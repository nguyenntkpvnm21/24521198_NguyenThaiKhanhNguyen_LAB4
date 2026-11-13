import { useId, useState } from 'react';
import { validateForm } from '../utils/validateForm.js';
import { FormContext } from './FormContext.js';
import { InputField } from './InputField.jsx';
import { ShowData } from './ShowData.jsx';
import styles from './SimpleForm.module.css';

const INITIAL_VALUES = { fullName: '', email: '', studentId: '' };

export function SimpleForm() {
  const headingId = useId();
  const resultHeadingId = useId();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const errors = validateForm(values);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (isValid) setSubmitted(values);
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched({});
    setSubmitAttempted(false);
    setSubmitted(null);
  };

  return (
    <FormContext.Provider
      value={{ values, errors, touched, submitAttempted, handleChange, handleBlur }}
    >
      <section className={styles.panel} aria-labelledby={headingId}>
        <h2 id={headingId}>Registration Form</h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <InputField label="Full name" name="fullName" type="text" autoComplete="name" />
          <InputField label="Email" name="email" type="email" autoComplete="email" />
          <InputField
            label="Student ID"
            name="studentId"
            type="text"
            inputMode="numeric"
            autoComplete="off"
          />
          <p className={styles.actions}>
            <button type="submit">Submit</button>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </p>
        </form>
        <section className={styles.result} aria-live="polite">
          {submitted && (
            <>
              <h3 id={resultHeadingId}>Submitted data</h3>
              <ShowData data={submitted} />
            </>
          )}
        </section>
      </section>
    </FormContext.Provider>
  );
}