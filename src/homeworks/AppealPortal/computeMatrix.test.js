import { describe, it, expect } from 'vitest';
import { computeMatrix } from './computeMatrix.js';

const A = { id: 'a', matchesPlayed: 120, violations: 6, penalties: 3 };
const B = { id: 'b', matchesPlayed: 100, violations: 5, penalties: 5 };

describe('computeMatrix', () => {
  it('returns one row per dossier with violation rate per 100 matches', () => {
    const { rows } = computeMatrix([A, B]);
    expect(rows.map((r) => r.id)).toEqual(['a', 'b']);
    expect(rows[0].violationsPer100Matches).toBe(5);
    expect(rows[1].violationsPer100Matches).toBe(5);
  });

  it('computes penalties per violation', () => {
    const { rows } = computeMatrix([A, B]);
    expect(rows[0].penaltiesPerViolation).toBe(0.5);
    expect(rows[1].penaltiesPerViolation).toBe(1);
  });

  it('computes the disproportion index against the group mean (1 = proportional)', () => {
    const { rows } = computeMatrix([A, B]);
    expect(rows[0].disproportionIndex).toBe(0.67);
    expect(rows[1].disproportionIndex).toBe(1.33);
  });

  it('reports the gap between the highest and lowest value per metric', () => {
    const { gaps } = computeMatrix([A, B]);
    expect(gaps.violationsPer100Matches).toBe(0);
    expect(gaps.penaltiesPerViolation).toBe(0.5);
  });

  it('never produces NaN or Infinity for zero violations or zero matches', () => {
    const { rows } = computeMatrix([
      { id: 'c', matchesPlayed: 50, violations: 0, penalties: 0 },
      { id: 'd', matchesPlayed: 0, violations: 0, penalties: 0 },
    ]);
    for (const row of rows) {
      expect(row.violationsPer100Matches).toBe(0);
      expect(row.penaltiesPerViolation).toBe(0);
      expect(row.disproportionIndex).toBe(0);
    }
  });

  it('handles an empty list', () => {
    expect(computeMatrix([])).toEqual({
      rows: [],
      gaps: { violationsPer100Matches: 0, penaltiesPerViolation: 0 },
    });
  });

  it('does not mutate its input', () => {
    const input = Object.freeze([Object.freeze({ ...A }), Object.freeze({ ...B })]);
    expect(() => computeMatrix(input)).not.toThrow();
  });
});