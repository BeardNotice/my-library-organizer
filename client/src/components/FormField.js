import { Field, ErrorMessage } from 'formik';
import './FormField.css'

function FormField({ label, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{label}:</label>
      <Field id={props.name} {...props} />
      <ErrorMessage name={props.name} component="div" className="error" />
    </div>
  );
}

export default FormField;