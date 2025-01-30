import React, { useState, useCallback } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
//import useTokenValidation from '../../hooks/useTokenValidation'; // Import the hook
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [email] = useState(localStorage.getItem('email') || ''); // Avoid unnecessary state updates

  const navigate = useNavigate();
  const location = useLocation();

  console.log('hello from file upload')
  //useTokenValidation(); // Ensure this doesn't cause unnecessary renders
  console.log('hello from file upload');

  const uploadFile = useCallback(async () => {
    if (!file) return;

    const S3_BUCKET = 'awsproj-1';
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
      // Check if file exists before uploading
      await s3
        .headObject({ Bucket: S3_BUCKET, Key: fileKey })
        .promise()
        .then(() => {
          alert('File with the same name already exists.');
          throw new Error('File already exists.');
        })
        .catch((err) => {
          if (err.code !== 'NotFound') {
            console.error('Error checking file existence:', err);
            throw err;
          }
        });

      // Upload the file
      await s3
        .putObject({ Bucket: S3_BUCKET, Key: fileKey, Body: file, ContentType: file.type })
        .on('httpUploadProgress', (evt) => setProgress(Math.round((evt.loaded * 100) / evt.total)))
        .promise();

      const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${email}/${file.name}`;

      await axios.post('http://localhost:5000/api/file/metadata', {
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date(),
        fileUrl,
        email,
      });

      setUploadedFileUrl(fileUrl);
      setFile(null);
      setProgress(0);
      alert('File uploaded successfully.');

    } catch (err) {
      console.error('Upload failed:', err);
      if (err.message !== 'File already exists.') {
        alert('File upload failed.');
      }
    }
  }, [file, email]);

  const handleClick = useCallback(() => {
    if (location.pathname !== '/files') {
      navigate('/files');
    }
  }, [location.pathname, navigate]);

  const validateFile = useCallback((selectedFile) => {
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
      setError('Invalid file type.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  }, [navigate]);

  return (
    <div className="upload-box">
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      <div
        className={`drag-drop-area ${isDragActive ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          validateFile(e.dataTransfer.files[0]);
        }}
      >
        <p>Drag & Drop Files here</p>
      </div>

      <input
        type="file"
        id="fileInput"
        onChange={(e) => validateFile(e.target.files[0])}
        className="hidden-input"
      />

      <div className="button-row">
        <button className="browse-files-button" onClick={() => document.getElementById('fileInput').click()}>
          Browse Files
        </button>

        <button className={`upload-button-1 ${!file || progress > 0 ? 'disabled' : ''}`} onClick={uploadFile} disabled={!file || progress > 0}>
          Upload
        </button>
      </div>

      {file && <p className="file-name">Selected File: <strong>{file.name}</strong></p>}
      {error && <p className="error">{error}</p>}

      {progress > 0 && (
        <div className="progress-container">
          <p>Uploading: {progress}%</p>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <button className="view-files-button" onClick={handleClick}>View Uploaded Files</button>
    </div>
  );
};

export default FileUpload;
