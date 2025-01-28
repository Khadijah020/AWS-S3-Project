import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const useTokenValidation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasNavigated = useRef(false); 
    const [isTokenValid, setIsTokenValid] = useState(true); 

    useEffect(() => {
        const validateToken = () => {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('email');

            if (!token || !userEmail) {
                if (location.pathname !== '/login' && !hasNavigated.current) {
                    localStorage.clear();
                    hasNavigated.current = true;
                    navigate('/login');
                }
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now();
                const expirationTime = decodedToken.exp * 1000;

                if (expirationTime < currentTime) {
                    if (location.pathname !== '/login' && !hasNavigated.current) {
                        alert('Session expired! Redirecting to login...');
                        localStorage.clear();
                        setIsTokenValid(false); 
                        hasNavigated.current = true;
                        navigate('/login');
                    }
                }
            } catch (err) {
                console.error('[Token Validation] Invalid token:', err);
                if (location.pathname !== '/login' && !hasNavigated.current) {
                    localStorage.clear();
                    setIsTokenValid(false); 
                    hasNavigated.current = true;
                    navigate('/login');
                }
            }
        };

        
        validateToken();

        
        if (location.pathname !== '/login') {
            const intervalId = setInterval(validateToken, 6000);
            return () => clearInterval(intervalId); 
        }

    }, [location.pathname, navigate]);

    
    if (!isTokenValid) {
        return null; 
    }

    return null; 
};

export default useTokenValidation;
