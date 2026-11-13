import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PEOPLE } from '../data/people.js';
import PeopleLayout from './PeopleLayout.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/people" element={<PeopleLayout people={PEOPLE} />}>
          <Route index element={<p>Pick someone</p>} />
          <Route path=":id" element={<p>Child outlet content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('PeopleLayout', () => {
  it('renders one link per person pointing to /people/:id', () => {
    renderAt('/people');
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(PEOPLE.length);
    expect(links[0].getAttribute('href')).toBe(`/people/${PEOPLE[0].id}`);
  });

  it('marks only the active link with aria-current="page"', () => {
    renderAt('/people/sp-2');
    const active = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('aria-current') === 'page',
    );
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toBe('Albert Einstein');
  });

  it('renders the matched child route inside the main landmark', () => {
    renderAt('/people/sp-2');
    const main = screen.getByRole('main');
    expect(main.textContent).toContain('Child outlet content');
  });
});