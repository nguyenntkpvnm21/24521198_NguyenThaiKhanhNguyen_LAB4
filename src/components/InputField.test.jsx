import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormContext } from './FormContext.js';
import { InputField } from './InputField.jsx';

function renderField(overrides = {}) {
  const value = {
    values: { email: '' },
    errors: { email: 'Enter a valid email address.' },
    touched: {},
    submitAttempted: false,
    handleChange: () => {},
    handleBlur: () => {},
    ...overrides,
  };
  return render(
    <FormContext.Provider value={value}>
      <InputField label="Email" name="email" type="email" />
    </FormContext.Provider>,
  );
}

describe('InputField', () => {
  it('binds the label to the input with a generated id', () => {
    renderField();
    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
    expect(input.id).not.toBe('');
  });

  it('hides the error while the field is untouched', () => {
    renderField();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('false');
    expect(screen.getByLabelText('Email').hasAttribute('aria-describedby')).toBe(false);
  });

  it('links the error with aria-invalid and aria-describedby once touched', () => {
    renderField({ touched: { email: true } });
    const input = screen.getByLabelText('Email');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Enter a valid email address.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('shows the error after a submit attempt even if untouched', () => {
    renderField({ submitAttempted: true });
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('shows no error when the value is valid', () => {
    renderField({ touched: { email: true }, errors: {} });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});