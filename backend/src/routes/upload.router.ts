import { NextFunction, Request, Response, Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../utils/fileUpload';

const router = Router();
const uploadController = new UploadController();


const noop = (req:Request, res:Response, next:NextFunction) => next();

router.post('/', upload.single('file'), uploadController.uploadFile);
router.post('/chunk', process.env.STORAGE_MODE == 'local'? upload.single('chunk') : noop ,uploadController.uploadChunk);

export default router;
