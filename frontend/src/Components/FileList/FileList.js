import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FileList.css";

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [expirationTime, setExpirationTime] = useState("1 minute");

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
            const userEmail = localStorage.getItem("email");
            if (!userEmail) {
                alert("You need to log in to view your files.");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/file/list?page=${page}&email=${userEmail}`
            );

            const uniqueFiles = Array.from(
                new Map(
                    response.data.files.map((file) => [file.fileName, file])
                ).values()
            );

            setFiles(uniqueFiles);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error("Error fetching files:", err);
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
    const handleGenerateUrlClick = (file) => {
        setSelectedFile(file);
        setShowModal(true);
    };
    const handleGenerate = () => {
        console.log(`Generating URL for ${selectedFile.fileName} with expiration: ${expirationTime}`);
        setShowModal(false);
    };
    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="file-list-container">
            <h2>Your Uploaded Files</h2>
            {loading ? (
                <p>Loading files...</p>
            ) : files.length > 0 ? (
                <div className="table-wrapper">
                <table className="file-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Size</th>
                            <th>Uploaded</th>
                            <th>Url Expiration Time</th>
                            <th>View File</th>
                            <th>Delete File</th>
                            <th>Generate Pre-Signed URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file._id}>
                                <td>{file.fileName}</td>
                                <td>{formatFileSize(file.fileSize)}</td>
                                <td>{new Date(file.uploadDate).toLocaleString()}</td>
                                <td>
                                    Expiration time
                                </td>
                                <td>
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <button className="view-button">View</button>
                                    </a>
                                </td>
                                <td>
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <button className="view-button">Delete</button>
                                    </a>
                                </td>
                                <td>
                                        <button
                                            className="view-button"
                                            onClick={() => handleGenerateUrlClick(file)}
                                        >
                                            Generate
                                        </button>
                                    </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <p>No files uploaded yet.</p>
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
            {showModal && (
    <div className="modal-overlay">
        <div className="modal">
            <div className="modal-header">
                <h3>Generate Pre-Signed URL</h3>
                <button className="close-button" onClick={closeModal}>
                    ✖
                </button>
            </div>
            <div className="modal-content">
                <label htmlFor="expiration">Select Expiration Time:</label>
                <select
                    id="expiration"
                    value={expirationTime}
                    onChange={(e) => setExpirationTime(e.target.value)}
                >
                    <option value="1 minute">1 minute</option>
                    <option value="5 minutes">5 minutes</option>
                    <option value="10 minutes">10 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1 day">1 day</option>
                </select>
            </div>
            <div className="modal-footer">
                <button className="apply-button" onClick={handleGenerate}>
                    Apply
                </button>
                <button className="cancel-button" onClick={closeModal}>
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default FileList;
