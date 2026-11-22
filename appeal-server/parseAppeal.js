import { validateAppeal } from '../src/homeworks/AppealPortal/validateAppeal.js';

// Only these fields are ever read from the request body (whitelist).
export const APPEAL_FIELDS = ['fullName', 'email', 'incidentDate', 'appealDate', 'reason'];

export function parseAppealPayload(body) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const values = {};
  const typeErrors = {};

  for (const field of APPEAL_FIELDS) {
    if (typeof source[field] === 'string') {
      values[field] = source[field];
    } else {
      values[field] = '';
      typeErrors[field] = `${field} is required and must be text`;
    }
  }

  const playerID = typeof source.playerID === 'string' ? source.playerID : '';
  if (!playerID) typeErrors.playerID = 'playerID is required and must be text';

  return { playerID, values, errors: { ...validateAppeal(values), ...typeErrors } };
}