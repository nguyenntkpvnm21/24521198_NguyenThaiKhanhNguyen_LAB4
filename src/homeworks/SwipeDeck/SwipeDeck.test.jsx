import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SwipeDeck from './SwipeDeck.jsx';
import * as api from './swipeApi.js';

vi.mock('./swipeApi.js');

const ID_A = 'a'.repeat(24);
const ID_B = 'b'.repeat(24);
const ID_C = 'c'.repeat(24);
const PROFILES = [
  { id: ID_A, name: 'Linh', age: 24, bio: 'First profile.' },
  { id: ID_B, name: 'Minh', age: 26, bio: 'Second profile.' },
  { id: ID_C, name: 'An', age: 23, bio: 'Third profile.' },
];

beforeEach(() => {
  vi.resetAllMocks();
  api.fetchProfiles.mockResolvedValue(PROFILES);
  api.fetchSwipes.mockResolvedValue([]);
  api.createSwipe.mockResolvedValue({});
  api.removeSwipe.mockResolvedValue(null);
});

const getDeck = () => screen.getByRole('region', { name: 'Swipe deck' });
const getStatus = () => screen.getByRole('status').textContent;
const settle = () =>
  waitFor(() => expect(getDeck().getAttribute('aria-busy')).toBe('false'));

async function renderDeck() {
  render(
    <StrictMode>
      <SwipeDeck />
    </StrictMode>,
  );
  await screen.findByRole('heading', { name: /Linh, 24/ });
}

async function press(key) {
  fireEvent.keyDown(getDeck(), { key });
  await settle();
}

describe('SwipeDeck loading', () => {
  it('shows the first profile and the initial score', async () => {
    await renderDeck();
    expect(getStatus()).toBe('Score 0. 3 cards left.');
  });

  it('announces a load failure', async () => {
    api.fetchProfiles.mockRejectedValue(new Error('Request failed with status 500'));
    render(<SwipeDeck />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/Could not load profiles/);
  });

  it('restores the saved swipes from the server', async () => {
    api.fetchSwipes.mockResolvedValue([{ profileId: ID_A, type: 'LIKE' }]);
    render(<SwipeDeck />);
    await screen.findByRole('heading', { name: /Minh, 26/ });
    expect(getStatus()).toBe('Score 10. 2 cards left.');
  });
});

describe('SwipeDeck keyboard', () => {
  it('likes with ArrowRight (+10) and saves it', async () => {
    await renderDeck();
    await press('ArrowRight');
    expect(api.createSwipe).toHaveBeenCalledWith(ID_A, 'LIKE');
    expect(getStatus()).toBe('Score 10. 2 cards left.');
    expect(screen.getByRole('heading', { name: /Minh, 26/ })).toBeTruthy();
  });

  it('passes with ArrowLeft (-5)', async () => {
    await renderDeck();
    await press('ArrowLeft');
    expect(api.createSwipe).toHaveBeenCalledWith(ID_A, 'PASS');
    expect(getStatus()).toBe('Score -5. 2 cards left.');
  });

  it('super likes with ArrowUp (+20)', async () => {
    await renderDeck();
    await press('ArrowUp');
    expect(api.createSwipe).toHaveBeenCalledWith(ID_A, 'SUPER_LIKE');
    expect(getStatus()).toBe('Score 20. 2 cards left.');
  });

  it('undoes swipes in LIFO order with Backspace', async () => {
    await renderDeck();
    await press('ArrowRight');
    await press('ArrowLeft');
    expect(getStatus()).toBe('Score 5. 1 card left.');

    await press('Backspace');
    expect(api.removeSwipe).toHaveBeenLastCalledWith(ID_B);
    expect(getStatus()).toBe('Score 10. 2 cards left.');
    expect(screen.getByRole('heading', { name: /Minh, 26/ })).toBeTruthy();

    await press('Backspace');
    expect(api.removeSwipe).toHaveBeenLastCalledWith(ID_A);
    expect(getStatus()).toBe('Score 0. 3 cards left.');
  });

  it('ignores Backspace when there is nothing to undo', async () => {
    await renderDeck();
    await press('Backspace');
    expect(api.removeSwipe).not.toHaveBeenCalled();
  });

  it('shows the final score when the deck is finished', async () => {
    await renderDeck();
    await press('ArrowRight');
    await press('ArrowRight');
    await press('ArrowLeft');
    expect(screen.getByText(/No more profiles/)).toBeTruthy();
    expect(getStatus()).toBe('Score 15. 0 cards left.');
  });
});

describe('SwipeDeck pointer', () => {
  it('likes on a swipe to the right', async () => {
    await renderDeck();
    const card = screen.getByRole('article');
    fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 80, clientY: 0, pointerId: 1 });
    await settle();
    expect(api.createSwipe).toHaveBeenCalledWith(ID_A, 'LIKE');
  });

  it('ignores a short drag', async () => {
    await renderDeck();
    const card = screen.getByRole('article');
    fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 30, clientY: 0, pointerId: 1 });
    expect(api.createSwipe).not.toHaveBeenCalled();
  });

  it('does not crash when pointerup arrives without pointerdown', async () => {
    await renderDeck();
    const card = screen.getByRole('article');
    fireEvent.pointerUp(card, { clientX: 100, clientY: 0, pointerId: 1 });
    expect(api.createSwipe).not.toHaveBeenCalled();
    expect(getStatus()).toBe('Score 0. 3 cards left.');
  });
});

describe('SwipeDeck buttons and errors', () => {
  it('likes with the Like button', async () => {
    await renderDeck();
    fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    await settle();
    expect(api.createSwipe).toHaveBeenCalledWith(ID_A, 'LIKE');
  });

  it('rolls back the swipe and shows an alert when saving fails', async () => {
    api.createSwipe.mockRejectedValue(new Error('Request failed with status 500'));
    await renderDeck();
    await press('ArrowRight');
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /Could not save your swipe/,
    );
    expect(getStatus()).toBe('Score 0. 3 cards left.');
    expect(screen.getByRole('heading', { name: /Linh, 24/ })).toBeTruthy();
  });
});