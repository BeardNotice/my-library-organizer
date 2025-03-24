import React, { createContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";

export const SessionContext = createContext({ isLoggedIn: false, setIsLoggedIn: () => {} });

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const checkSession = () => {
    fetch('http://localhost:5555/check_session', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        if (data && data.id) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(err => console.error('Session check error:', err));
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
        <h1>My Library App</h1>
        <Outlet />
      </main>
    </SessionContext.Provider>
  );
}

export default App;
