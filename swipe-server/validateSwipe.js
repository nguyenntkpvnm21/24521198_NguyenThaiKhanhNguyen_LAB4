export const ACTIONS = ['LIKE', 'PASS', 'SUPER_LIKE'];

export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Whitelist: only profileId and type ever reach the database.
export function validateSwipe(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Body must be a JSON object' };
  }
  const { profileId, type } = body;
  if (typeof profileId !== 'string' || !OBJECT_ID_PATTERN.test(profileId)) {
    return { error: 'profileId must be a 24 character hex id' };
  }
  if (!ACTIONS.includes(type)) {
    return { error: `type must be one of ${ACTIONS.join(', ')}` };
  }
  return { value: { profileId, type } };
}