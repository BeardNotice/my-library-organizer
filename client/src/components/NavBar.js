import React, { useContext } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { SessionContext } from '../App';

function NavBar({ onLogout }) {
    const { isLoggedIn } = useContext(SessionContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5555/logout', {
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
        <nav>
            <NavLink to="/" className="nav-link">Home</NavLink>
            { isLoggedIn ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </nav>
    );
}

export default NavBar;