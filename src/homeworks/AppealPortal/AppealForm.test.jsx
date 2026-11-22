import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import AppealForm from './AppealForm.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dossier/:playerID/appeal" element={<AppealForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

function fill(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValid() {
  fill('Full name', 'Nguyen Van A');
  fill('Email', 'a@example.com');
  fill('Incident date', '2026-03-01');
  fill('Appeal date', '2026-03-05');
  fill('Reason', 'The penalty was applied to the wrong match record.');
}

describe('AppealForm', () => {
  it('renders the heading and all five labelled fields', () => {
    renderAt('/dossier/himass/appeal');
    expect(screen.getByRole('heading', { level: 2, name: /Appeal for Himass/ })).toBeTruthy();
    for (const label of ['Full name', 'Email', 'Incident date', 'Appeal date', 'Reason']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  it('shows no errors before the user interacts', () => {
    renderAt('/dossier/himass/appeal');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows a field error on blur and clears it once the value is valid', () => {
    renderAt('/dossier/himass/appeal');
    const name = screen.getByLabelText('Full name');
    fireEvent.blur(name);
    expect(screen.getByRole('alert').textContent).toBe('Full name is required');
    fireEvent.change(name, { target: { value: 'Nguyen Van A' } });
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows the cross-field error on the appeal date', () => {
    renderAt('/dossier/himass/appeal');
    fill('Incident date', '2026-03-10');
    fill('Appeal date', '2026-03-01');
    fireEvent.blur(screen.getByLabelText('Appeal date'));
    expect(screen.getByRole('alert').textContent).toBe(
      'Appeal date cannot be before the incident date',
    );
  });

  it('blocks an invalid submit and shows every error', () => {
    renderAt('/dossier/himass/appeal');
    fireEvent.click(screen.getByRole('button', { name: /submit appeal/i }));
    expect(screen.getAllByRole('alert')).toHaveLength(5);
    expect(screen.queryByRole('heading', { name: /submitted data/i })).toBeNull();
  });

  it('accepts a valid submit and shows the submitted data with the player id', () => {
    renderAt('/dossier/himass/appeal');
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: /submit appeal/i }));
    expect(screen.getByRole('heading', { name: /submitted data/i })).toBeTruthy();
    expect(screen.getByText('himass')).toBeTruthy();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('resets the form and the submitted data', () => {
    renderAt('/dossier/himass/appeal');
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: /submit appeal/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText('Full name').value).toBe('');
    expect(screen.queryByRole('heading', { name: /submitted data/i })).toBeNull();
  });

  it('shows an in-page 404 for an unknown player', () => {
    renderAt('/dossier/nobody/appeal');
    expect(screen.getByRole('alert').textContent).toContain('Dossier not found');
  });
});