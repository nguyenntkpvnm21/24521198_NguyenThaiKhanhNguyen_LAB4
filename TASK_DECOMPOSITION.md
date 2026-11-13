# Work Breakdown Structure (Exercise 1)
- [x] Task 1.1: Scaffold Vite project, clean boilerplate, mount StrictMode
- [x] Task 1.2: Contract spec in project-rules.md (docs)
- [x] Task 1.3: Design tokens and reset (CSS only)
- [x] Task 1.4: CSS Module scaffold for PeopleLayout and PersonDetail (CSS only)
- [x] Task 1.5: People dataset with stable string ids
- [x] Task 1.6: Install React Router v7 and Vitest tooling
- [x] Task 1.7: Fail test for PeopleLayout
- [x] Task 1.8: PeopleLayout with NavLink and Outlet, BrowserRouter mount (mandatory commit 1)
- [x] Task 1.9: Fail test for PersonDetail
- [x] Task 1.10: PersonDetail with useParams, find() and 404 guard (mandatory commit 2)
- [x] Task 1.11: CSS layout, then responsive 375px (CSS only)
- [x] Task 1.12: Verification (DevTools, grep, lint, build) and AI failure notes
- [ ] Task 1.13: Push to GitHub and tag lab4-ex1-done

* RULE: Never prompt AI with more than 1 sub-task at a time.
* RULE: Mandatory commits contain JSX/JS only. CSS goes in its own commits (1.3, 1.4, 1.11).

## Ex1 contract
```js
/**
 * @typedef {{ id: string, name: string, role: string, age: number, iq: number }} Person
 *
 * Routes:
 *   "/"            -> <Navigate to="/people" replace />
 *   "/people"      -> <PeopleLayout people={PEOPLE} />
 *     index        -> placeholder paragraph
 *     ":id"        -> <PersonDetail people={PEOPLE} />
 *   "*"            -> 404 page (role="alert")
 *
 * PeopleLayout({ people })
 *   <section frame> <nav aria-label="People"><ul><li><NavLink to="/people/:id" /></li></ul></nav>
 *   <main content><Outlet /></main></section>
 *   NavLink className = ({ isActive }) => link / link + activeLink
 *
 * PersonDetail({ people })
 *   id = useParams().id (string); person = people.find(p => p.id === id)
 *   not found -> <section role="alert"><p>404: Person Not Found</p></section>
 *   found     -> <dl> with dt/dd pairs: Name, Role, Age, IQ
 *
 * CSS Module classes:
 *   PeopleLayout: frame, sidebar, list, link, activeLink, content
 *   PersonDetail: details, notFound
 * Layout: mobile single column; from 48em grid-template-columns: minmax(280px, 1fr) 2fr
 */
```