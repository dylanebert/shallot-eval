import { expect, test } from "bun:test";
import { fallEvidence } from "./falling";

const samples = Array.from({ length: 61 }, (_, i) => ({
    ms: i * 100,
    y: i < 10 ? 0.1 + i * 0.04 : 0.5,
}));

test("a visible descent followed by two seconds of rest qualifies", () => {
    expect(fallEvidence(samples)).toMatchObject({ visible: true, settled: true, descent: 0.4 });
});

test("disappearance is not discarded or mistaken for rest", () => {
    const missing = samples.map((sample, i) => ({ ...sample, y: i > 15 ? null : sample.y }));
    expect(fallEvidence(missing)).toMatchObject({ visible: false, settled: false });
});

test("small per-frame motion is not rest across the final interval", () => {
    const moving = samples.map((sample, i) => ({ ...sample, y: 0.1 + i * 0.002 }));
    expect(fallEvidence(moving).settled).toBe(false);
});

test("two adjacent tail samples do not establish a meaningful rest interval", () => {
    expect(
        fallEvidence([
            { ms: 5900, y: 0.5 },
            { ms: 6000, y: 0.5 },
        ]).settled,
    ).toBe(false);
});
