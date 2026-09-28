# shallot-eval

Can a stock coding agent compose Shallot from the shipped package and complete a small user-shaped
task? Each task has a with-context arm and a without-context arm. Setup builds an isolated project,
an agent works in it, and a withheld gate grades it through the installed package's public observation
and capture exports. This repository owns task prompts, arms, withheld expectations, invocation
records, and outcomes. Shallot owns engine correctness and the mechanism that establishes it.

The consumer pins the published prerelease, and setup records the version and content hash of the
installed Shallot package used for its artifact preflight. A single run does not produce a score,
aggregate, model-capability conclusion, or comparative claim.

## Surface Commands

The default surface runs the cheap consumer checks. It never runs task setup, grading, a browser, or
an engine clone.

```bash
bun install
bun run check
bun run test
```

The Shallot package is pinned as a dev-only dependency to `^0.10.0-next.1` in `package.json` and
`bun.lock`. Task setup packs the installed package for an out-of-tree generated app; this artifact
preflight is not the consumer's staged package state. The task app receives the package version,
content hash and tar SHA-256 in `.eval.json`.

## The Contract

- **The agent never sees the gate.** `tasks/<task>/gate.ts` and `NOTES.md` stay here. Setup copies
  only `PROMPT.md` into the isolated project.
- **Isolation is an artifact preflight in a temp dir.** Setup packs the installed package into a
  temporary tarball, records its version, content hash and tar SHA-256, and installs it into a fresh
  `create-shallot` project under the OS temp dir. The agent sees only the installed
  `node_modules/@dylanebert/shallot` package and the context selected by its arm, not either source
  worktree. This local pack is not the consumer's staged package state.
- **Gates assert positive behavior.** Each one drives the canvas, sends synthetic input where needed,
  and checks the task claim. The withheld task files remain outside the generated project.
- **Public instrumentation owns observation.** Grading runs the project's independent check/build
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
bun run setup red-box          # prints the project dir on the last line
# an agent works in that dir with PROMPT.md and the installed package
bun run grade red-box <projectDir>
```

`--bare` sets up the without-context arm: the tarball loses `examples/` and `AGENTS.md`, and the
scaffold's agent docs lose their pointer to them. Run a task with and without it to observe the two
arms. `setup --json` prints the task, installed package identity, and artifact integrity;
`grade --json` includes browser runtime and capture identity when available.

The browser and fixed `final-canvas 1280x720@1 rgba8-tight` identity travel with the verdict.
Missing GPU/Chromium premises refuse rather than pass. An agent stall is a product discoverability
finding for Shallot's public API, CLI, examples, or docs, not evidence of an internal engine defect.
