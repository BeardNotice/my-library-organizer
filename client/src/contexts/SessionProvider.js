

import React, { createContext, useState, useEffect } from 'react';

export const SessionContext = createContext(null);

export default function SessionProvider({ children }) {
  const [sessionData, setSessionData] = useState({});
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    async function initialize() {
      // Kick off loading user session before showing the app
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
      {children}
    </SessionContext.Provider>
  );
}