import React, { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../index';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import CreateLibraryModal from '../components/CreateLibrary';
import { Formik, Form } from 'formik';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { librarySchema } from '../components/ValidationSchema';
import './Home.css'

function Home() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const isLoggedIn = Boolean(sessionData?.user);
  const libraryData = sessionData?.libraries || [];
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  

  const deleteLibrary = (libraryId) => {
    if (!libraryId) {
      console.error("deleteLibrary: libraryId is undefined!");
      return;
    }
    if (window.confirm('Are you sure you want to delete this library?')) {
      fetch(`/api/libraries/${libraryId}/books`, {
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
          setSessionData(prev => ({
            ...prev,
            libraries: prev.libraries.filter(lib => lib.library_id !== libraryId)
          }));
        })
        .catch(error => {
          console.error('Error deleting library:', error);
        });
    }
  };

  const handleRating = (libraryId, bookId, newRating) => {
    fetch(`/api/libraries/${libraryId}/books/${bookId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update rating');
        return res.json();
      })
      .then(updatedBook => {
        setSessionData(prev => ({
          ...prev,
          libraries: prev.libraries.map(lib => ({
            ...lib,
            books: lib.books.map(book =>
              book.id === bookId
                ? {
                    ...book,
                    rating: {
                      userRating: updatedBook.userRating,
                      globalRating: updatedBook.globalRating
                    }
                  }
                : book
            )
          }))
        }));
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
            fetch(`/api/libraries/${selectedLibrary.library_id}/books`, {
              method: 'PATCH',
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
                // Normalize returned library id to match sessionData shape
                const libNorm = {
                  ...updatedLibrary,
                  library_id: updatedLibrary.id
                };
                setSessionData(prev => ({
                  ...prev,
                  libraries: prev.libraries.map(lib =>
                    lib.library_id === libNorm.library_id ? libNorm : lib
                  )
                }));
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


  return (
    <div className="home-container">
      <h1>Your Libraries</h1>
      {libraryData && libraryData.length > 0 ? (
        libraryData.map(library => (
          <div key={library.library_id} className="library-section">
            <h2>{library.name}</h2>
            {library.books && library.books.length > 0 ? (
              <div className="book-list">
                {library.books.map(book => {
                  const ratingObj = book.rating ?? {
                    userRating: book.userRating,
                    globalRating: book.globalRating
                  };
                  return (
                    <BookCard
                      key={book.id}
                      book={{ ...book, libraryId: library.library_id, rating: ratingObj }}
                      onRate={(bookId, newRating) => handleRating(library.library_id, bookId, newRating)}
                      onDelete={(bookId) => {
                        setSessionData(prev => ({
                          ...prev,
                          libraries: prev.libraries.map(lib =>
                            lib.library_id === library.library_id
                              ? { ...lib, books: lib.books.filter(b => b.id !== bookId) }
                              : lib
                          )
                        }));
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <p>No books found in this library.</p>
            )}
            <div className="button-group">
              <button className="btn" onClick={() => navigate(`/books/new?libraryId=${library.library_id}`)}>
                Add New Book
              </button>
              <button className="btn delete-btn" onClick={() => deleteLibrary(library.library_id)}>
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
            const lib = {
              library_id: newLibrary.id,
              name: newLibrary.name,
              books: []
            };
            setSessionData(prev => ({
              ...prev,
              libraries: prev.libraries ? [...prev.libraries, lib] : [lib]
            }));
          }} 
        />
      )}
    </div>
  );
}

export default Home;