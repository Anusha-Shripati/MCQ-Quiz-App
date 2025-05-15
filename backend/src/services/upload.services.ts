import { UploadedFile } from '../types/upload.types';

export class UploadService {
  
  processFile(file: Express.Multer.File): UploadedFile {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileName: file.filename,
      size: file.size,
      path: process.env.BACKEND_URL + '/uploads/' + file.filename,
    };
  }
}
