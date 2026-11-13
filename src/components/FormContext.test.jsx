import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormContext, useFormContext } from './FormContext.js';

describe('FormContext', () => {
  it('throws a helpful error when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useFormContext())).toThrow(/FormContext/);
    spy.mockRestore();
  });

  it('returns the provided value inside a provider', () => {
    const value = { values: { fullName: 'A' }, errors: {} };
    const wrapper = ({ children }) => (
      <FormContext.Provider value={value}>{children}</FormContext.Provider>
    );
    const { result } = renderHook(() => useFormContext(), { wrapper });
    expect(result.current).toBe(value);
  });
});