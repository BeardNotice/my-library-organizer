import * as Yup from 'yup';

export const librarySchema = Yup.object({
  name: Yup.string()
    .min(3, 'Library name must be at least 3 characters')
    .max(100, 'Library name can be at most 100 characters')
    .required('Library name is required')
});

export const signupSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const newBookSchema = Yup.object({
  title: Yup.string().when('selectedBook', (selectedBook, schema) => {
    return !selectedBook ? schema.required('Title is required') : schema;
  }),
  author: Yup.string().when('selectedBook', (selectedBook, schema) => {
    return !selectedBook ? schema.required('Author is required') : schema;
  }),
  genre: Yup.string(),
  published_year: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' ? null : value
    )
    .integer('Must be an integer')
    .min(0, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .nullable(),
  rating: Yup.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating can be at most 5')
    .nullable(),
  selectedBook: Yup.object().nullable()
});