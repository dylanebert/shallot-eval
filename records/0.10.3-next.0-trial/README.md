# Stranger trial — 0.10.3-next.0

One stock-agent invocation per task, in the order below, on 2026-11-03 (UTC). No retry,
operator intervention, operator task-project edit, or re-grade. These are three individual
trajectories, not a reliability estimate or an engine-correctness population.

| Task | Verdict | Agent wall time | Model (default, not overridden) |
|---|---|---|---|
| falling-box | PASS | 210.923s (3m31s) | anthropic/claude-opus-5-5, medium thinking |
| color-on-key | PASS | 114.148s (1m54s) | anthropic/claude-opus-5-5, medium thinking |
| striped-material | PASS | 128.095s (2m08s) | anthropic/claude-opus-5-5, medium thinking |

## Evidence and setup

Each task directory contains `setup.json`, `run.json` (argv, context preflight, UTC start/end,
exit status, wall time), `grade.json`, `stdout.txt` (agent final response), `stderr.txt`,
`grade-stderr.txt`, and the original session JSONL. Session references below use **physical
JSONL line numbers**:

- **F**: [falling-box session](falling-box/2026-11-03T01-27-49-795Z_01a19f05-0922-76fa-acf3-e107465500a6.jsonl)
- **C**: [color-on-key session](color-on-key/2026-11-03T01-31-34-946Z_01a19f08-78a1-728c-8850-f0ddedf4f636.jsonl)
- **S**: [striped-material session](striped-material/2026-11-03T01-33-39-239Z_01a19f0a-5e27-764e-8080-86d5895644fd.jsonl)

Host: macOS 26.7 (25G229), arm64; Bun 1.4.3; pi 1.5.0.
Evaluator HEAD before the trial: `690100011b47f0e677ff62934221a90c1b70c2df`.
The initial worktree was clean. The registry pin and three consumer-contract version literals
were updated before invocation; no assertion was removed. No task gate, grading code, or task
project was changed by the operator. Surface checks pass: `bun check`, `bun run lint`,
`bun run test` (21 tests).

For each task, setup ran once as `bun src/setup.ts <task> --json`. Before launching pi,
the supervisor asserted version `0.10.3-next.0` and registry integrity:

```
sha512-76D1+TtnPcml8vK9iAFjSPAETMa/mxH4WlCyBa/qOYTtjbrMLhndRnCL6CuMaIofryRpnUGreKCPAhIwJpj8PA==
```

All three record installed content hash
`3226d415dc788297fd9f42f548b5c46f36fe2e980e121a3a3d928a0951c183bf`.
Generated AGENTS SHA-256 is
`86c2b1cc5decd7805b19949883cbe1206340f7657a60d8076df50aff83959449` in every preflight.
Setup asserts generated AGENTS equals the installed skill body without frontmatter.
Fresh projects were under the OS temp tree, outside evaluator and engine worktrees.
Each `run.json` lists absent AGENTS.md/CLAUDE.md files in every ancestor and `~/.pi/agent`;
project CLAUDE.md was also asserted absent. Each session L4's `sections.project_context`
contains only the project's generated AGENTS.md. The system sections contain no evaluator
context, withheld material, custom skill, extension, or MCP tool. L5 is exactly the task's
complete PROMPT.md. Guidance was supplied at startup, not suppressed with `--no-context-files`.

The command shape matches the previous trial:

```
pi -p --no-extensions --no-skills --no-mcp --no-prompt-templates --session-dir <task-record-dir> <PROMPT.md contents>
```

A subprocess supervisor read the prompt unchanged, launched pi in the project directory,
and enforced a 1,800-second wall-clock limit on its process group. All exited 0 without timeout.
No model flag or extra prompt was supplied; L2/L3 record the model and thinking above.
After each exit, before setting up the next task, the supervisor ran
`bun src/grade.ts <task> <project> --json` from the evaluator. Each grade explicitly says PASS;
process exit status alone is not the verdict.

### Setup limits

- Setup is installed-artifact preflight, not a registry install inside each task app. It records
  registry integrity, installed content identity and local-pack SHA-256, then installs that pack.
  Agents could read the scaffold's `file:...engine-pack/...tgz` entry and `.eval.json`.
  This supplies no private engine checkout. AGENTS was the only context file, not the only readable file.
- Context isolation is not a filesystem sandbox. Absolute session-directory paths are invocation
  metadata, not extra prompts. Agents used shared `/tmp` capture paths; independent grades do not
  rely on these screenshots.
- All grades use ephemeral servers and public capture at `final-canvas 1280x720@1 rgba8-tight`,
  reporting HeadlessChrome 153 and `apple metal-3` (provenance only). All grading-copy typechecks
  and builds pass.

## falling-box — PASS

[Grade](falling-box/grade.json): 141/141 visible blue samples, descent 0.274, and a final
2,041ms rest interval with centroid spread 0.0000.

### Reading and checks

- **First read:** F L6 reads package.json, lists files and runs `create --help`;
  L8 reads generated scene, startup/check configuration, README and prompt.
- **Examples:** L10–18 inspect physics tests and single-box authoring. No installed suite runs.
- **JSDoc/source:** L19–42 trace mesh, shape, body, hull, physics dependencies, sleep and Orbit fields.
- **Own evidence:** L45–60 implement the scene and two CPU tests; L61–64 inspect the falling and
  sleeping trajectory. L65–70 add a browser visibility check and read its settled screenshot.
  L71–72 finish with a clean typecheck and two CPU tests.

### Findings / wrong turns

1. **Owning surface: agent material API discovery.** F L56's colour test passes a MeshMaterial
   component copy instead of its material row to Materials.get. L57–60 read the JSDoc and fix
   the test; both tests pass. This is recovered discovery, not a rendering failure.
2. **Owning surface: agent environment assumption.** F L43–44 tries Git in a generated app
   that is not a Git repository; it continues without operator help.

## color-on-key — PASS

[Grade](color-on-key/grade.json): 21,702 foreground pixels, white **177,177,177** becomes
**61,161,71**, green in all 11 post-Space samples at actual 548–3085ms.

### Reading and checks

- **First read:** C L6 reads package.json, lists files and runs `create --help`;
  L8 reads prompt, README, generated scene and startup/check configuration.
- **Examples:** L8–18 inspect minimal, interact's input and HUD's material updates.
  No installed suite runs.
- **JSDoc/source:** L15–22 inspect BaseColor, InputPlugin, key handling and camera rotation.
- **Own evidence:** L23–26 implement and pass three state tests and typecheck.
  L29–34 add and repair a browser colour check and read the green screenshot.
  L35–36 pass typecheck, three CPU tests and all seven browser tests.

### Findings / wrong turns

1. **Owning surface: agent Playwright check adaptation.** C L30 rejects
   `expect.poll(...).toSatisfy`. L31–32 switches to polling a boolean with `toBe(true)` and
   passes. This is a recovered test API mistake, not an input failure.

## striped-material — PASS

[Grade](striped-material/grade.json): maximum silhouette change 0.00% (limit 2%), brightness
peak-to-peak 75 with three crossings, and observed frame motion.

### Reading and checks

- **First read:** S L6 reads package.json, lists files and runs `create --help`;
  L8 reads generated scene and startup/check configuration.
- **Examples:** L10–14 inspect materials authoring, CPU tests, gallery and quantized GPU checks.
  No installed suite runs.
- **JSDoc/source:** L15–18 inspect fragment inputs, lit and materialType.
- **Own evidence:** L19–22 implement moving stripes on a stationary cube, passing two CPU
  tests and typecheck. L23–28 build and repair a GPU check, passing with contrast 74–252 and
  562/576 pixels changed. L29–33 capture and read two browser images. L34–35 finish with
  typecheck, two CPU tests and six startup browser checks passing.

### Findings / wrong turns

1. **Owning surface: example/GPU-check prerequisites.** S L24 reports the missing optional
   `webgpu` peer; L25 installs it. Bun reports a blocked postinstall at L26. The GPU check
   subsequently passes without operator action.
2. **Owning surface: agent material authoring.** S L26's test scene initialization fails on
   an undefined vector after adding a material row with only time. L27 supplies darkColor
   and lightColor as well; L28 passes. No engine mechanism failure is established.
3. **Owning surface: agent environment assumption.** S L34–35's final Git status exits 128
   because the app is not a Git repository; preceding checks pass.

## Scope of conclusions

All three agents reached relevant installed examples and source comments through the shipped
guidance and independently met the existing qualified task observations. None stalled, timed out,
or required operator help. The recovered wrong turns do not establish an observation CLI gap or
an internal engine defect. These trajectories are witnesses, not a reliability estimate or a
comparison with the previous trial's single trajectories.
