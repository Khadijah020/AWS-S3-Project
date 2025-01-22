import React, { useState } from 'react'
import './LoginSignup.css'
import userIcon from '../Assets/person.png'
import emailIcon from '../Assets/email.png'
import passwordIcon from '../Assets/password.png'
import axios from 'axios'

const LoginSignup = () => {
    const [action, setAction] = useState("Sign Up")
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (action === "Sign Up") {
                const response = await axios.post("http://localhost:5001/api/users/register", {
                    username: name,
                    email,
                    password,
                });
                console.log("Registration success:", response.data);
            } else {
                const response = await axios.post("http://localhost:5001/api/users/login", {
                    email,
                    password,
                });
                console.log("Login success:", response.data);
                localStorage.setItem("token", response.data.accessToken);
                alert("Login Successful!");
            }
        } catch (err) {
            console.error("Error:", err);  // Log the error to inspect it
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

export default LoginSignup 