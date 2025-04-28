import React from 'react';
import { useRequireLogin } from '../components/UseRequireLogin';
import { Formik, Form } from 'formik';
import FormField from '../components/FormField';
import { librarySchema } from '../components/ValidationSchema';
import Modal from '../components/Modal';

// Send new library to server and handle success or validation errors
function createLibrary(values, { setSubmitting, setErrors }, onSuccess, onClose) {
  fetch('/api/libraries', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
    .then(response => {
      if (response.ok) return response.json();
      return response.json().then(data => {
        setErrors({ name: data.error || 'Failed to create library' });
        throw new Error('Library creation failed');
      });
    })
    .then(data => {
      if (onSuccess) onSuccess(data);
      onClose();
      return data;
    })
    .catch(error => console.error('Error creating library:', error))
    .finally(() => setSubmitting(false));
}

function CreateLibraryModal({ onClose, onSuccess }) {
  useRequireLogin()

  const initialValues = {
    name: '',
    private: false
  };


  return (
    <Modal onClose={onClose}>
      <div className='create-library-container'>
        <h1>Create Library</h1>
        <Formik initialValues={initialValues} validationSchema={librarySchema}
          onSubmit={(values, helpers) => createLibrary(values, helpers, onSuccess, onClose)}
        >
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