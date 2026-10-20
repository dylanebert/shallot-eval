# Stranger trial — 0.10.1-next.5

One stock-agent invocation per task, in the order below, on 2026-10-20. These are readings of
three individual trajectories, not a reliability estimate or an engine-correctness population.
No retry, intervention, or task-project edit by the trial operator. The verdicts are the qualified
evaluator's results, including the color task's disagreement with the agent's own browser check.
No pre-land check was run.

| Task | Verdict | Agent wall time | Model (default, not overridden) |
|---|---|---|---|
| falling-box | PASS | 202.892s (3m23s) | anthropic/claude-opus-5-5, medium thinking |
| color-on-key | FAIL | 121.684s (2m02s) | anthropic/claude-opus-5-5, medium thinking |
| striped-material | PASS | 151.075s (2m31s) | anthropic/claude-opus-5-5, medium thinking |

## Evidence and setup

Each task directory contains `setup.json`, `run.json` (argv, context preflight, UTC start/end,
exit status, wall time), `grade.json`, `stdout.txt` (agent's final response), and the original
session JSONL. Session references below use **physical JSONL line numbers**, not tool-output lines:

- **F**: [falling-box session](falling-box/2026-10-20T23-16-57-364Z_01a15b9a-8b94-77a6-bc25-cb8e2d6a1d68.jsonl)
- **C**: [color-on-key session](color-on-key/2026-10-20T23-20-35-821Z_01a15b9d-e0ec-7538-a26d-87d37aa2d2f9.jsonl)
- **S**: [striped-material session](striped-material/2026-10-20T23-23-01-430Z_01a15ba0-19b4-72b5-a2a3-561c1aa53b1a.jsonl)

Host: macOS 26.7 (25G229), arm64; Bun 1.4.3; pi 1.3.0. Evaluator HEAD before the trial:
`04e0e0ff85d738cd6a166f7793586d51264ca7d7`. Initial worktree was clean.
All three grades report HeadlessChrome 153, hardware `apple metal-3` (provenance, not a criterion),
and `final-canvas 1280x720@1 rgba8-tight`. All three grading-copy typechecks and builds pass.

For each task, setup ran once as `bun src/setup.ts <task> --json`. Before launching pi, the
operator asserted the record's version `0.10.1-next.5` and registry integrity:

```
sha512-tAvTzE37qhm0IFJwO6/KKWQDbuz7ywDO7uQW79D2FCd20HOjjrWFuthXGGICZT/smZZxWJoeJ9AdEI/3Xponvg==
```

All retain the qualified content hash
`cdd8fd40d15a7ddef47c1a9fa3c88b2c4084c89f647539eb020aafca9410ea15`.
Fresh projects were under the OS temp tree, outside the evaluator and engine worktrees.
Their generated AGENTS SHA-256 was
`6823960b3a59d8e8be1a5e830e702abe45e7a9195357f1c7755476779ec6fa4e` in every preflight.
Each `run.json` enumerates absent AGENTS.md/CLAUDE.md files in every ancestor and in the pi
configuration root (`~/.pi/agent`); project CLAUDE.md was also absent. More importantly, each
session L4's `sections.project_context` contains **only that project's AGENTS.md**. It begins
“Explore this project's entry, plugins and checks first; reuse its setup.” No harness AGENTS,
qualification material, custom skill, extension, or MCP tool appears in those system sections.
The guidance was supplied at startup, not suppressed by `--no-context-files`.

Each invocation used the requested command shape, with the complete PROMPT.md text as its sole
user message (L5 in each session):

```
pi -p --no-extensions --no-skills --no-mcp --no-prompt-templates --session-dir <task-record-dir> <PROMPT.md contents>
```

A subprocess supervisor read PROMPT.md without changing it, launched pi in the project directory,
and enforced a 1,800-second wall-clock limit on its process group. All exited 0 without hitting
that limit. No model flag or extra prompt was supplied; each session L2 records
`"provider":"anthropic","modelId":"claude-opus-5-5"`, L3 records `medium`.
After each exit, before setting up the next task, the supervisor ran
`bun src/grade.ts <task> <project> --json` from the evaluator. No trial was resumed or rerun.

### Setup caveats that could mislead a run

- These are installed-artifact preflights, not direct registry installs inside the task apps.
  Setup records registry integrity and qualified content identity, then installs its local pack.
  The agents saw a `file:...engine-pack/...tgz` manifest entry and `.eval.json` (F/C/S L7–9).
  This is visible harness provenance, not an engine source link; no private engine checkout was
  supplied. The stock scaffold also supplied README, startup tests, CI and config files: AGENTS
  was the only **context file**, not the only file available to read.
- The sessions are stored in the requested evaluator record directories. That absolute path is
  invocation metadata, not an extra prompt. This is context isolation, not a filesystem sandbox.
- F L41 reports a possible existing-server mix-up on the scaffold's fixed port 4175 (see below).
  The operator did not inspect or change other servers during the agent run. The session does
  not establish which server produced the disputed screenshot; don't treat the agent's diagnosis
  as independent proof. The final independent grade used its own ephemeral server.
- C's browser check samples **one centre pixel**; the withheld grade averages the central
  20% × 20% region at 1280×720. These are different promises of visibility. The grade's low
  averages do not establish that the keyboard API failed. No post-trial project modification or
  diagnostic rerun was made to resolve that disagreement.

## falling-box — PASS

The grade observes 100/100 visible blue samples, descent 0.336, and 1,964ms of final rest with
centroid spread 0.0000 ([grade](falling-box/grade.json)).

### Reading and checks

- **First read, +14s:** F L6 executes `ls -la; cat package.json; find . ...; bunx shallot create --help`.
  The first file read is package.json, not a separate AGENTS read. AGENTS was already in system
  context at L4 (+0.5s); no later tool explicitly reads AGENTS.md.
- **Examples:** F L8 (+19s) lists installed `examples/physics` and `examples/minimal` after reading
  the generated entry, plugin, test and preload. F L10 (+21s) reads physics checks with
  `cat tests/*.node.ts | head -200`, then F L12 (+25s) reads scene construction and viewer code.
  Those checks were inspected, not executed as an installed suite.
- **JSDoc:** F L14–17 (+31–35s) searches installed physics source and reads `isAwake`'s comment:
  “Returns the solver's current awake state, or null for a body the solver does not hold”.
  F L19 returns MeshInstance's “Defaults to the built-in cube.” F L21 returns Body field comments.
- **Own evidence:** F L28–29 creates/runs `tests/drop.node.ts`: “final y 0.4999292492866516 awake false”,
  six assertions pass. F L32–36 runs startup tests and a temporary browser capture and reads two
  screenshots. F L37–45 changes lighting/camera, repeats physics/captures, then recaptures on a
  distinct port. F L52–53 adds a discoverable composition test and reruns both Bun test paths.

### Findings / wrong turns

1. **Owning surface: example (minimal browser configuration).** F L41: “That screenshot came from
   a different app. Another server was already running on port 4175, and Playwright reused it.”
   F L31–32 show the generated config's fixed `4175` URL and spread `WEB_SERVER_CONFIG`.
   F L41 switches to `4391` with `reuseExistingServer: false`; L42 reports a passing capture.
   This is a server-identity hazard encountered in this run, not proof of a persistent port conflict.
2. **Owning surface: example (minimal lighting).** After inheriting its lights, F L37 says
   “The floor's reading beige instead of plain gray because of the warm sun and lighting”.
   It changes both lights to white and repeats the captures (L37–45). The example was useful
   scaffolding but its aesthetic defaults required correction for this task.
3. **Owning surface: skill/generated AGENTS (check routing), agent lapse rather than a demonstrated
   missing instruction.** F L47: “Tests need \".test\", \"_test_\", \".spec\" or \"_spec_\" in the filename”.
   The agent had deleted the only auto-discovered test and kept physics in `drop.node.ts`.
   F L52: “CI runs `bun test`, and deleting the welcome test left it with no tests to run.”
   It adds a `.test.ts` and reruns both paths. L4 already explicitly distinguishes node-path checks.
4. **Owning surface: JSDoc (geometry/default discovery).** It repeatedly traces default geometry:
   F L18 “checking whether a half-extent of 0.5 ... matches MeshInstance's default unit box mesh”;
   L20 “check the built-in cube's default size”; L22 “quickly verify that”, followed by L24/L26
   searches through primitive registration. L27 finally returns `cube(... = [1, 1, 1])`.
   The default-cube comment was found, but the size needed implementation tracing in this run.
5. **Owning surface: skill/generated AGENTS (check selection).** F L30 attempts
   `bunx tsc --noEmit -p .`; L32 says “The tsc check seems blocked by install noise, so I'll skip
   that”. Its output was dependency-resolution text, not a reported type failure. The agent
   substitutes browser evidence; the independent grading typecheck later passes. No CLI failure
   was observed: `create --help` successfully led to the physics example (L7).

## color-on-key — FAIL

The grade's initial central-region RGB is **110,110,112**, after Space **46,102,52**.
Both the white and green brightness assertions fail ([grade](color-on-key/grade.json)).
The green-dominant change is present; this result must not be rewritten as “Space did nothing”.

### Reading and checks

- **First read, +5s:** C L6: `ls; cat package.json; find . ...; bunx shallot create --help`.
  AGENTS appears in system context at L4 (+1.4s); no explicit later AGENTS read occurs.
- **Examples:** C L8 (+9s) reads the generated plugin/test, entry, preload and startup e2e and
  lists installed minimal/hud/interact. L10 (+12s): “Now the hud (recolor) and interact (keys)
  examples.” L12–13 (+18s) reads HUD implementation and its `.test.ts`, and interaction
  implementation/check excerpts. L15–16 reads HUD's `Materials.update` recoloring.
  No installed example suite is executed.
- **JSDoc:** C L15–16 (+23s) reads the Keys/Devices comments, including “the input plugin clears
  them at the draw boundary” and pressKey's “Repeated presses do not retrigger an edge”.
  C L19–20 reads scheduler API comments/implementation; L27–28 reads lookAtRotation's comment.
- **Own evidence:** C L29–30 runs its new CPU input/material test: one pass, seven assertions,
  covering other keys, same stepped frame and persistence. C L31–32 builds and runs startup
  e2e plus a new `tests/space.e2e.ts`, all five pass. C L33 reads `/tmp/green.png`.
  It does not iterate after that screenshot. L35 concludes “The cube is done.”

### Findings / wrong turns

1. **Owning surface: example (checks and framing), not an established input defect.** C L31's
   browser witness reads `getImageData(c.width >> 1, c.height >> 1, 1, 1)` and asserts the pixel
   is bright before Space and green afterward. C L35 claims “That pixel is white ... after
   pressing space it's green”. This is narrower than the evaluator's central region, which
   grades FAIL despite typecheck/build and the agent's e2e passing. Its plugin sets baseColor
   WHITE and updates to GREEN (L29); a material-row check alone does not establish the task's
   rendered visibility. The example-check route reached real browser evidence, but this agent's
   chosen sampling/framing did not witness the graded area. Root cause of the numerical
   discrepancy was not isolated by another run.
2. **Owning surface: JSDoc (input lifecycle/material discovery).** C L17: “wondering if a \"setup\"
   group ... would be the right place”, followed by L19 scheduler implementation reading and
   L21 “I should just set the group to \"setup\" so it runs in the same frame”. It also repeats
   material API searches at L21, L23 and L25 after finding HUD's update usage. This is extra
   source tracing, not a prolonged stall or an API malfunction. The final CPU test passes.
   The CLI itself provides the useful HUD and interact descriptions at L7; no CLI error occurs.

## striped-material — PASS

The grade observes a stationary measurable silhouette (0.00% maximum change), spatial bands
(peak-to-peak 67, four crossings), and frame motion ([grade](striped-material/grade.json)).

### Reading and checks

- **First read, +4s:** S L6: `cat package.json; ls; ...; bunx shallot create --help`.
  AGENTS is in L4's system context (+0.6s); no explicit later AGENTS read occurs.
- **Examples:** S L8 (+7s) reads the generated entry/plugin/check and lists installed materials.
  L12 lists that example's source/checks; L14–15 (+16s) reads `materials.ts` and
  `animation.test.ts`. L16–17 (+19s) reads the gallery, its node checks, materials unit checks,
  and quantized GPU check. No installed suite is executed.
- **JSDoc:** S L18–19 (+27s) searches installed lit/materialType source and receives the comment
  “Define a material resource with plain \"use gpu\" shaders whose arguments are inferred from
  its schemas.” It then implements UV stripes with a stepped material time parameter.
- **Own evidence:** S L22–28 runs/revises a CPU material-clock test. L29–35 creates and eventually
  passes `tests/stripes.node.ts`, comparing band edges and changed GPU pixels. L38–42 saves and
  reads two GPU images 40 updates apart. L43 widens bands from five to three; L44–46 reruns
  CPU/GPU checks, typecheck and build. It does not run a browser check: GPU frames answer the
  pattern claim. L47 explicitly discloses it did not look at a new frame after widening.

### Findings / wrong turns

1. **Owning surface: example (minimal adaptation); agent editing error, not an example defect.**
   S L23: “\"WelcomeCube\" has already been declared”. L24 diagnoses “the search matched the
   wrong occurrence first, grabbing WelcomeCube instead of the intended match”; L26:
   “My scripted edit duplicated the file; rewriting it cleanly.” The rewrite and test pass at L28.
2. **Owning surface: example (GPU-check prerequisites), CLI/runtime diagnostic recovery succeeds.**
   S L31: “The optional \"webgpu\" peer is missing; install it with `bun add webgpu`”.
   The agent follows it with `bun add -d webgpu` (L32). Then L33:
   “World.gpu is unavailable: no enabled plugin declares a GPU requirement”.
   It adds StandardRenderingPlugin and MeshRenderPlugin (L34); L35 passes.
   It had read both the gallery's state-only `openGpuApp({ defaults: false, plugins: [GalleryPlugin] })`
   and the explicitly composed renderer in `quantized.node.ts` (L17). Choosing the state-only
   composition for a capture caused one avoidable failed attempt after installing the peer.
3. **Owning surface: JSDoc (capture result type), local test typing error.** S L44:
   “Type 'Uint8ClampedArray<ArrayBufferLike>' is missing ... from type 'Uint8Array<ArrayBufferLike>'”.
   Its helper annotation was too narrow; L45 changes it to `ArrayLike<number>` and L46 returns
   “TSC OK”. This does not establish a wrong public signature: the compiler caught the mismatch.
4. **Owning surface: skill/generated AGENTS (evidence order), positive witness with a limit.**
   S L29: “The state is right. Next I'll capture frames on the GPU”; L36: “I'll also look at one
   captured frame myself.” It follows state → GPU capture without needing a new observation CLI.
   L47 accurately bounds the visual witness: “I reran the tests and build after that change but
   didn't look at a new frame.” The final independent grade passes. No CLI discovery stall occurs.

## Scope of conclusions

All three agents used the startup-injected guidance's discovery command and reached relevant
installed implementations, checks and source comments. None explicitly reread AGENTS.md; injection
is observed, internal attention is not. Both visual tasks reached GPU/browser observations without
operator help. The observed stalls belong to example composition/configuration, source/JSDoc
navigation and check selection, not demonstrated internal scheduler/capture faults. In particular,
these runs do not justify adding an observation CLI on the premise that the agent could not explore
a running app. Which, if any, guidance/example fixes to make remains the person's decision.
