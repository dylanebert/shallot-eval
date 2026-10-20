# Evaluator qualification — 0.10.1-next.5

**Latest color qualification:** [review corrections](color-review-correction/README.md) qualify
neutral starting white, sustained green samples and a dominant-border background estimate. Pink
start and brief green are FAIL; a border-touching cube is PASS; earlier fixtures retain their
verdicts and white-on-white is INCOMPLETE. The unchanged retained trial app remains PASS.

**Color observation correction:** the original fixed central sampling region assumed an unrequested
minimum cube size. The [qualification addendum](color-observation-correction/README.md) replaces that
observation with border-contrast foreground pixels, retains all earlier color fixture verdicts,
qualifies a smaller good cube and absent-cube INCOMPLETE, and re-grades the unchanged trial project
PASS. The records below describe the earlier qualification; they did not cover the smaller-cube case.

This is evaluator qualification, not a stock-agent trial or an engine-correctness test.
Run on macOS arm64 with Bun 1.4.3 and Playwright Chromium 153 (Apple Metal-3 adapter).
Records were refreshed after qualifying the diagonal-on-white fixture as `INCOMPLETE`: its outline
cannot be measured. Every earlier fixture retains its expected verdict. JSON files retain command
output, runtime, capture identity and assertions, including `null` for an undetermined observation.

## Checks (narrow to wide)

- `bun check`: no type errors (75 files).
- `bun run lint`: 15 files checked, no errors.
- `bun run test`: 16 passed, 0 failed, 33 assertions. No engine TGSL loaded.
- `bun src/setup.ts <task> --json`: all three projects report engine `0.10.1-next.5`,
  content hash `cdd8fd40d15a7ddef47c1a9fa3c88b2c4084c89f647539eb020aafca9410ea15`, and
  registry integrity `sha512-tAvTzE37qhm0IFJwO6/KKWQDbuz7ywDO7uQW79D2FCd20HOjjrWFuthXGGICZT/smZZxWJoeJ9AdEI/3Xponvg==`.
  Each generated `AGENTS.md` equals the published skill body; withheld files are absent.
  Setup records contain project paths, artifact hashes and the guidance hash.
- Registry verification from the initial qualification: fetched the version's registry tarball,
  verified its SHA-512 against `dist.integrity`, extracted it and compared its full package content
  identity to the installed package. They agree (`registry.json`); the refreshed setups retain that
  same identity. No source checkout or workspace link was used.
- For each fixture, copied `tasks/<task>/<fixture>.ts` to the subject's `src/solution.ts`, replaced
  `index.html` with the canvas page below, then ran `bun src/grade.ts <task> <project> --json`.
  All eleven fixtures pass both `bun check` and `bun run build` in the grading copy.

| Task | Fixture | Verdict and evidence |
|---|---|---|
| falling-box | good | PASS: 116/116 visible samples, descent 0.284, final rest 1978ms with centroid spread 0.0000 |
| falling-box | bad | FAIL: static body, descent 0.000 |
| falling-box | bad-no-floor-collider | FAIL: 17/76 visible samples; no final visible rest |
| color-on-key | good | PASS: window listener; white 196,196,196 → green 61,192,45 |
| color-on-key | bad | FAIL: listens to Enter instead of Space; stays white |
| color-on-key | good-document | PASS: document listener; same white → green observation |
| striped-material | good | PASS: 12 crossings; silhouette change 0.00% |
| striped-material | bad | FAIL: static pattern, no frame motion |
| striped-material | bad-turning | FAIL: silhouette change 16.08%, limit 2% |
| striped-material | good-white-background | PASS: 12 crossings; silhouette change 0.00% |
| striped-material | incomplete-diagonal-white-background | INCOMPLETE: bands and motion pass; outline observation is undetermined |

The new fixtures change only the relevant behavior from their good baseline: remove the floor's
`Shape`, register the keyboard listener on `document`, or set the camera's clear colour to white.
The turning fixture has static bands and Welcome's quaternion update at 0.65 radians/second. Its
bands and frame motion still pass; only outline stability fails. The diagonal-on-white fixture uses
`(uv.x + uv.y) * 12` instead of vertical bands. Background-coloured bands break continuous spans
along both scan axes. With no shared measurable spans in at least one frame pair, the outline is
undetermined, not evidence of motion. Its expected verdict is `INCOMPLETE`, not PASS or FAIL.
All eleven grades observe the installed public `captureFrame` seam at
`final-canvas 1280x720@1 rgba8-tight`.

With the document-listener good fixture in place, setting `PLAYWRIGHT_BROWSERS_PATH` to a fresh empty
directory gives **INCOMPLETE**: both project commands succeed but Chromium's executable is missing
(`missing-browser.json`).

Three falling-good qualification attempts timed out before Playwright ran a test, each yielding
`INCOMPLETE` (`instrument-startup-timeout-{1,2,3}.json`). These are unavailable-instrument attempts,
not determined task failures. The suite's 12-second global timeout was shorter than its existing
30-second preview-startup and 20-second test budgets. It is now 60 seconds to allow those budgets
plus teardown. Test timeout, task observation windows and semantic thresholds are unchanged.
The subsequent full fixture sweep produced the table above.

```html
<!doctype html><html><head><style>html,body,canvas { margin:0; width:100%; height:100%; display:block; overflow:hidden }</style></head><body><canvas id="canvas"></canvas><script type="module" src="/src/solution.ts"></script></body></html>
```

## Grading boundary

Grading copies the subject and its installed dependencies into a temporary directory, preserving
relative dependency symlinks. Typecheck, build and preview run there. The withheld probe and its pure
pixel-analysis helpers are copied only into that grading copy after the project commands succeed;
imports are relative, with no absolute evaluator path written into the subject. The copy and ephemeral
browser/server artifacts are removed afterward.

`subject-boundary.json` records before/after SHA-256 identities of the entire subject tree (including
installed dependencies and symlink targets as link text) for each of the eleven grades. Every pair is
unchanged. Fixture installation is intentional setup before the before-hash, not part of grading.

## Gate corrections and remaining limits

- Falling retains missing samples and requires visibility in every capture. Rest requires ≥1.5s of
  observed samples in the final two seconds and centroid range <0.01 across that interval. The gate
  no longer treats two nearby moving frames or disappearance as rest. This measures visible rest,
  not floor contact or physics internals. NOTES describe the actual six-second observation window,
  without a reload or settled boot.
- Color uses Playwright's `keyboard.press("Space")` with the canvas focused, after the white capture.
  The normal browser input path reaches canvas, document and window listeners. The probe no longer
  dispatches a window-only synthetic event. It still checks green at 500ms, not instantaneous latency
  or indefinite persistence.
- Striped profile trimming uses RGB contrast against the sampled corner background in either
  direction, so a bright background does not remove dark bands. Outline detection likewise uses
  contrast (>3 channel levels) rather than brightness direction. A white band can exactly match a
  white background, making its edge unobservable; to avoid treating its phase shift as object motion,
  rows and columns supply only spans with ≥90% continuous foreground. Only spans visible in both
  frames contribute to outline comparison. If a frame pair has no shared spans, its outline
  observation is `null`, not a numerical change of Infinity and not evidence of failure.
  With no measured outline failure and the other task checks passing, that missing observation yields
  `INCOMPLETE`. A determined failure, including a measured ≥2% change in another frame pair, still
  outranks an unavailable observation. When all observations are determined, PASS/FAIL
  behavior is unchanged. No third outline heuristic is introduced: final RGBA cannot distinguish an
  invisible moving boundary from a background-coloured band crossing a still boundary.
  The spatial-band thresholds (>30 peak-to-peak, ≥2 crossings), frame motion threshold (>0.5) and
  outline change limit (<2%) are unchanged. This qualifies the white-background good and rejects the
  turning bad through public pixels; it does not prove stability of invisible edges or distinguish
  motion preserving all measurable outline segments. It assumes the corner sample represents the
  background, not a particular background colour.

Unit tests cover missing falling samples, slow continuous descent, too-short rest evidence, moving
internal bands, measurable outline motion, absent outlines, vertical and diagonal bands matching a
white background, and tri-state aggregation (unknown cannot pass; a determined failure remains FAIL).
The next.5 capture adaptation still validates each returned capture's surface and encoding.

No pre-land check or stock-agent trial was run.
