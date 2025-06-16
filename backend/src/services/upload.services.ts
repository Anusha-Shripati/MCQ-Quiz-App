import path from 'path';
import { UploadedFile } from '../types/upload.types';
import { convertWebmToMp4 } from '../utils/fileUpload';
import fs from 'fs'
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const storageMode = process.env.STORAGE_MODE || 'local';

export class UploadService {
  
  async processFile(file: Express.Multer.File): Promise<UploadedFile> {
    let filePath = file.path.split('/uploads/')[1];
    
    if(file.mimetype.includes('webm')){
      filePath = await convertWebmToMp4(file.path);
    }
  
    return {
      originalName: file.originalname, 
      mimeType: file.mimetype,
      fileName: file.filename,
      size: file.size,
      path: process.env.BACKEND_URL + '/uploads/' + filePath,
    };
  }

  async mergeChunk(foldername: string,exam_id:string) {
    if (storageMode === 's3') {
      return this.mergeChunkS3(foldername,exam_id);
    } else {
      const path = await this.mergeChunkLocal(foldername,exam_id)
      
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

  private async mergeChunkLocal(foldername: string,exam_id:string) {
    const chunkDir = path.join('uploads', foldername);
    
    if (!fs.existsSync(chunkDir)) {
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

  private async mergeChunkS3(filename: string,exam_id:string) {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
      region: process.env.AWS_REGION as string,
    });

    // Create temporary directory for processing
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const finalPath = path.join(tempDir, `${Date.now()}-${filename}`);
    const writeStream = fs.createWriteStream(finalPath);

    try {
      // List all chunks in S3
      const listResponse = await s3.send(new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: `${filename}/`
      }));

      if (!listResponse.Contents) {
        throw new Error('No chunks found');
      }

      // Sort chunks by their index
      const chunks = listResponse.Contents
        .filter(obj => obj.Key)
        .sort((a, b) => {
          const aIndex = parseInt(a.Key!.split('/').pop() || '0');
          const bIndex = parseInt(b.Key!.split('/').pop() || '0');
          return aIndex - bIndex;
        });

      // Download and merge chunks
      for (const chunk of chunks) {
        if (!chunk.Key) continue;

        const response = await s3.send(new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: chunk.Key
        }));

        if (response.Body && response.Body instanceof Readable) {
          await new Promise<void>((resolve, reject) => {
            const stream = response.Body as Readable;
            stream.pipe(writeStream, { end: false })
              .on('error', reject)
              .on('finish', resolve);
          });
        }
      }

      writeStream.end();

      // Wait for the write stream to finish
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Upload the merged file to S3
      const finalKey = `${Date.now()}-${filename}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: finalKey,
        Body: fs.createReadStream(finalPath),
        ACL: 'public-read'
      }));

      // Delete all chunks from S3
      await s3.send(new DeleteObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: chunks.map(chunk => ({ Key: chunk.Key! }))
        }
      }));

      // Clean up temporary file
      fs.unlinkSync(finalPath);

      return finalKey;
    } catch (error) {
      // Clean up temporary file in case of error
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }
      throw error;
    }
  }
}

export default new UploadService();