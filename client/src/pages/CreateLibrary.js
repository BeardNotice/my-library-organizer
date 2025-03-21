import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';

function CreateLibrary() {
    const navigate = useNavigate();

    const initialValues = {
        name: '',
        private: false
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Required')
    });

    const onSubmit = (values, { setSubmitting, setErrors })=> {
        fetch('http://localhost:5555/library', {
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
                    setErrors({name: data.error || 'Failed to create library' });
                    throw new Error('Library creation failed');
                  });
                }
            })
            .catch(error=> {
                console.error('Error creating library:', error);
            })
            .finally(()=> {
                setSubmitting(false);
            });
    };
    return (
        <div className="create-library-container">
            <h1>Create Library</h1>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {formik => (
                    <Form>
                        <FormField label="Library Name" name="name" type="text" />
                        <button type="submit" disabled={formik.isSubmitting}>
                            Create Library
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default CreateLibrary;