import React from 'react';

const FileList = ({ files }) => {
  return (
    <div>
      <h3>Uploaded Files</h3>
      <ul>
        {files.map((file) => (
          <li key={file._id}>
            <a href={file.s3Url} target="_blank" rel="noopener noreferrer">
              {file.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
