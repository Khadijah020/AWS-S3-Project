import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import userIcon from '../../Assets/person.png';
import emailIcon from '../../Assets/email.png';
import passwordIcon from '../../Assets/password.png';
import axios from 'axios';

const LoginSignup = ({ onLogin }) => {
  const [action, setAction] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Trim inputs and update state
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    setName(trimmedName);
    setEmail(trimmedEmail);
    setPassword(trimmedPassword);

    // Validation flags
    let validationFailed = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name validation (Sign Up only)
    if (action === "Sign Up") {
      const nameRegex = /^[A-Za-z\s'-]+$/;
      if (!trimmedName) {
        alert("Please enter your name.");
        validationFailed = true;
      } else if (!nameRegex.test(trimmedName)) {
        alert("Name can only contain letters, spaces, apostrophes, and hyphens.");
        validationFailed = true;
      }
    }

    // Email validation
    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address.");
      validationFailed = true;
    }

    // Password validation
    if (action === "Sign Up") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(trimmedPassword)) {
        alert("Password must be at least 8 characters long and include:\n- One uppercase letter\n- One lowercase letter\n- One number\n- One special character (@$!%*?&)");
        validationFailed = true;
      }
    } else {
      if (!trimmedPassword) {
        alert("Please enter your password.");
        validationFailed = true;
      }
    }

    if (validationFailed) return;

    try {
      if (action === "Sign Up") {
        await axios.post("http://localhost:5000/api/users/register", {
          username: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
        });
        alert("Registration successful! You can now log in.");
        setAction("Login");
      } else {
        const response = await axios.post("http://localhost:5000/api/users/login", {
          email: trimmedEmail,
          password: trimmedPassword,
        });
  
        if (response.status === 200 && response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("email", trimmedEmail);
          alert("Login Successful!");
          onLogin();
          navigate('/upload');
        } else {
          alert('Invalid Username or Password! Please try again!');
        }
      }
    } catch (err) {
      console.error("Error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Something went wrong! Please try again.");
      } else {
        setError("Something went wrong! Please try again.");
      }
    }
  };
  

    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>{action}</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>

                {
                    action === "Login" ? <div></div> : <div className='input'>
                        <img src={userIcon} alt="" />
                        <input type="text" placeholder='Name' value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                }

                <div className='input'>
                    <img src={emailIcon} alt="" />
                    <input type="email" placeholder='Email ID' value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>

                <div className='input'>
                    <img src={passwordIcon} alt="" />
                    <input type="password" placeholder='Password' value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
            </div>
            {action === "Sign Up" ? <div></div> : <div className="forgot-pswd">Forgot Password? <span>Click Here!</span></div>}
            <div className="submit-container">
                {action !== "Login" && (
                    <div className="submit gray" onClick={() => setAction("Login")}>Login</div>
                )}
                {action !== "Sign Up" && (
                    <div className="submit gray" onClick={() => setAction("Sign Up")}>Sign Up</div>
                )}
                <button className="submit" onClick={handleSubmit}>
                    {action === "Sign Up" ? "Sign Up" : "Login"}
                </button>
            </div>


            {error && <div className="error-message">{error}</div>}
        </div>
    )
}

export default LoginSignup;
