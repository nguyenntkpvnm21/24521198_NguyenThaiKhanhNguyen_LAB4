// Fictional sample data for coursework. Not real records of any real person.
export const SAMPLE_DATA_NOTICE =
  'Sample data for coursework only. These are not real records.';

export const dossiers = [
  {
    id: 'himass',
    displayName: 'Himass',
    caseNumber: 'FP-001',
    matchesPlayed: 120,
    incidents: [
      { id: 'FP-001-1', rule: 'Pause limit', outcome: 'Warning' },
      { id: 'FP-001-2', rule: 'Pause limit', outcome: 'Warning' },
      { id: 'FP-001-3', rule: 'Chat conduct', outcome: 'Warning' },
      { id: 'FP-001-4', rule: 'Late check-in', outcome: 'Penalty' },
      { id: 'FP-001-5', rule: 'Chat conduct', outcome: 'Penalty' },
      { id: 'FP-001-6', rule: 'Pause limit', outcome: 'Penalty' },
    ],
  },
  {
    id: 'tanvuu',
    displayName: 'TanVuu',
    caseNumber: 'FP-002',
    matchesPlayed: 100,
    incidents: [
      { id: 'FP-002-1', rule: 'Late check-in', outcome: 'Penalty' },
      { id: 'FP-002-2', rule: 'Pause limit', outcome: 'Penalty' },
      { id: 'FP-002-3', rule: 'Chat conduct', outcome: 'Penalty' },
      { id: 'FP-002-4', rule: 'Pause limit', outcome: 'Penalty' },
      { id: 'FP-002-5', rule: 'Late check-in', outcome: 'Penalty' },
    ],
  },
];

export function getDossier(playerID) {
  const key = String(playerID ?? '').toLowerCase();
  return dossiers.find((d) => d.id === key) ?? null;
}

// Shape consumed by computeMatrix: counts derived from incidents, so they never drift.
export function toMatrixInput(dossier) {
  return {
    id: dossier.id,
    matchesPlayed: dossier.matchesPlayed,
    violations: dossier.incidents.length,
    penalties: dossier.incidents.filter((i) => i.outcome === 'Penalty').length,
  };
}