import './App.css';
import React from 'react';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import FileUpload from './Components/FileUpload';
import FileActions from './Components/FileActions'; 
import FileList from './Components/FileList'

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        <header className="hero">
          <h1>Secure Cloud Storage & Communication</h1>
          <p>Grab Premium Account today. Check out our awesome deal!</p>
          
          <FileActions />
          <FileUpload />  
          <FileList />
        </header>

        <div className="cta-banner">
          <p>Do you want 50 GB Free* storage?</p>
          <button className="signup-button">Create an Account</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
