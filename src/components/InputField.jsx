import { useId } from 'react';
import { useFormContext } from './FormContext.js';
import styles from './InputField.module.css';

export function InputField({ label, name, ...inputProps }) {
  const id = useId();
  const errorId = `${id}-error`;
  const { values, errors, touched, submitAttempted, handleChange, handleBlur } =
    useFormContext();
  const error = touched[name] || submitAttempted ? errors[name] : undefined;

  return (
    <p className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        name={name}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </p>
  );
}