import { expect, test } from "bun:test";
import { readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { CAPTURE_CONTRACT, captureFrame } from "@dylanebert/shallot/rendering";

const ROOT = resolve(import.meta.dir, "..");

test("Eval installs the candidate package and public frame seam", () => {
    const manifest = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
        devDependencies: Record<string, string>;
    };
    const lock = readFileSync(resolve(ROOT, "bun.lock"), "utf8");
    const declared = manifest.devDependencies["@dylanebert/shallot"];
    expect(declared).toBe("^0.10.0-next.1");
    expect(lock).toContain('"@dylanebert/shallot": "^0.10.0-next.1"');
    const nodeModules = realpathSync(resolve(ROOT, "node_modules"));
    const installed = realpathSync(resolve(ROOT, "node_modules/@dylanebert/shallot"));
    expect(installed.startsWith(`${nodeModules}/`)).toBe(true);
    const installedManifest = JSON.parse(
        readFileSync(resolve(installed, "package.json"), "utf8"),
    ) as { name?: string; version?: string };
    expect(installedManifest.name).toBe("@dylanebert/shallot");
    expect(installedManifest.version).toMatch(/^0\.10\.0-next\.\d+$/);
    expect(typeof captureFrame).toBe("function");
    expect(CAPTURE_CONTRACT).toEqual({
        width: 1280,
        height: 720,
        deviceScale: 1,
        surface: "final-canvas",
        encoding: "rgba8-tight",
    });
}, 250);
