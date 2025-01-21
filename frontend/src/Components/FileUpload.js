import React, { useState } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';

const AWS = require('aws-sdk');
require('dotenv').config();

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

  // Function to upload file to S3
  const uploadFile = async () => {
    const S3_BUCKET = "awsproj-1";
    const REGION = AWS_REGION;

    AWS.config.update({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    const params = {
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
    };

    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        setProgress(parseInt((evt.loaded * 100) / evt.total));
      })
      .promise();

    await upload
      .then(async () => {
        alert("File uploaded successfully.");

        // Generate S3 file URL
        const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file.name}`;

        // Save metadata in database
        await axios.post('/api/file/metadata', {
          fileName: file.name,
          fileSize: file.size,
          uploadDate: new Date(),
          fileUrl,
        });

        setUploadedFileUrl(fileUrl);
      })
      .catch((err) => {
        console.error('Upload failed:', err);
        alert("File upload failed.");
      });
  };

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    // Check file type
    const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (!allowedFileTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Only PDF, PNG, JPG, and TXT files are allowed.");
      return;
    }

    setFile(selectedFile);
  };

  return (
    <div className="upload-box">
      <p>Drag & Drop Files here to upload</p>

      {/* Hidden file input for multiple file selection */}
      <input
        type="file"
        id="fileInput"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Trigger file input when this button is clicked */}
      <button
        className="upload-button"
        onClick={() => document.getElementById('fileInput').click()}
      >
        Browse Files
      </button>

      {/* Show error if file is invalid */}
      {error && <p style={{ color: 'red' }}>{error}</p>}


      {/* Show the selected file name */}
      {file && <p>Selected File: {file.name}</p>}

      {/* Upload button */}
      <button
        className="upload-button"
        onClick={uploadFile}
        disabled={!file}
      >
        Upload
      </button>

      {/* Show upload progress */}
      {progress > 0 && <p>Upload Progress: {progress}%</p>}

      {/* Display the uploaded file URL */}
      {uploadedFileUrl && (
      <div>
      <h3>Uploaded File:</h3>
      <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
        {uploadedFileUrl}
      </a>
      </div>
      )}
    </div>
  );
};

export default FileUpload;
