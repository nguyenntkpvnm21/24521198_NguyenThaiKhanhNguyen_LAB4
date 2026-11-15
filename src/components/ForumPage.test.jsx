import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ForumPage } from './ForumPage.jsx';

const DATA = {
  nasa: [{ id: 'n1', author: 'Mission Control', text: 'Telemetry nominal', timestamp: '2026-11-01T08:00:00.000Z' }],
  'esports-tribunal': [{ id: 't1', author: 'Clerk', text: 'Appeal received', timestamp: '2026-11-02T09:00:00.000Z' }],
  notNasa: [{ id: 'x1', author: 'Pilot', text: 'Off topic', timestamp: '2026-11-03T10:00:00.000Z' }],
};

const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

let fetchMock;
let failNext;

beforeEach(() => {
  failNext = false;
  fetchMock = vi.fn(async (url, options = {}) => {
    const forum = url.split('/').at(-1);
    if (options.method === 'POST') {
      const created = { id: 'new1', timestamp: '2026-11-04T00:00:00.000Z', ...JSON.parse(options.body) };
      DATA[forum] = [...DATA[forum], created];
      return json(created, 201);
    }
    if (failNext) {
      failNext = false;
      throw new TypeError('Failed to fetch');
    }
    return json(DATA[forum]);
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ForumPage', () => {
  it('renders three channel buttons with the first pressed and lists its messages in a dl', async () => {
    const { container } = render(<ForumPage />);
    const buttons = screen.getAllByRole('button', { pressed: true });
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe('NASA');
    expect(screen.getByRole('button', { name: 'Esports Tribunal' }).getAttribute('type')).toBe('button');
    expect(screen.getByRole('button', { name: 'notNasa' })).toBeTruthy();

    await screen.findByText('Telemetry nominal');
    expect(container.querySelector('dl')).not.toBeNull();
    expect(screen.getByText('Mission Control').tagName).toBe('DT');
  });

  it('switches channel, replacing the messages and the pressed state', async () => {
    render(<ForumPage />);
    await screen.findByText('Telemetry nominal');

    fireEvent.click(screen.getByRole('button', { name: 'Esports Tribunal' }));
    expect(screen.queryByText('Telemetry nominal')).toBeNull();
    await screen.findByText('Appeal received');
    expect(screen.getByRole('button', { name: 'Esports Tribunal' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'NASA' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('shows an alert with a retry button when the server is unreachable', async () => {
    failNext = true;
    render(<ForumPage />);
    const message = await screen.findByText(/cannot reach/i);
    expect(message.closest('[role="alert"]')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('Telemetry nominal');
    expect(screen.queryByText(/cannot reach/i)).toBeNull();
  });

  it('posts a message through the form and shows it after the refetch', async () => {
    render(<ForumPage />);
    await screen.findByText('Telemetry nominal');

    fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'Nguyen' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello forum' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await screen.findByText('Hello forum');
    expect(screen.getByLabelText('Message').value).toBe('');
    const postCall = fetchMock.mock.calls.find(([, o]) => o?.method === 'POST');
    expect(JSON.parse(postCall[1].body)).toEqual({ author: 'Nguyen', text: 'Hello forum' });
  });

  it('shows the server validation error when sending an empty message', async () => {
    fetchMock.mockImplementation(async (url, options = {}) => {
      if (options.method === 'POST') return json({ error: 'Missing required fields: author and text' }, 400);
      return json(DATA.nasa);
    });
    render(<ForumPage />);
    await screen.findByText('Telemetry nominal');
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    const message = await screen.findByText(/missing required/i);
    expect(message.closest('[role="alert"]')).not.toBeNull();
  });
});