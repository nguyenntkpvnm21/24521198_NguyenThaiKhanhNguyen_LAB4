/** @typedef {{ fullName: string, email: string, studentId: string }} FormValues */
/** @typedef {Partial<Record<keyof FormValues, string>>} FormErrors */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_PATTERN = /^\d{8}$/;

/**
 * Pure, synchronous validation. Runs during render, never inside an effect.
 * @param {FormValues} values
 * @returns {FormErrors} only invalid fields appear as keys
 */
export function validateForm(values) {
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const studentId = values.studentId.trim();
  /** @type {FormErrors} */
  const errors = {};

  if (fullName === '') errors.fullName = 'Full name is required.';
  else if (fullName.length < 2) errors.fullName = 'Full name must be at least 2 characters.';

  if (email === '') errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  if (studentId === '') errors.studentId = 'Student ID is required.';
  else if (!STUDENT_ID_PATTERN.test(studentId)) errors.studentId = 'Student ID must be exactly 8 digits.';

  return errors;
}