# Evaluator qualification — 0.10.1-next.5

This is evaluator qualification, not a stock-agent trial or an engine-correctness test.
Run on macOS arm64 with Bun 1.4.3 and Playwright Chromium 153 (Apple Metal-3 adapter).
Records were refreshed after the review's missing-collider, document-listener and white-background
cases were added. JSON files retain command output, runtime, capture identity and assertions.

## Checks (narrow to wide)

- `bun check`: no type errors (75 files).
- `bun run lint`: 15 files checked, no errors.
- `bun run test`: 13 passed, 0 failed, 26 assertions. No engine TGSL loaded.
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
  All ten fixtures pass both `bun check` and `bun run build` in the grading copy.

| Task | Fixture | Verdict and evidence |
|---|---|---|
| falling-box | good | PASS: 123/123 visible samples, descent 0.270, final rest 2025ms with centroid spread 0.0000 |
| falling-box | bad | FAIL: static body, descent 0.000 |
| falling-box | bad-no-floor-collider | FAIL: 22/135 visible samples; no final visible rest |
| color-on-key | good | PASS: window listener; white 196,196,196 → green 61,192,45 |
| color-on-key | bad | FAIL: listens to Enter instead of Space; stays white |
| color-on-key | good-document | PASS: document listener; same white → green observation |
| striped-material | good | PASS: 12 crossings; silhouette change 0.00% |
| striped-material | bad | FAIL: static pattern, no frame motion |
| striped-material | bad-turning | FAIL: silhouette change 15.57%, limit 2% |
| striped-material | good-white-background | PASS: 12 crossings; silhouette change 0.00% |

The new fixtures change only the relevant behavior from their good baseline: remove the floor's
`Shape`, register the keyboard listener on `document`, or set the camera's clear colour to white.
The turning fixture has static bands and Welcome's quaternion update at 0.65 radians/second. Its
bands and frame motion still pass; only outline stability fails. All ten grades observe the installed
public `captureFrame` seam at `final-canvas 1280x720@1 rgba8-tight`.

With the document-listener good fixture in place, setting `PLAYWRIGHT_BROWSERS_PATH` to a fresh empty
directory gives **INCOMPLETE**: both project commands succeed but Chromium's executable is missing
(`missing-browser.json`).

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
installed dependencies and symlink targets as link text) for each of the ten grades. Every pair is
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
  frames contribute to outline comparison. No shared spans means stability fails, not passes.
  The spatial-band thresholds (>30 peak-to-peak, ≥2 crossings), frame motion threshold (>0.5) and
  outline change limit (<2%) are unchanged. This qualifies the white-background good and rejects the
  turning bad through public pixels; it does not prove stability of invisible edges or distinguish
  motion preserving all measurable outline segments. It assumes the corner sample represents the
  background, not a particular background colour.

Unit tests cover missing falling samples, slow continuous descent, too-short rest evidence, moving
internal bands, measurable outline motion, absent outlines and bands matching a white background.
The next.5 capture adaptation still validates each returned capture's surface and encoding.

No pre-land check or stock-agent trial was run.
