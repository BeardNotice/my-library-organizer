import React, { createContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import "./index.css";

export const SessionContext = createContext(null);

function Root() {
  const [sessionData, setSessionData] = useState(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    async function initialize() {
      let session = null;
      try {
        const res = await fetch('/api/user_session', { credentials: 'include' });
        if (res.ok) session = await res.json();
      } catch {} // ignore
      let books = [];
      try {
        const resBooks = await fetch('/api/books', { credentials: 'include' });
        if (resBooks.ok) books = await resBooks.json();
      } catch {} // ignore
      setSessionData({ ...session, books });
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
