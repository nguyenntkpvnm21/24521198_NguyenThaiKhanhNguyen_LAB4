import { describe, expect, it } from 'vitest';
import { ACTIONS, validateSwipe } from './validateSwipe.js';

const ID = 'a'.repeat(24);

describe('validateSwipe', () => {
  it('returns only the whitelisted fields', () => {
    expect(
      validateSwipe({ profileId: ID, type: 'LIKE', score: 9999, _id: 'x' }),
    ).toEqual({ value: { profileId: ID, type: 'LIKE' } });
  });

  it.each(ACTIONS)('accepts the %s action', (type) => {
    expect(validateSwipe({ profileId: ID, type }).error).toBeUndefined();
  });

  it('rejects a missing body', () => {
    expect(validateSwipe(undefined).error).toBeDefined();
  });

  it('rejects an array body', () => {
    expect(validateSwipe([]).error).toBeDefined();
  });

  it('rejects a profileId that is not a 24 character hex id', () => {
    expect(validateSwipe({ profileId: 'abc', type: 'LIKE' }).error).toBeDefined();
  });

  it('rejects a non-string profileId', () => {
    expect(validateSwipe({ profileId: 123, type: 'LIKE' }).error).toBeDefined();
  });

  it('rejects an unknown action type', () => {
    expect(validateSwipe({ profileId: ID, type: 'DISLIKE' }).error).toBeDefined();
  });
});