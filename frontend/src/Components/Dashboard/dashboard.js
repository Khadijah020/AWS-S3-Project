import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';
import { useNavigate } from 'react-router-dom'; 

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorageUsed: 0,
    mostRecentUpload: null, 
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  

  useEffect(() => {
    // function for authenticating the token and fetching information
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:5000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          validateStatus: false,
        });

        if (response.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch dashboard stats');
        }

        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="dashboard-container">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-container error">Error: {error}</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>File Storage Dashboard</h1>
      </div>

      <div className="dashboard-container">
        <button
          className="back-button"  
          onClick={() => navigate('/upload')}  
        >
          ←
        </button>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Files Uploaded</h3>
            <p>{stats.totalFiles}</p>
          </div>
          <div className="stat-card">
            <h3>Most Recent Upload</h3>
            {stats.mostRecentUpload ? (
              <div>
                <p>File: {stats.mostRecentUpload.fileName}</p>
                <p>Uploaded: {new Date(stats.mostRecentUpload.uploadDate).toLocaleString()}</p>
                <p>Size: {stats.mostRecentUpload.fileSize} MB</p>
              </div>
            ) : (
              <p>No files uploaded yet</p>
            )}
          </div>
          <div className="stat-card">
            <h3>Total Storage Used</h3>
            <p>{stats.totalFiles > 0 ? stats.totalStorageUsed + ' MB' : '0 MB'}</p> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
