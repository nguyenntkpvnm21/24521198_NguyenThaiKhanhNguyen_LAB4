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