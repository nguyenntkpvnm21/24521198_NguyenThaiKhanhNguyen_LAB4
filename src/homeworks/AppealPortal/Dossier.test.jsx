import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import DossierPage from './DossierPage.jsx';
import DossierIndex from './DossierIndex.jsx';
import { SAMPLE_DATA_NOTICE } from './dossierData.js';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dossier" element={<DossierIndex />} />
        <Route path="/dossier/:playerID" element={<DossierPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DossierIndex', () => {
  it('links to every dossier', () => {
    renderAt('/dossier');
    const himass = screen.getByRole('link', { name: /Himass/ });
    const tanvuu = screen.getByRole('link', { name: /TanVuu/ });
    expect(himass.getAttribute('href')).toBe('/dossier/himass');
    expect(tanvuu.getAttribute('href')).toBe('/dossier/tanvuu');
  });
});

describe('DossierPage', () => {
  it('shows the player heading and the sample-data notice', () => {
    renderAt('/dossier/himass');
    expect(screen.getByRole('heading', { level: 2, name: /Himass/ })).toBeTruthy();
    expect(screen.getByText(SAMPLE_DATA_NOTICE)).toBeTruthy();
  });

  it('matches the player id case-insensitively', () => {
    renderAt('/dossier/TanVuu');
    expect(screen.getByRole('heading', { level: 2, name: /TanVuu/ })).toBeTruthy();
  });

  it('lists the incidents of the selected player', () => {
    renderAt('/dossier/himass');
    const list = screen.getByRole('list', { name: 'Incidents' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
  });

  it('shows the derived matrix with one row per player', () => {
    renderAt('/dossier/himass');
    const table = screen.getByRole('table', { name: /violation and penalty rates/i });
    const tanvuuRow = within(table).getByRole('row', { name: /TanVuu/ });
    expect(tanvuuRow.textContent).toContain('1.33');
    const himassRow = within(table).getByRole('row', { name: /Himass/ });
    expect(himassRow.textContent).toContain('0.67');
  });

  it('links to the appeal form for the selected player', () => {
    renderAt('/dossier/himass');
    const link = screen.getByRole('link', { name: /file an appeal/i });
    expect(link.getAttribute('href')).toBe('/dossier/himass/appeal');
  });
  
  it('shows an in-page 404 for an unknown player id', () => {
    renderAt('/dossier/nobody');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Dossier not found');
    const back = within(alert).getByRole('link', { name: /back to all dossiers/i });
    expect(back.getAttribute('href')).toBe('/dossier');
  });
});