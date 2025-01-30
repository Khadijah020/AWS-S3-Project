const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();


const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter(req, file, cb) {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type.'));
    }
    cb(null, true);
  },
});

router.post('/upload',protect, upload.single('file'), fileController.uploadFileToS3);

router.get("/list",protect, fileController.listFiles);

module.exports = router;