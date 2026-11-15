import { Navigate, NavLink, Route, Routes } from 'react-router';
import { ForumPage } from './components/ForumPage.jsx';
import PeopleLayout from './components/PeopleLayout.jsx';
import PersonDetail from './components/PersonDetail.jsx';
import { SimpleForm } from './components/SimpleForm.jsx';
import { PEOPLE } from './data/people.js';
import styles from './App.module.css';

const getTopLinkClassName = ({ isActive }) =>
  isActive ? `${styles.topLink} ${styles.topLinkActive}` : styles.topLink;

export default function App() {
  return (
    <>
      <header className={styles.header}>
        <h1>People Directory</h1>
        <nav aria-label="Primary">
          <ul className={styles.topList}>
            <li>
              <NavLink to="/people" className={getTopLinkClassName}>
                People
              </NavLink>
            </li>
            <li>
              <NavLink to="/form" className={getTopLinkClassName}>
                Form
              </NavLink>
            </li>
            <li>
              <NavLink to="/forum" className={getTopLinkClassName}>
                Forum
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/people" replace />} />
        <Route path="/people" element={<PeopleLayout people={PEOPLE} />}>
          <Route index element={<p>Select a person from the list.</p>} />
          <Route path=":id" element={<PersonDetail people={PEOPLE} />} />
        </Route>
        <Route
          path="/form"
          element={
            <main>
              <SimpleForm />
            </main>
          }
        />
        <Route
          path="/forum"
          element={
            <main>
              <ForumPage />
            </main>
          }
        />
        <Route
          path="*"
          element={
            <main>
              <section role="alert">
                <p>404: Page Not Found</p>
              </section>
            </main>
          }
        />
      </Routes>
    </>
  );
}