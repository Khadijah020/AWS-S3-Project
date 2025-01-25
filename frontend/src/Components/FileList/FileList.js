import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileList.css';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper function to convert file size from bytes to KB/MB
    const formatFileSize = (sizeInBytes) => {
        const sizeInKB = sizeInBytes / 1024;
        if (sizeInKB < 1024) {
            return `${sizeInKB.toFixed(2)} KB`;
        }
        const sizeInMB = sizeInKB / 1024;
        return `${sizeInMB.toFixed(2)} MB`;
    };

    const fetchFiles = async (page) => {
        setLoading(true);
        try {
            console.log("hello")
            const userEmail = localStorage.getItem('email');
            console.log("Fetching files for email:", userEmail);
    
            if (!userEmail) {
                alert("You need to log in to view your files.");
                setLoading(false);
                return;
            }
            console.log("reaching this part")
    
            const response = await axios.get(
                `http://localhost:5000/api/file/list?page=${page}&email=${userEmail}`
            );
    
            console.log("reaching this part 2")
            console.log("Full API Response:", response);
            console.log("Files:", response.data.files);
    
            setFiles(response.data.files);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error("Error fetching files in filelist:", err);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchFiles(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="file-list-container">
            <h2>Your Uploaded Files</h2>
            {loading ? (
                <p>Loading files...</p>
            ) : (
                <div className="file-grid">
                    {files.length > 0 ? (
                        files.map((file) => (
                            <div key={file._id} className="file-card">
                                <p><strong>Name:</strong> {file.fileName}</p>
                                <p><strong>Size:</strong> {formatFileSize(file.fileSize)}</p>
                                <p><strong>Uploaded:</strong> {new Date(file.uploadDate).toLocaleString()}</p>
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <button className="view-button">View/Download</button>
                                </a>
                            </div>
                        ))
                    ) : (
                        <p>No files uploaded yet.</p>
                    )}
                </div>
            )}
            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default FileList;
