import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import CreateLibraryModal from '../components/CreateLibrary';

function Home() {
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const navigate = useNavigate();
  
  const refreshLibraryData = useCallback(() => {
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
  
  useEffect(() => {
    refreshLibraryData();
  }, [navigate]);

  const deleteLibrary = (libraryId) => {
    if (window.confirm('Are you sure you want to delete this library?')) {
      fetch(`http://localhost:5555/library/${libraryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete library');
          }
          if (response.status === 204) {
            return {};
          }
          return response.json();
        })
        .then(() => {
          refreshLibraryData();
        })
        .catch(error => {
          console.error('Error deleting library:', error);
        });
    }
  };

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
                  // Existing inline fetch for updating rating remains here.
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
              {/* Replace Link with button to open modal */}
              <button className="btn" onClick={() => setShowLibraryModal(true)}>
                Add New Book
              </button>
              <button className="btn delete-btn" onClick={() => deleteLibrary(library.id)}>
                Delete Library
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="button-group">
          <button className="btn" onClick={() => setShowLibraryModal(true)}>
            Create Library
          </button>
        </div>
      )}
      {libraryData && libraryData.length > 0 && (
        <div className="button-group">
          <button className="btn" onClick={() => setShowLibraryModal(true)}>
            Add Another Library
          </button>
        </div>
      )}
      {showLibraryModal && (
        <CreateLibraryModal 
          onClose={() => setShowLibraryModal(false)} 
          onSuccess={refreshLibraryData} 
        />
      )}
    </div>
  );
}

export default Home;