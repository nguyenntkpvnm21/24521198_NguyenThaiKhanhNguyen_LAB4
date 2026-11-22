const BASE_URL = (
  import.meta.env.VITE_APPEAL_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:4200`
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status, body?.fields);
  }
  return body;
}

export function fetchDossier(playerID, { signal } = {}) {
  return request(`/api/dossiers/${encodeURIComponent(playerID)}`, { signal });
}

export function postAppeal(payload) {
  return request('/api/appeals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}