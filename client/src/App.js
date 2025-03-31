import React, { createContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import './App.css';

export const SessionContext = createContext({ isLoggedIn: false, setIsLoggedIn: () => {} });

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const checkSession = () => {
    fetch('http://localhost:5555/check_session', { credentials: 'include' })
      .then(response => {
        console.log('response.ok:', response.ok);
        setIsLoggedIn(response.ok);
        return response.json();
      })
      .catch(err => {
        console.error('Session check error:', err);
        setIsLoggedIn(false);
      });
  };

  useEffect(() => {
    checkSession();
  }, [location]);

  return (
    <SessionContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <header>
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </SessionContext.Provider>
  );
}

export default App;
