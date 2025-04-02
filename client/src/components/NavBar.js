import React, { useContext } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { SessionContext } from '../App';
import './NavBar.css';

function NavBar({ onLogout }) {
    const { isLoggedIn } = useContext(SessionContext);
    const currentPath = window.location.pathname;
    const hideAuthButton = currentPath === '/login';
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                if (onLogout) {
                    onLogout();
                }
                navigate('/login');
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