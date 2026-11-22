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

# Work Breakdown Structure (Exercise 1, Sprint 2)
- [x] Task 1.14: WBS and contract for the form engine (docs commit)
- [x] Task 1.15: CSS Module scaffold and danger token (CSS only)
- [x] Task 1.16: Fail test, then synchronous validateForm rules
- [x] Task 1.17: Fail test, then FormContext and SimpleForm state (mandatory commit 1)
- [x] Task 1.18: Primary navigation and /form route
- [x] Task 1.19: Fail test, then InputField with useId, aria-invalid, aria-describedby (mandatory commit 2)
- [x] Task 1.20: Fail test, then ShowData inspector, submit and reset (mandatory commit 3)
- [x] Task 1.21: CSS layout, then responsive 375px (CSS only)
- [x] Task 1.22: Verification (Profiler, DevTools, grep, lint, build) and AI failure notes
- [x] Task 1.23: Push to GitHub and tag lab4-sprint2-done
- [x] Task 1.24: Reserve error row so blur errors cannot shift the Submit button (CSS fix found in verification)

* RULE: Never prompt AI with more than 1 sub-task at a time.
* RULE: Mandatory commits contain JSX/JS only. CSS goes in its own commits (1.15, 1.21).

## Sprint 2 contract
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

# Work Breakdown Structure (Exercise 1, Sprint 3)
- [x] Task 1.25: WBS and contract for the forum hook and API (docs commit)
- [x] Task 1.26: .env.example and ignore .env
- [x] Task 1.27: Add express and cors dependencies
- [x] Task 1.28: Fail test, then Express forum API with CORS and payload validation
- [x] Task 1.29: Fail test, then useForumMessages with AbortController
- [x] Task 1.30: CSS Module scaffold for the forum (CSS only)
- [x] Task 1.31: Fail test, then ForumPage channel switcher, message form and /forum route
- [x] Task 1.32: CSS layout, then responsive 375px (CSS only)
- [x] Task 1.33: Verification (Slow 3G cancel check, grep, lint, build) and AI failure notes
- [x] Task 1.34: Full-stack error log verification document
- [x] Task 1.35: Push to GitHub and tag lab4-sprint3-done

* RULE: Never prompt AI with more than 1 sub-task at a time.
* RULE: Mandatory commits contain JSX/JS only. CSS goes in its own commits (1.30, 1.32).

## Sprint 3 contract
```js
/**
 * Channels: 'nasa' | 'esports-tribunal' | 'notNasa'  (labels: NASA, Esports Tribunal, notNasa)
 * Message: { id: string (uuid), author: string, text: string, timestamp: string (ISO) }
 *
 * REST API (Express 5, ESM, in-memory db). Slides use three different URLs;
 * /api/messages/:forum is the single source of truth.
 *   GET  /api/messages/:forum -> 200 Message[] | 404 { error }
 *   POST /api/messages/:forum body { author, text } -> 201 Message | 400 { error } | 404 { error }
 *     both strings, non-blank after trim, author <= 40, text <= 500
 *     only author and text are stored (whitelist); id = crypto.randomUUID(); timestamp = server time
 *   cors({ origin: CLIENT_ORIGIN }); express.json({ limit: '10kb' })
 *   every response with status >= 400 is logged: ISO time, method, url, status
 *   API_DELAY_MS adds artificial latency (used for the Slow 3G verification)
 *
 * useForumMessages(forumId) -> { data, loading, refreshing, error, postMessage, retry }
 *   effect deps [forumId, refreshTick]; AbortController created inside the effect, cleanup aborts
 *   state writes guarded by !controller.signal.aborted; !res.ok throws
 *   loading = result.forumId !== forumId (derived); data is [] while loading
 *   postMessage(payload): POST JSON to the current forum, throws the server error text, then refetches
 *   retry(): refetch
 *
 * ForumPage: channel buttons (type="button", aria-pressed), output role=status, board aria-busy,
 *   error in <section role="alert"> with Retry, <dl> of Fragment key={msg.id}
 * MessageForm({ onSubmit }): useId labels Author / Message, Send button, error span role="alert"
 *
 * Routes: "/forum" -> <main><ForumPage /></main>; nav link Forum
 * CSS Module classes: ForumPage: panel, channels, channelButton, status, board, messages, alert
 *                     MessageForm: form, field, actions, error
 * Env (.env.example): PORT, CLIENT_ORIGIN, API_DELAY_MS, VITE_API_URL; .env is git-ignored
 */
```

## Homework 1A — Photo & Evidence Gallery (React Router v7)
- [x] Task H1.1 Update WBS for Homework 1A (docs)
- [x] Task H1.2 Add script that generates 8 sample SVG images in public/gallery
- [x] Task H1.3 Add photos.js data module (categories + photos)
- [x] Task H1.4 Write failing tests: category filter via URL (?category=)
- [x] Task H1.5 Write failing tests: dialog driven by ?photoId= (open, close, Back, invalid id)
- [x] Task H1.6 Scaffold CSS Modules (Layout + Shell)
- [x] Task H1.7 Add GalleryShell, About, NotFound and the /gallery route
- [x] Task H1.8 Implement PhotoGalleryLayout: category filter + photo grid
- [x] Task H1.9 Implement PhotoGalleryLayout: native <dialog> synced with URL
- [x] Task H1.10 Refactor, scan forbidden patterns, run lint
- [x] Task H1.11 Verify WCAG 2.2 AA and Lighthouse on the production build (mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; remaining Performance deduction is unused JavaScript in the shared bundle)
- [x] Task H1.12 Record real AI failures with evidence in AI_FAILURE_AUDIT.md
- [x] Task H1.13 Push and tag lab4-hw1-done

## Homework 1B — Full-Stack Card-Swipe Deck (Express + Mongoose 8)
- [x] Task H1B.1 Update WBS for Homework 1B (docs)
- [x] Task H1B.2 Install mongoose@8, add .env.example, make sure .env is ignored
- [x] Task H1B.3 Write failing tests for swipeLogic (score, undo stack, remaining cards, gesture direction)
- [x] Task H1B.4 Implement swipeLogic
- [x] Task H1B.5 Write failing tests for validateSwipe and the API routes
- [x] Task H1B.6 Implement validateSwipe, models and createApp
- [x] Task H1B.7 Implement server.js (env guard, mongoose.connect, seed, listen)
- [x] Task H1B.8 Write failing tests for SwipeDeck (keyboard, pointer, undo, score)
- [x] Task H1B.9 Scaffold CSS Modules for SwipeDeck
- [x] Task H1B.10 Implement swipeApi and the data hook
- [x] Task H1B.11 Implement SwipeDeck and the /swipe route
- [x] Task H1B.12 Verify end to end with MongoDB, WCAG, 375px and forbidden patterns
- [x] Task H1B.13 Record real AI failures with evidence in AI_FAILURE_AUDIT.md
- [x] Task H1B.14 Push and tag lab4-hw1b-done

## Homework 2 — Fair-Play Appeal Portal (slide 21)

- [x] H2.1 Confirm baseline (clean tree, tests green, hw1b tag on remote)
- [x] H2.2 Contract: fictional dossier data + `computeMatrix` (red tests first)
- [x] H2.3 Implement `computeMatrix` as a pure function
- [x] H2.4 `/dossier/:playerID` route + `DossierView` (404 for unknown id)
- [x] H2.5 Appeal form engine on top of the Sprint 2 context form
- [x] H2.6 Contract: `useAppealSlaTimer` (red tests with fake timers)
- [x] H2.7 Implement `useAppealSlaTimer` (absolute deadline + clock offset + visibilitychange)
- [ ] H2.8 `appeal-server/` (Express 5 + Mongoose 8): GET dossier, POST appeal
- [ ] H2.9 Wire client to API (loading / error / expired states)
- [ ] H2.10 Accessibility and responsive pass (375px, 320px)
- [ ] H2.11 `AI_FAILURE_AUDIT.md` entries (real failures only)
- [ ] H2.12 Push and tag `lab4-hw2-done`