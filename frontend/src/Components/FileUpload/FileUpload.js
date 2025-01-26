import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FileUpload.css';
import { jwtDecode } from 'jwt-decode';


const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    
    if (!userEmail || !token) {
      // No email or token found, redirect to login
      navigate('/login');
    } else {
      try {
        const decodedToken = jwtDecode(token); // Decode the JWT to check expiry
  
        // Current time in milliseconds
        const currentTime = Date.now();
  
        // Token expiry time in milliseconds (token.exp is in seconds)
        const expirationTime = decodedToken.exp * 1000;
  
        console.log('Token expires at:', new Date(expirationTime).toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
        console.log('Current time:', new Date(currentTime).toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  
        // Check if the token is expired
        if (expirationTime < currentTime) {
          // Token is expired, log out the user
          localStorage.clear();
          navigate('/login');
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.clear();
        navigate('/login');
      }
    }
  }, [navigate]);
  

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
      const paramsCheck = {
        Bucket: S3_BUCKET,
        Key: fileKey,
      };

      await s3
        .headObject(paramsCheck)
        .promise()
        .then(() => {
          alert('File with the same name already exists. Please rename your file or choose a different one.');
          throw new Error('File already exists.');
        })
        .catch((err) => {
          if (err.code !== 'NotFound') {
            console.error('Error checking file existence:', err);
            throw err;
          }
        });

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
      setFile(null);
      setProgress(0);
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
  const handleLogout = () => {
    localStorage.clear();  
    navigate('/login');    
    window.location.reload();
  };
  

  return (
    <div className="upload-box">
    <button className="logout-button" onClick={handleLogout}>Logout</button>
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

  <div className="button-row">
    <button
      className="browse-files-button"
      onClick={() => document.getElementById('fileInput').click()}
    >
      Browse Files
    </button>

    <button
      className={`upload-button-1 ${!file || progress > 0 ? 'disabled' : ''}`}
      onClick={uploadFile}
      disabled={!file || progress > 0}
    >
      Upload
    </button>
  </div>

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
    className="view-files-button"
    onClick={() => navigate('/files')}
  >
    View Uploaded Files
  </button>
</div>

  );
};

export default FileUpload;