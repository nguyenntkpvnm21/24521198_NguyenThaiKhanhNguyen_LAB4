import { Navigate, Route, Routes } from 'react-router';
import PeopleLayout from './components/PeopleLayout.jsx';
import { PEOPLE } from './data/people.js';

export default function App() {
  return (
    <>
      <header>
        <h1>People Directory</h1>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/people" replace />} />
        <Route path="/people" element={<PeopleLayout people={PEOPLE} />}>
          <Route index element={<p>Select a person from the list.</p>} />
        </Route>
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