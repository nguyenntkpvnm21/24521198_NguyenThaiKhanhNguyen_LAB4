import { NavLink, Outlet } from 'react-router';
import styles from './PeopleLayout.module.css';

const getLinkClassName = ({ isActive }) =>
  isActive ? `${styles.link} ${styles.activeLink}` : styles.link;

export default function PeopleLayout({ people }) {
  return (
    <section className={styles.frame}>
      <nav className={styles.sidebar} aria-label="People">
        <ul className={styles.list}>
          {people.map((p) => (
            <li key={p.id}>
              <NavLink to={`/people/${p.id}`} className={getLinkClassName}>
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </section>
  );
}