# Color observation correction

This addendum supersedes the original color gate's fixed central-region observation, not the
stock-agent session. The original qualification records remain historical evidence. Their large
known-good cube masked an unrequested size assumption: averaging background into a smaller white
or green cube could fail a correct implementation.

## Corrected observation

`foregroundColor` samples the frame's one-pixel border as the background, then averages only
interior pixels differing from it by more than three levels in any RGB channel. Selection uses
contrast in either direction, not the desired colour. The color task promises one cube, so these
foreground pixels are its observation; no central location or minimum projected size is required.
The existing white (>150 each channel) and green (g>110 and >r+40, >b+40) criteria are unchanged.
No foreground yields `null`, so an unavailable colour observation is INCOMPLETE rather than FAIL
or PASS. Existing tri-state aggregation still lets a determined failure outrank an unknown.

This assumes the border represents the plain background and the only foreground is the cube.
It does not infer a cube's geometry from pixels, distinguish a cube from unrelated foreground,
or observe a cube whose colour matches its background. Those limits do not authorize a minimum
cube size. The helper consumes public final RGBA, not a CPU reconstruction of rendering.

## Qualification — narrow to wide

Run with Bun 1.4.3 on the same macOS arm64 host and published next.5 identity as the trial.
`setup.json` records the fresh out-of-tree qualification app, registry integrity and artifact hash.
Only this qualification app received fixture installation. The retained trial app was not edited.

1. `bun test src/foreground.test.ts`: 3 pass, 5 assertions. Covers a 2×2 foreground smaller than
   the former sampling area, white and green colour recovery, contrast against a bright border,
   and absent/indistinguishable foreground returning null.
2. `bun src/setup.ts color-on-key --json`: reports `0.10.1-next.5`, qualified content hash
   `cdd8fd40d15a7ddef47c1a9fa3c88b2c4084c89f647539eb020aafca9410ea15`, and registry integrity
   `sha512-tAvTzE37qhm0IFJwO6/KKWQDbuz7ywDO7uQW79D2FCd20HOjjrWFuthXGGICZT/smZZxWJoeJ9AdEI/3Xponvg==`.
3. Installed each fixture as `src/solution.ts` with the same canvas-only index documented in the
   parent qualification README; ran `bun src/grade.ts color-on-key <qualification-app> --json`.
   Every fixture passes the independent typecheck/build. All determined captures retain
   `final-canvas 1280x720@1 rgba8-tight`, HeadlessChrome 153, `apple metal-3` provenance.

| Fixture | Verdict | Pixel evidence |
|---|---|---|
| good-small (new) | PASS | 2,496 foreground pixels; white 191,191,191 → green 58,187,43 |
| good (earlier window listener) | PASS | 173,056 foreground pixels; 196,196,196 → 61,192,45 |
| bad (earlier Enter listener) | FAIL | remains 196,196,196 after Space |
| good-document (earlier document listener) | PASS | 196,196,196 → 61,192,45 |
| incomplete-no-cube (new) | INCOMPLETE | both colour observations null; no border-distinct pixels |

`good-small.ts` differs in scene size from the original good: cube scale 0.3 rather than 2 at the
same camera distance. Its 2,496 projected pixels occupy less than the old central region's 36,864
pixels, so it cannot fill that region. It must pass without altering thresholds or moving a camera
to satisfy the instrument. Earlier color fixture verdicts are unchanged.

4. With good-document installed, set `PLAYWRIGHT_BROWSERS_PATH` to a fresh empty directory and
   grade: **INCOMPLETE** (`missing-browser.json`), with both project commands passing.
5. Re-grade the retained color trial project once: **PASS**, foreground **175,176,181 → 62,161,73**
   across 21,702 pixels. See the trial's `color-on-key/grade-corrected.json`. The original FAIL
   remains `grade.json` and is marked superseded in the trial README. Whole-project before/after
   SHA-256 hashes match; no agent invocation or project edit occurred.
6. Surface checks, independent from the browser qualification:
   - `bun check`: no type errors in 77 files (`check.txt`).
   - `bun run lint`: 17 files checked, no fixes/errors (`lint.txt`).
   - `bun run test`: 19 pass, 0 fail, 38 assertions (`test.txt`).

No pre-land check was run. No other task's browser fixtures were re-run for this color-only
correction; their observation algorithms are unchanged.
