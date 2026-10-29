# Stranger trial — 0.10.2-next.1

One stock-agent invocation per task, in the order below, on 2026-10-29 (UTC). No retry,
operator intervention, operator task-project edit, or re-grade. These are three individual
trajectories, not a reliability estimate or an engine-correctness population. No pre-land
check was run.

| Task | Verdict | Agent wall time | Model (default, not overridden) |
|---|---|---|---|
| falling-box | PASS | 197.559s (3m18s) | anthropic/claude-opus-5-5, medium thinking |
| color-on-key | PASS | 143.794s (2m24s) | anthropic/claude-opus-5-5, medium thinking |
| striped-material | PASS | 135.050s (2m15s) | anthropic/claude-opus-5-5, medium thinking |

## Evidence and setup

Each task directory contains `setup.json`, `run.json` (argv, context preflight, UTC start/end,
exit status, wall time), `grade.json`, `stdout.txt` (agent final response), and the original
session JSONL. Session references use **physical JSONL line numbers**:

- **F**: [falling-box session](falling-box/2026-10-29T23-29-55-779Z_01a189ff-a843-71c7-8561-2f89d94ff7f4.jsonl)
- **C**: [color-on-key session](color-on-key/2026-10-29T23-33-27-018Z_01a18a02-e169-7760-aef9-334fd30a2fb6.jsonl)
- **S**: [striped-material session](striped-material/2026-10-29T23-36-01-376Z_01a18a05-3c5f-7610-95ef-2b5a0c85007f.jsonl)

Host: macOS 26.7 (25G229), arm64; Bun 1.4.3; pi 1.4.0.
Evaluator HEAD before the trial: `56f74f25cb6d77a244473438bd52697be3d04013`.
The initial worktree was clean. The registry pin was updated before invocation. The three
consumer-contract version literals were updated during the trial; no assertion was removed,
and no task gate, grading code, or task project was changed by the operator. Surface checks
pass: `bun check`, `bun run lint`, `bun run test` (21 tests). The first test run failed only
on the stale `0.10.1` consumer-contract literal; the version assertions now name the pinned candidate.

For each task, setup ran once as `bun src/setup.ts <task> --json`. Before launching pi,
the supervisor asserted version `0.10.2-next.1` and registry integrity:

```
sha512-jG8t5++T0v4s691Nsx5QMS5gIJigRAFxvZzDRBrzJMiUIYMtCuc3SKyyKvnpLimUPIlJ6kCFWKy66WjAGoBzFA==
```

All three record content hash
`8f2ab352db67c5760f05b71fa4500d94fedc69af7926863beabba913c0895fb4`.
Generated AGENTS SHA-256 is
`86c2b1cc5decd7805b19949883cbe1206340f7657a60d8076df50aff83959449` in every preflight.
Setup itself asserts generated AGENTS equals the installed skill body without frontmatter.
Fresh projects were under the OS temp tree, outside evaluator and engine worktrees.
Each `run.json` lists absent AGENTS.md/CLAUDE.md files in every ancestor and `~/.pi/agent`;
project CLAUDE.md was also asserted absent. Each session L4's `sections.project_context`
contains only that project's generated AGENTS.md. No evaluator context, withheld material,
custom skill, extension, or MCP tool appears in the system sections. Guidance was supplied at
startup, not suppressed with `--no-context-files`. L5 in each session is exactly that project's
complete PROMPT.md.

The command shape matches next.7:

```
pi -p --no-extensions --no-skills --no-mcp --no-prompt-templates --session-dir <task-record-dir> <PROMPT.md contents>
```

A subprocess supervisor read the prompt unchanged, launched pi in the project directory,
and enforced a 1,800-second wall-clock limit on its process group. All exited 0 without a timeout.
No model flag or extra prompt was supplied; L2/L3 record the model and thinking above.
After each exit, before setting up the next task, the supervisor ran
`bun src/grade.ts <task> <project> --json` from the evaluator. All three `grade.json` files
explicitly say PASS; the process exit status alone is not the verdict.

### Setup limits

- Setup is installed-artifact preflight, not a registry install inside each task app. It records
  registry integrity, installed content identity and local-pack SHA-256, then installs that pack.
  Agents could read the scaffold's `file:...engine-pack/...tgz` manifest entry and `.eval.json`.
  This supplies no private engine checkout. AGENTS was the only context file, not the only readable file.
- Absolute session-directory paths are invocation metadata, not extra prompts. Context isolation
  is not a filesystem sandbox. Agents used shared `/tmp` capture paths. F L46–59 includes an
  unchanged image reading and a read-before-write ENOENT; the agent's caching diagnosis is not
  established by this record. The independent grade does not rely on these screenshot files.
- All grades use their own ephemeral servers and public capture at
  `final-canvas 1280x720@1 rgba8-tight`, reporting HeadlessChrome 153 and `apple metal-3`
  (provenance only). All grading-copy typechecks and builds pass.

## falling-box — PASS

[Grade](falling-box/grade.json): 73/73 visible blue samples, descent 0.287, and a final
1,954ms rest interval with centroid spread 0.0000.

### Reading and checks

- **First read:** F L6 reads package.json, lists files and runs `create --help`;
  L8 reads generated scene, checks, preload, CI and README and lists physics/minimal.
- **Examples:** L11–14 narrow the large physics example to body setup and a node check.
  L35–38 later inspect its material authoring helper. No installed example suite is executed.
- **JSDoc/source:** L15–22 trace Body, Shape, built-in cube, physics plugin and sleep query;
  L24–28 inspect Orbit's fields after initially guessing `target`.
- **Own evidence:** L29–32 implement and pass a physics check. L33–40 add a cheap scene test
  after finding no default tests. L41–45 run startup/browser checks and read screenshots.
  L53–54 finish with a clean typecheck, cheap test, physics test and seven browser checks.

### Findings / wrong turns

1. **Owning surface: agent API discovery.** F L23 guesses Orbit `target`; L24–29 discovers
   `pan` and corrects it. L29–32 also moves the sleep query import to the public physics
   entrypoint. Recovery occurs within the invocation, without operator help.
2. **Owning surface: agent check selection.** F L34 finds `bun test` has no tests after removing
   the starter. L35–40 adds a cheap scene-authoring test; the explicit physics node test is separate.
3. **Owning surface: agent screenshot sequencing.** F L46–53 investigates an apparently unchanged
   floor image, measures pixels, and makes lighting neutral. L53 requests a read alongside the
   command producing the file; L55 gets ENOENT, then L56–59 rereads successfully. These are
   recovered observation issues, not evidence of a rendering mechanism defect.

## color-on-key — PASS

[Grade](color-on-key/grade.json): 21,702 foreground pixels, white **212,212,212** becomes
**76,188,87**, green in all 11 post-Space samples at actual 576–3097ms.

### Reading and checks

- **First read:** C L6 reads package.json, lists files/examples and runs `create --help`;
  L8 reads prompt, README, generated scene and startup/check configuration.
- **Examples:** L10–19 inspect interact's input and HUD's material updates. No installed suite runs.
- **JSDoc/source:** L20–37 trace Materials row/get/update, Keys draw-boundary latches,
  keyboard listener, InputPlugin and camera rotation helper.
- **Own evidence:** L40–43 implement and pass state checks. L44–50 add and repair a browser
  colour check; L51–52 read its green image. L53–54 pass typecheck, two CPU tests and all
  seven browser tests. Independent grade agrees.

### Findings / wrong turns

1. **Owning surface: agent Playwright check adaptation.** C L46 writes
   `expect.poll(...).toSatisfy`, which Playwright rejects at L48. L49 switches to polling a
   boolean with `toBe(true)` and L50 passes. This is an agent test API mistake, not an input failure.
2. **Owning surface: agent environment assumption.** C L38–39 tries Git in the generated app,
   which is not a Git repository. It continues without intervention.

## striped-material — PASS

[Grade](striped-material/grade.json): maximum silhouette change 0.00% (limit 2%), brightness
peak-to-peak 67 with three crossings, and observed frame motion.

### Reading and checks

- **First read:** S L6 reads package.json, lists files and runs `create --help`;
  L8 reads generated scene/checks and inventories materials/minimal.
- **Examples:** L11–14 read materials implementation, CPU animation/material checks, gallery
  node check and browser-check excerpts; L17–18 inspect quantized renderer capture composition.
  No installed suite runs.
- **JSDoc/source:** L15–20 inspect fragment local-position inputs, materialType and `lit`;
  L47–48 trace step timing after the GPU check's requested time advance fails to move far enough.
- **Own evidence:** L21–30 implement stripes, stop cube spin and pass three CPU tests.
  L31–50 build and repair a GPU frame check. L51–54 finish with a clean typecheck, three CPU
  tests and six startup browser checks. The independent grade establishes pattern and motion.

### Findings / wrong turns

1. **Owning surface: example/GPU-check prerequisites.** S L32 reports the missing optional
   `webgpu` peer. L33 installs it. Bun reports a blocked postinstall (L34); subsequent GPU
   checks pass. No operator action was required.
2. **Owning surface: agent observation design and step API discovery.** S L34 initially sees
   only 51 changed pixels. L35–44 examines captures and increases resolution; a stricter
   half-cycle assertion still fails at L46. L47–49 discovers clamped steps, advances in 50
   small frames and L50 passes with 2,345 changed pixels. This recovered exploration does not
   establish a scheduler defect or missing guidance requirement.
3. **Owning surface: agent dependency hygiene.** S L25–28 reads the package's peer range and
   declares the directly imported `typegpu` dependency. This is self-directed, not an operator fix.

## Scope of conclusions

All three agents reached relevant installed examples and source comments through the shipped
guidance and independently met the existing qualified task observations. None stalled, timed out,
or required operator help. The recovered wrong turns above do not demonstrate an observation CLI
stall or an internal engine defect. These three trajectories are witnesses, not a reliability
estimate or a comparison with next.7's single trajectories.
