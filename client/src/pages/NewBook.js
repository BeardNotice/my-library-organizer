import React, { useState, useEffect, useContext } from 'react';
import { useRequireLogin } from '../hooks/UseRequireLogin';
import { Formik, Form } from 'formik';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../components/FormField';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';
import { newBookSchema } from '../components/ValidationSchema';
import { SessionContext } from '../contexts/SessionProvider';
import './NewBook.css';

// Add new book to library and update sessionData, then navigate home
async function addNewBook(values, libraryId, setSessionData, navigate, setSubmitting, setErrors) {
  if (!libraryId) {
    setErrors({ title: 'Library not found' });
    setSubmitting(false);
    return;
  }
  let payload = { ...values };
  if (values.selectedBook) {
    payload.book_id = values.selectedBook.value;
    if (!payload.title) payload.title = values.selectedBook.label;
    if (!payload.author && values.selectedBook.author) payload.author = values.selectedBook.author;
  }
  delete payload.selectedBook;
  if (payload.published_year === '') {
    payload.published_year = null;
  } else {
    payload.published_year = Number(payload.published_year);
  }
  // Early exit: prevent submission if both title and selectedBook are empty
  if (!payload.title && !values.selectedBook) {
    setErrors({ title: 'Title is required' });
    setSubmitting(false);
    return;
  }
  // Validate rating to be between 1 and 5 before submission
  if (payload.rating !== undefined && payload.rating !== '') {
    payload.rating = Number(payload.rating);
    if (payload.rating < 1 || payload.rating > 5) {
      setErrors({ rating: 'Rating must be between 1 and 5' });
      setSubmitting(false);
      return;
    }
  } else {
    delete payload.rating;
  }
  try {
    // Add new book to the library (and create globally if needed)
    const response = await fetch(`/api/libraries/${libraryId}/books`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const newBook = await response.json();
    if (!response.ok) {
      const errorMsg = newBook.error || 'Error adding book to library';
      setErrors({ title: errorMsg });
      alert(errorMsg);
      return;
    }
    setSessionData(prev => {
      const updatedLibraries = prev.libraries.map(lib =>
        lib.id === libraryId
          ? {
              ...lib,
              books: lib.books.some(b => b.id === newBook.id)
                ? lib.books
                : [...lib.books, newBook]
            }
          : lib
      );
      const updatedBooks = prev.books.some(b => b.id === newBook.id)
        ? prev.books
        : [...prev.books, newBook];

      return {
        ...prev,
        libraries: updatedLibraries,
        books: updatedBooks
      };
    });
    navigate('/');
    return newBook;
  } catch (error) {
    console.error('Error adding new book:', error);
    const errorMsg = error.message || 'Error adding new book';
    setErrors({ title: errorMsg });
    alert(errorMsg);
    return;
  } finally {
    setSubmitting(false);
  }
}

function NewBook() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const [libraryId, setLibraryId] = useState(null);
  const navigate = useNavigate();
  useRequireLogin()
  const [searchParams] = useSearchParams();

  // Pick library ID from URL or session; if none, use the first library
  useEffect(() => {
    const libs = sessionData.libraries || [];
    const queryLibraryId = searchParams.get('libraryId');
    if (queryLibraryId) {
      const parsedId = parseInt(queryLibraryId, 10);
      if (!isNaN(parsedId)) {
        setLibraryId(parsedId);
      }
    } else if (!libraryId && libs.length > 0) {
      setLibraryId(libs[0].id);
    }
  }, [searchParams, sessionData.libraries, libraryId]);

  const initialValues = {
    title: '',
    author: '',
    genre: '',
    published_year: '',
    rating: '',
    selectedBook: null
  };


  if (!libraryId) {
    return <p>No libraries found. Please create a library first.</p>;
  }

  return (
    <div className="new-book-container">
      <h1>Add New Book</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={newBookSchema}
        onSubmit={(values, { setSubmitting, setErrors }) =>
          addNewBook(values, libraryId, setSessionData, navigate, setSubmitting, setErrors)
        }
      >
        {formik => (
          <Form>
            <FormField label="Title" name="title" type="text" />
            <FormField label="Author" name="author" type="text" />
            <FormField label="Genre" name="genre" type="text" />
            <FormField label="Published Year" name="published_year" type="number" />
            <FormField label="Rating (1–5)" name="rating" type="number" min={1} max={5} />
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