import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FileUpload from './Components/FileUpload';
import FileActions from './Components/FileAction';
import './App.css'; 

function App() {
  const [files, setFiles] = useState([]);
  const userId = 'user123'; 

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`/api/files/files?userId=${userId}`);
      setFiles(response.data.files);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (fileKey) => {
    try {
      await axios.delete(`/api/files/${fileKey}`);
      alert('File deleted successfully.');
      fetchFiles();
    } catch (error) {
      console.error(error);
      alert('Failed to delete file.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">File Management</h1>
        <FileUpload userId={userId} onUploadSuccess={fetchFiles} />
        <h2 className="subtitle">Your Files</h2>
        <div className="file-list">
          {files.map((file) => (
            <FileActions key={file.fileKey} file={file} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
