import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useForumMessages } from './useForumMessages.js';

const MESSAGES = {
  nasa: [{ id: 'n1', author: 'A', text: 'nasa msg', timestamp: '2026-11-01T00:00:00.000Z' }],
  tribunal: [{ id: 't1', author: 'B', text: 'tribunal msg', timestamp: '2026-11-02T00:00:00.000Z' }],
};

/** fetch stub whose responses are resolved manually, so tests control timing */
function createFetchStub() {
  const calls = [];
  const stub = vi.fn((url, options = {}) => {
    return new Promise((resolve, reject) => {
      const call = { url, options, resolve, reject };
      options.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')),
      );
      calls.push(call);
    });
  });
  return { stub, calls };
}

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

let fetchStub;

beforeEach(() => {
  fetchStub = createFetchStub();
  vi.stubGlobal('fetch', fetchStub.stub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useForumMessages', () => {
  it('requests the forum endpoint with an abort signal and exposes loading then data', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(fetchStub.calls[0].url).toMatch(/\/api\/messages\/nasa$/);
    expect(fetchStub.calls[0].options.signal).toBeInstanceOf(AbortSignal);

    await act(async () => fetchStub.calls[0].resolve(jsonResponse(MESSAGES.nasa)));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(MESSAGES.nasa);
    expect(result.current.error).toBeNull();
  });

  it('aborts the in-flight request when the forum changes and clears stale data', async () => {
    const { result, rerender } = renderHook(({ id }) => useForumMessages(id), {
      initialProps: { id: 'nasa' },
    });
    await act(async () => fetchStub.calls[0].resolve(jsonResponse(MESSAGES.nasa)));
    await waitFor(() => expect(result.current.data).toEqual(MESSAGES.nasa));

    rerender({ id: 'esports-tribunal' });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    rerender({ id: 'notNasa' });
    expect(fetchStub.calls[1].options.signal.aborted).toBe(true);
    expect(fetchStub.calls[2].options.signal.aborted).toBe(false);
  });

  it('ignores a late response from an aborted request (no out-of-order overwrite)', async () => {
    const { result, rerender } = renderHook(({ id }) => useForumMessages(id), {
      initialProps: { id: 'nasa' },
    });
    rerender({ id: 'esports-tribunal' });

    await act(async () => fetchStub.calls[1].resolve(jsonResponse(MESSAGES.tribunal)));
    await waitFor(() => expect(result.current.data).toEqual(MESSAGES.tribunal));

    await act(async () => fetchStub.calls[0].resolve(jsonResponse(MESSAGES.nasa)));
    expect(result.current.data).toEqual(MESSAGES.tribunal);
  });

  it('aborts the request on unmount', () => {
    const { unmount } = renderHook(() => useForumMessages('nasa'));
    unmount();
    expect(fetchStub.calls[0].options.signal.aborted).toBe(true);
  });

  it('exposes an error for a non-OK response instead of treating it as data', async () => {
    const { result } = renderHook(() => useForumMessages('unknown'));
    await act(async () =>
      fetchStub.calls[0].resolve(jsonResponse({ error: 'Unknown forum' }, 404)),
    );
    await waitFor(() => expect(result.current.error).toMatch(/404/));
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('exposes a readable error when the server is unreachable', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => fetchStub.calls[0].reject(new TypeError('Failed to fetch')));
    await waitFor(() => expect(result.current.error).toMatch(/cannot reach/i));
  });

  it('retry refetches after an error', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => fetchStub.calls[0].reject(new TypeError('Failed to fetch')));
    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.retry());
    await waitFor(() => expect(fetchStub.calls).toHaveLength(2));
    await act(async () => fetchStub.calls[1].resolve(jsonResponse(MESSAGES.nasa)));
    await waitFor(() => expect(result.current.data).toEqual(MESSAGES.nasa));
    expect(result.current.error).toBeNull();
  });

  it('postMessage sends JSON to the current forum and triggers a refetch', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => fetchStub.calls[0].resolve(jsonResponse(MESSAGES.nasa)));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let posted;
    await act(async () => {
      const promise = result.current.postMessage({ author: 'Me', text: 'Hi' });
      await waitFor(() => expect(fetchStub.calls).toHaveLength(2));
      fetchStub.calls[1].resolve(jsonResponse({ id: 'new', author: 'Me', text: 'Hi' }, 201));
      posted = await promise;
    });
    expect(posted.id).toBe('new');
    expect(fetchStub.calls[1].options.method).toBe('POST');
    expect(JSON.parse(fetchStub.calls[1].options.body)).toEqual({ author: 'Me', text: 'Hi' });
    expect(fetchStub.calls[1].options.headers['Content-Type']).toBe('application/json');
    expect(fetchStub.calls[1].url).toMatch(/\/api\/messages\/nasa$/);

    await waitFor(() => expect(fetchStub.calls).toHaveLength(3));
    expect(fetchStub.calls[2].options.method).toBeUndefined();
  });

  it('postMessage rejects with the server error message on 400', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => fetchStub.calls[0].resolve(jsonResponse(MESSAGES.nasa)));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const promise = result.current.postMessage({ author: '', text: '' });
      await waitFor(() => expect(fetchStub.calls).toHaveLength(2));
      fetchStub.calls[1].resolve(jsonResponse({ error: 'Missing required fields' }, 400));
      await expect(promise).rejects.toThrow('Missing required fields');
    });
    expect(fetchStub.calls).toHaveLength(2);
  });
});