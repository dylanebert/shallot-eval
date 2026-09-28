// Grade one task by running its own Vite preview under Playwright Test. The withheld probe is
// bundled for one run and loaded into the preview page; capture comes only from /rendering.

import {
    existsSync,
    mkdtempSync,
    readFileSync,
    realpathSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { deriveResultKind } from "./result";

const ROOT = resolve(import.meta.dir, "..");
const TASKS = new Set([
    "red-box",
    "falling-box",
    "orbit-on-drag",
    "color-on-key",
    "persist-color",
    "striped-material",
]);

type CommandResult = { command: string[]; ok: boolean; output: string };
type Assertion = { name: string; ok: boolean; detail: string };
type BrowserGrade = {
    ok: boolean;
    runtime?: string;
    hardware?: unknown;
    reproduction?: { capture?: string };
    checks?: Assertion[];
};
type ProbeResult = {
    ok: boolean;
    checks: Assertion[];
    capture: string;
    runtime?: string;
    hardware?: string;
};

async function processOutput(stream: ReadableStream<Uint8Array> | null): Promise<string> {
    return stream === null ? "" : await new Response(stream).text();
}

function unusedPort(): number {
    const server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        fetch: () => new Response(),
    });
    const { port } = server;
    server.stop(true);
    if (port === undefined) throw new Error("grade preview could not reserve a port");
    return port;
}

type EvalRecord = {
    task?: string;
    artifact?: { kind?: string; sourceCommit?: string; sha256?: string };
};

function run(command: string[], cwd: string): CommandResult {
    const process = Bun.spawnSync(command, { cwd, stdout: "pipe", stderr: "pipe" });
    return {
        command,
        ok: process.exitCode === 0,
        output: `${process.stdout.toString()}\n${process.stderr.toString()}`.trim(),
    };
}

async function runBrowser(command: string[], cwd: string): Promise<CommandResult> {
    const process = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr, exitCode] = await Promise.all([
        processOutput(process.stdout),
        processOutput(process.stderr),
        process.exited,
    ]);
    return { command, ok: exitCode === 0, output: `${stdout}\n${stderr}`.trim() };
}

function fail(message: string, output = ""): never {
    console.error(`${message}${output ? `\n${output.slice(-4_000)}` : ""}`);
    process.exit(1);
}

function expectedSource(): string {
    const engine = JSON.parse(readFileSync(join(ROOT, "engine.json"), "utf8")) as {
        source?: unknown;
    };
    if (typeof engine.source !== "string") throw new Error("engine.json has no source identity");
    const commit = engine.source.split("#").at(-1);
    if (!commit) throw new Error("engine.json source has no commit identity");
    return commit;
}

/**
 * Check the setup artifact boundary using filesystem and package metadata, not a source scan.
 * A grade may consume only a generated project with an installed packed Shallot package and the
 * matching immutable artifact record. Missing premises are unavailable instrumentation.
 */
export function validateEvalProject(project: string, task: string): void {
    const recordPath = join(project, ".eval.json");
    const packagePath = join(project, "package.json");
    const installedPath = join(project, "node_modules/@dylanebert/shallot");
    if (!existsSync(recordPath)) throw new Error("setup record .eval.json is missing");
    if (!existsSync(packagePath)) throw new Error("project package.json is missing");

    let record: EvalRecord;
    try {
        record = JSON.parse(readFileSync(recordPath, "utf8")) as EvalRecord;
    } catch (error) {
        throw new Error(`setup record is not valid JSON: ${String(error)}`);
    }
    if (record.task !== task) throw new Error(`setup record task is not ${task}`);
    if (record.artifact?.kind !== "local-pack-preflight")
        throw new Error("setup record has no local package artifact identity");
    if (record.artifact.sourceCommit !== expectedSource())
        throw new Error("setup record source identity does not match engine.json");
    if (!/^[0-9a-f]{64}$/.test(record.artifact.sha256 ?? ""))
        throw new Error("setup record has no SHA-256 package integrity");

    const projectRoot = realpathSync(project);
    const nodeModules = realpathSync(join(projectRoot, "node_modules"));
    const installed = realpathSync(installedPath);
    if (!installed.startsWith(`${nodeModules}/`))
        throw new Error("installed Shallot package resolves outside the generated project");
    const installedManifest = JSON.parse(readFileSync(join(installed, "package.json"), "utf8")) as {
        name?: unknown;
    };
    if (installedManifest.name !== "@dylanebert/shallot")
        throw new Error("installed package is not the public Shallot package");

    const projectManifest = JSON.parse(readFileSync(packagePath, "utf8")) as {
        dependencies?: Record<string, unknown>;
    };
    const dependency = projectManifest.dependencies?.["@dylanebert/shallot"];
    if (typeof dependency !== "string" || !dependency.startsWith("file:"))
        throw new Error("project is not using the recorded packed package artifact");
}

function playwrightConfig(project: string, gradeDir: string, port: number): string {
    const url = `http://127.0.0.1:${port}`;
    return `import type { PlaywrightTestConfig } from "playwright/test";

export default {
    testDir: ${JSON.stringify(gradeDir)},
    outputDir: ${JSON.stringify(join(gradeDir, "test-results"))},
    testMatch: "grade.e2e.ts",
    timeout: 20_000,
    globalTimeout: 12_000,
    fullyParallel: false,
    workers: 1,
    reporter: "list",
    use: {
        browserName: "chromium",
        channel: "chromium",
        launchOptions: {
            args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-features=WebGPU"],
        },
        baseURL: ${JSON.stringify(url)},
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
    },
    webServer: {
        command: "bun x vite preview --host 127.0.0.1 --port ${port} --strictPort",
        cwd: ${JSON.stringify(project)},
        url: ${JSON.stringify(url)},
        reuseExistingServer: false,
        timeout: 30_000,
    },
} satisfies PlaywrightTestConfig;
`;
}

function playwrightSpec(task: string, bundlePath: string, resultPath: string): string {
    return `import { writeFileSync } from "node:fs";
import { expect, test } from "playwright/test";

test("withheld task claims", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const seat = await page.evaluate(async () => {
        const gpu = (navigator as Navigator & {
            gpu?: {
                requestAdapter: () => Promise<{
                    info?: {
                        vendor?: string;
                        architecture?: string;
                        device?: string;
                        description?: string;
                        isFallbackAdapter: boolean;
                    };
                } | null>;
            };
        }).gpu;
        if (!gpu) throw new Error("grade refused: Chromium has no WebGPU premise");
        const adapter = await gpu.requestAdapter();
        if (!adapter) throw new Error("grade refused: Chromium could not obtain a WebGPU adapter");
        const info = adapter.info;
        if (!info || typeof info.isFallbackAdapter !== "boolean")
            throw new Error("grade refused: Chromium cannot establish the WebGPU adapter premise");
        if (info.isFallbackAdapter)
            throw new Error("grade refused: the software WebGPU adapter cannot establish task behavior");
        const hardware = info
            ? [info.vendor, info.architecture, info.device, info.description].filter(Boolean).join(" ")
            : undefined;
        return { runtime: navigator.userAgent, hardware };
    });
    await page.addScriptTag({ path: ${JSON.stringify(bundlePath)} });
    await page.evaluate((task) => {
        (window as Window & { __shallotEvalTask?: string }).__shallotEvalTask = task;
    }, ${JSON.stringify(task)});
    await page.waitForFunction(
        () =>
            (window as Window & { __shallotEvalGradeReady?: boolean }).__shallotEvalGradeReady ===
            true,
        null,
        { timeout: 10_000 },
    );
    const result = await page.evaluate(async () => {
        const grade = (window as Window & {
            __shallotEvalGrade?: {
                run: () => Promise<{ ok: boolean; checks: { name: string; ok: boolean; detail: string }[]; capture: string }>;
            };
        }).__shallotEvalGrade;
        if (!grade) throw new Error("grade refused: withheld probe did not initialize");
        return grade.run();
    });
    const record = { ...result, ...seat };
    writeFileSync(${JSON.stringify(resultPath)}, JSON.stringify(record));
    expect(result.ok, JSON.stringify(result.checks)).toBe(true);
});
`;
}

function printResult(result: Record<string, unknown>, kind: string, json: boolean): void {
    if (json) console.log(JSON.stringify(result));
    else {
        const hardware = result.hardware ? ` on ${String(result.hardware)}` : "";
        const capture =
            typeof result.reproduction === "object" && result.reproduction !== null
                ? ` (${String((result.reproduction as { capture?: unknown }).capture ?? "no capture")})`
                : "";
        console.log(`${kind}${hardware}${capture}`);
    }
}

const args = process.argv.slice(2);
const json = args.includes("--json");
const positional = args.filter(
    (arg, index) => !arg.startsWith("--") && args[index - 1] !== "--port",
);
const [task, projectArg] = positional;
const portIndex = args.indexOf("--port");
if (!task || !projectArg || !TASKS.has(task) || (portIndex !== -1 && !args[portIndex + 1]))
    fail("Usage: bun run grade <task> <projectDir> [--json] [--port <n>]");

const project = resolve(projectArg);
if (!existsSync(join(project, "package.json"))) fail(`no project at ${project}`);

let validationError: string | undefined;
try {
    validateEvalProject(project, task);
} catch (error) {
    validationError = error instanceof Error ? error.message : String(error);
}
if (validationError) {
    printResult(
        {
            task,
            project,
            result: "INCOMPLETE",
            error: validationError,
            diagnostics: "the generated project or installed public package is unavailable",
        },
        "INCOMPLETE",
        json,
    );
    process.exitCode = 2;
} else {
    const commandResults = [
        run(["bun", "run", "check"], project),
        run(["bun", "run", "build"], project),
    ];
    const typecheckOk = commandResults[0].ok;
    const buildOk = commandResults[1].ok;
    let gateOk: boolean | null = null;
    let browser: BrowserGrade | undefined;
    let instrumentationError: string | undefined;
    let failureDiagnostics: unknown;
    const probePath = join(project, ".shallot-eval-grade-probe.ts");
    let gradeDir: string | undefined;

    if (typecheckOk && buildOk) {
        gradeDir = mkdtempSync(join(ROOT, ".shallot-eval-grade-"));
        const bundlePath = join(gradeDir, "probe.js");
        const specPath = join(gradeDir, "grade.e2e.ts");
        const configPath = join(gradeDir, "playwright.config.ts");
        const resultPath = join(gradeDir, "result.json");
        writeFileSync(probePath, readFileSync(join(ROOT, "src/grade-probe.ts")));
        try {
            const built = await Bun.build({
                entrypoints: [probePath],
                outdir: gradeDir,
                naming: "probe.js",
                target: "browser",
            });
            if (!built.success) throw new Error(built.logs.map(String).join("\n"));

            const port = Number(args[portIndex + 1]) || unusedPort();
            writeFileSync(configPath, playwrightConfig(project, gradeDir, port));
            writeFileSync(specPath, playwrightSpec(task, bundlePath, resultPath));
            const browserRun = await runBrowser(
                ["bun", "x", "playwright", "test", "--config", configPath],
                ROOT,
            );
            if (!existsSync(resultPath)) {
                instrumentationError = `Playwright did not produce a determined task result${browserRun.output ? `:\n${browserRun.output.slice(-4_000)}` : ""}`;
            } else {
                const verdict = JSON.parse(readFileSync(resultPath, "utf8")) as ProbeResult;
                const checks = verdict.checks ?? [];
                const failedChecks = checks.filter((check) => !check.ok);
                browser = {
                    ok: verdict.ok,
                    runtime: verdict.runtime,
                    hardware: verdict.hardware,
                    reproduction: { capture: verdict.capture },
                    checks: verdict.ok ? checks : failedChecks,
                };
                gateOk = verdict.ok;
                // The semantic result is the probe's completed assertions. A Playwright process
                // failure without that result remains instrumentation failure, never a pass.
                if (!verdict.ok) failureDiagnostics = { checks: failedChecks };
            }
        } catch (error) {
            instrumentationError = error instanceof Error ? error.message : String(error);
        } finally {
            rmSync(probePath, { force: true });
            if (gradeDir) rmSync(gradeDir, { recursive: true, force: true });
        }
    }

    const kind = deriveResultKind(typecheckOk, buildOk, gateOk);
    const result: Record<string, unknown> = {
        task,
        project,
        result: kind,
        commands: commandResults,
        runtime: browser?.runtime,
        hardware: browser?.hardware,
        reproduction: browser?.reproduction,
        checks: browser?.checks ?? [],
        ...(instrumentationError ? { diagnostics: instrumentationError } : {}),
        ...(failureDiagnostics ? { failureDiagnostics } : {}),
    };
    printResult(result, kind, json);
    if (kind === "INCOMPLETE") process.exitCode = 2;
}
