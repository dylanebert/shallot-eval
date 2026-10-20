# Evaluator qualification — 0.10.1-next.5

This is deterministic evaluator qualification, not a stock-agent trial or engine-correctness test.
Run on macOS arm64 with Bun 1.4.3 and Playwright Chromium 153 (Apple Metal-3 adapter).
The JSON records retain each command's output, browser identity, capture identity and assertions.
These records were refreshed after tightening the striped gate to reject a turning striped cube.

## Checks (narrow to wide)

- `bun check`: no type errors (73 files).
- `bun run lint`: 13 files checked, no errors.
- `bun run test`: 8 passed, 0 failed, 20 assertions. No engine TGSL loaded.
- `bun src/setup.ts <task> --json`: all three projects report engine `0.10.1-next.5`,
  content hash `cdd8fd40d15a7ddef47c1a9fa3c88b2c4084c89f647539eb020aafca9410ea15`, and
  registry integrity `sha512-tAvTzE37qhm0IFJwO6/KKWQDbuz7ywDO7uQW79D2FCd20HOjjrWFuthXGGICZT/smZZxWJoeJ9AdEI/3Xponvg==`.
  Each generated `AGENTS.md` equals the skill body; withheld files are absent from each project.
  Setup records contain the project paths, artifact hashes and guidance hash.
- Registry verification: fetched the version's registry tarball, verified its SHA-512 against
  `dist.integrity`, extracted it, and compared its full package content identity to the installed
  package. They agree (`registry.json`). No source checkout or workspace link was used.
- For each project, copied its withheld fixture to `src/solution.ts`, replaced `index.html` with
  the minimal canvas page below, then ran `bun src/grade.ts <task> <project> --json`.
  Both `bun check` and `bun run build` pass for all seven final fixture runs, including
  `tasks/striped-material/bad-turning.ts` installed by the same procedure.

| Task | Good | Bad | Bad's determined failed assertion |
|---|---|---|---|
| falling-box | PASS; descent 0.255 | FAIL | static body: descent 0.000 |
| color-on-key | PASS; white 196,196,196 → green 61,192,45 | FAIL | listens to Enter, not Space; stays white |
| striped-material | PASS; 12 band crossings | FAIL | patterned but not animated |

The additional striped known-bad (`striped-material-bad-turning.json`) uses static UV bands and
rotates its cube at the Welcome plugin's 0.65 radians/second using the same quaternion update.
It grades **FAIL** solely on silhouette stability: maximum change 18.80%, limit 2%.
Its spatial bands and frame motion both pass. The known-good's silhouette change is 0.00%.

All seven runs use public `captureFrame` with `final-canvas 1280x720@1 rgba8-tight`.
The original bad striped fixture still passes the spatial pattern and silhouette assertions; the
bad falling fixture is visible and settled; the bad key fixture starts white. These are task
failures, not build failures.

With the good color fixture restored, set `PLAYWRIGHT_BROWSERS_PATH` to a fresh empty directory and
ran the same grade: `INCOMPLETE`, with both project commands successful and Chromium's executable
missing (`missing-browser.json`).

```html
<!doctype html><html><head><style>html,body,canvas { margin:0; width:100%; height:100%; display:block; overflow:hidden }</style></head><body><canvas id="canvas"></canvas><script type="module" src="/src/solution.ts"></script></body></html>
```

## Qualification corrections and limits

The next.5 public capture contract puts surface and encoding on each capture's `identity`, not on
`CAPTURE_CONTRACT`. The probe now checks that returned identity before reading pixels. No task
threshold or semantic assertion was loosened.

Fixture authoring required corrections before the fixtures qualified: changing an existing
`MeshMaterial` with `world.add` did not update it (use `Materials.update`), the white cube needed to
fill the gate's central sampling region, custom material exports come from `standard/rendering`,
and a material parameter struct cannot be empty. These were fixture mistakes, not agent outcomes.
One striped attempt also hit Playwright's existing 12-second suite timeout and returned INCOMPLETE.

The gates are bounded witnesses, not complete readings of the prompts: the color gate samples a
fixed central region and checks at 500ms, not instantaneous latency or indefinite persistence;
falling checks the last two visible samples, not floor contact or physics internals. Its NOTES now
correctly describe the six-second sampling window after canvas readiness, without a reload or
settled boot.

The striped gate now also requires the foreground silhouette to hold still across the three frames.
It compares row envelopes, ignoring internal band changes, with a <2% symmetric-difference/union
limit to tolerate edge/antialiasing changes. Foreground pixels differ from the corner background by
>25 in any channel. This assumes a plain contrasting background; it does not distinguish motion
that preserves the silhouette. Unit tests cover internal stripe changes, outline width/position
changes, and an absent silhouette. The new known-bad demonstrates the likely Welcome-style turning
cube is rejected while the stationary animated material passes. No existing threshold was loosened.

No pre-land check was run. Surface checks were rerun after implementation; no trial was run.
