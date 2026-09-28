import { createHash } from "node:crypto";
import {
    cpSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
} from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";

/** The Eval repository root. */
export const root = resolve(import.meta.dir, "..");

/** The package Bun installed for Eval's Shallot dependency. */
export const enginePackage = resolve(root, "node_modules/@dylanebert/shallot");

export interface EngineIdentity {
    version: string;
    contentHash: string;
}

/** Identify the installed package tree, including same-version staged builds. */
export function installedEngineIdentity(packageRoot = enginePackage): EngineIdentity {
    const manifestPath = resolve(packageRoot, "package.json");
    if (!existsSync(manifestPath)) {
        throw new Error("@dylanebert/shallot is not installed; run `bun install`");
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        name?: unknown;
        version?: unknown;
    };
    if (manifest.name !== "@dylanebert/shallot" || typeof manifest.version !== "string") {
        throw new Error("the installed @dylanebert/shallot package has no valid identity");
    }

    const hash = new Bun.CryptoHasher("sha256");
    const files: string[] = [];
    const walk = (directory: string) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            if ([".git", "node_modules", "target"].includes(entry.name)) continue;
            const path = resolve(directory, entry.name);
            if (entry.isDirectory()) walk(path);
            else if (entry.isFile()) files.push(path);
        }
    };
    walk(packageRoot);
    for (const path of files.sort()) {
        const rel = relative(packageRoot, path).split(sep).join("/");
        hash.update(`\0${rel}\0`);
        hash.update(readFileSync(path));
    }
    return { version: manifest.version, contentHash: hash.digest("hex") };
}

function sha256(path: string): string {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Pack the installed public package for task setup's isolated artifact preflight. */
export function engineArtifact(dest: string): {
    path: string;
    identity: EngineIdentity;
    sha256: string;
} {
    const identity = installedEngineIdentity();
    mkdirSync(dest, { recursive: true });
    const staging = mkdtempSync(join(dest, ".shallot-pack-"));
    const packageCopy = join(staging, "package");
    const path = resolve(dest, `dylanebert-shallot-${identity.version}.tgz`);
    try {
        cpSync(enginePackage, packageCopy, {
            recursive: true,
            filter: (source) => ![".git", "node_modules", "target"].includes(basename(source)),
        });
        const pack = Bun.spawnSync(["tar", "-czf", path, "-C", staging, "package"], {
            stdout: "pipe",
            stderr: "pipe",
        });
        if (pack.exitCode !== 0) {
            throw new Error(
                `packing installed Shallot failed:\n${pack.stdout.toString()}${pack.stderr.toString()}`,
            );
        }
        return { path, identity, sha256: sha256(path) };
    } finally {
        rmSync(staging, { recursive: true, force: true });
    }
}
