## Failure #01: Blur error shifts Submit button and swallows the first click (Lab 4, Ex2)

- **Prompt**: Asked the AI for a step-by-step guide and code for the Lab 4
  Sprint 2 form engine (SimpleForm, InputField, ShowData).
- **AI output**: InputField rendered its `<span role="alert">` only when an
  error existed, with no space reserved for it in the field layout.
- **Bug**: Clicking Submit while an invalid field had focus blurred that
  field first. The new error line pushed the Submit button down by about
  26px before mouseup, so the click missed the button. Only one error
  appeared and the form did not submit; a second click worked.
- **Detection method**: Manual browser testing of the click path, plus a
  Console mousedown listener logging the button's y shift and alert count.
- **DevTools proof**: lab4-ex2-bug-lost-click.png (shift 26px, alerts: 1).
- **Engineering fix (commit 6999bcf)**: Reserved a fixed error row in the
  field grid: `grid-template-rows: auto auto minmax(1.375rem, auto)`.
- **Verification after fix**: Same listener reports shift 0px and
  alerts: 3 on the first click (lab4-ex2-fix-verified.png).
- **Lesson**: Content that appears on blur must never move interactive
  elements; reserve space for it (also prevents layout shift). Test the
  click path, not only typing.

  
## Failure #02: Test helper used `<output>`, which has the implicit ARIA role `status` (Lab 4, Homework 1A)

- **Prompt**: Asked the AI for a step-by-step guide and contract-first failing
  tests for Homework 1A (Photo & Evidence Gallery, URL-driven category filter
  and native `<dialog>`).
- **AI output**: The shared test helper (`testUtils.jsx`) rendered the current
  URL inside an `<output data-testid="url">` element so tests could assert on
  the location. The gallery itself also renders a live region
  (`<p role="status">Showing N of 8 photos</p>`).
- **Bug**: `<output>` maps to the ARIA role `status` by default, so the page
  had two `status` elements. Every `screen.getByRole('status')` assertion
  failed (2 tests in the category filter suite). The component was correct;
  the AI-generated test code was wrong because it treated `<output>` as a
  neutral element.
- **Detection method**: Ran `npm test`; the filter suite failed on the
  `getByRole('status')` assertion, even though the gallery rendered the
  correct text. Traced it by checking which elements expose the `status` role
  in the rendered tree.
- **Proof**: Failing `npm test` output captured before the fix (in the
  submission PDF).
- **Engineering fix (commit 555d347)**: Replaced the probe element with
  `<p data-testid="url">`, so the live region is the only `status` in the
  tree.
- **Verification after fix**: The two failing filter tests passed and the
  whole filter suite was green. The remaining failures were the dialog tests
  waiting for the dialog implementation; all tests passed once it was added
  (68 passing).
- **Lesson**: Native HTML elements carry implicit ARIA roles (`output` is
  `status`, `form` can be a landmark, and so on). When tests query by role,
  helper elements must not collide with the roles under test. Prefer a
  neutral element (`<p>`, `<span>`) for test-only probes and check roles
  before using a semantic element.

  
## Failure #03: Per-test HTTP server crashed the Vitest worker on Windows (Lab 4, Homework 1B)

- **Prompt**: Asked the AI for contract-first tests for the Express swipe API
  (Homework 1B backend).
- **AI output**: `swipe-server/app.test.js` started a real HTTP server in
  `beforeEach` and closed it in `afterEach`, so the server was created and
  destroyed 14 times in one file while `fetch` kept connections open.
- **Bug**: `npm test` ended with "Worker exited unexpectedly with exit code
  3221226505" (0xC0000409) while running `app.test.js`. Vitest reported 105 of
  112 tests passed and one unhandled error, so the file did not finish and the
  result could have hidden failing tests.
- **Detection method**: The unhandled-error summary at the end of `npm test`;
  re-ran only `swipe-server/app.test.js` to confirm it was this file. Node
  version: v24.15.0.
- **Proof**: Terminal output of the crash captured before the fix (in the
  submission PDF).
- **Engineering fix**: Start one server in `beforeAll`,
  clear the fake swipes in `beforeEach`, and close the server once in
  `afterAll`.
- **Verification after fix**: `app.test.js` finished without the unhandled
  error and the full suite passed. The exact root cause inside Node was not
  investigated; the repeated open/close of sockets on Windows is the likely
  trigger because removing it made the crash disappear.
- **Lesson**: Do not create and tear down a network server per test. Share
  one server per file and reset state between tests. An "unhandled error"
  from the test runner means some tests did not run, so a mostly green
  summary is not proof that the suite passed.