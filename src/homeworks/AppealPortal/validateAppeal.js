const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidDate = (value) => DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));

// Pure and synchronous: called during render, never from an effect.
export function validateAppeal(values) {
  const errors = {};

  const fullName = values.fullName.trim();
  if (!fullName) errors.fullName = 'Full name is required';
  else if (fullName.length < 2) errors.fullName = 'Full name must be at least 2 characters';

  const email = values.email.trim();
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';

  const { incidentDate, appealDate } = values;
  if (!incidentDate) errors.incidentDate = 'Incident date is required';
  else if (!isValidDate(incidentDate)) errors.incidentDate = 'Enter a valid date';

  if (!appealDate) errors.appealDate = 'Appeal date is required';
  else if (!isValidDate(appealDate)) errors.appealDate = 'Enter a valid date';

  // Cross-field rule: ISO dates (YYYY-MM-DD) compare correctly as strings.
  if (!errors.incidentDate && !errors.appealDate && appealDate < incidentDate) {
    errors.appealDate = 'Appeal date cannot be before the incident date';
  }

  const reason = values.reason.trim();
  if (!reason) errors.reason = 'Reason is required';
  else if (reason.length < 20) errors.reason = 'Reason must be at least 20 characters';
  else if (reason.length > 500) errors.reason = 'Reason must be at most 500 characters';

  return errors;
}