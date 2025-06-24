import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../utils/generateResponse';
import { UploadService } from '../services/upload.services';

const uploadService = new UploadService();

export class UploadController {
  
  uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        generateResponse(res, 400, {}, false, 'No file uploaded');
        return;
      }

      const fileData = await uploadService.processFile(req.file);
      generateResponse(res, 200, fileData, true, 'File uploaded successfully');
      return;
    } catch (error) {
      next(error);
    }
  };
  uploadChunk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        generateResponse(res, 400, {}, false, 'No file uploaded');
        return;
      }
      const fileData = await uploadService.processFile(req.file);
      generateResponse(res, 200, fileData, true, 'File uploaded successfully');
      return;
    } catch (error) {
      next(error);
    }
  };
}
