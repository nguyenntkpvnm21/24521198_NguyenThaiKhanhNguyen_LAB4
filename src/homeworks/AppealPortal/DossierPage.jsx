import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { dossiers, getDossier, toMatrixInput, SAMPLE_DATA_NOTICE } from './dossierData.js';
import { computeMatrix } from './computeMatrix.js';
import styles from './Dossier.module.css';

export default function DossierPage() {
  const { playerID } = useParams();
  const dossier = getDossier(playerID);

  // Derived during render: no useEffect + setState.
  const matrix = useMemo(() => computeMatrix(dossiers.map(toMatrixInput)), []);

  if (!dossier) {
    return (
      <section className={styles.alert} role="alert">
        <h2>Dossier not found</h2>
        <p>There is no dossier for &quot;{playerID}&quot;.</p>
        <Link className={styles.link} to="/dossier">
          Back to all dossiers
        </Link>
      </section>
    );
  }

  const nameById = new Map(dossiers.map((d) => [d.id, d.displayName]));
  const penalties = dossier.incidents.filter((i) => i.outcome === 'Penalty').length;

  return (
    <section className={styles.page} aria-labelledby="dossier-title">
      <h2 id="dossier-title">
        {dossier.displayName} — Case {dossier.caseNumber}
      </h2>
      <p className={styles.notice}>{SAMPLE_DATA_NOTICE}</p>

      <dl className={styles.facts}>
        <dt>Matches played</dt>
        <dd>{dossier.matchesPlayed}</dd>
        <dt>Violations</dt>
        <dd>{dossier.incidents.length}</dd>
        <dt>Penalties</dt>
        <dd>{penalties}</dd>
      </dl>

      <Link className={styles.link} to={`/dossier/${dossier.id}/appeal`}>
        File an appeal
      </Link>

      <h3>Incidents</h3>
      <ul className={styles.list} aria-label="Incidents">
        {dossier.incidents.map((incident) => (
          <li key={incident.id} className={styles.item}>
            {incident.rule} — {incident.outcome}
          </li>
        ))}
      </ul>

      <h3>Disproportionality matrix</h3>
      <table className={styles.table}>
        <caption>Violation and penalty rates for all dossiers</caption>
        <thead>
          <tr>
            <th scope="col">Player</th>
            <th scope="col">Violations per 100 matches</th>
            <th scope="col">Penalties per violation</th>
            <th scope="col">Disproportion index</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.id} aria-current={row.id === dossier.id ? 'true' : undefined}>
              <th scope="row">{nameById.get(row.id)}</th>
              <td>{row.violationsPer100Matches}</td>
              <td>{row.penaltiesPerViolation}</td>
              <td>{row.disproportionIndex}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.notice}>
        Index 1 means penalties are proportional to violations across the group; above 1 means
        more penalties per violation than the group average. Penalty-rate gap between players:{' '}
        {matrix.gaps.penaltiesPerViolation}.
      </p>
    </section>
  );
}