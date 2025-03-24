import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';

function BookIndex({ loggedIn }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const navigate = useNavigate();

  // Fetch public books data
  useEffect(() => {
    fetch('http://localhost:5555/books', { credentials: 'include' })
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
    if (loggedIn) {
      fetch('http://localhost:5555/library', { credentials: 'include' })
        .then(response => response.json())
        .then(libs => setLibraries(libs))
        .catch(err => console.error("Error fetching libraries:", err));
    }
  }, [loggedIn]);

  // Function to filter books using AutocompleteBookSelect
  const handleFilter = (selectedBook) => {
    if (selectedBook) {
      const filtered = books.filter(book => book.id === selectedBook.value);
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  };

  // Handle adding a book to a library from the modal
  const handleAddToLibrary = (libraryId, book) => {
    fetch(`http://localhost:5555/library/${libraryId}/books`, {
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
         // Update the book in state to reflect it has been added to the library
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
      <h1>All Books</h1>
      <AutocompleteBookSelect onChange={handleFilter} />
      <div className="book-cards-container">
        {filteredBooks.map(book => (
          <div key={book.id}>
            <BookCard book={book} />
            {loggedIn && !book.userRating && (
              <button onClick={() => { setModalBook(book); setShowModal(true); console.log('modalBook set to', book); console.log('showModal set to true')}}>
                Add to Library
              </button>
            )}
          </div>
        ))}
      </div>
      {loggedIn && (
        <div className="add-library-section">
          <p>Don't see a book in your library? You can add it from here!</p>
        </div>
      )}
      {showModal && modalBook && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }}>
            <h3>Add "{modalBook.title}" to a library</h3>
            <p>Select a library:</p>
            {libraries.length > 0 ? (
              <ul>
                {libraries.map(lib => (
                  <li key={lib.id}>
                    <button onClick={() => handleAddToLibrary(lib.id, modalBook)}>
                      {lib.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You have no libraries. <Link to="/library/new">Create one</Link></p>
            )}
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {addedMessage && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }}>
            <h3>Success</h3>
            <p>{addedMessage}</p>
            <button onClick={() => { setAddedMessage(null); navigate('/'); }}>
              Return Home
            </button>
            <button onClick={() => { setAddedMessage(null); }}>
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookIndex;
