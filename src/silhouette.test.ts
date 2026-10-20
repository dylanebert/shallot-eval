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
    expect(silhouetteDelta(a, wider)).toBeGreaterThan(0.02);
    expect(silhouetteDelta(a, shifted)).toBeGreaterThan(0.02);
});

test("an absent silhouette is undetermined, not stable or moving evidence", () => {
    const empty = silhouette(frame([[0, 0, 0]]), bg);
    expect(silhouetteDelta(empty, empty)).toBeNull();
});

test("diagonal background-coloured bands leave the outline undetermined", () => {
    const white = { r: 255, g: 255, b: 255 };
    const diagonal = (phase: number) =>
        frame(
            Array.from({ length: 12 }, (_, y) =>
                Array.from({ length: 12 }, (_, x) => ((x + y + phase) % 4 < 2 ? 40 : 255)),
            ),
        );
    expect(
        silhouetteDelta(silhouette(diagonal(0), white), silhouette(diagonal(1), white)),
    ).toBeNull();
});

test("white bands matching a white border do not invent outline motion", () => {
    const white = { r: 255, g: 255, b: 255 };
    const a = frame([
        [255, 255, 255, 255, 255, 255],
        [255, 40, 255, 40, 255, 255],
        [255, 40, 255, 40, 255, 255],
        [255, 40, 255, 40, 255, 255],
        [255, 255, 255, 255, 255, 255],
    ]);
    const b = frame([
        [255, 255, 255, 255, 255, 255],
        [255, 255, 40, 40, 40, 255],
        [255, 255, 40, 40, 40, 255],
        [255, 255, 40, 40, 40, 255],
        [255, 255, 255, 255, 255, 255],
    ]);
    expect(silhouetteDelta(silhouette(a, white), silhouette(b, white))).toBe(0);
    // The same visible column ending earlier really does move a measurable edge.
    b.rgba.set([255, 255, 255, 255], (3 * b.width + 3) * 4);
    expect(silhouetteDelta(silhouette(a, white), silhouette(b, white))).toBeGreaterThan(0.02);
});
