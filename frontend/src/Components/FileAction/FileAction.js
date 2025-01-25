import React from 'react';
import './FileAction.css'; 

const FileActions = ({ file, onDelete }) => {
  return (
    <div className="file-actions-container">
      <span className="file-name">{file.fileName}</span>
      <button className="delete-button" onClick={() => onDelete(file.fileKey)}>
        Delete
      </button>
    </div>
  );
};

export default FileActions;
