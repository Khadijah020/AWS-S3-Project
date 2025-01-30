import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const useTokenValidation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasNavigated = useRef(false); 

    useEffect(() => {

        const validateToken = () => {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('email');
        
            if (!token || !userEmail) {
                if (location.pathname !== '/login' && !hasNavigated.current) {
                    console.log('No token found! Please Login! ');
                    localStorage.clear();
                    hasNavigated.current = true;
                    window.location.href = '/login'; // 🔥 Force full page reload
                }
                return;
            }
        
            try {
                const decodedToken = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const currentTime = Date.now();
        
                if (expirationTime < currentTime) {
                    alert('Session expired! Logging out the user');        
                    localStorage.clear();
                    hasNavigated.current = true;
                    
                    window.location.href = '/login'; // 🔥 Immediate redirect
                }
            } catch (err) {
                console.error('[Token Validation] Invalid token:', err);
                if (location.pathname !== '/login' && !hasNavigated.current) {
                    localStorage.clear();
                    hasNavigated.current = true;
                    window.location.href = '/login'; // 🔥 Ensures full logout
                }
            }
        };
        

        validateToken();

        if (location.pathname !== '/login') {
            const intervalId = setInterval(validateToken, 6000);
            return () => clearInterval(intervalId); 
        }
    }, [location.pathname, navigate]);

    return null;
};

export default useTokenValidation;
