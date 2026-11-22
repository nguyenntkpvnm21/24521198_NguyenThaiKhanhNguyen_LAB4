import { useEffect, useState } from 'react';
import { fetchDossier } from './appealApi.js';

// "loading" is derived: it is true whenever the stored result belongs to another
// player or another attempt, so it resets itself without setState inside the effect body.
export function useAppealCase(playerID) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchDossier(playerID, { signal: controller.signal })
      .then((data) => setResult({ playerID, attempt, status: 'ready', data }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setResult({
          playerID,
          attempt,
          status: error.status === 404 ? 'notfound' : 'error',
        });
      });
    return () => controller.abort();
  }, [playerID, attempt]);

  const current =
    result && result.playerID === playerID && result.attempt === attempt ? result : null;

  return {
    status: current?.status ?? 'loading',
    data: current?.data,
    retry: () => setAttempt((n) => n + 1),
  };
}