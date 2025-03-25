import React from 'react';
import { Formik, Form } from 'formik';
import FormField from '../components/FormField';
import { librarySchema } from '../components/ValidationSchema';
import Modal from '../components/Modal';

function CreateLibraryModal({ onClose, onSuccess }) {
  const initialValues = {
    name: '',
    private: false
  };

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    fetch('http://localhost:5555/library', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
      .then(response => {
        if (response.ok) {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
          return response.json();
        } else {
          return response.json().then(data => {
            setErrors({ name: data.error || 'Failed to create library' });
            throw new Error('Library creation failed');
          });
        }
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