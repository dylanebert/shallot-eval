// Visible outline segments from both scan directions. A stripe can match the background exactly:
// lines broken by such bands do not locate the object's outer edges. Use continuous foreground
// spans instead, and compare only edges visible in both frames. Internal stripe motion then cannot
// masquerade as an outline change merely because a formerly invisible band becomes visible.
type Frame = { width: number; height: number; rgba: Uint8ClampedArray };
type Rgb = { r: number; g: number; b: number };
type Span = [number, number] | null;

export function silhouette(frame: Frame, background: Rgb): Span[] {
    const foreground = new Uint8Array(frame.width * frame.height);
    for (let i = 0; i < foreground.length; i++) {
        foreground[i] =
            Math.max(
                Math.abs(frame.rgba[i * 4] - background.r),
                Math.abs(frame.rgba[i * 4 + 1] - background.g),
                Math.abs(frame.rgba[i * 4 + 2] - background.b),
            ) > 3
                ? 1
                : 0;
    }
    const spans: Span[] = [];
    for (const axis of ["row", "column"]) {
        const lines = axis === "row" ? frame.height : frame.width;
        const length = axis === "row" ? frame.width : frame.height;
        for (let line = 0; line < lines; line++) {
            let left = length;
            let right = -1;
            let count = 0;
            for (let p = 0; p < length; p++) {
                const index = axis === "row" ? line * frame.width + p : p * frame.width + line;
                if (foreground[index]) {
                    left = Math.min(left, p);
                    right = p;
                    count++;
                }
            }
            // Permit a few antialiased pixels, but not background-coloured bands splitting a span.
            spans.push(count > 0 && count / (right - left + 1) >= 0.9 ? [left, right] : null);
        }
    }
    return spans;
}

export function silhouetteDelta(a: Span[], b: Span[]): number {
    let changed = 0;
    let union = 0;
    for (let i = 0; i < a.length; i++) {
        const spanA = a[i];
        const spanB = b[i];
        if (!spanA || !spanB) continue;
        const [al, ar] = spanA;
        const [bl, br] = spanB;
        const areaA = ar - al + 1;
        const areaB = br - bl + 1;
        const overlap = Math.max(0, Math.min(ar, br) - Math.max(al, bl) + 1);
        changed += areaA + areaB - 2 * overlap;
        union += areaA + areaB - overlap;
    }
    return union === 0 ? Number.POSITIVE_INFINITY : changed / union;
}
