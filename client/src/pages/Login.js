import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';

function Login() {
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    password: ''
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Required'),
    password: Yup.string().required('Required')
  });

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    fetch('http://localhost:5555/login', {
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
            setErrors({ password: data.error || 'Login failed' });
            throw new Error('Login failed');
          });
        }
      })
      .catch(error => {
        console.error('Login error:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {formik => (
          <Form>
            <FormField label="Username" name="username" type="text" />
            <FormField label="Password" name="password" type="password" />
            <button type="submit" disabled={formik.isSubmitting}>
              Login
            </button>
          </Form>
        )}
      </Formik>
      <div className="signup-redirect">
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;