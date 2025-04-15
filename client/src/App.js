import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import './App.css';
import React, { createContext, useEffect, useState } from "react";

export const SessionContext = createContext({ isLoggedIn: false, setIsLoggedIn: () => {} });
export const LibraryContext = createContext({ libraries: [], setLibraries: () => {} });
export const BookDataContext = createContext({ books: [], setBooks: () => {} });

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [libraries, setLibraries] = useState([]);
  const [books, setBooks] = useState([]);
  const location = useLocation();

  const checkSession = () => {
    fetch('/check_session', { credentials: 'include' })
      .then(response => {
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

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/library', { credentials: 'include' })
        .then(res => res.json())
        .then(setLibraries)
        .catch(err => console.error("Failed to fetch libraries:", err));

      fetch('/api/books', { credentials: 'include' })
        .then(res => res.json())
        .then(setBooks)
        .catch(err => console.error("Failed to fetch books:", err));
    }
  }, [isLoggedIn]);

  return (
    <SessionContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <LibraryContext.Provider value={{ libraries, setLibraries }}>
        <BookDataContext.Provider value={{ books, setBooks }}>
          <header>
            <NavBar />
          </header>
          <main>
            <Outlet />
          </main>
        </BookDataContext.Provider>
      </LibraryContext.Provider>
    </SessionContext.Provider>
  );
}

export default App;

//test comment
