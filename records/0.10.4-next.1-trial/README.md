# Stranger trial — 0.10.4-next.1

One stock-agent invocation per task, in the order below, on 2026-11-13 (UTC). No retry,
operator intervention in the agent runs or operator task-project edit. Falling-box was later
regraded once after browser provisioning, as recorded below. These are three individual
trajectories, not a reliability estimate or an engine-correctness population.

| Task | Verdict | Agent wall time | Model (default, not overridden) |
|---|---|---|---|
| falling-box | PASS on regrade (first grade INCOMPLETE) | 122.630s (2m03s) | anthropic/claude-opus-5-5, medium thinking |
| color-on-key | PASS | 90.202s (1m30s) | anthropic/claude-opus-5-5, medium thinking |
| striped-material | PASS | 135.685s (2m16s) | anthropic/claude-opus-5-5, medium thinking |

## Evidence and setup

Each task directory contains `setup.json`, `run.json` (argv, context preflight, UTC start/end,
exit status, wall time), `grade.json`, `stdout.txt` (agent final response, empty for color-on-key),
`stderr.txt`, `grade-stderr.txt`, and the original session JSONL. References below use physical
JSONL line numbers:

- **F**: [falling-box session](falling-box/2026-11-13T13-17-23-869Z_01a1d50e-421c-7738-a736-4ab7dc6edc7a.jsonl)
- **C**: [color-on-key session](color-on-key/2026-11-13T13-19-33-587Z_01a1d510-3cd3-7580-b8c1-5a127bf21018.jsonl)
- **S**: [striped-material session](striped-material/2026-11-13T13-21-14-497Z_01a1d511-c700-7213-8dc0-0781673209b9.jsonl)

Host: macOS 26.7 (25G229), arm64; Bun 1.4.3; pi 1.5.2 (previous trial: 1.5.0).
Evaluator HEAD before the trial: `f2829615230639b7321b44284e8836e0c068e1ea`.
The initial worktree was clean. The exact registry pin and three consumer-contract version
literals were updated before invocation; no assertion was removed. No task gate, grading code,
or task project was changed by the operator. Before trials, `bun check`, `bun run lint` and
`bun run test` passed (21 tests).

For each task, setup ran once as `bun src/setup.ts <task> --json`. Before each pi invocation,
the supervisor asserted installed and setup version `0.10.4-next.1`, setup registry integrity,
and the integrity's presence in the evaluator lockfile:

```
sha512-C8U137BGYqK/DEFb/6WEl5XPGPxQYssV4ujxXhGiSUkxPuhnWZPCquTZ2ttXcFqyCsnxQHtVgtQPW4TEOPOR2w==
```

All three record installed content hash
`6b0c9261229e47d21240f8031c5f929abdef330d3f8a3b2e72270b950856fb5b`.
Generated AGENTS SHA-256 is
`86c2b1cc5decd7805b19949883cbe1206340f7657a60d8076df50aff83959449` in every preflight.
Setup asserts generated AGENTS equals the installed skill body without frontmatter.
Fresh projects were under the OS temp tree, outside evaluator and engine worktrees.
Each `run.json` lists absent AGENTS.md/CLAUDE.md files in every ancestor and `~/.pi/agent`;
project CLAUDE.md was also asserted absent. Each session L4's `sections.project_context`
contains only the project's generated AGENTS.md. L5 is exactly the complete task PROMPT.md.
No evaluator context, withheld material, custom skill, extension or MCP tool was supplied.
Guidance was supplied at startup, not suppressed with `--no-context-files`.

The invocation shape matches the 0.10.3-next.0 trial:

```
pi -p --no-extensions --no-skills --no-mcp --no-prompt-templates --session-dir <task-record-dir> <PROMPT.md contents>
```

A subprocess supervisor read the prompt unchanged, launched pi in the project directory,
and enforced a 1,800-second wall-clock limit on its process group. None timed out.
No model flag or extra prompt was supplied. After each exit, before setting up the next task,
the supervisor ran `bun src/grade.ts <task> <project> --json` once from the evaluator.
Verdicts above come from grade.json, not agent exit status.

### Setup limits and departures from the previous trial

- Setup remains installed-artifact preflight, not a registry install inside each task app.
  It records registry integrity, installed content identity and local-pack SHA-256, then installs
  that pack. The scaffold's file dependency and `.eval.json` are readable, but supply no private
  engine checkout. Context isolation is not a filesystem sandbox.
- pi is now 1.5.2 rather than 1.5.0; the default model and thinking level are unchanged.
  `bun install` warned about the typegpu peer dependency; surface gates still passed.
- Falling-box's first independent grade is INCOMPLETE: Playwright could not launch because
  the required cached Chromium 1243 full-browser executable was missing. Later task grades
  launched successfully; this record does not establish why shared host availability differed.
  After the initial record commit, the operator explicitly requested browser provisioning and
  one regrade of the same untouched project. From the evaluator root, `bunx playwright --version`
  reported 1.63.0 and `bunx playwright install chromium` exited 0. The same grade command was
  then run once; `falling-box/regrade.json` records PASS and `regrade-stderr.txt` its stderr.
  The original `grade.json` remains unchanged. The agent was not rerun, and the task project was
  not touched. A full regular-file tree SHA-256 (sorted relative path, NUL, contents; symlinks
  excluded) before and after grading was identical:
  `c89d7d036749321e8b2a7cf7d8d48afecae396ce243f06e5f493f1c6e83d20ba`.
- Color-on-key exited 1 after provider 503 credential-validation errors, with no final response.
  The stock harness made its own recovery attempts within that one invocation; the supervisor
  did not retry it. Its existing project nevertheless independently grades PASS.
- Striped-material also encountered provider 503 errors within its invocation, recovered without
  operator help, and exited 0. Falling-box exited 0. All grading-copy typechecks and builds pass.

## falling-box — PASS on regrade; first grade INCOMPLETE

[First grade](falling-box/grade.json): no determined task observations, because the grading
browser could not launch. [Regrade](falling-box/regrade.json), after browser provisioning:
360/360 visible blue samples, descent 0.358, and a final 2,000ms rest interval with centroid
spread 0.0000. Both grading-copy typecheck and build pass. The agent was not rerun and the
project was unchanged.

### Reading and checks

- **First read:** F L6 reads package.json, lists files and runs `create --help`; L8 reads
  the scaffold, prompt and configuration.
- **Examples/source:** L11–23 inspect physics and interact examples, physics body/shape fields,
  default plugins, camera rotation and GPU-test support. No installed suite runs.
- **Own evidence:** L25–28 implement a blue falling box and gray floor and a physics test.
  L29–38 inspect GPU-test support, add a rendered-frame check and install the optional webgpu
  peer. L39–40 finish with typecheck, one CPU test and six browser startup tests passing.

### Findings / wrong turns

1. **Owning surface: GPU-check prerequisites.** F L35–38 discover and install webgpu after
   the rendered check needs it. The agent reports Bun blocking its setup script; its check passes.
2. **Owning surface: evaluator host browser availability.** The first independent grade could
   not launch the required browser. The separately recorded regrade after browser provisioning
   passes the withheld falling/rest observation. No engine mechanism failure is established.

## color-on-key — PASS

[Grade](color-on-key/grade.json): 22,237 foreground pixels; white **166,170,179** becomes
**58,159,72**, remaining green in all 11 post-Space samples at actual 515–3022ms.

### Reading and checks

- **First read:** C L6 reads package.json, lists files and runs `create --help`; L8 reads
  prompt, scaffold and startup configuration.
- **Examples/source:** L8–18 inspect minimal, HUD and interact, key handling, BaseColor and camera
  rotation. No installed suite runs.
- **Own evidence:** L19–25 replace the starter scene, add input/material state tests and run
  checks. L28–29 read browser configuration and a HUD browser example before provider errors
  end the invocation. There is no final response.

### Findings / wrong turns

1. **Owning surface: provider availability.** C L26 and L30–36 record 503 errors, ending in
   credential-validation failure. The agent process exits 1, but the independent grade observes
   the requested white-to-green behavior in the project already written. This is not evidence
   of an engine input failure or a completed agent verification trajectory.
2. **Owning surface: agent environment assumption.** C L19–20 attempt Git in a non-Git app;
   the agent continues without operator help.

## striped-material — PASS

[Grade](striped-material/grade.json): maximum silhouette change 0.00% (limit 2%), brightness
peak-to-peak 70 with three crossings, and observed frame motion.

### Reading and checks

- **First read:** S L6 reads package.json, lists files and runs `create --help`; L8 reads
  the scaffold and startup configuration.
- **Examples/source:** L10–20 inspect materials authoring, gallery, tests, fragment inputs and lit.
  No installed suite runs.
- **Own evidence:** L22–25 implement animated stripes on a stationary cube and three CPU tests.
  L26–31 add a GPU check and install webgpu. L32–35 run startup checks and repair a type error;
  final typecheck, GPU test and six browser startup tests pass.

### Findings / wrong turns

1. **Owning surface: provider availability.** S L12 and L16 record 503 credential-validation
   failures. The stock invocation continues without operator help.
2. **Owning surface: agent material/test authoring.** S L24 supplies the stripe material's color
   defaults; L33 reports use of a material value as a type. L34–35 switch to MaterialHandle and
   pass typecheck and the GPU check. These are recovered authoring mistakes, not established
   engine defects.
3. **Owning surface: GPU-check prerequisites.** S L30 installs the optional webgpu peer.

## Scope of conclusions

All three existing projects independently meet the qualified task observations, with falling-box
requiring one separately recorded regrade after provisioning the missing browser. Its original
INCOMPLETE grade is preserved. No agent was rerun and no task project was edited by the operator.
Color-on-key's invocation exited 1 on provider 503 errors while its written project passed;
striped-material recovered from provider errors within its invocation. These trajectories are
witnesses, not a reliability estimate, an engine-correctness population, or a capability comparison
with the previous trial.
