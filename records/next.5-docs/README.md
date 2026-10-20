# Published next.5 documentation trial

## Scope and provenance

Stage 3 only; no engine changes, no pre-land check. Commands were executed in order from the installed package README, not reconstructed from a checkout. Both runs lived outside the harness at `/private/tmp/shallot-docs-next5.xQOuN6`. Host: macOS 26.7 (25G229), arm64, Bun 1.4.3 (c6da4a4d3). This is one witness, not a reliability claim.

Two independent registry installs (`bun add --exact @dylanebert/shallot@0.10.1-next.5 typescript`) supplied the migration projects and the documentation being tested. Installed realpaths are `<root>/cpu-next5/node_modules/@dylanebert/shallot` and `<root>/gpu-next5/node_modules/@dylanebert/shallot`, not links to a producer. Both report `0.10.1-next.5`.

Installed document SHA-256 (identical in both projects):

- README.md: `51493a9e07ade038ce7ea37ae93f481b5053a8e541d35f94e62b413f3bb66cd3`
- MIGRATION.md: `b377d85d2a80be499594f4dc70f504e1b50d8651b9e572e0cadcd15daf48839f`

CPU-only means a consumer without `webgpu` installed and without importing `/webgpu`; it does not mean this physical host lacks a GPU. GPU consumers install Dawn's `webgpu` and call `setupGlobals` from the public `@dylanebert/shallot/webgpu` entry. No private driver or engine source was copied. The GPU adapter was:

```text
{
  vendor: "apple",
  architecture: "metal-3",
  device: "apple-m4-max",
  description: "Metal driver on macOS Version 26.7 (Build 25G229)",
  isFallbackAdapter: false,
}
```

## README outcomes

Commands retained their documented working-directory sequence: the examples commands run inside `my-game`. `cd my-game` was executed by changing the subprocess working directory (confirmed with `pwd`). `bun run dev` was observed for eight seconds and intentionally terminated as a process group; exit 143 is cleanup, not a startup failure. No browser rendering is claimed for that command. The GPU variant adds `bun add --dev webgpu` after the documented install; the CPU variant does not. README's commands do not themselves initialize Dawn or request a headless device.

**Important:** neither README run is a next.5 app witness. We did not replace the version chosen by `bun create`. That published path selects 0.10.0; continuing honestly tests its output, not next.5. This is finding F1, not a reason to silently upgrade.

| Command, in order | CPU-only | GPU environment | Evidence |
| --- | --- | --- | --- |
| `curl -fsSL https://bun.sh/install &#124; bash` | PASS, installed Bun | PASS, installed Bun | `*-install-bun` below |
| `bun create shallot my-game` | PASS scaffold; engine pin 0.10.0 | Same | `*-create`, `*-install` |
| `cd my-game` | PASS | PASS | `*-cd` |
| `bun install` | PASS; installed engine 0.10.0 | Same | `*-install` |
| `bunx shallot --help` | PASS; old CLI | Same | `*-help` |
| `bun run dev` | PASS startup, Vite URL; intentionally stopped | Same | `*-dev` |
| `bun create shallot --help` | PASS, lists templates | Same | `*-examples-help` |
| `bun create shallot first-person --template first-person` | PASS scaffold; engine pin 0.10.0 | Same | `*-template`, supplementary install/version |

The last documented command only copies a project; supplementary `bun install` inside each generated `first-person` confirmed engine 0.10.0. The first version inspection occurred before that install and reported ENOENT for its node_modules; that is not a product failure.

## MIGRATION.md outcomes

The installed guide has exactly one “after” fenced example: **A second camera and the first canvas**, with two alternatives (`attachTexture` and `Camera.order`). The other fenced block is the 0.10 “before”; the capture, effect-stack and GPU-row sections contain prose, not after examples. This record does not claim to verify all those prose behaviors.

The guide explicitly assumes an owning world, an existing entity and surrounding imports. Wrappers supplied `createApp`, `Camera`, `attachTexture`, `RenderingPlugin`, `world.create()`, and disposal. GPU app composition was `{ defaults: false, plugins: [RenderingPlugin] }`; CPU composition had no GPU plugins. Each uses published public exports. The literal after block was run as printed, then its order-only alternative was also isolated so the expected CPU texture prerequisite would not mask that CPU-capable example.

| After example | CPU typecheck | CPU execution | GPU typecheck | GPU execution |
| --- | --- | --- | --- | --- |
| Entire block: camera + 320×180 texture, then order 1 | PASS | Not CPU-applicable: texture allocation requires GPU; explicit diagnostic below | PASS | PASS; block and `world.step(1/60)` completed |
| Order-only alternative: `world.add(eid, Camera, { order: 1 })` | PASS | PASS, including step | PASS | PASS, including step |

Typechecking: `bunx tsc --noEmit` with strict, skipLibCheck, target ESNext, module Preserve, moduleResolution bundler, Bun types, include probe.ts. Order-only: `bunx tsc --ignoreConfig --noEmit --target esnext --module preserve --moduleResolution bundler --skipLibCheck --strict --types bun stack.ts`. TypeScript and @types/bun are test tools. Execution: `DOCS_GPU=1 bun --preload ./preload.ts probe.ts` (GPU), `bun --preload ./preload.ts probe.ts` (CPU); replace probe.ts with stack.ts for the isolated alternative.

Preload registration (importing `/bun` alone does **not** register its plugin):

```ts
import { plugin } from 'bun';
import { shallot } from '@dylanebert/shallot/bun';
plugin(shallot({ root: import.meta.dir }));
```

## Findings and non-findings

- **F1 — create-shallot (owning surface), README (affected entry point):** both documented `bun create` commands select engine **0.10.0**, not **0.10.1-next.5**. Both independent new-project installs and both supplementary first-person installs agree. Thus the next.5 README quick start does not lead to the engine whose guidance is under trial. The help printed by that app even describes `migrate` as 0.9.5 → 0.10. No version was overridden to manufacture a next.5 README success. Registry create-package version and outputs appear below.
- **CPU texture prerequisite, not an engine defect:** the full migration block typechecks without Dawn; its texture branch cannot run without a GPU. Its order-only branch runs without either optional GPU dependency/import. This is within the requested CPU-only scope (“examples and commands that need no GPU”), not a failed migration promise.
- **Trial-wrapper corrections, not documentation findings:** the initial GPU attempt imported `/bun` without registering `shallot()`, producing the explicit missing-TGSL-transform error below. Registering the public plugin made the unmodified after block pass. The first CPU typecheck still contained the GPU-only `/webgpu` dynamic import and reported missing optional `webgpu`; removing that GPU bootstrap from the CPU wrapper made typecheck pass without installing Dawn. A first explicit-file TypeScript invocation needed `--ignoreConfig`; the corrected invocation above passed. None of these harness mistakes is charged to Shallot.

## Command output evidence

Outputs below are from the actual out-of-tree runs. Empty typecheck logs mean exit 0. Supplementary setup/correction outputs are included to distinguish them from findings. Successful dev-server startup alone is not rendered-game verification.

### adapter

```text
{
  vendor: "apple",
  architecture: "metal-3",
  device: "apple-m4-max",
  description: "Metal driver on macOS Version 26.7 (Build 25G229)",
  isFallbackAdapter: false,
}

```

### cpu-cd

```text
/private/tmp/shallot-docs-next5.xQOuN6/cpu/my-game

```

### cpu-create

```text
Resolving dependencies
Resolved, downloaded and extracted [2]
created /private/tmp/shallot-docs-next5.xQOuN6/cpu/my-game from minimal
  cd my-game && bun install && bun run dev

```

### cpu-dev

```text
$ vite --host 127.0.0.1

  VITE v8.3.4  ready in 607 ms

  ➜  Local:   http://127.0.0.1:5173/
error: script "dev" exited with code 143

```

### cpu-examples-help

```text
Resolving dependencies
Resolved, downloaded and extracted [2]

  shallot create <name> [--template <example>]

  Create a project in the outer folder. The default template is minimal.

  Outer folder, without Shallot installed
    bun create shallot <name> [--template <example>]

  Inside a project where Shallot is installed
    bunx shallot create <name> [--template <example>]

  Options
    --template <example>  Copy an installed example
    -h, --help            Show this help

  Templates
    city — A seeded city assembled from shared building parts, with an orbit and fly camera.
    day-night-cycle — A sky, sun, shadows and haze follow a one-minute day; scrub the hour.
    embedded-scene — Embed a Shallot scene in an ordinary web page, with loading and rendering contained in its frame.
    first-person — Climb a first-person ascent with steps, a lift, and a block perch.
    hud — Svelte controls recolour a cube and set its turn speed, beside its live angle.
    interact — Aim at objects in a first-person room and use E to switch a lamp, press a button or hold to lift a block.
    lit-interior — Walk a dark room between sunlight through a window and warm shadowed pendants.
    loading-screen — A game's own title card, held until its intro and minimum dwell end.
    materials — Orbit a gallery of plastic, metals, glass, textured wood, animated custom materials and banded lighting from an extended material.
    minimal — A turning cube and ground under an orbit camera, built with Shallot.
    particles — Walk through GPU-simulated dust motes in a sunlit room and see their cost in the profiler.
    physics — Box3D samples in Shallot: stacking, joints, sensors, contacts and hit events.
    save-and-load — Click a cube to build a coin pile, save it, and load it into the running game.
    sound — Walk a first-person sound yard: moving spatial music, pause and resume, a synthesized chime.
    voxel — Scroll over seeded voxel hills with scattered grass, flowers, rocks and trees as GPU-meshed chunks stream into and out of view.
    world-ui — Follow a courier along a road with a world-space name, a progress bar, a line trail and an icon that scales away.

```

### cpu-help

```text

  shallot — tools for a Shallot project

  Shallot is a library: Vite runs your project and Bun tests it.

  Your loop
    bun run dev                  run the Vite project
    bun test                     run cheap and GPU tests
    bun test ./<file>            run a Node or oracle file by path
    bunx playwright test         run browser tests

  Commands
    create <name>                create a project from minimal or an example
    migrate                      print the 0.9.5 to 0.10 migration guide
    dev --target <platform>      develop a desktop app
    build --target <platform>    build a desktop app
    preview --target <platform>  launch a desktop build

  Desktop options
    --target <platform>          windows, mac, linux
    --release                    optimized native build
    --portable                   bundle the Chromium runtime (CEF)

  Help
    -V, --version                print the installed version
    --skill                      print the Shallot project skill
    shallot <command> --help
    shallot help [command]


```

### cpu-install-bun

```text
#=#=#                                                                          
##O#-#                                                                         
##O=#  #                                                                       

                                                                           0.0%
#                                                                          2.2%
#########                                                                 13.3%
#####################                                                     29.2%
##################################                                        48.3%
##################################################                        69.9%
################################################################          89.2%
######################################################################## 100.0%
bun was installed successfully to ~/.bun/bin/bun 
Run 'bun --help' to get started

```

### cpu-install

```text
bun install v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [48]
Saved lockfile

+ @types/bun@1.4.3
+ playwright@1.64.1
+ vite@8.3.4
+ @dylanebert/shallot@0.10.0

54 packages installed [1414.00ms]

```

### cpu-migration-run-configured

```text
160 |     }
161 | 
162 |     /** this world's GPU device, typed root and frame state; unavailable when the build acquired no device. */
163 |     get gpu(): WorldGpu {
164 |         if (!this._gpu)
165 |             throw new Error(
                            ^
error: World.gpu is unavailable: no enabled plugin declares a GPU requirement
      at gpu (/private/tmp/shallot-docs-next5.xQOuN6/cpu-next5/node_modules/@dylanebert/shallot/src/engine/ecs/world.ts:165:23)
      at attachTexture (/private/tmp/shallot-docs-next5.xQOuN6/cpu-next5/node_modules/@dylanebert/shallot/src/core/rendering/view.ts:501:20)
      at /private/tmp/shallot-docs-next5.xQOuN6/cpu-next5/probe.ts:10:1

Bun v1.4.3 (macOS arm64)

```

### cpu-migration-run

```text
160 |     }
161 | 
162 |     /** this world's GPU device, typed root and frame state; unavailable when the build acquired no device. */
163 |     get gpu(): WorldGpu {
164 |         if (!this._gpu)
165 |             throw new Error(
                            ^
error: World.gpu is unavailable: no enabled plugin declares a GPU requirement
      at gpu (/private/tmp/shallot-docs-next5.xQOuN6/cpu-next5/node_modules/@dylanebert/shallot/src/engine/ecs/world.ts:165:23)
      at attachTexture (/private/tmp/shallot-docs-next5.xQOuN6/cpu-next5/node_modules/@dylanebert/shallot/src/core/rendering/view.ts:496:20)
      at /private/tmp/shallot-docs-next5.xQOuN6/cpu-next5/probe.ts:17:1

Bun v1.4.3 (macOS arm64)

```

### cpu-migration-typecheck

```text

```

### cpu-next5-install

```text
bun add v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [0]
Saved lockfile

installed @dylanebert/shallot@0.10.1-next.5 with binaries:
 - shallot
installed typescript@7.0.2 with binaries:
 - tsc

48 packages installed [90.00ms]

```

### cpu-stack-run

```text
after block completed
step completed

```

### cpu-stack-typecheck

```text

```

### cpu-template-install

```text
bun install v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [0]
Saved lockfile

+ @types/bun@1.4.3
+ playwright@1.64.1
+ vite@8.3.4
+ webgpu@0.6.2
+ @dylanebert/shallot@0.10.0

56 packages installed [102.00ms]

Blocked 1 postinstall. Run `bun pm untrusted` for details.

```

### cpu-template-version

```text
0.10.0

```

### cpu-template

```text
Resolving dependencies
Resolved, downloaded and extracted [2]
created /private/tmp/shallot-docs-next5.xQOuN6/cpu/my-game/first-person from first-person
  cd first-person && bun install && bun run dev

```

### cpu-types-install

```text
bun add v1.4.3 (c6da4a4d3)
Saved lockfile

installed @types/bun@1.4.3

[17.00ms] done

```

### cpu-versions

```text
./node_modules/@dylanebert/shallot/package.json 0.10.0
./first-person/node_modules/@dylanebert/shallot/package.json ENOENT: no such file or directory, open './first-person/node_modules/@dylanebert/shallot/package.json'

```

### create-version

```text
0.10.0

```

### gpu-cd

```text
/private/tmp/shallot-docs-next5.xQOuN6/gpu/my-game

```

### gpu-create

```text
Resolving dependencies
Resolved, downloaded and extracted [2]
created /private/tmp/shallot-docs-next5.xQOuN6/gpu/my-game from minimal
  cd my-game && bun install && bun run dev

```

### gpu-dawn

```text
bun add v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [1]
Saved lockfile

installed webgpu@0.6.2

1 package installed [522.00ms]

Blocked 1 postinstall. Run `bun pm untrusted` for details.

```

### gpu-dev

```text
$ vite --host 127.0.0.1

  VITE v8.3.4  ready in 898 ms

  ➜  Local:   http://127.0.0.1:5173/
error: script "dev" exited with code 143

```

### gpu-examples-help

```text
Resolving dependencies
Resolved, downloaded and extracted [2]

  shallot create <name> [--template <example>]

  Create a project in the outer folder. The default template is minimal.

  Outer folder, without Shallot installed
    bun create shallot <name> [--template <example>]

  Inside a project where Shallot is installed
    bunx shallot create <name> [--template <example>]

  Options
    --template <example>  Copy an installed example
    -h, --help            Show this help

  Templates
    city — A seeded city assembled from shared building parts, with an orbit and fly camera.
    day-night-cycle — A sky, sun, shadows and haze follow a one-minute day; scrub the hour.
    embedded-scene — Embed a Shallot scene in an ordinary web page, with loading and rendering contained in its frame.
    first-person — Climb a first-person ascent with steps, a lift, and a block perch.
    hud — Svelte controls recolour a cube and set its turn speed, beside its live angle.
    interact — Aim at objects in a first-person room and use E to switch a lamp, press a button or hold to lift a block.
    lit-interior — Walk a dark room between sunlight through a window and warm shadowed pendants.
    loading-screen — A game's own title card, held until its intro and minimum dwell end.
    materials — Orbit a gallery of plastic, metals, glass, textured wood, animated custom materials and banded lighting from an extended material.
    minimal — A turning cube and ground under an orbit camera, built with Shallot.
    particles — Walk through GPU-simulated dust motes in a sunlit room and see their cost in the profiler.
    physics — Box3D samples in Shallot: stacking, joints, sensors, contacts and hit events.
    save-and-load — Click a cube to build a coin pile, save it, and load it into the running game.
    sound — Walk a first-person sound yard: moving spatial music, pause and resume, a synthesized chime.
    voxel — Scroll over seeded voxel hills with scattered grass, flowers, rocks and trees as GPU-meshed chunks stream into and out of view.
    world-ui — Follow a courier along a road with a world-space name, a progress bar, a line trail and an icon that scales away.

```

### gpu-help

```text

  shallot — tools for a Shallot project

  Shallot is a library: Vite runs your project and Bun tests it.

  Your loop
    bun run dev                  run the Vite project
    bun test                     run cheap and GPU tests
    bun test ./<file>            run a Node or oracle file by path
    bunx playwright test         run browser tests

  Commands
    create <name>                create a project from minimal or an example
    migrate                      print the 0.9.5 to 0.10 migration guide
    dev --target <platform>      develop a desktop app
    build --target <platform>    build a desktop app
    preview --target <platform>  launch a desktop build

  Desktop options
    --target <platform>          windows, mac, linux
    --release                    optimized native build
    --portable                   bundle the Chromium runtime (CEF)

  Help
    -V, --version                print the installed version
    --skill                      print the Shallot project skill
    shallot <command> --help
    shallot help [command]


```

### gpu-install-bun

```text
#=#=#                                                                          

                                                                           0.1%
####                                                                       5.6%
####################                                                      28.4%
#####################################                                     52.1%
######################################################                    76.0%
######################################################################## 100.0%
bun was installed successfully to ~/.bun/bin/bun 
Run 'bun --help' to get started

```

### gpu-install

```text
bun install v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [0]
Saved lockfile

+ @types/bun@1.4.3
+ playwright@1.64.1
+ vite@8.3.4
+ @dylanebert/shallot@0.10.0

55 packages installed [64.00ms]

```

### gpu-migration-run-configured

```text
adapter {"subgroupMatrixConfigs":[]}
world.add: component already attached to entity 1
after block completed
step completed

```

### gpu-migration-run

```text
adapter {"subgroupMatrixConfigs":[]}
874 |         );
875 |     }
876 |     try {
877 |         tgpu.resolve([tgslCanary]);
878 |     } catch (cause) {
879 |         throw new Error(
                        ^
error: TGSL metadata is missing — this bundle was built without the typegpu transform, so every engine shader would resolve wrong. Add `shallot()` from `@dylanebert/shallot/vite` to your vite config, or register `unplugin-typegpu/bun` in a bun preload.
      at checkTgsl (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:879:19)
      at requestGPU (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:1251:5)
      at buildNow (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/app/index.ts:298:35)

45 |         // Set the prototype explicitly.
46 |         Object.setPrototypeOf(this, ResolutionError.prototype);
47 |     }
48 |     appendToTrace(ancestor) {
49 |         const newTrace = [ancestor, ...this.trace];
50 |         return new ResolutionError(this.cause, newTrace);
                    ^
error: Resolution of the following tree failed:
- <root>
- fn:<unnamed>: Missing metadata for tgpu.fn function body (either missing 'use gpu' directive, or misconfigured `unplugin-typegpu`)
 cause: 110 |             if (pluginExternals) {
111 |                 this.setExternals('pluginProvided', pluginExternals);
112 |             }
113 |             const ast = pluginData?.ast;
114 |             if (!ast) {
115 |                 throw new Error("Missing metadata for tgpu.fn function body (either missing 'use gpu' directive, or misconfigured `unplugin-typegpu`)");
                                ^
error: Missing metadata for tgpu.fn function body (either missing 'use gpu' directive, or misconfigured `unplugin-typegpu`)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/function/fnCore.js:115:27)
      at _getOrInstantiate (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:767:31)
      at [typegpu:0.12.8:$resolve] (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/resolve/tgpuResolve.js:63:25)
      at _getOrInstantiate (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:767:31)
      at provideCtx (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/execMode.js:38:16)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:827:36)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:883:15)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/resolve/tgpuResolve.js:23:16)
      at checkTgsl (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:877:14)
      at requestGPU (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:1251:5)
,
 trace: [
  [Object ...], [Function: impl]
],

      at appendToTrace (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/errors.js:50:16)
      at _getOrInstantiate (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:793:27)
      at provideCtx (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/execMode.js:38:16)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:827:36)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:883:15)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/resolve/tgpuResolve.js:23:16)
      at checkTgsl (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:877:14)
      at requestGPU (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:1251:5)
      at buildNow (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/app/index.ts:298:35)

110 |             if (pluginExternals) {
111 |                 this.setExternals('pluginProvided', pluginExternals);
112 |             }
113 |             const ast = pluginData?.ast;
114 |             if (!ast) {
115 |                 throw new Error("Missing metadata for tgpu.fn function body (either missing 'use gpu' directive, or misconfigured `unplugin-typegpu`)");
                                ^
error: Missing metadata for tgpu.fn function body (either missing 'use gpu' directive, or misconfigured `unplugin-typegpu`)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/function/fnCore.js:115:27)
      at _getOrInstantiate (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:767:31)
      at [typegpu:0.12.8:$resolve] (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/resolve/tgpuResolve.js:63:25)
      at _getOrInstantiate (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:767:31)
      at provideCtx (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/execMode.js:38:16)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:827:36)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/resolutionCtx.js:883:15)
      at resolve (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/typegpu/core/resolve/tgpuResolve.js:23:16)
      at checkTgsl (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:877:14)
      at requestGPU (/private/tmp/shallot-docs-next5.xQOuN6/gpu-next5/node_modules/@dylanebert/shallot/src/engine/runtime/gpu.ts:1251:5)

Bun v1.4.3 (macOS arm64)

```

### gpu-migration-typecheck

```text

```

### gpu-next5-install

```text
bun add v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [0]
Saved lockfile

installed @dylanebert/shallot@0.10.1-next.5 with binaries:
 - shallot
installed typescript@7.0.2 with binaries:
 - tsc
installed webgpu@0.6.2

49 packages installed [60.00ms]

Blocked 1 postinstall. Run `bun pm untrusted` for details.

```

### gpu-stack-run

```text
adapter {"subgroupMatrixConfigs":[]}
after block completed
step completed

```

### gpu-stack-typecheck

```text

```

### gpu-template-install

```text
bun install v1.4.3 (c6da4a4d3)
Resolving dependencies
Resolved, downloaded and extracted [0]
Saved lockfile

+ @types/bun@1.4.3
+ playwright@1.64.1
+ vite@8.3.4
+ webgpu@0.6.2
+ @dylanebert/shallot@0.10.0

56 packages installed [80.00ms]

Blocked 1 postinstall. Run `bun pm untrusted` for details.

```

### gpu-template-version

```text
0.10.0

```

### gpu-template

```text
Resolving dependencies
Resolved, downloaded and extracted [2]
created /private/tmp/shallot-docs-next5.xQOuN6/gpu/my-game/first-person from first-person
  cd first-person && bun install && bun run dev

```

### gpu-versions

```text
./node_modules/@dylanebert/shallot/package.json 0.10.0
./first-person/node_modules/@dylanebert/shallot/package.json ENOENT: no such file or directory, open './first-person/node_modules/@dylanebert/shallot/package.json'

```

### registry-dist

```text
{
  "shasum": "d945784c42ff4b292a720571a086442fc210ebf4",
  "tarball": "https://registry.npmjs.org/@dylanebert/shallot/-/shallot-0.10.1-next.5.tgz",
  "fileCount": 681,
  "integrity": "sha512-tAvTzE37qhm0IFJwO6/KKWQDbuz7ywDO7uQW79D2FCd20HOjjrWFuthXGGICZT/smZZxWJoeJ9AdEI/3Xponvg==",
  "signatures": [{
    "sig": "MEQCIB/2P9BKfwmvygyiyaYk7WVas5HcZITUUGSSqAO4qjK4AiB+5PTjh4+rHErxfkunZsaKC5AMObD9hvOmDUcPiX/S5w==",
    "keyid": "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U"
  }, {
    "keyid": "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
    "sig": "MEUCIBITEjR0hJlxudIRbcKLqkcRYfT5+AYlwp/KcoZ/9YPUAiEAzIj71Qk76j35+t/zHSICHAAcZTRB6FQL4dvnaIL4C/o="
  }],
  "unpackedSize": 8834879
}

```

## cpu migration wrapper

```ts
import { createApp } from '@dylanebert/shallot/app';
import { Camera, attachTexture, RenderingPlugin } from '@dylanebert/shallot/rendering';
const gpu = process.env.DOCS_GPU === '1';
const app = await createApp({ defaults: false, plugins: gpu ? [RenderingPlugin] : [] });
const world = app.world;
const eid = world.create();
try {
// 0.10.1: give it its own target
world.add(eid, Camera);
attachTexture(world, eid, { width: 320, height: 180 });
// or stack it over the first camera on purpose
world.add(eid, Camera, { order: 1 });
console.log('after block completed');
world.step(1/60);
console.log('step completed');
} finally { app.dispose(); }
```

## gpu migration wrapper

```ts
import { createApp } from '@dylanebert/shallot/app';
import { Camera, attachTexture, RenderingPlugin } from '@dylanebert/shallot/rendering';
const gpu = process.env.DOCS_GPU === '1';
if (gpu) {
 const { setupGlobals } = await import('@dylanebert/shallot/webgpu');
 await setupGlobals();
 const adapter = await navigator.gpu.requestAdapter();
 if (!adapter || adapter.info.device === 'null-backend') throw new Error('No real GPU adapter');
 console.log('adapter', JSON.stringify(adapter.info));
}
const app = await createApp({ defaults: false, plugins: gpu ? [RenderingPlugin] : [] });
const world = app.world;
const eid = world.create();
try {
// 0.10.1: give it its own target
world.add(eid, Camera);
attachTexture(world, eid, { width: 320, height: 180 });
// or stack it over the first camera on purpose
world.add(eid, Camera, { order: 1 });
console.log('after block completed');
world.step(1/60);
console.log('step completed');
} finally { app.dispose(); }
```

Order-only wrappers are identical except that the first `world.add` and `attachTexture` statements are omitted; the `world.add(... { order: 1 })` statement is retained.
