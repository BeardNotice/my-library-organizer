import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import AutocompleteBookSelect from '../components/AutocompleteBookSelect';

function NewBook() {
  const [libraryId, setLibraryId] = useState(null);
  const navigate = useNavigate();

  // Fetch the library info on component mount
  useEffect(() => {
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
  }, []);

  const initialValues = {
    title: '',
    author: '',
    genre: '',
    published_year: '',
    selectedBook: null
  };

  const validationSchema = Yup.object({
    title: Yup.string().when('selectedBook', (selectedBook, schema) =>
      !selectedBook ? schema.required('Title is required') : schema
    ),
    author: Yup.string().when('selectedBook', (selectedBook, schema) =>
      !selectedBook ? schema.required('Author is required') : schema
    ),
    genre: Yup.string(),
    published_year: Yup.number()
      .transform((value, originalValue) => originalValue === '' ? null : value)
      .integer('Must be an integer')
      .min(0, 'Invalid year')
      .nullable(),
 
    selectedBook: Yup.object().nullable()
  });

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    if (!libraryId) {
      setErrors({ title: 'Library not found' });
      setSubmitting(false);
      return;
    }

    // Build payload from form values
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
    // Remove the extra field before sending
    delete payload.selectedBook;

    // Explicitly convert empty strings to null for numeric fields
    if (payload.published_year === '') {
      payload.published_year = null;
    } else {
      // Convert to a number
      payload.published_year = Number(payload.published_year);
    }

 

    // Log payload to help with debugging
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
        validationSchema={validationSchema}
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