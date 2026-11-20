import { describe, expect, it } from 'vitest';
import { buildSearch } from './buildSearch.js';

describe('buildSearch', () => {
  it('sets a param and keeps the others', () => {
    expect(
      buildSearch(new URLSearchParams('category=scene'), { photoId: '5' }),
    ).toBe('?category=scene&photoId=5');
  });

  it('removes a param when the value is empty', () => {
    expect(
      buildSearch(new URLSearchParams('category=scene&photoId=5'), { photoId: '' }),
    ).toBe('?category=scene');
  });

  it('returns an empty string when no params are left', () => {
    expect(
      buildSearch(new URLSearchParams('category=scene'), { category: '' }),
    ).toBe('');
  });

  it('does not mutate the original params', () => {
    const original = new URLSearchParams('category=scene');
    buildSearch(original, { category: '' });
    expect(original.get('category')).toBe('scene');
  });
});