const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FileMetadata = require("../models/File");
const multer = require("multer");
const AWS = require("aws-sdk");

// AWS S3 Configuration
const S3_BUCKET = "awsproj-1";
const REGION = process.env.AWS_REGION;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3({ region: REGION });

// Configure Multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/file/upload - Upload file to S3
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { email } = req.body;
    const file = req.file;

    if (!file || !email) {
      return res.status(400).json({ message: "File and email are required." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const fileKey = `${email}/${file.originalname}`;

    // Check if file already exists in S3
    try {
      await s3.headObject({ Bucket: S3_BUCKET, Key: fileKey }).promise();
      return res.status(400).json({ message: "File already exists. Please rename and try again." });
    } catch (err) {
      if (err.code !== "NotFound") {
        console.error("Error checking file existence:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
    }

    //Uploading the file and saving metadata if file doesn't exist
    const params = {
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.upload(params).promise();
    const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${fileKey}`;

    // save file metadata in MongoDB
    const fileMetadata = new FileMetadata({
      fileName: file.originalname,
      fileSize: file.size,
      uploadDate: new Date(),
      fileUrl,
      uploadedBy: user._id,
      uploadedByEmail: email,
    });

    await fileMetadata.save();

    res.status(200).json({ message: "File uploaded successfully.", fileUrl });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "File upload failed." });
  }
});


// GET /api/file/list - List files of the logged-in user
router.get("/list", async (req, res) => {
  const { email, page = 1, limit = 10 } = req.query;

  if (!email) {
    return res.status(400).json({ message: "User email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const totalFiles = await FileMetadata.countDocuments({ uploadedBy: user._id });
    const files = await FileMetadata.find({ uploadedBy: user._id })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ uploadDate: -1 });

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFiles / limit),
      totalFiles,
      files,
    });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res.status(500).json({ message: "Error fetching user files." });
  }
});

// POST /api/file/metadata - Save file metadata & check storage
router.post("/metadata", async (req, res) => {
  const { fileName, fileSize, uploadDate, fileUrl, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newStorageUsed = user.storageUsed + fileSize / (1024 * 1024);

    if (newStorageUsed > 100) {
      return res.status(400).json({ message: "Storage limit exceeded. Please upgrade your plan or delete files." });
    }

    const fileMetadata = new FileMetadata({
      fileName,
      fileSize,
      uploadDate,
      fileUrl,
      uploadedBy: user._id,
      uploadedByEmail: email,
    });

    await fileMetadata.save();

    user.storageUsed = newStorageUsed;
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: "File uploaded and metadata saved successfully." });
  } catch (error) {
    console.error("Error saving file metadata:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// POST /api/delete-file-metadata - Delete file metadata from DB
router.post("/delete-file-metadata", async (req, res) => {
  const { email, fileName } = req.body;

  if (!email || !fileName) {
    return res.status(400).json({ message: "Email and file name are required." });
  }

  try {
    const fileToDelete = await FileMetadata.findOneAndDelete({ uploadedByEmail: email, fileName });

    if (!fileToDelete) {
      return res.status(404).json({ message: "File metadata not found." });
    }

    res.status(200).json({ message: "File metadata deleted successfully." });
  } catch (error) {
    console.error("Error deleting file metadata:", error);
    res.status(500).json({ message: "An error occurred while deleting file metadata." });
  }
});

module.exports = router;
