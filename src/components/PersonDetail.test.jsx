import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PEOPLE } from '../data/people.js';
import PersonDetail from './PersonDetail.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/people/:id" element={<PersonDetail people={PEOPLE} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PersonDetail', () => {
  it('renders name and role as dt/dd pairs for a known id', () => {
    renderAt('/people/sp-2');
    const term = screen.getByText('Name');
    expect(term.tagName).toBe('DT');
    expect(term.nextElementSibling.tagName).toBe('DD');
    expect(term.nextElementSibling.textContent).toBe('Albert Einstein');
    expect(screen.getByText('Theoretical Physicist').tagName).toBe('DD');
  });

  it('renders a 404 alert for an unknown id', () => {
    renderAt('/people/does-not-exist');
    expect(screen.getByRole('alert').textContent).toContain(
      '404: Person Not Found',
    );
  });
});