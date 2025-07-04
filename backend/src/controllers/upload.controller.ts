import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../utils/generateResponse';
import { UploadService } from '../services/upload.services';
import { CreateMultipartUploadCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../utils/S3';
import formidable from 'formidable'
import fs from 'fs'


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
  uploadChunk = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (process.env.STORAGE_MODE == 's3') {

        const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
          const form = formidable({ multiples: true });
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
          });
        });

        const obj = {
          UploadId: fields.UploadId?.[0],
          index: fields.index?.[0],
          exam_id: fields.examId?.[0],
          filename: fields.filename?.[0],
        };

        const file = files.chunk ? files.chunk[0] : {};
        if (!file || !file.filepath) {
          generateResponse(res, 400, {}, false, 'No chunk file uploaded');
          return;
        }
        if (Number(obj.index) == 0) {

          const command = new CreateMultipartUploadCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${obj.exam_id}/${obj.filename}.mp4`,
            ACL: 'public-read',
            ContentType: 'video/mp4',
          });
          let res = await s3Client.send(command);
          obj.UploadId = res.UploadId
        }
        const chunkStream = fs.createReadStream(file.filepath);

        const uploadPartCommand = new UploadPartCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${obj.exam_id}/${obj.filename}.mp4`,
          UploadId: obj.UploadId,
          PartNumber: Number(obj.index) + 1,
          Body: chunkStream
        });
        const { ETag } = await s3Client.send(uploadPartCommand);
        generateResponse(res, 200, { ETag, UploadId: obj.UploadId }, true, 'File uploaded successfully');
        return

      }
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
