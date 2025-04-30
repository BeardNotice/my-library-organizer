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
async function addNewBook({ values, libraryId, setSessionData, navigate, setSubmitting, setErrors }) {
  try {
    let bookId = values.selectedBook?.value;
    // 1) Create global book if none selected
    if (!bookId) {
      const createRes = await fetch('/api/books', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          author: values.author,
          genre: values.genre,
          published_year: values.published_year || null
        })
      });
      const created = await createRes.json();
      if (!createRes.ok) {
        setErrors({ title: created.error || 'Could not create book' });
        setSubmitting(false);
        return;
      }
      bookId = created.id;
    }

    // 2) Link book into library
    const linkPayload = { book_id: bookId };
    if (values.rating) linkPayload.rating = Number(values.rating);

    const linkRes = await fetch(`/api/libraries/${libraryId}/books`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkPayload)
    });
    const linkedBook = await linkRes.json();
    if (!linkRes.ok) {
      setErrors({ title: linkedBook.error || 'Could not add to library' });
      setSubmitting(false);
      return;
    }

    // 3) Merge into context
    setSessionData(prev => {
      const updatedLibraries = prev.libraries.map(lib =>
        lib.id === libraryId
          ? { ...lib, books: [...lib.books, linkedBook] }
          : lib
      );
      const alreadyGlobal = prev.books.some(b => b.id === linkedBook.id);
      return {
        ...prev,
        libraries: updatedLibraries,
        books: alreadyGlobal ? prev.books : [...prev.books, linkedBook]
      };
    });

    navigate('/');
  } catch (err) {
    console.error(err);
    setErrors({ title: err.message });
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
          addNewBook({ values, libraryId, setSessionData, navigate, setSubmitting, setErrors })
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