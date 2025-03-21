import React from 'react';
import { Field, ErrorMessage } from 'formik';

function FormField({ label, name, type = 'text' }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}:</label>
      <Field type={type} id={name} name={name} />
      <ErrorMessage name={name} component="div" className="error" />
    </div>
  );
}

export default FormField;