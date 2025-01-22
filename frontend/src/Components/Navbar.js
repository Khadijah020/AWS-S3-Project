import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Terms</a></li>
        <li><a href="#">Login</a></li>
        <li><button className="signup-button">Sign Up</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
