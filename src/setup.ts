// Create an isolated task app using the installed engine's public CLI. Only PROMPT.md is copied.
import { mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { engineArtifact, enginePackage, root } from "../scripts/engine";

function run(cmd: string[], cwd: string): void {
    const p = Bun.spawnSync(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
    if (p.exitCode !== 0) throw new Error(`${cmd.join(" ")} failed:\n${p.stdout}\n${p.stderr}`);
}

export function skillBody(skill: string): string {
    return skill.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n\r?\n/, "");
}

function main(): void {
    const args = process.argv.slice(2);
    const task = args.find((a) => !a.startsWith("--"));
    if (!task || args.some((a) => a.startsWith("--") && a !== "--json"))
        throw new Error("Usage: bun src/setup.ts <task> [--json]");
    const prompt = readFileSync(resolve(root, "tasks", task, "PROMPT.md"));
    const work = realpathSync(mkdtempSync(join(tmpdir(), `shallot-eval-${task}-`)));
    const project = join(work, "app");
    const artifact = engineArtifact(join(work, "engine-pack"));
    run(["bun", join(enginePackage, "bin/shallot.ts"), "create", "app"], work);
    const pkg = JSON.parse(readFileSync(join(project, "package.json"), "utf8"));
    pkg.dependencies["@dylanebert/shallot"] = `file:${artifact.path}`;
    writeFileSync(join(project, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
    run(["bun", "install"], project);
    const body = skillBody(readFileSync(join(enginePackage, "src/cli/skill.md"), "utf8"));
    if (readFileSync(join(project, "AGENTS.md"), "utf8") !== body)
        throw new Error("generated AGENTS.md differs from the installed skill body");
    writeFileSync(join(project, "PROMPT.md"), prompt);
    const record = {
        task,
        engine: artifact.identity,
        registryIntegrity: artifact.registryIntegrity,
        artifact: {
            kind: "local-pack-preflight",
            identity: artifact.identity,
            sha256: artifact.sha256,
        },
        scaffold: { kind: "installed-engine-create", version: artifact.identity.version },
        created: new Date().toISOString(),
    };
    writeFileSync(join(project, ".eval.json"), `${JSON.stringify(record, null, 2)}\n`);
    if (args.includes("--json")) console.log(JSON.stringify({ ...record, project, work }));
    else console.log(project);
}

if (import.meta.path === Bun.main) main();
