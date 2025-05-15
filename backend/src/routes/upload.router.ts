import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../utils/fileUpload';

const router = Router();
const uploadController = new UploadController();


router.post('/', upload.single('file'), uploadController.uploadFile);

export default router;
