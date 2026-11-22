import { useEffect, useMemo, useState } from 'react';

export function computeRemainingMs(deadlineMs, offsetMs, nowMs) {
  const remaining = deadlineMs - (nowMs + offsetMs);
  return Number.isFinite(remaining) ? Math.max(0, remaining) : 0;
}

export function formatRemaining(ms) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

// Call this once the server response (deadline + serverTime, both ISO UTC) is available.
// The remaining time is always derived from absolute timestamps, never decremented.
export function useAppealSlaTimer({ deadline, serverTime, intervalMs = 1000 }) {
  const deadlineMs = Date.parse(deadline);
  const serverMs = Date.parse(serverTime);

  // Clock delta between server and this device, sampled when the server time arrives.
  const offsetMs = useMemo(() => serverMs - Date.now(), [serverMs]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const remainingMs = computeRemainingMs(deadlineMs, offsetMs, nowMs);
  const isExpired = remainingMs === 0;

  // Syncing with external systems (timer and page visibility), so an effect is appropriate.
  useEffect(() => {
    if (isExpired) return undefined;

    const resync = () => setNowMs(Date.now());
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resync();
    };

    const id = setInterval(resync, intervalMs);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isExpired, intervalMs]);

  return { remainingMs, isExpired, display: formatRemaining(remainingMs) };
}