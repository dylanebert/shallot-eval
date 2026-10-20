import { expect, test } from "bun:test";
import { silhouette, silhouetteDelta } from "./silhouette";

function frame(rows: number[][]) {
    return {
        width: rows[0].length,
        height: rows.length,
        rgba: new Uint8ClampedArray(rows.flatMap((row) => row.flatMap((v) => [v, v, v, 255]))),
    };
}
const bg = { r: 0, g: 0, b: 0 };

test("internal bands can move without changing the silhouette", () => {
    const a = silhouette(
        frame([
            [0, 100, 0, 200, 0],
            [0, 200, 0, 100, 0],
        ]),
        bg,
    );
    const b = silhouette(
        frame([
            [0, 200, 100, 100, 0],
            [0, 100, 200, 200, 0],
        ]),
        bg,
    );
    expect(silhouetteDelta(a, b)).toBe(0);
});

test("changing outline width or position changes the silhouette", () => {
    const a = silhouette(frame([[0, 100, 100, 100, 0]]), bg);
    const wider = silhouette(frame([[100, 100, 100, 100, 100]]), bg);
    const shifted = silhouette(frame([[0, 0, 100, 100, 100]]), bg);
    expect(silhouetteDelta(a, wider)).toBeCloseTo(0.4);
    expect(silhouetteDelta(a, shifted)).toBeCloseTo(0.5);
});

test("an absent silhouette is not stable evidence", () => {
    const empty = silhouette(frame([[0, 0, 0]]), bg);
    expect(silhouetteDelta(empty, empty)).toBe(Number.POSITIVE_INFINITY);
});
