import React, { useContext } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { SessionContext } from '../contexts/SessionProvider';
import './NavBar.css';

function NavBar() {
    const { sessionData, setSessionData } = useContext(SessionContext);
    // sessionData always exists; user prop only set when logged in, so we derive isLoggedIn from sessionData.user
    const isLoggedIn = Boolean(sessionData?.user);
    const currentPath = window.location.pathname;
    const hideAuthButton = currentPath === '/login';
    const navigate = useNavigate();

    // Log out the current user, clear user and libraries from session
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                setSessionData(prev => ({
                  ...prev,
                  user: null,
                  libraries: []
                }));
                navigate('/books');
            } else {
                console.error('Logout failed.');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <NavLink to="/books" className="nav-link">Books</NavLink>
            { !hideAuthButton && (
                isLoggedIn ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <button onClick={handleLogin}>Login</button>
                )
            )}
        </nav>
    );
}

export default NavBar;