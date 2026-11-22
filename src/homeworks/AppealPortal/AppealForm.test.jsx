import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import AppealForm from './AppealForm.jsx';
import { fetchDossier, postAppeal, ApiError } from './appealApi.js';

vi.mock('./appealApi.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchDossier: vi.fn(), postAppeal: vi.fn() };
});

const DOSSIER = {
  id: 'himass',
  displayName: 'Himass',
  caseNumber: 'FP-001',
  matchesPlayed: 120,
  incidents: [],
};

function caseData(remainingMs = 3_600_000) {
  const now = Date.now();
  return {
    dossier: DOSSIER,
    sla: {
      deadline: new Date(now + remainingMs).toISOString(),
      serverTime: new Date(now).toISOString(),
    },
  };
}

const VALID = {
  fullName: 'Nguyen Van A',
  email: 'a@example.com',
  incidentDate: '2026-03-01',
  appealDate: '2026-03-05',
  reason: 'The penalty was applied to the wrong match record.',
};

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dossier/:playerID/appeal" element={<AppealForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function renderReady() {
  renderAt('/dossier/himass/appeal');
  await screen.findByLabelText('Full name');
}

function fill(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValid() {
  fill('Full name', VALID.fullName);
  fill('Email', VALID.email);
  fill('Incident date', VALID.incidentDate);
  fill('Appeal date', VALID.appealDate);
  fill('Reason', VALID.reason);
}

const clickSubmit = () => fireEvent.click(screen.getByRole('button', { name: /submit appeal/i }));

beforeEach(() => {
  vi.resetAllMocks();
  fetchDossier.mockResolvedValue(caseData());
  postAppeal.mockResolvedValue({ id: 'abc123', playerID: 'himass', createdAt: '2026-03-05T00:00:00.000Z' });
});

describe('AppealForm loading and errors', () => {
  it('shows a loading status first and requests the dossier with an abort signal', async () => {
    renderAt('/dossier/himass/appeal');
    expect(screen.getByRole('status').textContent).toContain('Loading');
    await screen.findByLabelText('Full name');
    expect(fetchDossier).toHaveBeenCalledWith(
      'himass',
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it('shows an in-page 404 when the server does not know the player', async () => {
    fetchDossier.mockRejectedValue(new ApiError('Dossier not found', 404));
    renderAt('/dossier/nobody/appeal');
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Dossier not found');
  });

  it('shows a retryable error when the request fails', async () => {
    fetchDossier.mockRejectedValueOnce(new ApiError('Internal server error', 500));
    renderAt('/dossier/himass/appeal');
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Could not load');
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await screen.findByLabelText('Full name');
    expect(fetchDossier).toHaveBeenCalledTimes(2);
  });
});

describe('AppealForm fields and validation', () => {
  it('renders the heading, the countdown and all five labelled fields', async () => {
    await renderReady();
    expect(screen.getByRole('heading', { level: 2, name: /Appeal for Himass/ })).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toMatch(/Time left to appeal: \d\d:\d\d:\d\d/);
    for (const label of ['Full name', 'Email', 'Incident date', 'Appeal date', 'Reason']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  it('shows no errors before the user interacts', async () => {
    await renderReady();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows a field error on blur and clears it once the value is valid', async () => {
    await renderReady();
    const name = screen.getByLabelText('Full name');
    fireEvent.blur(name);
    expect(screen.getByRole('alert').textContent).toBe('Full name is required');
    fireEvent.change(name, { target: { value: 'Nguyen Van A' } });
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows the cross-field error on the appeal date', async () => {
    await renderReady();
    fill('Incident date', '2026-03-10');
    fill('Appeal date', '2026-03-01');
    fireEvent.blur(screen.getByLabelText('Appeal date'));
    expect(screen.getByRole('alert').textContent).toBe(
      'Appeal date cannot be before the incident date',
    );
  });
});

describe('AppealForm submit', () => {
  it('blocks an invalid submit, shows every error and does not call the API', async () => {
    await renderReady();
    clickSubmit();
    expect(screen.getAllByRole('alert')).toHaveLength(5);
    expect(postAppeal).not.toHaveBeenCalled();
  });

  it('posts the appeal with the player id and shows the submitted data', async () => {
    await renderReady();
    fillValid();
    clickSubmit();
    await screen.findByRole('heading', { name: /submitted data/i });
    expect(postAppeal).toHaveBeenCalledWith({ playerID: 'himass', ...VALID });
    expect(screen.getByText('abc123')).toBeTruthy();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows the server message when the API rejects the appeal', async () => {
    postAppeal.mockRejectedValue(new ApiError('The appeal window has closed', 403));
    await renderReady();
    fillValid();
    clickSubmit();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('The appeal window has closed');
    expect(screen.queryByRole('heading', { name: /submitted data/i })).toBeNull();
  });

  it('shows a network message when the server cannot be reached', async () => {
    postAppeal.mockRejectedValue(new TypeError('Failed to fetch'));
    await renderReady();
    fillValid();
    clickSubmit();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Could not reach the server');
  });

  it('resets the form, the submitted data and the server error', async () => {
    await renderReady();
    fillValid();
    clickSubmit();
    await screen.findByRole('heading', { name: /submitted data/i });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText('Full name').value).toBe('');
    expect(screen.queryByRole('heading', { name: /submitted data/i })).toBeNull();
  });
});

describe('AppealForm SLA expiry', () => {
  it('announces the closed window and never posts after the deadline', async () => {
    fetchDossier.mockResolvedValue(caseData(-1000));
    await renderReady();
    expect(screen.getByRole('alert').textContent).toContain('appeal window has closed');
    expect(screen.getByRole('timer').textContent).toContain('closed');
    fillValid();
    clickSubmit();
    expect(postAppeal).not.toHaveBeenCalled();
  });
});