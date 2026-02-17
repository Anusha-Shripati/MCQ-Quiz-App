import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { logger } from '../config/logger';
import { s3Client } from './S3';

const storageMode = process.env.STORAGE_MODE || 'local';

let storage: multer.StorageEngine;
type ExamFileUploadRequest = Request<{ examId?: string }, any, any, { fileType?: string; chunkFolder?: string }>;

if (storageMode === 's3') {
  storage = multerS3({
    s3:s3Client,
    bucket: process.env.AWS_BUCKET_NAME as string,
    acl: 'public-read',
    key: (req: ExamFileUploadRequest, file, cb) => {
      const tenantId = req.context?.tenant?.id || 'unknown';
      let folderPath = `/${tenantId}`;
      if (req.params.examId) folderPath += `/${req.params.examId}`;
      if (req.query.fileType) folderPath += `/${req.query.fileType}`;
      const filename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;
      cb(null, `${folderPath}/${filename}`);
    },
  });
} else {
  const uploadPath = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isPlatformAdmin = req.user?.token_type === 'PLATFORM_ADMIN';
      const userId = req.params.id || req.user?.id || 'unknown';
      
      let destPath = uploadPath;
      
      if (isPlatformAdmin) {
        destPath += `/platform-admin/${userId}`;
      } else {
        const tenantSlug = req.context?.tenant?.slug || 'unknown';
        destPath += `/tenants/${tenantSlug}`;
        
        // For user profile uploads, add userId
        if (req.params.id || (req.path && req.path.includes('upload-image'))) {
          destPath += `/${userId}`;
        }
      }
      
      if (req.params.examId) destPath += `/${req.params.examId}`;
      if (req.query.fileType) destPath += `/${req.query.fileType}`;
      if (req.query.chunkFolder) destPath += `/${req.query.chunkFolder}`;

      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      cb(null, destPath);
    },
    filename: (req: ExamFileUploadRequest, file: Express.Multer.File, cb) => {
      const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
      const baseName = path.basename(file.originalname, ext);
      cb(
        null,
        req.body?.index && req.query?.chunkFolder
          ? `${req.body.index}`
          : `${baseName}-${Date.now()}${ext}`
      );
    },
  });
}

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  logger.debug(
    `Processing file: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size}`
  );

  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype == 'application/octet-stream'
  ) {
    // Accept the file
    cb(null, true);
  } else {
    logger.error(`Invalid file type: ${file.mimetype}`);
    cb(new Error(`Invalid file type: ${file.mimetype}. Only image and video files are allowed!`));
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
    if (ext !== '.webm') return resolve(inputPath);

    // Validate file existence and size
    let stats;
    try {
      stats = fs.statSync(inputPath);
      if (stats.size === 0) {
        logger.error(`File is empty: ${inputPath}`);
        return reject(new Error('File is empty'));
      }
      logger.info(`Processing valid file: ${inputPath}, size: ${stats.size} bytes`);
    } catch (e) {
      logger.error(`File does not exist or cannot be accessed: ${inputPath}`);
      return reject(new Error('File does not exist or cannot be accessed'));
    }

    const outputPath = inputPath.replace(ext, '.mp4');

    ffmpeg(inputPath)
      .output(outputPath)
      .inputOptions([
        '-f webm',
        '-err_detect ignore_err',
      ])
      .outputOptions([
        '-c:v libx264',
        '-preset ultrafast',
        '-crf 28',
        '-c:a aac',
        '-b:a 128k',
        '-threads 0', // Use all CPU cores
      ])
      .on('start', (cmd) => logger.info('Started FFmpeg with command:', cmd))
      .on('progress', (progress) => logger.info(`FFmpeg progress: frame: ${progress.frames}, time: ${progress.timemark}`))
      .on('stderr', (line) => logger.debug('FFmpeg stderr:', line))
      .on('end', () => {
        logger.info(`Conversion finished: ${inputPath} → ${outputPath}`);
        try {
          fs.rmSync(inputPath, { force: true });
          resolve(outputPath.split('uploads/')[1]);
        } catch (err) {
          logger.error(`Error removing original file: ${err}`);
          resolve(outputPath.split('uploads/')[1]);
        }
      })
      .on('error', (err) => {
        logger.error('❌ FFmpeg error:', err.message);
        try {
          fs.copyFileSync(inputPath, outputPath);
          logger.info('Using original file as fallback');
          resolve(outputPath.split('uploads/')[1]);
        } catch (copyError) {
          logger.error(`Error copying original file: ${copyError}`);
          reject(err);
        }
      })
      .run();
  });
};

// Utility function to check if file is valid
export const isValidFile = (filePath: string): boolean => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size > 0;
  } catch (err) {
    logger.error(`Error checking file validity: ${err}`);
    return false;
  }
};
