const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FileMetadata = require("../models/File");

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

    res.status(200).json({ message: "File uploaded and metadata saved successfully." });
  } catch (error) {
    console.error("Error saving file metadata:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
