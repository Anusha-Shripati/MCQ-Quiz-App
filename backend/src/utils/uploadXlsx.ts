import multer from 'multer';

const storage = multer.memoryStorage(); 
export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {

    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only XLSX files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});
