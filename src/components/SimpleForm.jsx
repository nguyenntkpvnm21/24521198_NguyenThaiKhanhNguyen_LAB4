import { useId, useState } from 'react';
import { validateForm } from '../utils/validateForm.js';
import { FormContext, useFormContext } from './FormContext.js';
import styles from './SimpleForm.module.css';

const INITIAL_VALUES = { fullName: '', email: '', studentId: '' };

function FormStatus() {
  const { errors } = useFormContext();
  return <output>Fields with errors: {Object.keys(errors).length}</output>;
}

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
          <FormStatus />
        </form>
      </section>
    </FormContext.Provider>
  );
}