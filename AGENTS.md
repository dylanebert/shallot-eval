# Shallot Eval Contract

This evaluation admits Bun `1.4.2` from `.bun-version`/`packageManager`. Run `bun run check` and
`bun run test`; these surface gates stay independent from task setup and grading.

Eval owns the prompts, context arms, withheld task expectations, invocation records, and agent
outcomes. Shallot owns the scheduler and observation mechanism, the capture contract, and tests of those
mechanisms; Eval owns its Playwright grading run. Eval may consume those public exports. It does not
copy them, import Shallot source, archive engine paths, use a workspace link as evidence, turn task
gates into a second engine-correctness population, or infer model capability from one run.

## Package States

- The consumer pin is `@dylanebert/shallot@^0.10.0-next.1` in `package.json` and `bun.lock`.
  Staging uses `bun pm pack` from Shallot main followed by `bun add --no-save <tarball> --dev`;
  `bun install` restores the registry pin without changing either file.
- Local co-development is an uncommitted `bun link` producer registration plus
  `bun link @dylanebert/shallot --no-save` here. Record both HEAD/dirt states and the consumer
  `package.json`/`bun.lock` hashes; the installed realpath must equal the producer. Exit with a fresh
  empty-cache `bun install --force --frozen-lockfile --cache-dir <cache>`, prove a non-producer
  realpath and the candidate identity, rerun the focused gate, and unlink the producer when finished.
- The local pack made by `bun run setup` is **artifact preflight**, not source staging. It is copied
  from the package installed under this repository, and `.eval.json` records its package version,
  content hash and tar SHA-256. Setup installs it only in the out-of-tree task app; its temporary
  package override never changes this repository's manifest or lockfile.

Do not save a local link or file source, Git ref, mutable tag, global checkout or private engine path.
Eval does not use a workspace link as evidence. A clean exit from local co-development is a forced
frozen install from an empty cache, followed by installed-package identity/realpath proof, the focused
gate, and removal of the producer registration.

## Task And Frame Gates

`bun run setup <task>` creates an isolated temp app and copies only `PROMPT.md`; withheld claims and
notes remain in this repository. The selected arm provides the installed packed package and its
shipped public context. Setup records the installed package identity and artifact integrity in
`.eval.json`. `bun run grade <task> <project>` runs the project's independent check/build gates, then
runs Playwright Test against the project's own `vite preview`. The temporary probe imports only the
installed public `@dylanebert/shallot/rendering` `captureFrame` contract. It asserts the existing task
properties semantically over `final-canvas 1280x720@1 rgba8-tight`, never by a screenshot golden, CPU
reconstruction of GPU truth, copied capture transport, or archived/private engine driver. A determined
task failure is `FAIL`; a missing or unusable public instrument is `INCOMPLETE`, never green. Adapter
identity, when present in the subject's existing output, is provenance only; Eval does not grade
adapter class. Grading tears down its ephemeral app server and leaves no tabs.

Bun tests here never load engine TGSL, so this project has no Bun transform preload. Task setup,
grading, and the surface checks are separate gates. Product checks do not claim that task tooling proves
engine correctness. An agent stall is an Eval discoverability finding, not proof that an internal
Shallot mechanism is broken.
