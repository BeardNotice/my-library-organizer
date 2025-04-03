import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import BookCard from '../components/BookCard';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';
import { SessionContext } from '../App';
import Modal from "../components/Modal";
import './BookIndex.css';

function BookIndex() {
  const { isLoggedIn } = useContext(SessionContext);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/books', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        console.log("Fetched books:", data);
        setBooks(data);
        setFilteredBooks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching books:", error);
        setLoading(false);
      });
  }, []);
  
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/library', { credentials: 'include' })
        .then(response => response.json())
        .then(libs => setLibraries(libs))
        .catch(err => console.error("Error fetching libraries:", err));
    }
  }, [isLoggedIn]);

  const handleFilter = (selectedBook) => {
    if (selectedBook) {
      const filtered = books.filter(book => book.id === selectedBook.value);
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  };

  const handleAddToLibrary = (libraryId, book) => {
    fetch(`/library/${libraryId}/books`, {
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
      .then(response => response.json())
      .then(addedBook => {
         const updateBooks = prevBooks => prevBooks.map(b =>
           b.id === book.id
             ? { ...b, userRating: addedBook.userRating, globalRating: addedBook.globalRating }
             : b
         );
         setBooks(updateBooks);
         setFilteredBooks(updateBooks);
         const selectedLibrary = libraries.find(lib => lib.id === libraryId);
         setAddedMessage(`Book added to ${selectedLibrary.name}`);
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
                  <li key={lib.id}>
                    {alreadyAdded ? (
                      <span>{lib.name} (Already added)</span>
                    ) : (
                      <button onClick={() => handleAddToLibrary(lib.id, modalBook)}>
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