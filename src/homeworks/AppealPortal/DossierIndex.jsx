import { Link } from 'react-router';
import { dossiers, SAMPLE_DATA_NOTICE } from './dossierData.js';
import styles from './Dossier.module.css';

export default function DossierIndex() {
  return (
    <section className={styles.page} aria-labelledby="dossier-index-title">
      <h2 id="dossier-index-title">Fair-Play Appeal Portal</h2>
      <p className={styles.notice}>{SAMPLE_DATA_NOTICE}</p>
      <ul className={styles.list}>
        {dossiers.map((d) => (
          <li key={d.id} className={styles.item}>
            <Link className={styles.link} to={`/dossier/${d.id}`}>
              {d.displayName} — Case {d.caseNumber}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}