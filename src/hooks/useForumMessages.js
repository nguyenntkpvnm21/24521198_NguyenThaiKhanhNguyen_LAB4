import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const NO_MESSAGES = [];

const toMessage = (err) =>
  err instanceof TypeError ? 'Cannot reach the forum server.' : err.message;

export function useForumMessages(forumId) {
  const [result, setResult] = useState({
    forumId: null,
    tick: 0,
    messages: NO_MESSAGES,
    error: null,
  });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/messages/${encodeURIComponent(forumId)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const messages = await res.json();
        if (!controller.signal.aborted) {
          setResult({ forumId, tick: refreshTick, messages, error: null });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setResult({
            forumId,
            tick: refreshTick,
            messages: NO_MESSAGES,
            error: toMessage(err),
          });
        }
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, [forumId, refreshTick]);

  const loading = result.forumId !== forumId;
  const refreshing = !loading && result.tick !== refreshTick;

  const retry = () => setRefreshTick((tick) => tick + 1);

  const postMessage = async (payload) => {
    const res = await fetch(
      `${API_URL}/api/messages/${encodeURIComponent(forumId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Request failed with status ${res.status}`);
    }
    const created = await res.json();
    setRefreshTick((tick) => tick + 1);
    return created;
  };

  return {
    data: loading ? NO_MESSAGES : result.messages,
    loading,
    refreshing,
    error: loading ? null : result.error,
    postMessage,
    retry,
  };
}