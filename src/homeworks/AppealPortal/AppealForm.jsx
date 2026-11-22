import { useId, useState } from 'react';
import { Link, useParams } from 'react-router';
import { FormContext } from '../../components/FormContext.js';
import { InputField } from '../../components/InputField.jsx';
import { ShowData } from '../../components/ShowData.jsx';
import { getDossier } from './dossierData.js';
import { validateAppeal } from './validateAppeal.js';
import { TextAreaField } from './TextAreaField.jsx';
import dossierStyles from './Dossier.module.css';
import styles from './AppealForm.module.css';

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  incidentDate: '',
  appealDate: '',
  reason: '',
};

export default function AppealForm() {
  const { playerID } = useParams();
  const dossier = getDossier(playerID);
  const headingId = useId();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  if (!dossier) {
    return (
      <section className={dossierStyles.alert} role="alert">
        <h2>Dossier not found</h2>
        <p>There is no dossier for &quot;{playerID}&quot;.</p>
        <Link className={dossierStyles.link} to="/dossier">
          Back to all dossiers
        </Link>
      </section>
    );
  }

  // Derived during render: no useEffect validation loop.
  const errors = validateAppeal(values);
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
    if (isValid) setSubmitted({ playerID: dossier.id, ...values });
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
        <h2 id={headingId}>Appeal for {dossier.displayName}</h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <InputField label="Full name" name="fullName" type="text" autoComplete="name" />
          <InputField label="Email" name="email" type="email" autoComplete="email" />
          <InputField label="Incident date" name="incidentDate" type="date" />
          <InputField label="Appeal date" name="appealDate" type="date" />
          <TextAreaField label="Reason" name="reason" rows={5} />
          <p className={styles.actions}>
            <button type="submit">Submit appeal</button>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </p>
        </form>
        <section className={styles.result} aria-live="polite">
          {submitted && (
            <>
              <h3>Submitted data</h3>
              <ShowData data={submitted} />
            </>
          )}
        </section>
      </section>
    </FormContext.Provider>
  );
}