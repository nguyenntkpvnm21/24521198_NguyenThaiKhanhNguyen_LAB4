import { useId, useState } from 'react';
import { Link, useParams } from 'react-router';
import { FormContext } from '../../components/FormContext.js';
import { InputField } from '../../components/InputField.jsx';
import { ShowData } from '../../components/ShowData.jsx';
import { ApiError, postAppeal } from './appealApi.js';
import { useAppealCase } from './useAppealCase.js';
import { useAppealSlaTimer } from './useAppealSlaTimer.js';
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

function AppealFormBody({ dossier, sla }) {
  const headingId = useId();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  // Mounted only after the server answered, so deadline and serverTime are always valid.
  const { isExpired, display } = useAppealSlaTimer({
    deadline: sla.deadline,
    serverTime: sla.serverTime,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid || isExpired || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await postAppeal({ playerID: dossier.id, ...values });
      setSubmitted({ appealId: saved.id, playerID: saved.playerID, ...values });
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Could not reach the server. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched({});
    setSubmitAttempted(false);
    setSubmitError(null);
    setSubmitted(null);
  };

  return (
    <FormContext.Provider
      value={{ values, errors, touched, submitAttempted, handleChange, handleBlur }}
    >
      <section className={styles.panel} aria-labelledby={headingId}>
        <h2 id={headingId}>Appeal for {dossier.displayName}</h2>
        <p className={styles.timer} role="timer">
          {isExpired ? 'Appeal window closed' : `Time left to appeal: ${display}`}
        </p>
        {isExpired && (
          <p className={styles.message} role="alert">
            The appeal window has closed. This form is locked.
          </p>
        )}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <fieldset className={styles.fieldset} disabled={isExpired}>
            <legend className={styles.legend}>Appeal details</legend>
            <InputField label="Full name" name="fullName" type="text" autoComplete="name" />
            <InputField label="Email" name="email" type="email" autoComplete="email" />
            <InputField label="Incident date" name="incidentDate" type="date" />
            <InputField label="Appeal date" name="appealDate" type="date" />
            <TextAreaField label="Reason" name="reason" rows={5} />
            <p className={styles.actions}>
              <button type="submit" disabled={submitting}>
                Submit appeal
              </button>
              <button type="button" onClick={handleReset}>
                Reset
              </button>
            </p>
          </fieldset>
        </form>
        {submitError && (
          <p className={styles.message} role="alert">
            {submitError}
          </p>
        )}
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

export default function AppealForm() {
  const { playerID } = useParams();
  const { status, data, retry } = useAppealCase(playerID);

  if (status === 'loading') {
    return (
      <section className={styles.panel} role="status">
        Loading appeal window…
      </section>
    );
  }

  if (status === 'notfound') {
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

  if (status === 'error') {
    return (
      <section className={dossierStyles.alert} role="alert">
        <h2>Could not load the appeal window</h2>
        <p>The server did not answer. Check that it is running, then try again.</p>
        <p className={styles.actions}>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </p>
      </section>
    );
  }

  return <AppealFormBody dossier={data.dossier} sla={data.sla} />;
}