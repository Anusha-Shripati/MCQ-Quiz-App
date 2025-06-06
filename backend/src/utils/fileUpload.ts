import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
const storageMode = process.env.STORAGE_MODE || 'local';

let storage: multer.StorageEngine; 
type ExamFileUploadRequest = Request<{ examId?: string }, any, any, { fileType?: string }>;

if (storageMode === 's3') {
    const s3 = new S3Client({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
        region: process.env.AWS_REGION as string,
    });

    storage = multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME as string,
        acl: 'public-read',
        key: (req:ExamFileUploadRequest, file, cb) => {
            let folderPath = '';
            if(req.params.examId) folderPath+=`/${req.params.examId}`;
            if(req.query.fileType) folderPath+=`/${req.query.fileType}`;
            const filename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;
            cb(null, `${folderPath?folderPath+'/':""}${filename}`);
        },
    });
}
else {

    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let path = uploadPath;
            if(req.params.examId) path+=`/${req.params.examId}`;
            if(req.query.fileType) path+=`/${req.query.fileType}`;
            if(req.query.chunkFolder) path+=`/${req.query.chunkFolder}`;
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            cb(null, path);
        },
        filename: (req: Express.Request, file: Express.Multer.File, cb) => {
            const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
            const baseName = path.basename(file.originalname, ext);
            cb(null, req.body.index && req.query.chunkFolder ? `${req.body.index}`: `${baseName}-${Date.now()}${ext}`);
        },
    });
}

const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype == 'application/octet-stream') {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
    },
});



export const convertWebmToMp4 = (inputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath);
        if (ext == '.webm') {
            const outputPath = inputPath.replace(ext, '.mp4');
            
            ffmpeg(inputPath)
            .output(outputPath)
            .outputOptions([
                '-c:v libx264',  // Use H.264 codec
                '-preset ultrafast',  // Use fastest encoding preset
                '-crf 28',  // Slightly lower quality but faster encoding
                '-c:a aac',  // Use AAC audio codec
                '-b:a 128k'  // Lower audio bitrate for faster processing
            ])
            .on('start', (commandLine) => {
                console.log('Started FFmpeg with command:', commandLine);
            })
            .on('progress', (progress) => {
                const percent = progress.percent ?? 0;
                console.log(`Processing: ${Math.round(percent)}% done`);
            })
            .on('end', () => {
                console.log('Conversion finished');
                fs.rmSync(inputPath);
                resolve(outputPath.split('uploads/')[1]);
            })
            .on('error', (err: any) => {
                console.error('❌ FFmpeg error:', err.message);
                reject(err);
            })
            .run();
        }
        else {
            resolve(inputPath);
        }
    });
};