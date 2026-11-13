import { Fragment } from 'react';
import styles from './ShowData.module.css';

export function ShowData({ data }) {
  return (
    <dl className={styles.inspector}>
      {Object.entries(data).map(([key, val]) => (
        <Fragment key={key}>
          <dt>{key}</dt>
          <dd>{String(val)}</dd>
        </Fragment>
      ))}
    </dl>
  );
}