// Disproportionality Derived Matrix (our reading of the spec, which does not define it):
// per dossier, violation rate per 100 matches, penalties per violation, and an index of
// penaltiesPerViolation relative to the group mean (1 = proportional, > 1 = harsher).
// Pure function: safe to call during render or inside useMemo.
const round2 = (n) => Math.round(n * 100) / 100;
const safeDivide = (a, b) => (b === 0 ? 0 : a / b);

export function computeMatrix(dossiers) {
  const base = dossiers.map((d) => ({
    id: d.id,
    violationsPer100Matches: safeDivide(d.violations, d.matchesPlayed) * 100,
    penaltiesPerViolation: safeDivide(d.penalties, d.violations),
  }));

  const mean = safeDivide(
    base.reduce((sum, r) => sum + r.penaltiesPerViolation, 0),
    base.length,
  );

  const rows = base.map((r) => ({
    id: r.id,
    violationsPer100Matches: round2(r.violationsPer100Matches),
    penaltiesPerViolation: round2(r.penaltiesPerViolation),
    disproportionIndex: round2(safeDivide(r.penaltiesPerViolation, mean)),
  }));

  const gap = (key) =>
    base.length === 0
      ? 0
      : round2(Math.max(...base.map((r) => r[key])) - Math.min(...base.map((r) => r[key])));

  return {
    rows,
    gaps: {
      violationsPer100Matches: gap('violationsPer100Matches'),
      penaltiesPerViolation: gap('penaltiesPerViolation'),
    },
  };
}