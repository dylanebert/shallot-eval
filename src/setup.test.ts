import { expect, test } from "bun:test";
import { skillBody } from "./setup";

test("project guidance is the published skill without frontmatter", () => {
    expect(skillBody("---\nname: shallot\n---\n\n# Shallot\n")).toBe("# Shallot\n");
    expect(skillBody("# Shallot\n")).toBe("# Shallot\n");
});

test("removed setup options are rejected", () => {
    const result = Bun.spawnSync(["bun", "src/setup.ts", "falling-box", "--bare"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain("Usage:");
});
