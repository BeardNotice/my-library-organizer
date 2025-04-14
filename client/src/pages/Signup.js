import {Formik, Form} from 'formik';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { signupSchema } from '../components/ValidationSchema';
import './Signup.css';

function Signup(){
    const navigate = useNavigate()

    const initialValues = {
        username: '',
        email: '',
        password: ''
    };

    const onSubmit = (values, { setSubmitting, setErrors })=>{
        fetch('/api/signup', {
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
                    setErrors({ username: data.error || 'Signup failed' });
                    throw new Error('Signup failed');
                });
            }
        })
        .catch(error=> {
            console.error('Signup error:', error);
        })
        .finally(()=>{
            setSubmitting(false);
        });
    };

    return (
        <div className="signup-container">
            <h1>Sign Up</h1>
            <Formik initialValues={initialValues} validationSchema={signupSchema} onSubmit={onSubmit}>
                {formik => (
                    <Form>
                        <FormField label="Username" name="username" type="text" />
                        <FormField label="Email" name="email" type="email" />
                        <FormField label="Password" name="password" type="password" />
                        <button type="submit" disabled={formik.isSubmitting}>
                            Sign Up
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default Signup