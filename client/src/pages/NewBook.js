import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
//import './NewBook.css';

function NewBook() {
  const [libraryId, setLibraryId] = useState(null);
  const navigate = useNavigate();

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
          // Assuming the user has at least one library, take the first one
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
    rating: ''
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    author: Yup.string().required('Required'),
    genre: Yup.string(),
    published_year: Yup.number()
      .integer('Must be an integer')
      .min(0, 'Invalid year')
      .nullable(),
    rating: Yup.number()
      .integer('Must be an integer')
      .min(1, 'Minimum rating is 1')
      .max(5, 'Maximum rating is 5')
      .nullable()
  });

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    if (!libraryId) {
      setErrors({ title: 'Library not found' });
      setSubmitting(false);
      return;
    }

    fetch(`http://localhost:5555/library/${libraryId}/books`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
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
            <FormField label="Rating" name="rating" type="number" />
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
