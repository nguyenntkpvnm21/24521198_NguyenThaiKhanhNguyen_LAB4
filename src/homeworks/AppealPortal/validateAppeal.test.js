import { describe, it, expect } from 'vitest';
import { validateAppeal } from './validateAppeal.js';

const valid = {
  fullName: 'Nguyen Van A',
  email: 'a@example.com',
  incidentDate: '2026-03-01',
  appealDate: '2026-03-05',
  reason: 'The penalty was applied to the wrong match record.',
};

const withValues = (patch) => ({ ...valid, ...patch });

describe('validateAppeal', () => {
  it('accepts a complete valid appeal', () => {
    expect(validateAppeal(valid)).toEqual({});
  });

  it('requires a full name (whitespace does not count)', () => {
    expect(validateAppeal(withValues({ fullName: '   ' })).fullName).toBe(
      'Full name is required',
    );
  });

  it('requires at least 2 characters in the name', () => {
    expect(validateAppeal(withValues({ fullName: 'A' })).fullName).toBe(
      'Full name must be at least 2 characters',
    );
  });

  it('requires an email', () => {
    expect(validateAppeal(withValues({ email: '' })).email).toBe('Email is required');
  });

  it('rejects a malformed email', () => {
    expect(validateAppeal(withValues({ email: 'not-an-email' })).email).toBe(
      'Enter a valid email address',
    );
  });

  it('requires both dates', () => {
    const errors = validateAppeal(withValues({ incidentDate: '', appealDate: '' }));
    expect(errors.incidentDate).toBe('Incident date is required');
    expect(errors.appealDate).toBe('Appeal date is required');
  });

  it('rejects a malformed date', () => {
    expect(validateAppeal(withValues({ incidentDate: 'not-a-date' })).incidentDate).toBe(
      'Enter a valid date',
    );
  });

  it('rejects an appeal date before the incident date (cross-field)', () => {
    const errors = validateAppeal(
      withValues({ incidentDate: '2026-03-10', appealDate: '2026-03-01' }),
    );
    expect(errors.appealDate).toBe('Appeal date cannot be before the incident date');
    expect(errors.incidentDate).toBeUndefined();
  });

  it('allows an appeal on the same day as the incident', () => {
    const errors = validateAppeal(
      withValues({ incidentDate: '2026-03-01', appealDate: '2026-03-01' }),
    );
    expect(errors.appealDate).toBeUndefined();
  });

  it('skips the cross-field rule while a date is missing', () => {
    const errors = validateAppeal(withValues({ incidentDate: '' }));
    expect(errors.incidentDate).toBe('Incident date is required');
    expect(errors.appealDate).toBeUndefined();
  });

  it('requires a reason of at least 20 characters', () => {
    expect(validateAppeal(withValues({ reason: '' })).reason).toBe('Reason is required');
    expect(validateAppeal(withValues({ reason: 'Too short' })).reason).toBe(
      'Reason must be at least 20 characters',
    );
  });

  it('rejects a reason over 500 characters', () => {
    expect(validateAppeal(withValues({ reason: 'x'.repeat(501) })).reason).toBe(
      'Reason must be at most 500 characters',
    );
  });
});