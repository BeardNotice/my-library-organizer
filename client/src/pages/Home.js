import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

function Home() {
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const refreshLibraryData = () => {
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
  };
  
  useEffect(() => {
    refreshLibraryData();
  }, [navigate]);

  if (loading) {
    return <p>Loading your library...</p>;
  }

  return (
    <div className="home-container">
      <h1>Your Libraries</h1>
      {libraryData && libraryData.length > 0 ? (
        libraryData.map(library => (
          <div key={library.id} className="library-section">
            <h2>{library.name}</h2>
            {library.books && library.books.length > 0 ? (
              <div className="book-list">
                {library.books.map(book => {
                  const handleRating = (bookId, newRating) => {
                    fetch(`http://localhost:5555/library/${library.id}/books/${bookId}`, {
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
                      .then(() => {
                        refreshLibraryData();
                      })
                      .catch(error => {
                        console.error('Error updating rating:', error);
                      });
                  };

                  return (
                    <BookCard key={book.id} book={book} onRate={handleRating} />
                  );
                })}
              </div>
            ) : (
              <p>No books found in this library.</p>
            )}
            <div className="button-group">
              <Link to={`/books/new?libraryId=${library.id}`} className="btn">
                Add New Book
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="button-group">
          <Link to="/library/new" className="btn">
            Create Library
          </Link>
        </div>
      )}
      {libraryData && libraryData.length > 0 && (
        <div className="button-group">
          <Link to="/library/new" className="btn">
            Add Another Library
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;