# Project Rules (Lab 4)

## Stack
- React 19 + Vite + JavaScript (no TypeScript). React Router v7 (`react-router`).
- Hooks imported explicitly; mount with createRoot + StrictMode inside BrowserRouter.

## Forbidden
- Class components, ReactDOM.render, defaultProps, keyCode, window.alert.
- key={index}, in-place state mutation, innerHTML / dangerouslySetInnerHTML.
- Inline style={{}}, `<div>` in JSX (use main/section/article/header/nav/ul/li/dl/form/output).
- `http://` URLs, hex colors inside rules (tokens live in :root of index.css).
- React Router v5 API: Switch, Redirect, exact, activeClassName, component={...}.
- Legacy packages: react-media, typeface-roboto, @material-ui/core.
- useEffect for derived state or form validation (compute during render).

## Routing
- Declarative `<Routes>` / `<Route element={...}>`; layouts render `<Outlet />`.
- NavLink styling via `className={({ isActive }) => ...}`.
- Read dynamic ids with `useParams()`; lookup with `people.find()`; ids are strings.
- Unknown id renders `<section role="alert">` 404 state, never a crash.

## Accessibility and CSS
- One `<h1>` per page, one `<main>` landmark, no skipped heading levels.
- Every `<button>` has type="button" (except real submit buttons).
- CSS Modules + CSS Custom Properties, mobile-first, verified at 375px, no horizontal scroll.

## Git workflow
- Strict 4-stage loop: Contract -> Fail Test -> Implement -> Refactor.
- Atomic Conventional Commits; never mix CSS with JSX/JS in one commit.
- Every commit builds. No rebase/reset/amend/force-push; fix forward.
- Never prompt AI with more than 1 sub-task at a time.
- Only log real, evidenced failures in AI_FAILURE_AUDIT.md (capture BEFORE fixing).