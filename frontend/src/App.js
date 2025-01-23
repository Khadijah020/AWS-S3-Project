import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import axios from 'axios';
import FileUpload from './Components/FileUpload';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginSignup onLogin={checkAuth} /> : <Navigate to="/upload" />}
        />
        <Route
          path="/upload"
          element={isAuthenticated ? <FileUpload /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
