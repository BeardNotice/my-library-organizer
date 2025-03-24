import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

function Home() {
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5555/library', { credentials: 'include' })
      .then(response => {
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Not authenticated');
        }
        if (!response.ok) {
          throw new Error('Error fetching library');
        }
        return response.json();
      })
      .then(data => {
        setLibraryData(data);
      })
      .catch(error => {
        console.error('Error fetching library data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // Handle rating click from a book card
const handleRating = (bookId, newRating) => {
  // Assume libraryData is an array of libraries; here we work with the first library
  const libraryId = libraryData[0].id;
  // Update the rating via PUT request
  fetch(`http://localhost:5555/library/${libraryId}/books/${bookId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: newRating })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update rating');
      }
      return response.json();
    })
    .then(updatedBook => {
      // Instead of re-fetching, update the libraryData state directly:
      setLibraryData(prevData =>
        prevData.map(lib => {
          if (lib.id === libraryId) {
            return {
              ...lib,
              books: lib.books.map(book => {
                if (book.id === bookId) {
                  return {
                    ...book,
                    userRating: updatedBook.userRating,
                    globalRating: updatedBook.globalRating
                  };
                }
                return book;
              })
            };
          }
          return lib;
        })
      );
    })
    .catch(error => {
      console.error('Error updating rating:', error);
    });
};

  if (loading) {
    return <p>Loading your library...</p>;
  }

  // For this example, assume we are displaying books from the first library
  const currentLibrary = libraryData && libraryData.length > 0 ? libraryData[0] : null;

  return (
    <div className="home-container">
      <h1>Your Library</h1>
      {currentLibrary && currentLibrary.books && currentLibrary.books.length > 0 ? (
        <div className="book-list">
          {currentLibrary.books.map(book => (
            <BookCard key={book.id} book={book} onRate={handleRating} />
          ))}
        </div>
      ) : (
        <p>No books found in your library.</p>
      )}
      <div className="button-group">
        {libraryData && libraryData.length > 0 ? (
          <Link to="/books/new" className="btn">
            Add New Book
          </Link>
        ) : (
          <Link to="/library/new" className="btn">
            Create Library
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;