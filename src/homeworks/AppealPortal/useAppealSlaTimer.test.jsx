import { StrictMode } from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useAppealSlaTimer,
  computeRemainingMs,
  formatRemaining,
} from './useAppealSlaTimer.js';

const HOUR = 3_600_000;
const T0 = new Date('2026-03-01T00:00:00Z');

function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

function fireVisibilityChange() {
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.visibilityState;
});

describe('formatRemaining', () => {
  it('formats milliseconds as HH:MM:SS, rounding partial seconds up', () => {
    expect(formatRemaining(0)).toBe('00:00:00');
    expect(formatRemaining(1)).toBe('00:00:01');
    expect(formatRemaining(1000)).toBe('00:00:01');
    expect(formatRemaining(3_661_000)).toBe('01:01:01');
    expect(formatRemaining(72 * HOUR)).toBe('72:00:00');
  });

  it('never shows negative time', () => {
    expect(formatRemaining(-5000)).toBe('00:00:00');
  });
});

describe('computeRemainingMs', () => {
  it('applies the clock offset and clamps at zero', () => {
    expect(computeRemainingMs(10_000, 0, 4_000)).toBe(6_000);
    expect(computeRemainingMs(10_000, 2_000, 4_000)).toBe(4_000);
    expect(computeRemainingMs(10_000, 0, 20_000)).toBe(0);
  });

  it('treats an invalid deadline as expired instead of returning NaN', () => {
    expect(computeRemainingMs(Number.NaN, 0, 1_000)).toBe(0);
  });
});

describe('useAppealSlaTimer', () => {
  const props = {
    deadline: new Date(T0.getTime() + HOUR).toISOString(),
    serverTime: T0.toISOString(),
  };

  it('starts from deadline minus server time', () => {
    const { result } = renderHook(() => useAppealSlaTimer(props));
    expect(result.current.remainingMs).toBe(HOUR);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.display).toBe('01:00:00');
  });

  it('uses the server clock, not the local clock, as the reference', () => {
    // Local clock is one hour behind the server; the deadline is 2h after server time.
    const serverTime = new Date(T0.getTime() + HOUR).toISOString();
    const deadline = new Date(T0.getTime() + 3 * HOUR).toISOString();
    const { result } = renderHook(() => useAppealSlaTimer({ deadline, serverTime }));
    expect(result.current.remainingMs).toBe(2 * HOUR);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.remainingMs).toBe(2 * HOUR - 60_000);
  });

  it('recomputes from the absolute clock on every tick (no accumulated drift)', () => {
    const { result } = renderHook(() => useAppealSlaTimer(props));
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(HOUR - 5_000);
  });

  it('resyncs immediately when a throttled tab becomes visible again', () => {
    setVisibility('visible');
    const { result } = renderHook(() => useAppealSlaTimer(props));
    // Clock jumps 10 minutes while no timer fires (background tab throttling).
    vi.setSystemTime(new Date(T0.getTime() + 10 * 60_000));
    expect(result.current.remainingMs).toBe(HOUR);
    fireVisibilityChange();
    expect(result.current.remainingMs).toBe(HOUR - 10 * 60_000);
  });

  it('does not resync while the tab is hidden', () => {
    setVisibility('hidden');
    const { result } = renderHook(() => useAppealSlaTimer(props));
    vi.setSystemTime(new Date(T0.getTime() + 10 * 60_000));
    fireVisibilityChange();
    expect(result.current.remainingMs).toBe(HOUR);
  });

  it('stops at zero, flags expiry and stops its interval', () => {
    const deadline = new Date(T0.getTime() + 3_000).toISOString();
    const { result } = renderHook(() =>
      useAppealSlaTimer({ deadline, serverTime: props.serverTime }),
    );
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.display).toBe('00:00:00');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes its listener and interval on unmount, even under StrictMode', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const count = (spy) => spy.mock.calls.filter(([type]) => type === 'visibilitychange').length;

    const { unmount } = renderHook(() => useAppealSlaTimer(props), { wrapper: StrictMode });
    expect(count(add) - count(remove)).toBe(1);
    unmount();
    expect(count(add) - count(remove)).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});