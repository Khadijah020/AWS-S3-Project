import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FileList.css";

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

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
        </div>
    );
};

export default FileList;
