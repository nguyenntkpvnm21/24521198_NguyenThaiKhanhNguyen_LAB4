import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimpleForm } from './SimpleForm.jsx';

function fillValid() {
  fireEvent.change(screen.getByLabelText('Full name'), {
    target: { value: 'Nguyen Thai' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'nguyen@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Student ID'), {
    target: { value: '24521198' },
  });
}

describe('SimpleForm', () => {
  it('starts with three labelled inputs and no alerts', () => {
    render(<SimpleForm />);
    expect(screen.getByLabelText('Full name')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Student ID')).toBeTruthy();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows an error after an invalid field is blurred', () => {
    render(<SimpleForm />);
    fireEvent.blur(screen.getByLabelText('Email'));
    expect(screen.getByRole('alert').textContent).toMatch(/required/i);
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true');
  });

  it('updates the error live while typing, without effects', () => {
    render(<SimpleForm />);
    const email = screen.getByLabelText('Email');
    fireEvent.blur(email);
    fireEvent.change(email, { target: { value: 'abc' } });
    expect(screen.getByRole('alert').textContent).toMatch(/valid email/i);
    fireEvent.change(email, { target: { value: 'abc@example.com' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('blocks an invalid submit and shows every error', () => {
    render(<SimpleForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.queryByRole('heading', { name: 'Submitted data' })).toBeNull();
  });

  it('renders the inspector with the submitted values after a valid submit', () => {
    render(<SimpleForm />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('heading', { name: 'Submitted data' })).toBeTruthy();
    expect(screen.getByText('fullName').nextElementSibling.textContent).toBe('Nguyen Thai');
    expect(screen.getByText('studentId').nextElementSibling.textContent).toBe('24521198');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('reset clears the values, errors and inspector', () => {
    render(<SimpleForm />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Full name').value).toBe('');
    expect(screen.queryByRole('heading', { name: 'Submitted data' })).toBeNull();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });
});