import { useId } from 'react';
import { useFormContext } from '../../components/FormContext.js';
import fieldStyles from '../../components/InputField.module.css';
import styles from './AppealForm.module.css';

// Same contract as InputField, but renders a <textarea>. Reads everything from FormContext.
export function TextAreaField({ label, name, ...textareaProps }) {
  const id = useId();
  const errorId = `${id}-error`;
  const { values, errors, touched, submitAttempted, handleChange, handleBlur } =
    useFormContext();
  const error = touched[name] || submitAttempted ? errors[name] : undefined;

  return (
    <p className={fieldStyles.field}>
      <label htmlFor={id}>{label}</label>
      <textarea
        {...textareaProps}
        id={id}
        name={name}
        className={styles.textarea}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className={fieldStyles.error} role="alert">
          {error}
        </span>
      )}
    </p>
  );
}