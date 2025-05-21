import path from 'path';
import { UploadedFile } from '../types/upload.types';
import { convertWebmToMp4 } from '../utils/fileUpload';

export class UploadService {
  
  async processFile(file: Express.Multer.File): Promise<UploadedFile> {
    let filePath =  path.basename(file.path);
    if(path.extname(file.path) == '.webm'){
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
}
