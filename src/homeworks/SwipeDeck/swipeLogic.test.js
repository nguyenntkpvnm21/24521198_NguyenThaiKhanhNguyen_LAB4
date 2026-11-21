import { describe, expect, it } from 'vitest';
import {
  ACTION_BY_DIRECTION,
  calcScore,
  directionFromDelta,
  getRemaining,
  undoLast,
} from './swipeLogic.js';

const entry = (profileId, type) => ({ profileId, type });

describe('ACTION_BY_DIRECTION', () => {
  it('maps swipe directions to actions', () => {
    expect(ACTION_BY_DIRECTION).toEqual({
      left: 'PASS',
      right: 'LIKE',
      up: 'SUPER_LIKE',
    });
  });
});

describe('calcScore (asymmetric, derived from history)', () => {
  it('is 0 for an empty history', () => {
    expect(calcScore([])).toBe(0);
  });

  it('gives +10 for LIKE, +20 for SUPER_LIKE and -5 for PASS', () => {
    expect(calcScore([entry('a', 'LIKE')])).toBe(10);
    expect(calcScore([entry('a', 'SUPER_LIKE')])).toBe(20);
    expect(calcScore([entry('a', 'PASS')])).toBe(-5);
  });

  it('adds a mixed history', () => {
    const history = [
      entry('a', 'LIKE'),
      entry('b', 'PASS'),
      entry('c', 'SUPER_LIKE'),
      entry('d', 'PASS'),
    ];
    expect(calcScore(history)).toBe(20);
  });

  it('ignores unknown action types', () => {
    expect(calcScore([entry('a', 'WAT')])).toBe(0);
  });
});

describe('undoLast (LIFO)', () => {
  it('removes only the most recent swipe', () => {
    const history = [entry('a', 'LIKE'), entry('b', 'PASS'), entry('c', 'LIKE')];
    expect(undoLast(history)).toEqual([entry('a', 'LIKE'), entry('b', 'PASS')]);
  });

  it('restores swipes in reverse order when undone repeatedly', () => {
    const history = [entry('a', 'LIKE'), entry('b', 'PASS')];
    expect(undoLast(undoLast(history))).toEqual([]);
  });

  it('does not mutate the original history', () => {
    const history = [entry('a', 'LIKE')];
    undoLast(history);
    expect(history).toHaveLength(1);
  });

  it('returns an empty history when there is nothing to undo', () => {
    expect(undoLast([])).toEqual([]);
  });
});

describe('getRemaining', () => {
  const profiles = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('returns every profile when nothing was swiped', () => {
    expect(getRemaining(profiles, [])).toEqual(profiles);
  });

  it('drops the swiped profiles and keeps the order', () => {
    expect(getRemaining(profiles, [entry('a', 'LIKE')])).toEqual([
      { id: 'b' },
      { id: 'c' },
    ]);
  });
});

describe('directionFromDelta (pointer gesture)', () => {
  it('detects a right swipe', () => {
    expect(directionFromDelta(80, 0)).toBe('right');
  });

  it('detects a left swipe', () => {
    expect(directionFromDelta(-80, 5)).toBe('left');
  });

  it('detects an upward swipe', () => {
    expect(directionFromDelta(10, -90)).toBe('up');
  });

  it('ignores movements below the threshold', () => {
    expect(directionFromDelta(30, 0)).toBeNull();
    expect(directionFromDelta(0, -30)).toBeNull();
  });

  it('prefers the dominant axis', () => {
    expect(directionFromDelta(60, -70)).toBe('up');
  });

  it('ignores a downward swipe', () => {
    expect(directionFromDelta(0, 90)).toBeNull();
  });
});