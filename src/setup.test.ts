// Eval arm — setup.ts stripTarball
//
// Invariant: the --bare arm strips AGENTS.md from the tarball (not just examples/). stripTarball
// removes it with an rmSync. These tests exercise the real exported function against a fixture
// tarball, and verify it preserves code files.

import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stripTarball } from "./setup";

function fixture(): { root: string; tarball: string } {
    const root = mkdtempSync(join(tmpdir(), "shallot-setup-arm-"));
    const pkg = join(root, "package");
    mkdirSync(join(pkg, "examples"), { recursive: true });
    writeFileSync(join(pkg, "AGENTS.md"), "# Agents\n");
    writeFileSync(join(pkg, "examples", "recipe.ts"), "// recipe\n");
    writeFileSync(join(pkg, "index.ts"), "export const x = 1;\n");
    const tarball = join(root, "engine.tgz");
    const tar = Bun.spawnSync(["tar", "-czf", tarball, "-C", root, "package"], { cwd: root });
    if (tar.exitCode !== 0) throw new Error(`fixture tar failed: ${tar.stderr}`);
    return { root, tarball };
}

function untar(tarball: string, destination: string): void {
    mkdirSync(destination, { recursive: true });
    const tar = Bun.spawnSync(["tar", "-xzf", tarball, "-C", destination], { cwd: destination });
    if (tar.exitCode !== 0) throw new Error(`fixture untar failed: ${tar.stderr}`);
}

test("bare setup removes AGENTS.md from the installed tarball", () => {
    const { root, tarball } = fixture();
    const destination = join(root, "unpacked");
    try {
        stripTarball(tarball);
        untar(tarball, destination);
        expect(existsSync(join(destination, "package/AGENTS.md"))).toBe(false);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}, 250);

test("bare setup removes examples from the installed tarball", () => {
    const { root, tarball } = fixture();
    const destination = join(root, "unpacked");
    try {
        stripTarball(tarball);
        untar(tarball, destination);
        expect(existsSync(join(destination, "package/examples"))).toBe(false);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}, 250);

test("bare setup preserves code files in the installed tarball", () => {
    const { root, tarball } = fixture();
    const destination = join(root, "unpacked");
    try {
        stripTarball(tarball);
        untar(tarball, destination);
        expect(existsSync(join(destination, "package/index.ts"))).toBe(true);
        expect(readFileSync(join(destination, "package/index.ts"), "utf8").trim()).toBe(
            "export const x = 1;",
        );
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}, 250);
