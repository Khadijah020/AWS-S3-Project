import React from 'react'
import './LoginSignup.css'
import userIcon from '../Assets/person.png'
import emailIcon from '../Assets/email.png'
import passwordIcon from '../Assets/password.png'


const LoginSignup = () => {
    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>Sign Up</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                <div className='input'>
                    <img src={userIcon} alt="" />
                    <input type="text" placeholder='Name'/>
                </div>

                <div className='input'>
                    <img src={emailIcon} alt="" />
                    <input type="email" placeholder='Email ID' />
                </div>

                <div className='input'>
                    <img src={passwordIcon} alt="" />
                    <input type="password" placeholder='Password'/>
                </div>
            </div>
            <div className="forgot-pswd">Forgot Password? <span>Click Here!</span></div>
            <div className="submit-container">
                <div className="submit">
                    Sign Up
                </div>
                <div className="submit">
                    Login
                </div>
            </div>
        </div>
    )
}

export default LoginSignup
