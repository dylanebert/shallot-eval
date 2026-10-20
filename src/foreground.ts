type Frame = { width: number; height: number; rgba: ArrayLike<number> };
type Rgb = { r: number; g: number; b: number };

export function isWhite(color: Rgb): boolean {
    const channels = [color.r, color.g, color.b];
    return Math.min(...channels) > 150 && Math.max(...channels) - Math.min(...channels) <= 20;
}

export function isGreen(color: Rgb): boolean {
    return color.g > 110 && color.g > color.r + 40 && color.g > color.b + 40;
}

/** Mean foreground colour against the dominant border colour; no contrast is undetermined.
 * This task shows one cube on a plain background. No fixed location or minimum cube size is assumed.
 */
export function foregroundColor(frame: Frame): { color: Rgb; pixels: number } | null {
    const { width, height, rgba } = frame;
    const counts = new Map<number, number>();
    let dominant = 0;
    let largest = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1) continue;
            const i = (y * width + x) * 4;
            const rgb = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
            const count = (counts.get(rgb) ?? 0) + 1;
            counts.set(rgb, count);
            if (count > largest) {
                dominant = rgb;
                largest = count;
            }
        }
    }
    if (!largest) return null;
    const background = { r: dominant >>> 16, g: (dominant >>> 8) & 255, b: dominant & 255 };
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
