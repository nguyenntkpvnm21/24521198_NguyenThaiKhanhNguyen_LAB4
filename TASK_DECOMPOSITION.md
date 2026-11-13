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
- [x] Task 1.13: Push to GitHub and tag lab4-ex1-done

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

# Work Breakdown Structure (Exercise 2)
- [ ] Task 2.1: WBS and contract for the form engine (docs commit)
- [ ] Task 2.2: CSS Module scaffold and danger token (CSS only)
- [ ] Task 2.3: Fail test, then synchronous validateForm rules
- [ ] Task 2.4: Fail test, then FormContext and SimpleForm state (mandatory commit 1)
- [ ] Task 2.5: Primary navigation and /form route
- [ ] Task 2.6: Fail test, then InputField with useId, aria-invalid, aria-describedby (mandatory commit 2)
- [ ] Task 2.7: Fail test, then ShowData inspector, submit and reset (mandatory commit 3)
- [ ] Task 2.8: CSS layout, then responsive 375px (CSS only)
- [ ] Task 2.9: Verification (Profiler, DevTools, grep, lint, build) and AI failure notes
- [ ] Task 2.10: Push to GitHub and tag lab4-ex2-done

* RULE: Never prompt AI with more than 1 sub-task at a time.
* RULE: Mandatory commits contain JSX/JS only. CSS goes in its own commits (2.2, 2.8).

## Ex2 contract
```js
/**
 * @typedef {{ fullName: string, email: string, studentId: string }} FormValues
 * @typedef {Partial<Record<keyof FormValues, string>>} FormErrors  // only invalid fields are keys
 *
 * validateForm(values) -> FormErrors   (pure, synchronous, trims input)
 *   fullName: required, at least 2 chars
 *   email: required, /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *   studentId: required, exactly 8 digits
 *
 * FormContext value: { values, errors, touched, submitAttempted, handleChange, handleBlur }
 *   useFormContext() throws outside <FormContext.Provider>
 *
 * SimpleForm state: values (all ''), touched {}, submitAttempted false, submitted null | FormValues
 *   errors = validateForm(values) during render; isValid derived; NO useEffect
 *   submit: preventDefault, submitAttempted = true, if isValid then submitted = values
 *   reset: values, touched, submitAttempted, submitted back to initial
 *
 * InputField({ label, name, ...inputProps }): id = useId(); errorId = `${id}-error`
 *   visible error = (touched[name] || submitAttempted) ? errors[name] : undefined
 *   aria-invalid={Boolean(error)}; aria-describedby={error ? errorId : undefined}
 *   error rendered in <span role="alert">
 *
 * ShowData({ data }): <dl>; per entry Fragment key={key} with <dt>{key}</dt><dd>{String(val)}</dd>
 *
 * Routes: "/form" -> <main><SimpleForm /></main>; primary nav (NavLink People, Form)
 * CSS Module classes:
 *   SimpleForm: panel, form, actions, result | InputField: field, error
 *   ShowData: inspector | App: header, topList, topLink, topLinkActive
 * Headings: one h1 in App; form h2 (useId); inspector h3 "Submitted data"; no div; key={key}
 */
```