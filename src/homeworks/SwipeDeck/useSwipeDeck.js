import { useEffect, useState } from 'react';
import * as api from './swipeApi.js';
import {
  ACTION_BY_DIRECTION,
  calcScore,
  getRemaining,
  undoLast,
} from './swipeLogic.js';

export function useSwipeDeck() {
  const [profiles, setProfiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [syncError, setSyncError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [loadedProfiles, savedSwipes] = await Promise.all([
          api.fetchProfiles(controller.signal),
          api.fetchSwipes(controller.signal),
        ]);
        setProfiles(loadedProfiles);
        setHistory(
          savedSwipes.map(({ profileId, type }) => ({ profileId, type })),
        );
        setStatus('ready');
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.message);
        setStatus('error');
      }
    }

    load();
    return () => controller.abort();
  }, []);

  // Everything below is derived from profiles + history.
  const remaining = getRemaining(profiles, history);
  const current = remaining[0] ?? null;
  const score = calcScore(history);

  async function swipe(direction) {
    if (!current || isSaving) return;
    const entry = {
      profileId: current.id,
      type: ACTION_BY_DIRECTION[direction],
    };
    setHistory((previous) => [...previous, entry]);
    setIsSaving(true);
    try {
      await api.createSwipe(entry.profileId, entry.type);
      setSyncError('');
    } catch {
      setHistory((previous) =>
        previous.filter((item) => item.profileId !== entry.profileId),
      );
      setSyncError('Could not save your swipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function undo() {
    if (history.length === 0 || isSaving) return;
    const last = history[history.length - 1];
    setHistory(undoLast);
    setIsSaving(true);
    try {
      await api.removeSwipe(last.profileId);
      setSyncError('');
    } catch {
      setHistory((previous) => [...previous, last]);
      setSyncError('Could not undo the swipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    status,
    error,
    current,
    remainingCount: remaining.length,
    historyCount: history.length,
    score,
    syncError,
    isSaving,
    swipe,
    undo,
  };
}