export type FallSample = { ms: number; y: number | null };

export function fallEvidence(samples: FallSample[]) {
    const visible = samples.length > 1 && samples.every((sample) => sample.y !== null);
    const ys = samples.flatMap((sample) => (sample.y === null ? [] : [sample.y]));
    const descent = ys.length ? ys[ys.length - 1] - Math.min(...ys) : 0;
    // The final two seconds, not two adjacent frames: require at least 1.5s of observed rest.
    const tail = samples.filter((sample) => sample.ms >= 4000);
    const tailYs = tail.flatMap((sample) => (sample.y === null ? [] : [sample.y]));
    const duration = tail.length > 1 ? tail[tail.length - 1].ms - tail[0].ms : 0;
    const spread = tailYs.length ? Math.max(...tailYs) - Math.min(...tailYs) : Infinity;
    return {
        visible,
        descent,
        settled: visible && duration >= 1500 && spread < 0.01,
        duration,
        spread,
    };
}
