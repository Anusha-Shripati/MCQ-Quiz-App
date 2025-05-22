import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

const storageMode = process.env.STORAGE_MODE || 'local';

let storage: multer.StorageEngine; 

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
        key: (req, file, cb) => {
            const filename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;
            cb(null, filename);
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
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            cb(null, path);
        },
        filename: (req: Express.Request, file: Express.Multer.File, cb) => {
            const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
            const baseName = path.basename(file.originalname, ext);
            cb(null, `${baseName}-${Date.now()}${ext}`);
        },
    });
}

const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
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
            .on('end', () => {
                console.log('✅ Conversion complete:', outputPath);
                resolve(outputPath.split('/uploads/')[1]);
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