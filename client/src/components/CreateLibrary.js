import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import FormField from '../components/FormField';
import { librarySchema } from '../components/ValidationSchema';
import Modal from '../components/Modal';
import { SessionContext } from '../index';

function CreateLibraryModal({ onClose, onSuccess }) {
  const { sessionData } = useContext(SessionContext);
  const isLoggedIn = Boolean(sessionData?.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const initialValues = {
    name: '',
    private: false
  };

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    fetch('/api/libraries', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(data => {
            setErrors({ name: data.error || 'Failed to create library' });
            throw new Error('Library creation failed');
          });
        }
      })
      .then(data => {
        if (onSuccess) {
          onSuccess(data); // Notify Home that a new library has been created
        }
        onClose();
        return data;
      })
      .catch(error => {
        console.error('Error creating library:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Modal onClose={onClose}>
      <div className='create-library-container'>
        <h1>Create Library</h1>
        <Formik initialValues={initialValues} validationSchema={librarySchema} onSubmit={onSubmit}>
          {formik => (
            <Form>
              <FormField label='Library Name' name='name' type='text' />
              <div className='button-group'>
                <button type='submit' disabled={formik.isSubmitting}>
                  Create Library
                </button>
                <button type='button' onClick={onClose}>
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
}

export default CreateLibraryModal;