// Compare row envelopes, ignoring internal stripe brightness changes. The task uses a plain
// background; foreground pixels differ from its corner colour by more than 25 in some channel.
type Frame = { width: number; height: number; rgba: Uint8ClampedArray };
type Rgb = { r: number; g: number; b: number };

export function silhouette(frame: Frame, background: Rgb): [number, number][] {
    const rows: [number, number][] = [];
    for (let y = 0; y < frame.height; y++) {
        let left = frame.width;
        let right = -1;
        for (let x = 0; x < frame.width; x++) {
            const i = (y * frame.width + x) * 4;
            if (
                Math.max(
                    Math.abs(frame.rgba[i] - background.r),
                    Math.abs(frame.rgba[i + 1] - background.g),
                    Math.abs(frame.rgba[i + 2] - background.b),
                ) > 25
            ) {
                left = Math.min(left, x);
                right = x;
            }
        }
        rows.push([left, right]);
    }
    return rows;
}

export function silhouetteDelta(a: [number, number][], b: [number, number][]): number {
    let changed = 0;
    let union = 0;
    for (let y = 0; y < a.length; y++) {
        const [al, ar] = a[y];
        const [bl, br] = b[y];
        const areaA = Math.max(0, ar - al + 1);
        const areaB = Math.max(0, br - bl + 1);
        const overlap = Math.max(0, Math.min(ar, br) - Math.max(al, bl) + 1);
        changed += areaA + areaB - 2 * overlap;
        union += areaA + areaB - overlap;
    }
    return union === 0 ? Number.POSITIVE_INFINITY : changed / union;
}
