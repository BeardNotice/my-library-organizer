import React, { useState, useEffect, useContext } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../components/FormField';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';
import { newBookSchema } from '../components/ValidationSchema';
import { SessionContext } from '../App';
import './NewBook.css';

function NewBook() {
  const { isLoggedIn } = useContext(SessionContext);
  const [libraryId, setLibraryId] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const queryLibraryId = searchParams.get('libraryId');
    if (queryLibraryId) {
      setLibraryId(queryLibraryId);
    } else {
      fetch('http://localhost:5555/library', { credentials: 'include' })
        .then(response => {
          if (!response.ok) {
            throw new Error('Not authenticated or error fetching library');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            setLibraryId(data[0].id);
          } else {
            console.error('No library found for this user');
          }
        })
        .catch(error => {
          console.error('Error fetching library:', error);
        });
    }
  }, [searchParams]);

  const initialValues = {
    title: '',
    author: '',
    genre: '',
    published_year: '',
    selectedBook: null
  };

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    if (!libraryId) {
      setErrors({ title: 'Library not found' });
      setSubmitting(false);
      return;
    }

    let payload = { ...values };
    if (values.selectedBook) {
      payload.book_id = values.selectedBook.value;
      if (!payload.title) {
        payload.title = values.selectedBook.label;
      }
      if (!payload.author && values.selectedBook.author) {
        payload.author = values.selectedBook.author;
      }
    }
    delete payload.selectedBook;

    if (payload.published_year === '') {
      payload.published_year = null;
    } else {
      payload.published_year = Number(payload.published_year);
    }

    console.log('Payload being sent:', payload);

    fetch(`http://localhost:5555/library/${libraryId}/books`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          navigate('/');
          return response.json();
        } else {
          return response.json().then(data => {
            setErrors({ title: data.error || 'Error adding book' });
            throw new Error('Error adding book');
          });
        }
      })
      .catch(error => {
        console.error('Error adding new book:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="new-book-container">
      <h1>Add New Book</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={newBookSchema}
        onSubmit={onSubmit}
      >
        {formik => (
          <Form>
            <FormField label="Title" name="title" type="text" />
            <FormField label="Author" name="author" type="text" />
            <FormField label="Genre" name="genre" type="text" />
            <FormField label="Published Year" name="published_year" type="number" />
            {/* <FormField label="Rating" name="rating" type="number" min="1" max="5" /> */}
            <p>Or select an existing book:</p>
            <AutocompleteBookSelect 
              onChange={(selected) => formik.setFieldValue('selectedBook', selected)}
            />
            <button type="submit" disabled={formik.isSubmitting}>
              Add Book
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default NewBook;