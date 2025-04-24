import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import BookCard from '../components/BookCard';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';
import { SessionContext } from '../index';
import Modal from "../components/Modal";
import './BookIndex.css';

function BookIndex() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const isLoggedIn = Boolean(sessionData?.user);
  const libraries = sessionData?.libraries || [];
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(!sessionData);
  const [showModal, setShowModal] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const allBooks = sessionData?.books || [];
    setFilteredBooks(allBooks);
    setLoading(false);
  }, [sessionData]);

  const handleFilter = (selectedBook) => {
    const allBooks = sessionData?.books || [];
    if (selectedBook) {
      const found = allBooks.find(book => book.id === selectedBook.value);
      setFilteredBooks(found ? [found] : []);
    } else {
      setFilteredBooks(allBooks);
    }
  };

  const handleAddToLibrary = (libraryId, book) => {
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
          throw new Error(text || 'Error adding book to library');
        }
        return response.json();
      })
      .then(updatedLibrary => {
        // Normalize server library object to match client shape
        const normalizedLib = {
          library_id: updatedLibrary.id,
          name: updatedLibrary.name,
          books: updatedLibrary.books
        };
        setSessionData(prev => ({
          ...prev,
          libraries: prev.libraries.map(lib =>
            lib.library_id === libraryId ? normalizedLib : lib
          )
        }));
        // Display success message using the normalized library name
        setAddedMessage(`Book added to ${normalizedLib.name}`);
        setShowModal(false);
        setModalBook(null);
      })
      .catch(error => console.error("Error adding book to library:", error));
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
                  <li key={lib.library_id}>
                    {alreadyAdded ? (
                      <span>{lib.name} (Already added)</span>
                    ) : (
                      <button onClick={() => handleAddToLibrary(lib.library_id, modalBook)}>
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