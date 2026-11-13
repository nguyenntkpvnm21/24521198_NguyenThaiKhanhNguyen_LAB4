import { describe, expect, it } from 'vitest';
import { validateForm } from './validateForm.js';

const VALID = {
  fullName: 'Nguyen Thai',
  email: 'nguyen@example.com',
  studentId: '24521198',
};

describe('validateForm', () => {
  it('returns an empty object for valid values', () => {
    expect(validateForm(VALID)).toEqual({});
  });

  it('reports every empty field as required', () => {
    const errors = validateForm({ fullName: '', email: '', studentId: '' });
    expect(Object.keys(errors).toSorted()).toEqual([
      'email',
      'fullName',
      'studentId',
    ]);
    expect(errors.fullName).toMatch(/required/i);
  });

  it('rejects a malformed email', () => {
    const errors = validateForm({ ...VALID, email: 'not-an-email' });
    expect(errors.email).toMatch(/valid email/i);
    expect(errors.fullName).toBeUndefined();
  });

  it('rejects a student id that is not exactly 8 digits', () => {
    expect(validateForm({ ...VALID, studentId: '2452119' }).studentId).toBeDefined();
    expect(validateForm({ ...VALID, studentId: '2452119a' }).studentId).toBeDefined();
    expect(validateForm({ ...VALID, studentId: '245211980' }).studentId).toBeDefined();
  });

  it('trims whitespace before validating', () => {
    expect(validateForm({ ...VALID, fullName: '   ' }).fullName).toMatch(/required/i);
    expect(validateForm({ ...VALID, studentId: ' 24521198 ' })).toEqual({});
  });

  it('does not mutate its input', () => {
    const input = Object.freeze({ ...VALID });
    expect(() => validateForm(input)).not.toThrow();
  });
});