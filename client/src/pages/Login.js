import React, { useContext } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { SessionContext } from '../contexts/SessionProvider';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { setSessionData } = useContext(SessionContext);

  const initialValues = {
    username: '',
    password: ''
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Required'),
    password: Yup.string().required('Required')
  });

  // Handle login: send creds, fetch session & books, then redirect
  const onSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        // Fetch session data
        let data = {};
        const sessionRes = await fetch('/api/user_session', { credentials: 'include' });
        if (sessionRes.ok) {
          data = await sessionRes.json();
        }

        // Fetch global books list
        let books = [];
        const booksRes = await fetch('/api/books', { credentials: 'include' });
        if (booksRes.ok) {
          books = await booksRes.json();
        }

        // Set sessionData with both user info, libraries, and full book list
        setSessionData({ ...data, books });
        navigate('/');
        return {};
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Login failed';
        setErrors({ password: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setSubmitting(false);
    }
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
          <div className="login-form-container">
            <Form>
              <FormField label="Username" name="username" type="text" />
              <FormField label="Password" name="password" type="password" />
              <button type="submit" disabled={formik.isSubmitting}>
                Login
              </button>
            </Form>
          </div>
        )}
      </Formik>
      <div className="signup-redirect">
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;