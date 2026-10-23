# Stranger trial — 0.10.1-next.7

One stock-agent invocation per task, in the order below, on 2026-10-23. No retry,
operator intervention, task-project edit, or re-grade. These are three individual trajectories,
not a reliability estimate or an engine-correctness population. No pre-land check was run.
**The striped-material FAIL is a finding that stops the unit and goes to the person.**

| Task | Verdict | Agent wall time | Model (default, not overridden) |
|---|---|---|---|
| falling-box | PASS | 192.362s (3m12s) | anthropic/claude-opus-5-5, medium thinking |
| color-on-key | PASS | 194.707s (3m15s) | anthropic/claude-opus-5-5, medium thinking |
| striped-material | FAIL (grading-copy typecheck) | 200.922s (3m21s) | anthropic/claude-opus-5-5, medium thinking |

## Evidence and setup

Each task directory contains `setup.json`, `run.json` (argv, context preflight, UTC start/end,
exit status, wall time), `grade.json`, `stdout.txt` (agent final response), and the original
session JSONL. Session references use **physical JSONL line numbers**:

- **F**: [falling-box session](falling-box/2026-10-23T02-31-06-568Z_01a16699-0447-7329-9697-b72ed7f25986.jsonl)
- **C**: [color-on-key session](color-on-key/2026-10-23T02-34-31-264Z_01a1669c-23df-73dd-9d40-e46f95227ace.jsonl)
- **S**: [striped-material session](striped-material/2026-10-23T02-37-55-717Z_01a1669f-4285-7638-a4a3-b70731baabb0.jsonl)

Host: macOS 26.7 (25G229), arm64; Bun 1.4.3; pi 1.4.0 (next.5 used pi 1.3.0).
Evaluator HEAD before the trial: `811f7fda9070cb9bf2af261d5e2ba9b1f57d1e06`.
The initial worktree was clean; pin and README edits preceded invocation. During the trial,
the three consumer-contract version literals were updated with authorization; no task gate,
grading code, or task project was changed by the operator. Surface checks pass: `bun check`,
`bun run lint`, `bun run test` (21 tests). The first test run failed only on those stale next.5
consumer-contract literals; all assertions were retained in the update.

For each task, setup ran once as `bun src/setup.ts <task> --json`. Before launching pi,
the supervisor asserted version `0.10.1-next.7` and registry integrity:

```
sha512-ZAKRqRnCMBWal28hVmODAgJOcECUGgiunHdOftuAQPKeun8piv76l/x1sdwDRCH9kEG2GfIYsNMeZ1f0gp8SDQ==
```

All three record content hash
`66e4660b97b5f629fcb29b930977a47af5939dfa7d2a9f309f4f9967664901a5`.
Generated AGENTS SHA-256 is
`4ecb0056e6cd2cef903d76488f96aea58c9a1237cb16b6c34790b986310463ed` in every preflight.
Setup itself asserts generated AGENTS equals the installed skill body without frontmatter.
Fresh projects were under the OS temp tree, outside evaluator and engine worktrees.
Each `run.json` lists absent AGENTS.md/CLAUDE.md files in every ancestor and `~/.pi/agent`;
project CLAUDE.md was also asserted absent. Each session L4's `sections.project_context`
contains only that project's generated AGENTS.md. No evaluator context, withheld material,
custom skill, extension, or MCP tool appears in the system sections. Guidance was supplied at
startup, not suppressed with `--no-context-files`; no later explicit AGENTS read is observed.
L5 in each session is exactly that project's complete PROMPT.md.

The command shape matches next.5:

```
pi -p --no-extensions --no-skills --no-mcp --no-prompt-templates --session-dir <task-record-dir> <PROMPT.md contents>
```

A subprocess supervisor read the prompt unchanged, launched pi in the project directory,
and enforced a 1,800-second wall-clock limit on its process group. All exited 0 without a timeout.
No model flag or extra prompt was supplied; L2/L3 record the model and thinking above.
After each exit, before setting up the next task, the supervisor ran
`bun src/grade.ts <task> <project> --json` from the evaluator. A grading process exit 0 is not
itself a PASS: striped-material's `grade.json` explicitly says FAIL.

### Setup limits

- Setup is installed-artifact preflight, not a registry install inside each task app. It records
  registry integrity, installed content identity and local-pack SHA-256, then installs that pack.
  Agents saw a `file:...engine-pack/...tgz` manifest entry and `.eval.json` (F/C/S L7).
  This supplies no private engine checkout. The scaffold also includes files and checks;
  AGENTS was the only context file, not the only readable file.
- Absolute session-directory paths are invocation metadata, not extra prompts. Context isolation
  is not a filesystem sandbox. The agents used shared `/tmp` screenshot paths; stale captures
  could exist (C L56, S L58). Readings below rely on current check outputs and bounded observations,
  not an assumption that every listed image was produced by this task.
- Falling-box and color grades use their own ephemeral servers and public capture at
  `final-canvas 1280x720@1 rgba8-tight`, reporting HeadlessChrome 153 and `apple metal-3`
  (provenance only). Both grading-copy typechecks/builds pass. Striped builds but fails typecheck;
  its grade has no frame observations. Its visual correctness is therefore not established here.

## falling-box — PASS

[Grade](falling-box/grade.json): 146/146 visible blue samples, descent 0.325, and 2,043ms
of final rest with centroid spread 0.0000.

### Reading and checks

- **First read:** F L6 reads package.json, lists the project and runs `bunx shallot create --help`.
  L8 reads generated entry, plugin, startup checks, preload and CI and lists physics/minimal.
- **Examples:** L10 tries a broad physics read; L12–17 narrow it to scene construction,
  presentation/view and capture checks. The installed suite is inspected, not executed.
- **JSDoc/source:** L18–25 trace MeshInstance's built-in cube, `isAwake`, Body and Shape;
  L34–35 read `Materials.get`'s row/handle comment.
- **Own evidence:** L28–37 implement and pass a physics/material check (eight assertions).
  L40–43 implement and pass browser descent/rest checks. L44–46 read airborne/rest screenshots.
  After darkening the floor, L47–50 rerun `bun test` (one pass), all seven browser checks and
  read the final rest image. No agent typecheck is observed; the independent grade passes it.

### Findings / wrong turns

1. **Owning surface: example exploration (agent read selection, not an example defect).**
   F L10 cats every physics test, including gold text; L11 returns a truncated 14,224-line output.
   L12 says “That was noisy” and excludes gold files. Discovery recovers without help.
2. **Owning surface: JSDoc/material API discovery (agent field guess).** F L28 guesses
   `MeshMaterial.handle`; L29 fails with `undefined ... handle.get`. L30–35 discover `material`
   and the row/handle comment; L36–37 correct and pass. No public API malfunction is demonstrated.
3. **Owning surface: example/browser-check adaptation (agent host mistake).** F L40 uses
   `Bun.write` in Playwright; L41 reports `ReferenceError: Bun is not defined`. L42 switches to
   `node:fs` and L43 passes. This is the agent's helper, not a shipped check failure.
4. **Owning surface: example/minimal lighting adaptation.** F L47 says “The floor looks nearly
   white” despite neutral material/light values, lowers gray from 0.45 to 0.22 and checks again
   (L48–50). This is task-specific aesthetic adjustment, not proof the lighting is wrong.

## color-on-key — PASS

[Grade](color-on-key/grade.json): 21,702 foreground pixels, white **186,186,186** becomes
**85,174,91**, green in all 11 post-Space samples at actual 563–3062ms.

### Reading and checks

- **First read:** C L6 reads package.json, lists files and runs `create --help`; L8 reads the
  generated entry/plugin/checks, preload and CI and lists minimal/hud/interact.
- **Examples:** L10–15 read HUD turntable implementation/checks and interact implementation/checks,
  including material updates. No installed suite is executed.
- **JSDoc/source:** L16–17 read Keys/Devices draw-boundary latch comments; L18–19 read
  lookAtRotation's comment; L22–25 inspect `Materials.get/update` and pass three CPU checks.
- **Own evidence:** L28 adds a centre-pixel browser check. Following threshold debugging below,
  L53 passes it, L57–58 read the green image, and L59–60 pass three CPU and seven browser tests
  plus a typecheck with no reported errors. Independent grade agrees.

### Findings / wrong turns

1. **Owning surface: example/browser-check adaptation (agent observation threshold).** C L28
   requires green > twice both other channels. L29 fails. L30–47 explore focus, input defaults,
   draw reset and scheduler ordering before measuring the pixel. L49 proves `DBG pressed [Space]
   true`; L51 gives centre RGB **86,179,92**. L52 recognizes the overly strict threshold, changes
   it to green exceeding red/blue by 60, and L53 passes. The independent grade confirms green;
   this is not an input failure or demonstrated missing skill instruction. Source tracing was
   substantial but recovered in the single invocation without operator help.
2. **Owning surface: agent tool sequencing, not Shallot.** C L52 requests the capture read alongside
   the command producing it; L54 gets ENOENT. L55–58 list and reread successfully. No product fix
   is implied by that transient read failure.

## striped-material — FAIL

[Grade](striped-material/grade.json) fails its independent `bun check`:

```
tests/stripes.node.ts(3,32): error TS2305: Module '"@dylanebert/shallot/mesh"' has no exported member 'box'.
```

Build passes. No frame checks ran; do not infer that the striped task passed visually from the
agent's own observations. The operator did not repair the project or invoke the agent again.

### Reading and checks

- **First read:** S L6 reads package.json, lists files and runs `create --help`; L8 reads generated
  entry/plugin/checks, startup/browser configuration and lists materials.
- **Examples:** L10–13 read materials implementation, CPU animation/material checks, gallery state
  checks, quantized renderer capture composition and browser-check excerpts. No installed suite runs.
- **JSDoc/source:** L14–19 discover fragment local-position inputs, materialType and `lit` comments;
  L20–27 trace frame time. L50–53 later trace scheduler clamping.
- **Own evidence:** L30–35 implement scrolling local-space stripes, repair parameter initialization,
  and pass the existing CPU test/typecheck. L36 adds a renderer node check; after the recoveries
  below it passes at L55. L56–58 run all six startup browser checks and capture images;
  L59–66 read and recapture with the shipped browser configuration. L67–68 run `bun test`
  (one existing test passes). There is no typecheck after the new node check is added.

### Findings / wrong turns

1. **FAIL — owning surface: skill/generated AGENTS (check selection/completion), an agent lapse,
   not demonstrated defective guidance or engine code.** S L35 is the last clean typecheck.
   L36 then writes `import { Meshes, MeshInstance, box } ...`, although `box` is unused and the
   scene uses the default cube. Bun runs the check successfully at L55 without catching that
   unused import. L67–69 finish with CPU/browser/GPU evidence but no new typecheck. The independent
   grade catches the unexported name. The guidance says learn from installed APIs; the imported
   sphere in the read example (L13) did not justify guessing `box`. This failed artifact is preserved.
2. **Owning surface: JSDoc/material parameter discovery (agent default assumption).** S L30 calls
   `.add({})` despite required parameters. L31's compiler and L33's runtime reject it; L34 supplies
   explicit values, L35 passes. `materialType` defaults did not mean partial values for `.add`;
   this run establishes confusion, not an incorrect public signature.
3. **Owning surface: example/GPU-check prerequisites; runtime diagnostic recovery succeeds.**
   S L37 names the missing optional `webgpu` peer. L38 installs it, and the check runs at L39.
   Bun reports a blocked postinstall; the subsequent GPU check passes at L55. No operator action.
4. **Owning surface: example/GPU observation adaptation (agent thresholds).** S L39's dark-red
   threshold expects <50 but observes no such pixels; L40–41 measure levels **64,247** and
   L42 separates them at 150. These are the agent's test assumptions, not a rendering failure.
5. **Owning surface: JSDoc/time-step discovery.** S L43–49 repeatedly gets only 50 changed pixels
   despite a larger requested step. L50–53 trace the scheduler's bounded catch-up; L54 advances
   50 frame-sized steps and L55 passes. This is recovered API exploration, not proof of broken time.
6. **Owning surface: example/browser launch configuration (agent ad-hoc flags).** S L56 launches
   its screenshot browser with custom Vulkan flags; after reading images L62 says “Likely my
   ad-hoc browser flags” and switches to `BROWSER_CONFIG`. L64–69 report visible moving stripes.
   That diagnosis is the agent's, not independent proof of a platform bug.
7. **Owning surface: skill/generated AGENTS (CI discovery), agent reporting error.** S L56 asks
   for `.github/workflows/test.yml`; L57 actually returns its browser job. L67's grep for `node`
   finds no match, and L69 wrongly concludes “The project has no `.github/workflows/test.yml`”.
   This confuses absent node-tier text with an absent workflow. The scaffold and guidance did
   supply the CI pointer; no missing workflow is established.

S L69 also explicitly retains the starter's cube rotation. Because grading stops at typecheck,
this record does not determine its silhouette/motion verdict. Do not promote that unobserved
possibility to a second determined gate failure.

## Scope of conclusions

All three agents reached relevant installed examples and source comments through the injected
shipped guidance. Both passing tasks independently meet their existing qualified observations.
Striped-material fails a consumer-project typecheck; its own successful GPU/browser observations
cannot supersede that gate. None timed out or required operator help, and no observation CLI
stall is demonstrated. The findings above belong to discovery, check adaptation and completion;
these trajectories do not establish a scheduler/capture fault or a reliability estimate. The FAIL
stops this unit for the person's decision, with no retry or fix in this trial.
