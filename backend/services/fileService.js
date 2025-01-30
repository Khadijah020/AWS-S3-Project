const AWS = require('aws-sdk');
require('dotenv').config(); 
const File = require('../models/File');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadFile = async (file, userId) => {
  const fileContent = fs.readFileSync(file.path);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${userId}/${file.filename}`,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };
  const s3Response = await s3.upload(params).promise();

  const newFile = new File({
    user: userId,
    filename: file.filename,
    fileType: file.mimetype,
    fileSize: file.size,
    fileUrl: s3Response.Location,
  });
  console.log(newFile);
  await newFile.save();

  return newFile;
};

const deleteFile = async (fileId) => {
  const file = await File.findById(fileId);
  if (!file) throw new Error('File not found');

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.filename,
  };
  await s3.deleteObject(params).promise();

  await file.remove();
};

module.exports = { uploadFile, generatePresignedUrl, deleteFile };
