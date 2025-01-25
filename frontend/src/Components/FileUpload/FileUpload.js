import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null); 
  const [error, setError] = useState(''); 
  const [progress, setProgress] = useState(0); 
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null); 
  const [isDragActive, setIsDragActive] = useState(false); 
  const [email, setEmail] = useState('');

  const navigate = useNavigate()

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (userEmail) setEmail(userEmail);
    else alert("User email not found. Please log in again.");
  }, []);

  const uploadFile = async () => {
    const S3_BUCKET = "awsproj-1";
    const REGION = process.env.REACT_APP_AWS_REGION;
  
    AWS.config.update({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    });
  
    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });
  
    const fileKey = `${email}/${file.name}`;
  
    try {
      // Check if the file already exists in the bucket
      const paramsCheck = {
        Bucket: S3_BUCKET,
        Key: fileKey,
      };
  
      await s3
        .headObject(paramsCheck)
        .promise()
        .then(() => {
          // If file exists, stop upload
          alert('File with the same name already exists. Please rename your file or choose a different one.');
          throw new Error('File already exists.');
        })
        .catch((err) => {
          if (err.code !== 'NotFound') {
            console.error('Error checking file existence:', err);
            throw err;
          }
        });
  
      // Proceed with upload if the file does not exist
      const paramsUpload = {
        Bucket: S3_BUCKET,
        Key: fileKey,
        Body: file,
        ContentType: file.type,
      };
  
      await s3
        .putObject(paramsUpload)
        .on('httpUploadProgress', (evt) => {
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        })
        .promise();
  
      alert('File uploaded successfully.');
  
      const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${email}/${file.name}`;
  
      // Save file metadata in the backend
      await axios
        .post('http://localhost:5000/api/file/metadata', {
          fileName: file.name,
          fileSize: file.size,
          uploadDate: new Date(),
          fileUrl,
          email,
        })
        .then((response) => {
          alert(response.data.message);
        })
        .catch((error) => {
          if (error.response) {
            alert(error.response.data.message);
          } else {
            alert('An error occurred. Please try again.');
          }
        });
  
      setUploadedFileUrl(fileUrl);
  
      // Reset file and progress after successful upload
      setFile(null);
      setProgress(0);
      navigate('/files');
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.message !== 'File already exists.') {
        alert('File upload failed.');
      }
    }
  };
  

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const selectedFile = e.dataTransfer.files[0];
    validateFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const validateFile = (selectedFile) => {
    setError('');

    if (!selectedFile) {
      setError('No file selected.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      setFile(null);
      return;
    }

    const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (!allowedFileTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, PNG, JPG, and TXT files are allowed.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  return (
    <div className="upload-box">
      <div
        className={`drag-drop-area ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag & Drop Files here</p>
      </div>

      <input
        type="file"
        id="fileInput"
        onChange={handleFileChange}
        className="hidden-input"
      />

      <button
        className="upload-button"
        onClick={() => document.getElementById('fileInput').click()}
      >
        Browse Files
      </button>

      {file && (
        <p className="file-name">
          Selected File: <strong>{file.name}</strong>
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {progress > 0 && (
        <div className="progress-container">
          <p>Uploading: {progress}%</p>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <button
        className={`upload-button-1 ${!file || progress > 0 ? 'disabled' : ''}`}
        onClick={uploadFile}
        disabled={!file || progress > 0}
      >
        Upload
      </button>

      
    </div>
  );
};

export default FileUpload;
