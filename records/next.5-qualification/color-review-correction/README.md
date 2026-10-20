# Color gate review corrections

Review `r-stranger-trial-2` reproduced three observation errors on `513d8489`. These are evaluator
errors, not agent failures. `reviewer-{pink-start,brief-green,edge-near}.json` preserve the supplied
review outputs from `/tmp/review-*.json`; their sources are now recorded fixtures in
`tasks/color-on-key/`. Each source changes only the relevant behavior from `good.ts`:

- `bad-pink-start.ts`: initial baseColor `[1,0.65,0.65,1]`. The earlier brightness-only gate
  incorrectly accepted RGB 200,172,172 as white.
- `bad-brief-green.ts`: returns to white 1200ms after Space. The earlier single 500ms capture
  incorrectly accepted that transient green as staying green.
- `good-edge-near.ts`: translation `[2.1,0,0]`. The earlier mean border estimator was contaminated
  by the cube; it incorrectly selected almost the entire frame and reported white as 56,56,56.

## Corrections and limits

1. White still requires all channels >150, and now also requires max-minus-min <=20. This allows
   the retained lit-white trial cube's six-level channel spread while rejecting the pink fixture's
   28-level spread. This is a bounded rendered-colour criterion, not a claim about material values.
2. After Chromium sends Space, captures target 500ms through 3000ms after key completion, every
   250ms. Every observed sample must remain green (g>110, >r+40, >b+40). Records include actual
   capture completion times. This witnesses a bounded interval, not indefinite persistence or
   events between samples. No foreground yields an unknown sample; existing tri-state aggregation
   refuses green when an observation is missing, while a determined failure still yields FAIL.
3. Background is the most frequent exact RGB value on the one-pixel frame border, not its mean.
   Interior pixels contrasting by >3 levels in any channel supply the foreground mean. Partial
   border contact no longer tints the estimate. This assumes the plain background's colour is
   dominant at the border and the cube is the only foreground, not that every border pixel is
   background. A scene where background is not dominant remains outside this estimator's premise;
   no shape recognition or CPU rendering reconstruction is claimed. White-on-white remains
   unobservable, not evidence of success or failure.

## Qualification — narrow to wide

Same macOS arm64 host, Bun 1.4.3, package `0.10.1-next.5`. No agent was invoked again.

1. `bun test src/foreground.test.ts`: 5 pass, 10 assertions. Retains small-foreground and
   contrast-direction coverage; adds pink versus lit white, contaminated-border recovery and
   white-on-white unknown.
2. `bun src/setup.ts color-on-key --json`: fresh out-of-tree qualification app; `setup.json`
   confirms the qualified content hash `cdd8fd40d15a7ddef47c1a9fa3c88b2c4084c89f647539eb020aafca9410ea15`
   and registry integrity
   `sha512-tAvTzE37qhm0IFJwO6/KKWQDbuz7ywDO7uQW79D2FCd20HOjjrWFuthXGGICZT/smZZxWJoeJ9AdEI/3Xponvg==`.
3. Install each fixture as `src/solution.ts` in that qualification app with the canvas-only
   index documented in the parent README; run `bun src/grade.ts color-on-key <app> --json`.
   All nine fixtures pass independent typecheck/build. All observed frames retain
   `final-canvas 1280x720@1 rgba8-tight`, HeadlessChrome 153 and `apple metal-3` provenance.

| Fixture / record | Verdict | Observation |
|---|---|---|
| bad-pink-start | FAIL | starts 200,172,172: not neutral |
| bad-brief-green | FAIL | white 196,196,196 by the 1250ms-target capture (actual 1376ms), and every later sample |
| good-edge-near | PASS | 201,252 foreground pixels; 196,196,196 → 61,192,45, held through actual 3111ms |
| good-small | PASS | 2,496 pixels; 191,191,191 → 58,187,43, held |
| good | PASS | 196,196,196 → 61,192,45, held |
| bad (Enter listener) | FAIL | remains white after Space |
| good-document | PASS | 196,196,196 → 61,192,45, held |
| incomplete-no-cube | INCOMPLETE | all colour observations unknown |
| incomplete-white-on-white | INCOMPLETE | starting white unknown; later green observed and held |

The five earlier color fixtures retain their verdicts. The white-on-white case is now also a
recorded browser fixture. The three supplied counterexamples change to their required verdicts.

4. With good-document installed, set `PLAYWRIGHT_BROWSERS_PATH` to a fresh empty directory and
   grade: INCOMPLETE (`missing-browser.json`); both project commands still pass.
5. Re-grade the retained trial app once, without editing it: PASS. See
   `records/next.5-trial/color-on-key/grade-reviewed.json`: white 175,176,181, then green 62,161,73
   in all 11 post-Space samples, actual 651–3061ms. Whole-project before/after hashes match
   (`regrade-reviewed-boundary.json`); earlier grades and the original agent session remain intact.
6. Independent surface checks:
   - `bun check`: no type errors in 77 files (`check.txt`).
   - `bun run lint`: 17 files checked, no errors (`lint.txt`).
   - `bun run test`: 21 pass, 0 fail, 43 assertions (`test.txt`).

No pre-land check ran. No other task's browser fixtures were rerun; their observations are unchanged.
