import { useParams } from 'react-router';
import styles from './PersonDetail.module.css';

export default function PersonDetail({ people }) {
  const { id } = useParams();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <section className={styles.notFound} role="alert">
        <p>404: Person Not Found</p>
      </section>
    );
  }

  return (
    <dl className={styles.details}>
      <dt>Name</dt>
      <dd>{person.name}</dd>
      <dt>Role</dt>
      <dd>{person.role}</dd>
      <dt>Age</dt>
      <dd>{person.age}</dd>
      <dt>IQ</dt>
      <dd>{person.iq}</dd>
    </dl>
  );
}