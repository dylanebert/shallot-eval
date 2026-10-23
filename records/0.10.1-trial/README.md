# Stranger trial — 0.10.1

One stock-agent invocation of striped-material on 2026-10-23. Setup once, no retry,
operator intervention, task-project edit, or re-grade. No pre-land check was run.

| Task | Verdict | Agent wall time | Model (default, not overridden) |
|---|---|---|---|
| striped-material | PASS | 160.048s (2m40s) | anthropic/claude-opus-5-5, medium thinking |

**The finishing-typecheck fix is witnessed in this trajectory.** The agent ran `bun check`
after adding its renderer check and again before finishing. The independent grading-copy
typecheck and build pass, as do all three existing frame claims. This does not establish
reliability or prove that the guidance caused the outcome; the previous nonexistent `box`
import was not repeated here. The published 0.10.1 carries the generated-CI and finishing
instruction change identified as Shallot `01ceae1d` (release tag `v0.10.1`, `c47287a6`).

## Evidence and setup

The [task directory](striped-material/) contains `setup.json`, `run.json` (argv, context
preflight, UTC start/end, exit status, wall time), `grade.json`, `stdout.txt` (agent final
response), and the original session JSONL. References below use physical lines of
[S](striped-material/2026-10-23T03-56-19-749Z_01a166e7-09a5-762f-8a77-8dc6be51d5b3.jsonl).

Host: macOS 26.7 (25G229), arm64; Bun 1.4.3; pi 1.4.0.
Evaluator HEAD before edits: `fb5173e549f432aad1d2aba969bdbaede23977f9`.
The worktree started clean. The registry pin, consumer-contract version assertions, AGENTS
pin and README were updated before setup. Every contract assertion was retained; no gate,
grading code, prompt or operator task-project edit was made.

Surface checks ran narrow to wide before setup: `bun check` (79 files), `bun run lint`
(17 files), `bun run test` (21 pass, 43 assertions). The trial grade followed the invocation.

Setup ran once as `bun src/setup.ts striped-material --json`. Before launching pi, the
supervisor asserted version `0.10.1` and registry integrity:

```
sha512-nibU1r/nNnwrBcvZNtt6RazEONT4UXLVz/JOws0dh02heZsSYAmPr4HARdX++sM02V59zwLBPkulHduD1lrZsg==
```

Installed content hash:
`6c6e541c8d94f8b63e7b8f6fcadb7f2193af7043900beb559174801971b9be7a`.
Local-pack SHA-256:
`36775f38eca1a39e2657460667aef08eacbbc3b8ab967dce73cdcbf6c5f8032b`.
Generated AGENTS SHA-256:
`86c2b1cc5decd7805b19949883cbe1206340f7657a60d8076df50aff83959449`.
Setup asserts generated AGENTS equals the installed skill body without frontmatter.
The consumer install resolves under this worktree's node_modules, not a producer checkout.

The project was under the OS temp tree, outside evaluator and engine worktrees. `run.json`
lists absent AGENTS.md/CLAUDE.md files in every ancestor and `~/.pi/agent`; project CLAUDE.md
was also asserted absent. S L4's project context contains only the generated AGENTS.md,
including “Before you finish, run `bun check` and `bun test` once”. No evaluator context,
custom skills, extensions or MCP tools appear in the system sections. S L5 is exactly the
complete project PROMPT.md. Guidance was supplied at startup, not suppressed.

```
pi -p --no-extensions --no-skills --no-mcp --no-prompt-templates --session-dir <task-record-dir> <PROMPT.md contents>
```

A subprocess supervisor read the prompt unchanged, launched pi in the generated project,
and enforced a 1,800-second wall-clock limit on its process group. No model flag or extra
prompt was supplied. It exited 0 without timeout. The supervisor then ran exactly once:
`bun src/grade.ts striped-material <project> --json`. Its process exited 0 and its JSON
explicitly reports PASS.

### Setup limits

Setup is installed-artifact preflight, not a registry install in the task app. It records
registry integrity and installed content identity, packs that installation, and installs
the pack out of tree. The agent could read the file-based package entry and `.eval.json`;
this supplies no private engine checkout. Context isolation is not a filesystem sandbox.
This is one trajectory, not an engine-correctness population or model-capability estimate.

## striped-material — PASS

[Grade](striped-material/grade.json): grading-copy `bun check` passes (246 files), build
passes, silhouette change is 0.00% (limit 2%), surface brightness peak-to-peak is 102 with
2 crossings, and autonomous frame motion passes. Observation is public capture at
`final-canvas 1280x720@1 rgba8-tight`, HeadlessChrome 153, `apple metal-3` (provenance only).

### Reading and checks

- **First read:** S L6 reads package.json, lists the project and runs `create --help`.
  L8–10 inspect scaffold entry, preload, startup checks and materials example files.
- **Examples/JSDoc:** S L12–18 read materials implementation, animation and rendered-frame
  checks, gallery/browser excerpts and fragment-input/lighting definitions. No installed
  example suite is executed.
- **Implementation:** S L20–28 replace cube rotation with a stripe clock, define a custom
  local-space stripe material and add a state check. L31–32 run TypeScript and the CPU check.
- **Rendered evidence:** S L33–38 add a GPU check and pass it: 204 dark and 193 light samples,
  238 changed pixels under a fixed camera. These are agent checks, not the withheld verdict.
- **Finishing:** S L39–40 run `bun check` successfully after the new node check, run `bun test`
  (one pass), and read generated CI, which includes the new typecheck step. L41–42 pass all
  six startup browser checks. L43 appends its node check to CI. L45–46 update page metadata
  and run `bun check` successfully again. L47 finishes, explicitly saying it used numeric
  evidence and did not look at a picture. The independent grade agrees with task completion.

### Findings / recovered wrong turns

1. **Agent edit mistake, recovered:** S L20–28 initially splice at `WelcomeCube` rather than
   `Welcome`; L28 acknowledges it and rewrites the entry. No operator help or engine fix.
2. **Peer dependency discovery:** S L24–26 inspect package peers and declare `typegpu`.
   L35–36's GPU check reports the missing optional `webgpu` peer. L37 installs it; despite
   a blocked-postinstall notice, L38 passes the GPU check. No public malfunction is shown.
3. **CI adaptation:** S L43 adds its own node check to the browser job because that new
   `*.node.ts` file was not run by the scaffold's existing tiers. This is an agent project
   change, not evidence that Eval ran that CI or that every platform has been qualified.

Unlike next.7, the new renderer check is followed by a successful finishing typecheck,
and the withheld grade reaches and passes the frame observations. No task, gate or engine
repair was attempted by the operator. This bounded PASS witnesses the intended completion
behavior without a causal or comparative capability claim.
