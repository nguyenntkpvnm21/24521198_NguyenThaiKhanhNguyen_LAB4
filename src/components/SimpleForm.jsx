import { useId, useState } from 'react';
import { validateForm } from '../utils/validateForm.js';
import { FormContext } from './FormContext.js';
import { InputField } from './InputField.jsx';
import styles from './SimpleForm.module.css';

const INITIAL_VALUES = { fullName: '', email: '', studentId: '' };

export function SimpleForm() {
  const headingId = useId();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitAttempted] = useState(false);

  const errors = validateForm(values);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <FormContext.Provider
      value={{ values, errors, touched, submitAttempted, handleChange, handleBlur }}
    >
      <section className={styles.panel} aria-labelledby={headingId}>
        <h2 id={headingId}>Registration Form</h2>
        <form className={styles.form} noValidate>
          <InputField label="Full name" name="fullName" type="text" autoComplete="name" />
          <InputField label="Email" name="email" type="email" autoComplete="email" />
          <InputField
            label="Student ID"
            name="studentId"
            type="text"
            inputMode="numeric"
            autoComplete="off"
          />
        </form>
      </section>
    </FormContext.Provider>
  );
}