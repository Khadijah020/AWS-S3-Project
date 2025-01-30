import React, { useState, useCallback } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [email] = useState(localStorage.getItem('email') || ''); 

  const navigate = useNavigate();
  const location = useLocation();

  // Uploading file
  const uploadFile = useCallback(async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
  
    try {
      const response = await axios.post("http://localhost:5000/api/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
  
      alert("File uploaded successfully.");
      setUploadedFileUrl(response.data.fileUrl);
      setFile(null);
    } catch (err) {
      if (err.response && err.response.data.message === "File already exists. Please rename and try again.") {
        alert("File with the same name already exists. Please rename your file or choose a different one.");
      } else {
        alert("File upload failed.");
        console.error("Upload failed:", err);
      }
    }
  }, [file, email]);
  
  
  const handleClick = useCallback(() => {
    if (location.pathname !== '/files') {
      navigate('/files');
    }
  }, [location.pathname, navigate]);

  // Checking file selection
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

    // Validation for file types
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

        <button className={`upload-button-1 ${!file ? 'disabled' : ''}`} onClick={uploadFile} disabled={!file || progress > 0}>
          Upload
        </button>
      </div>

      {file && <p className="file-name">Selected File: <strong>{file.name}</strong></p>}
      {error && <p className="error">{error}</p>}

      <button className="view-files-button" onClick={handleClick}>View Uploaded Files</button>
      <div>
        <button
          className="view-files-button"
          onClick={() => navigate('/dashboard')}
        >
          View Analytics Dashboard
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
