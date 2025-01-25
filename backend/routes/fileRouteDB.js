const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FileMetadata = require("../models/File");


router.get("/list", async (req, res) => {
  console.log("hi")
  const { email } = req.query; // Retrieve email from request query
  const { page = 1, limit = 10 } = req.query;
  console.log('Query Parameters:', req.query);
  if (!email) {
    return res.status(400).json({ message: "User email is required." });
  }
  console.log("Received email:", email);

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





// POST /api/file/metadata
router.post("/metadata", async (req, res) => {
  const { fileName, fileSize, uploadDate, fileUrl, email } = req.body;

  try {
    
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user);
    const newStorageUsed = user.storageUsed + fileSize / (1024 * 1024); // Convert bytes to MB

    // Check if the total storage exceeds 100 MB
    if (newStorageUsed > 100) {
      return res.status(400).json({
        message: "Storage limit exceeded. Please upgrade your plan or delete files.",
      });
    }

    // Save file metadata
    const fileMetadata = new FileMetadata({
      fileName,
      fileSize,
      uploadDate,
      fileUrl,
      uploadedBy: user._id,
    });

    await fileMetadata.save();

    // Update user storage
    user.storageUsed = newStorageUsed;
    await user.save();
    user.updatedAt = new Date(); // Set the current date and time
    res.status(200).json({ message: "File uploaded and metadata saved successfully." });
  } catch (error) {
    console.error("Error saving file metadata:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
