import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import BookCard from '../components/BookCard';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';
import { SessionContext } from '../contexts/SessionProvider';
import Modal from "../components/Modal";
import './BookIndex.css';

// Add selected book to library, update session state, and show messages
function addBookToLibrary(libraryId, book, setSessionData, setAddedMessage, setShowModal, setModalBook) {
  fetch(`/api/libraries/${libraryId}/books`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: book.title,
      author: book.author,
      genre: book.genre,
      published_year: book.published_year,
      book_id: book.id
    })
  })
    .then(async response => {
      if (!response.ok) {
        const text = await response.text();
        // Try to parse error message as JSON, fallback to raw text
        let errorMsg = text;
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || text;
        } catch (e) {}
        throw new Error(errorMsg || 'Error adding book to library');
      }
      return response.json();
    })
    .then(addedBook => {
      setSessionData(prev => {
        const updatedLibraries = prev.libraries.map(lib =>
          lib.id === libraryId
            ? {
                ...lib,
                books: lib.books.some(b => b.id === addedBook.id)
                  ? lib.books
                  : [...lib.books, addedBook]
              }
            : lib
        );
        const updatedBooks = prev.books.some(b => b.id === addedBook.id)
          ? prev.books
          : [...prev.books, addedBook];

        return {
          ...prev,
          libraries: updatedLibraries,
          books: updatedBooks
        };
      });
      setAddedMessage(`Book added to ${libraryId}`);
      setShowModal(false);
      setModalBook(null);
    })
    .catch(error => {
      console.error("Error adding book to library:", error);
      alert(`Error: ${error.message}`);
    });
}

function BookIndex() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  // sessionData always exists; user prop only set when logged in, so we derive isLoggedIn from sessionData.user
  const isLoggedIn = Boolean(sessionData?.user);
  const libraries = sessionData?.libraries || [];
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const navigate = useNavigate();

  // Whenever sessionData changes, refresh the displayed book list
  useEffect(() => {
    setFilteredBooks(sessionData?.books || []);
    setLoading(false);
  }, [sessionData]);

  const handleFilter = (selectedBook) => {
    const all = sessionData?.books || [];
    setFilteredBooks(
      selectedBook
        ? all.filter(b => b.id === selectedBook.value)
        : all
    );
  };


  if (loading) {
    return <p>Loading books...</p>;
  }

  return (
    <div className="books-page">
      <Outlet />
      <h1>All Books</h1>
      {!isLoggedIn && <AutocompleteBookSelect onChange={handleFilter} />}
      <div className="book-cards-container">
        {filteredBooks.map(book => (
          <div key={book.id}>
            <BookCard book={book} allowDelete={false} />
            {isLoggedIn && (
              <button onClick={() => { setModalBook(book); setShowModal(true); }}>
                Add to Library
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && modalBook && (
        <Modal onClose={() => { setShowModal(false); setModalBook(null); }}>
          <h3>Add "{modalBook.title}" to a library</h3>
          <p>Select a library:</p>
          {libraries.length > 0 ? (
            <ul>
              {libraries.map(lib => {
                const alreadyAdded = lib.books && lib.books.some(b => b.id === modalBook.id);
                return (
                  <li key={lib.id}>
                    {alreadyAdded ? (
                      <span>{lib.name} (Already added)</span>
                    ) : (
                      <button onClick={() => addBookToLibrary(lib.id, modalBook, setSessionData, setAddedMessage, setShowModal, setModalBook)}>
                        {lib.name}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>You have no libraries. <Link to="/library/new">Create one</Link></p>
          )}
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </Modal>
      )}

      {addedMessage && (
        <Modal onClose={() => setAddedMessage(null)}>
          <h3>Success</h3>
          <p>{addedMessage}</p>
          <button onClick={() => { setAddedMessage(null); navigate('/'); }}>
            Return Home
          </button>
          <button onClick={() => setAddedMessage(null)}>
            Continue Browsing
          </button>
        </Modal>
      )}
    </div>
  );
}

export default BookIndex;