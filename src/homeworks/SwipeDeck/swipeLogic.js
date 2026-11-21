export const ACTION_BY_DIRECTION = {
  left: 'PASS',
  right: 'LIKE',
  up: 'SUPER_LIKE',
};

// Asymmetric on purpose: a like is worth more than a pass costs.
export const POINTS_BY_ACTION = {
  LIKE: 10,
  SUPER_LIKE: 20,
  PASS: -5,
};

export const SWIPE_THRESHOLD = 50;

export function calcScore(history) {
  return history.reduce(
    (total, entry) => total + (POINTS_BY_ACTION[entry.type] ?? 0),
    0,
  );
}

// LIFO undo: the last swipe is the first one restored.
export function undoLast(history) {
  return history.slice(0, -1);
}

export function getRemaining(profiles, history) {
  const swipedIds = new Set(history.map((entry) => entry.profileId));
  return profiles.filter((profile) => !swipedIds.has(profile.id));
}

export function directionFromDelta(dx, dy) {
  if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  if (dy <= -SWIPE_THRESHOLD) return 'up';
  return null;
}