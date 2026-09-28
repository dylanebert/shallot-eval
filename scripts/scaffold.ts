import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// The migrated create-shallot template is consumed as its landed packed artifact; this temporary
// pack is setup preflight, not a persisted consumer dependency.
export const scaffoldCommit = "aa2718e781475eaac00881cf4de8dd08ef459966";
const REPO = "https://github.com/dylanebert/create-shallot";

function run(command: string[], cwd: string): void {
    const process = Bun.spawnSync(command, { cwd, stdout: "pipe", stderr: "pipe" });
    if (process.exitCode !== 0) {
        throw new Error(
            `${command.join(" ")} failed:\n${process.stdout.toString()}${process.stderr.toString()}`,
        );
    }
}

export function scaffoldArtifact(dest: string): {
    path: string;
    sourceCommit: string;
    sha256: string;
} {
    const checkout = join(dest, "source");
    rmSync(checkout, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    run(["git", "clone", "--quiet", REPO, checkout], dest);
    run(["git", "checkout", "--quiet", scaffoldCommit], checkout);
    run(["bun", "install", "--frozen-lockfile"], checkout);
    run(["bun", "pm", "pack", "--destination", dest, "--quiet"], checkout);
    const file = readdirSync(dest).find(
        (entry) => entry.startsWith("create-shallot-") && entry.endsWith(".tgz"),
    );
    if (!file) throw new Error("no create-shallot artifact produced");
    const path = join(dest, file);
    const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
    return { path, sourceCommit: scaffoldCommit, sha256 };
}
