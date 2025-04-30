import React, { useState, useContext } from 'react';
import { useRequireLogin } from '../hooks/UseRequireLogin';
import { useLibraryActions } from '../hooks/UseLibraryActions';
import { SessionContext } from '../contexts/SessionProvider';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import CreateLibraryModal from '../components/CreateLibrary';
import { Formik, Form } from 'formik';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { librarySchema } from '../components/ValidationSchema';
import './Home.css';

function UpdateLibraryModal({ library, onClose, onSubmit }) {
  if (!library) return null;
  return (
    <Modal onClose={onClose}>
      <h2>Update Library Name</h2>
      <Formik
        initialValues={{ name: library.name }}
        validationSchema={librarySchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(library.id, values.name)
            .finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormField name="name" label="Library Name" />
            <button type="submit" className="btn" disabled={isSubmitting}>
              Update
            </button>
            <button type="button" className="btn cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}


function Home() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { deleteLibrary, updateLibrary } = useLibraryActions();
  // sessionData always exists; user prop only set when logged in, so we derive isLoggedIn from sessionData.user
  const libraryData = sessionData?.libraries || [];
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const navigate = useNavigate();  
  useRequireLogin()

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
                  return (
                    <BookCard
                      key={book.id}
                      book={{ ...book, libraryId: library.id }}
                      allowDelete={true}
                    />
                  );
                })}
              </div>
            ) : (
              <p>No books found in this library.</p>
            )}
            <div className="button-group">
              <button className="btn" onClick={() => navigate(`/books/new?libraryId=${library.id}`)}>
                Add New Book
              </button>
              <button
                className="btn delete-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this library?')) {
                    deleteLibrary(library.id);
                  }
                }}
              >
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
      {showUpdateModal && (
        <UpdateLibraryModal
          library={selectedLibrary}
          onClose={() => setShowUpdateModal(false)}
          onSubmit={(id, newName) =>
            updateLibrary(id, newName).finally(() => setShowUpdateModal(false))
          }
        />
      )}
      {showLibraryModal && (
        <CreateLibraryModal 
          onClose={() => setShowLibraryModal(false)} 
          onSuccess={(newLibrary) => {
            const lib = {
              id: newLibrary.id,
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