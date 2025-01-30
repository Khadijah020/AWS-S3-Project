import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const useTokenValidation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasNavigated = useRef(false); 

    useEffect(() => {
        console.log('hello from hook')

        const validateToken = () => {
            console.log('hello from function inside hook')
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('email');

            if (!token || !userEmail) {
                if (location.pathname !== '/login' && !hasNavigated.current) {
                    localStorage.clear();
                    hasNavigated.current = true;
                    console.log('trying to go to login')
                    navigate('/login', { replace: true });
                }
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const currentTime = Date.now();

                if (expirationTime < currentTime) {
                    alert('Session expired! Please reload page to continue!');

                    console.log('expired token, going to login')
                    if (location.pathname !== '/login' && !hasNavigated.current) {
                        localStorage.clear();
                        hasNavigated.current = true;
                        navigate('/login', { replace: true });
                    }
                }
            } catch (err) {
                console.error('[Token Validation] Invalid token:', err);
                if (location.pathname !== '/login' && !hasNavigated.current) {
                    localStorage.clear();
                    hasNavigated.current = true;
                    navigate('/login', { replace: true });
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
