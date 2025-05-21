import { UploadedFile } from '../types/upload.types';
import { convertWebmToMp4 } from '../utils/fileUpload';

export class UploadService {
  
  async processFile(file: Express.Multer.File): Promise<UploadedFile> {
    console.log(file)
    const convertedPath = await convertWebmToMp4(file.path);
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileName: file.filename,
      size: file.size,
      path: process.env.BACKEND_URL + '/uploads/' + convertedPath,
    };
  }
}
