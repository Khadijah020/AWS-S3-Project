const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Generate a pre-signed URL to view or download a file
router.get("/get-url", async (req, res) => {
  const { email, fileName } = req.query;

  if (!email || !fileName) {
    return res.status(400).json({ message: "Email and file name are required" });
  }

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${email}/${fileName}`, // File path includes the email
      Expires: 60 * 5, // URL expires in 5 minutes
    };

    const url = await s3.getSignedUrlPromise("getObject", params);
    res.status(200).json({ url });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ message: "Error generating pre-signed URL", error });
  }
});

/// Delete a file from the S3 bucket
router.delete("/delete-file", async (req, res) => {
  const { email, fileName } = req.query;

  if (!email || !fileName) {
    return res.status(400).json({ message: "Email and file name are required" });
  }

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${email}/${fileName}`, // File path includes the email
    };

    await s3.deleteObject(params).promise();
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file", error });
  }
});

// Fetch all files for a specific user
router.get("/list-files", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: `${email}/`, // List files under the user's email folder
    };

    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map((file) => ({
      fileName: file.Key.replace(`${email}/`, ""), // Remove email prefix from file name
      lastModified: file.LastModified,
      size: file.Size,
    }));

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ message: "Error listing files", error });
  }
});

module.exports = router;