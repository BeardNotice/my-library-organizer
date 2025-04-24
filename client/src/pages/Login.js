import React, { useContext } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { SessionContext } from '../index';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import './Login.css'

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

  const onSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        // Fetch full session data
        const sessionRes = await fetch('/api/user_session', { credentials: 'include' });
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          setSessionData({ ...data, books: data.libraries.flatMap(lib => lib.books) });
        }
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