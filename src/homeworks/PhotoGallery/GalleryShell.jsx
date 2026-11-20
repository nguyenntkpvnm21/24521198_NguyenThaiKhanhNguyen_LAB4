import { NavLink, Outlet } from 'react-router';
import styles from './GalleryShell.module.css';

const getTabClassName = ({ isActive }) =>
  isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab;

export default function GalleryShell() {
  return (
    <main className={styles.shell}>
      <h2>Photo &amp; Evidence Gallery</h2>
      <nav aria-label="Gallery sections">
        <ul className={styles.tabList}>
          <li>
            <NavLink to="/gallery" end className={getTabClassName}>
              Photos
            </NavLink>
          </li>
          <li>
            <NavLink to="/gallery/about" className={getTabClassName}>
              About
            </NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}