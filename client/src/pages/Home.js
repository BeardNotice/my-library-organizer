import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import CreateLibraryModal from '../components/CreateLibrary';
import { Formik, Form } from 'formik';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { librarySchema } from '../components/ValidationSchema';
import './Home.css'

function Home() {
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const navigate = useNavigate();
  
  const refreshLibraryData = useCallback(() => {
    fetch('/api/library', { credentials: 'include' })
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
  }, [refreshLibraryData]);

  const deleteLibrary = (libraryId) => {
    if (window.confirm('Are you sure you want to delete this library?')) {
    fetch(`/api/library/${libraryId}/books`, {
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
          setLibraryData(prev => prev.filter(lib => lib.id !== libraryId));
        })
        .catch(error => {
          console.error('Error deleting library:', error);
        });
    }
  };

  const handleRating = (libraryId, bookId, newRating) => {
    fetch(`/api/library/${libraryId}/books/${bookId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update rating');
        return res.json();
      })
      .then(updatedBook => {
        setLibraryData(prev =>
          prev.map(lib => ({
            ...lib,
            books: lib.books.map(book =>
              book.id === bookId ? { ...book, ...updatedBook } : book
            )
          }))
        );
      })
      .catch(err => console.error('Rating update error:', err));
  };

  const renderUpdateModal = () => {
    if (!showUpdateModal || !selectedLibrary) return null;
    return (
      <Modal onClose={() => setShowUpdateModal(false)}>
        <h2>Update Library Name</h2>
        <Formik
          initialValues={{ name: selectedLibrary.name }}
          validationSchema={librarySchema}
          onSubmit={(values, { setSubmitting }) => {
            fetch(`/api/library/${selectedLibrary.id}/books`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: values.name })
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to update library');
                }
                return response.json();
              })
              .then((updatedLibrary) => {
                setLibraryData(prev => prev.map(lib =>
                  lib.id === updatedLibrary.id ? updatedLibrary : lib
                ));
                setShowUpdateModal(false);
              })
              .catch(error => {
                console.error('Error updating library:', error);
              })
              .finally(() => {
                setSubmitting(false);
              });
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormField name="name" label="Library Name" />
              <button type="submit" className="btn" disabled={isSubmitting}>
                Update
              </button>
              <button type="button" className="btn cancel-btn" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </button>
            </Form>
          )}
        </Formik>
      </Modal>
    );
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
                {library.books.map(book => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      onRate={(bookId, newRating) => handleRating(library.id, bookId, newRating)}
                      onDelete={(bookId) => {
                        setLibraryData(prev => prev.map(lib => {
                          if (lib.id !== library.id) return lib;
                          return {
                            ...lib,
                            books: lib.books.filter(book => book.id !== bookId)
                          };
                        }));
                      }} 
                      libraryId={library.id} 
                    />
                ))}
              </div>
            ) : (
              <p>No books found in this library.</p>
            )}
            <div className="button-group">
              <button className="btn" onClick={() => navigate(`/books/new?libraryId=${library.id}`)}>
                Add New Book
              </button>
              <button className="btn delete-btn" onClick={() => deleteLibrary(library.id)}>
                Delete Library
              </button>
              <button className="btn" onClick={() => { setSelectedLibrary(library); setShowUpdateModal(true); }}>
                Update Library
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
      {renderUpdateModal()}
      {showLibraryModal && (
        <CreateLibraryModal 
          onClose={() => setShowLibraryModal(false)} 
          onSuccess={(newLibrary) => {
            const updatedLibraries = libraryData ? [...libraryData, newLibrary] : [newLibrary];
            setLibraryData(updatedLibraries);
          }} 
        />
      )}
    </div>
  );
}

export default Home;