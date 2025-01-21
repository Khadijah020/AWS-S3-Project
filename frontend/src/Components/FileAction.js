import React, { useState } from 'react';
import axios from 'axios';

const FileAction = () => {
  const [fileName, setFileName] = useState('');
  const [expiresIn, setExpiresIn] = useState(3600); // Default expiry to 1 hour (3600 seconds)
  const [presignedUrl, setPresignedUrl] = useState('');
  const [error, setError] = useState('');

  const handleGenerateUrl = async () => {
    if (!fileName) {
      setError('File name is required.');
      return;
    }

    try {
      const response = await axios.post('/presigned-url', {
        bucket: 'awsproj-1',
        key: fileName,
        expiresIn: expiresIn,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setPresignedUrl(response.data.url);
      setError('');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        setError('The link has expired or is invalid.');
      } else {
        setError('Error generating pre-signed URL.');
      }
    }
  };

  return (
    <div className="file-action-box">
      <h2>Request Pre-signed URL</h2>
      <input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Enter expiry time (in seconds)"
        value={expiresIn}
        onChange={(e) => setExpiresIn(e.target.value)}
      />
      <button onClick={handleGenerateUrl}>Generate Pre-signed URL</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {presignedUrl && (
        <div>
          <h3>Your Pre-signed URL:</h3>
          <a href={presignedUrl} target="_blank" rel="noopener noreferrer">{presignedUrl}</a>
        </div>
      )}
    </div>
  );
};

export default FileAction;
