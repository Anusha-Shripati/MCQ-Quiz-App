import path from 'path';
import { MergeChunk, UploadedFile } from '../types/upload.types';
import { convertWebmToMp4 } from '../utils/fileUpload';
import fs from 'fs'
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { logger } from '../config/logger';
import { s3Client } from '../utils/S3';

const storageMode = process.env.STORAGE_MODE || 'local';
type S3FileResponse = {
  key?: string;
}
export class UploadService {

  async processFile(file: Express.Multer.File & S3FileResponse): Promise<UploadedFile> {
    if (process.env.STORAGE_MODE === 's3') {
      return {
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileName: file.filename,
        size: file.size,
        path: file.key || '',
      }
    };
    let filePath = file.path.split('/uploads/')[1];

    if (file.mimetype.includes('webm')) {
      filePath = await convertWebmToMp4(file.path);
    }

    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileName: file.filename,
      size: file.size,
      path: 'uploads/' + filePath,
    };
  }

  async mergeChunk(foldername: string, exam_id: string, body:MergeChunk) {
    if (storageMode === 's3') {
      return this.mergeChunkS3(foldername, exam_id, body);
    } else {
      const path = await this.mergeChunkLocal(foldername, exam_id)

      const fileObj = {
        path,
        originalname: foldername,
        filename: path.split('/').pop() || foldername,
        mimetype: 'video/webm',
        size: fs.statSync(path).size
      } as Express.Multer.File;

      const finalPath = await this.processFile(fileObj);
      return finalPath;
    }
  }

  private async mergeChunkLocal(foldername: string, exam_id: string) {
    const chunkDir = path.join('uploads', foldername);

    if (!fs.existsSync(chunkDir)) {
      logger.error(`Chunk directory ${chunkDir} does not exist.`);
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const files = fs.readdirSync(chunkDir);
    files.sort((a, b) => Number(a) - Number(b));

    const finalPath = path.join('uploads', exam_id, `${foldername}.webm`);
    if (!fs.existsSync(path.dirname(finalPath))) {
      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    }

    const writeStream = fs.createWriteStream(finalPath);

    for (const file of files) {
      const chunkPath = path.join(chunkDir, file);
      const data = fs.readFileSync(chunkPath);
      writeStream.write(data);
    }

    writeStream.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        // fs.rmSync(chunkDir, { recursive: true });
        resolve();
      });
      writeStream.on('error', reject);
    });

    return finalPath;
  }

  private async mergeChunkS3(filename: string, exam_id: string,  body:MergeChunk) {
    try {
      
      const command = new CompleteMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${exam_id}/${filename}.mp4`,
        UploadId: body.UploadId,
        MultipartUpload: {
          Parts: body.parts,
        },
      });

      await s3Client.send(command);
      return  {
        path: `${exam_id}/${filename}.mp4`
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new UploadService();