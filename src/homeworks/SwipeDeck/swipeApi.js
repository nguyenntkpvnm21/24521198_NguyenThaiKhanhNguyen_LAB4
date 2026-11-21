const API_URL =
  import.meta.env.VITE_SWIPE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:4100`;

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

export const fetchProfiles = (signal) => request('/api/profiles', { signal });

export const fetchSwipes = (signal) => request('/api/swipes', { signal });

export const createSwipe = (profileId, type) =>
  request('/api/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, type }),
  });

export const removeSwipe = (profileId) =>
  request(`/api/swipe/${profileId}`, { method: 'DELETE' });