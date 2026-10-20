type Frame = { width: number; height: number; rgba: ArrayLike<number> };
type Rgb = { r: number; g: number; b: number };

/** Mean foreground colour against the frame's border background; no contrast is undetermined.
 * This task shows one cube on a plain background. No fixed location or minimum cube size is assumed.
 */
export function foregroundColor(frame: Frame): { color: Rgb; pixels: number } | null {
    const { width, height, rgba } = frame;
    const background = { r: 0, g: 0, b: 0 };
    let borderPixels = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1) continue;
            const i = (y * width + x) * 4;
            background.r += rgba[i];
            background.g += rgba[i + 1];
            background.b += rgba[i + 2];
            borderPixels++;
        }
    }
    if (!borderPixels) return null;
    background.r /= borderPixels;
    background.g /= borderPixels;
    background.b /= borderPixels;
    const color = { r: 0, g: 0, b: 0 };
    let pixels = 0;
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            if (
                Math.max(
                    Math.abs(rgba[i] - background.r),
                    Math.abs(rgba[i + 1] - background.g),
                    Math.abs(rgba[i + 2] - background.b),
                ) <= 3
            )
                continue;
            color.r += rgba[i];
            color.g += rgba[i + 1];
            color.b += rgba[i + 2];
            pixels++;
        }
    }
    if (!pixels) return null;
    color.r /= pixels;
    color.g /= pixels;
    color.b /= pixels;
    return { color, pixels };
}
