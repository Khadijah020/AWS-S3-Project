const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const FileMetadata = require("../models/File");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Listing file functionality
const s3 = new AWS.S3();
exports.listFiles = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { page = 1, limit = 10 } = req.query; 

    // Placing files in list in correct order
    const files = await FileMetadata.find({ uploadedBy: userId })
      .sort({ uploadDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalFiles = await FileMetadata.countDocuments({ uploadedBy: userId });

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFiles / limit),
      totalFiles,

      files: files.map((file) => ({
        id: file._id,
        fileName: file.fileName,
        fileSize: (file.fileSize / 1024).toFixed(2) + " KB",
        uploadDate: file.uploadDate,
        fileUrl: file.fileUrl,
      })),
    });
  } 
  catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Failed to fetch files. Please try again later." });
  }
};


// Uploading file functionality
exports.uploadFileToS3 = async (req, res) => {
  try {
    const file = req.file; 
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const S3_BUCKET = process.env.AWS_BUCKET_NAME;
    const fileKey =  `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
    };
    const s3Result = await s3.upload(params).promise();

    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: s3Result.Location,
      fileKey,
    });
  } 
  catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload file to S3.' });
  }
};