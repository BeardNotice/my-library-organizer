import React, { createContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import "./index.css";

export const SessionContext = createContext(null);

function Root() {
  const [sessionData, setSessionData] = useState({});
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    // Kick off loading user session before showing the app
    async function initialize() {
      try {
        const res = await fetch('/api/user_session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSessionData(prev => ({ ...prev, user: data.user, libraries: data.libraries }));
        }
      } catch (e) {
        console.error('Session init failed', e);
      }
      // After session loads, grab the full book catalog
      try {
        const resBooks = await fetch('/api/books', { credentials: 'include' });
        if (resBooks.ok) {
          const list = await resBooks.json();
          setSessionData(prev => ({ ...prev, books: list }));
        }
      } catch (e) {
        console.error('Books init failed', e);
      }
      setIsSessionChecked(true);
    }
    initialize();
  }, []);

  if (!isSessionChecked) {
    return <p>Loading...</p>;
  }

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      <AppRoutes />
    </SessionContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
