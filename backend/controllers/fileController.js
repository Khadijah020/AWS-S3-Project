const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

exports.uploadFileToS3 = async (req, res) => {
  try {
    const file = req.file; 
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const S3_BUCKET = process.env.AWS_BUCKET_NAME;
    const fileKey = ${uuidv4()}-${file.originalname};

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
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload file to S3.' });
  }
};