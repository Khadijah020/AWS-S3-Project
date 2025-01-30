import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FileList.css";
import { useNavigate } from "react-router-dom";

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [expirationTime, setExpirationTime] = useState("1 minute");
    const navigate = useNavigate();

    const formatFileSize = (sizeInBytes) => {
        const sizeInKB = sizeInBytes / 1024;
        if (sizeInKB < 1024) {
            return `${sizeInKB.toFixed(2)} KB`;
        }
        const sizeInMB = sizeInKB / 1024;
        return `${sizeInMB.toFixed(2)} MB`;
    };

    // Fetching files to display in list
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

            uniqueFiles.forEach((file) => {
                const expirationTime = localStorage.getItem(`${file.fileName}-expiration`);
                const currentTime = Date.now();
                if (expirationTime && currentTime <= expirationTime) {
                    file.remainingTime = Math.floor((expirationTime - currentTime) / 1000);
                } else {
                    file.remainingTime = null;
                }
            });

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

    useEffect(() => {
        const interval = setInterval(() => {
            // Auto-refresh every 10 seconds
            fetchFiles(currentPage); 
        }, 10000);

        return () => clearInterval(interval);
    }, [currentPage]);

    const handleGenerate = async () => {
        try {
            if (!selectedFile) {
                alert("No file selected for URL generation.");
                return;
            }

            const email = localStorage.getItem("email");
            if (!email) {
                alert("You need to log in to generate URLs.");
                return;
            }

            const fileName = selectedFile.fileName;

            // Convert user-selected expiration time to seconds
            let expirationInSeconds;
            switch (expirationTime) {
                case "1 minute":
                    expirationInSeconds = 60;
                    break;
                case "5 minutes":
                    expirationInSeconds = 300;
                    break;
                case "10 minutes":
                    expirationInSeconds = 600;
                    break;
                case "30 minutes":
                    expirationInSeconds = 1800;
                    break;
                case "1 hour":
                    expirationInSeconds = 3600;
                    break;
                case "1 day":
                    expirationInSeconds = 86400;
                    break;
                default:
                    expirationInSeconds = 60;
            }

            const response = await fetch(
                `http://localhost:5000/api/s3/get-url?email=${encodeURIComponent(
                    email
                )}&fileName=${encodeURIComponent(fileName)}&expiresIn=${expirationInSeconds}`
            );

            if (!response.ok) {
                throw new Error("Failed to generate pre-signed URL");
            }

            const data = await response.json();
            console.log("Generated Pre-signed URL:", data.url);

            // Save URL and expiration time to localStorage
            localStorage.setItem(fileName, data.url);
            // Store timestamp in milliseconds
            const expirationTimestamp = Date.now() + expirationInSeconds * 1000; 
            localStorage.setItem(`${fileName}-expiration`, expirationTimestamp);

            // Copy URL to clipboard and notify user
            await navigator.clipboard.writeText(data.url);
            alert("Pre-signed URL copied to clipboard!");

            setShowModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Error generating pre-signed URL:", error);
            alert("Failed to generate pre-signed URL. Please try again.");
        }
    };

    // Deleting file
    const handleDelete = async (file) => {
        const email = localStorage.getItem("email");
        if (!email) {
            alert("You need to log in to delete files.");
            return;
        }

        try {
            const confirmed = window.confirm(`Are you sure you want to delete ${file.fileName}?`);
            if (!confirmed) return;

            const response = await axios.delete(
                'http://localhost:5000/api/s3/delete-file',
                {
                    params: {
                        email,
                        fileName: file.fileName,
                    },
                }
            );
            const dbResponse = await fetch(`http://localhost:5000/api/file/delete-file-metadata`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    fileName: file.fileName,
                }),
            });

            if (response.status === 200 && dbResponse.status === 200) {
                alert("File deleted successfully.");
                setFiles((prevFiles) =>
                    prevFiles.filter((prevFile) => prevFile.fileName !== file.fileName)
                );
            } else {
                alert("Failed to delete file.");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("An error occurred while deleting the file.");
        }
    };

    // Viewing file from list
    const handleView = (file) => {
        try {
            const generatedURL = localStorage.getItem(file.fileName);

            if (!generatedURL) {
                alert("Error: The URL for this file was not generated.");
                return;
            }
            const expirationTime = localStorage.getItem(`${file.fileName}-expiration`);
            if (!expirationTime) {
                alert("Error: Expiration time not found.");
                return;
            }
            const currentTime = Date.now();

            if (currentTime > expirationTime) {
                alert("Error: The link has expired.");
                return;
            }
            // Open the URL in a new tab
            window.open(generatedURL, "_blank");
        } catch (error) {
            console.error("Error viewing the file:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="file-list-container">
            <button
                className="back-button"
                onClick={() => navigate("/upload")} 
            >
                ←
            </button>

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
                                <th>Uploaded On</th>
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
                                        {file.remainingTime
                                            ? `${Math.floor(file.remainingTime / 60)} min ${file.remainingTime % 60} sec`
                                            : "Not generated or expired"}
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => handleView(file)}
                                        >
                                            View
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => handleDelete(file)}
                                        >
                                            Delete
                                        </button>
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
