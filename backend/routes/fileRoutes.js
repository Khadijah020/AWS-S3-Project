const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');
const { authMiddleware } = require("../middlewares/authMiddleware"); // Example for JWT middleware

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

router.post('/upload', upload.single('file'), fileController.uploadFileToS3);

// New endpoint for listing files
router.get("/list", authMiddleware, fileController.listFiles);

module.exports = router;