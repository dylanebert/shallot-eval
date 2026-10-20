# shallot-eval

Can a stock coding agent compose Shallot from the shipped package and complete a small user-shaped
task? Setup builds an isolated project with the installed engine's own `create`,
an agent works in it, and a withheld gate grades it through the installed package's public observation
and capture exports. This repository owns task prompts, withheld expectations, invocation records,
and outcomes. Shallot owns engine correctness and the mechanism that establishes it.

The consumer pins the published prerelease, and setup records the version and content hash of the
installed Shallot package used for its artifact preflight. A single run does not produce a score,
aggregate, model-capability conclusion, or comparative claim.

## Surface Commands

The default surface runs the cheap consumer checks. It never runs task setup, grading, a browser, or
an engine clone.

```bash
bun install
bun check
bun run lint
bun run test
```

The Shallot package is pinned as a dev-only dependency to `0.10.1-next.5` in `package.json` and
`bun.lock`. Task setup packs the installed package for an out-of-tree generated app; this artifact
preflight is not the consumer's staged package state. The task app receives the package version,
content hash, lockfile registry integrity and tar SHA-256 in `.eval.json`.

## The Contract

- **The agent never sees the gate.** `tasks/<task>/gate.ts`, qualification solutions and `NOTES.md`
  stay here. Setup copies only `PROMPT.md` into the isolated project.
- **Isolation is an artifact preflight in a temp dir.** Setup packs the installed package into a
  temporary tarball, records its version, content hash, lockfile registry integrity and tar SHA-256,
  and installs it into a fresh engine-created project under the OS temp dir. The agent sees only the installed
  `node_modules/@dylanebert/shallot` package and its shipped guidance, not either source
  worktree. This local pack is not the consumer's staged package state.
- **Gates assert positive behavior.** Each one drives the canvas, sends synthetic input where needed,
  and checks the task claim. The withheld task files remain outside the generated project.
- **Public instrumentation owns observation.** Grading runs the project's independent typecheck/build
  gates, then runs the withheld probe under Playwright Test against that project's own `vite preview`.
  The probe imports only `captureFrame`, `Capture`, and `CAPTURE_CONTRACT` from the installed public
  `@dylanebert/shallot/rendering` entrypoint. Eval does not copy the capture transport or a browser
  driver. A task failure is `FAIL`; missing or unusable browser/GPU/public instrumentation is
  `INCOMPLETE`, not a pass.
- **Surface cadence is separate from task gates.** `test` runs the cheap `*.test.ts` suite with Bun.
  Task setup and grading remain explicit commands and are not default checks.

## Tasks

| task | problem | gate observes |
|------|---------|---------------|
| `red-box` | a static red cube on a dark background | centre is red, distinct from background, and holds still |
| `falling-box` | a box drops under gravity and lands | blue-pixel centroid moves down, then settles |
| `orbit-on-drag` | orbit the camera by dragging | idle view is stable; a drag changes it |
| `color-on-key` | spacebar turns a cube green | centre reads white before the press, green after |
| `persist-color` | number keys paint the cube; the colour survives a reload | key paints the target hue; a fresh load still reads it |
| `striped-material` | a cube with a moving procedural pattern | face brightness oscillates; two frames ~1s apart differ |

## Run One Task

```bash
bun install
bun src/setup.ts red-box       # prints the project dir on the last line
# an agent works in that dir with PROMPT.md and the installed package
bun src/grade.ts red-box <projectDir>
```

`bun src/setup.ts <task> --json` prints the task, installed package identity, registry integrity and
artifact integrity. The generated `AGENTS.md` equals the published skill body (without frontmatter).
`bun src/grade.ts <task> <projectDir> --json` includes runtime and capture identity when available.

The next.5 evaluator qualification and fixture installation steps are recorded in
[`records/next.5-qualification/`](records/next.5-qualification/README.md).

The browser and fixed `final-canvas 1280x720@1 rgba8-tight` identity travel with the verdict.
Missing GPU/Chromium premises refuse rather than pass. An agent stall is a product discoverability
finding for Shallot's public API, CLI, examples, or docs, not evidence of an internal engine defect.
