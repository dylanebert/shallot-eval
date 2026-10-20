import { expect, test } from "bun:test";
import { foregroundColor } from "./foreground";

function frame(background: number[], color?: number[], size = 2) {
    const width = 100;
    const height = 100;
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
            const foreground = color && x >= 40 && x < 40 + size && y >= 40 && y < 40 + size;
            rgba.set([...(foreground ? color : background), 255], (y * width + x) * 4);
        }
    return { width, height, rgba };
}

test("cube colour excludes background even when smaller than the old central region", () => {
    expect(foregroundColor(frame([16, 16, 16], [196, 196, 196]))).toEqual({
        color: { r: 196, g: 196, b: 196 },
        pixels: 4,
    });
    expect(foregroundColor(frame([16, 16, 16], [61, 192, 45]))).toEqual({
        color: { r: 61, g: 192, b: 45 },
        pixels: 4,
    });
});

test("foreground is measured by contrast in either direction, not target hue", () => {
    expect(foregroundColor(frame([255, 255, 255], [30, 20, 10]))?.color).toEqual({
        r: 30,
        g: 20,
        b: 10,
    });
});

test("absent or background-indistinguishable cube is undetermined, not a colour", () => {
    expect(foregroundColor(frame([16, 16, 16]))).toBeNull();
    expect(foregroundColor(frame([16, 16, 16], [19, 16, 16]))).toBeNull();
});
