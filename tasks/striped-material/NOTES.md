# striped-material — expected artifacts (withheld)

Problem shape from `examples/recipes/custom-material`: authoring a procedural surface (a WGSL shading
chunk registered with `Surfaces`, selected per entity by `Part.surface`) — something a flat entity
`Color` cannot produce.

What a correct project does:
- registers a custom surface whose fragment chunk computes a banded pattern from `uv` (a `floor`/`step`
  stripe or checker), animated by a time uniform so the bands shift each frame
- a `Part` cube wearing that surface, a static camera framing it

Gate observation: the first captured frame supplies brightness profiles across the cube along both
axes. Profile ends matching the sampled corner background are trimmed by RGB contrast in either
direction, not by assuming the cube is brighter. The profiles must have peak-to-peak >30 and ≥2
light/dark band crossings. Three frames over ~1.1s at two different gaps must differ (maximum
pairwise mean-absolute difference >0.5); the unequal gaps reduce periodic aliasing.

Visible outline segments in those frames must also hold still (<2% maximum pairwise symmetric
difference/union). A foreground pixel differs from the corner background by >3 in any channel.
Both rows and columns are scanned; a span is usable only if ≥90% of its pixels are foreground, and
only spans usable in both frames are compared. This avoids mistaking moving background-coloured
bands for moving outer edges. A frame pair with no shared measurable spans is undetermined (`null`),
not stationary or moving evidence. A measured change ≥2% still determines outline failure. Otherwise,
any missing pair leaves outline stability undetermined. Passing bands and motion with that missing
observation grade `INCOMPLETE`. A separately determined task failure still grades `FAIL`; when all
observations are determined, the grade remains `PASS` or `FAIL`.

The background may be bright or dark; it must be sufficiently uniform for the corner sample to
represent it. The Welcome-style turning fixture has measurable outline motion and grades `FAIL`.
Vertical animated bands on white retain measurable spans and grade `PASS`. The qualified
`incomplete-diagonal-white-background.ts` fixture instead uses `(uv.x + uv.y) * 12` bands on white:
bands matching the background break continuous spans along both axes. Its pattern and motion pass,
but its outline is unmeasurable, so its expected verdict is `INCOMPLETE`. Final RGBA cannot tell an
invisible boundary moving from a background-coloured band crossing a still boundary; no replacement
outline heuristic is used to infer the missing observation.

Common failure modes this catches: flat entity colour with no custom surface (fails band crossings);
a static pattern that never moves (fails the frame-delta check); a plain spinning cube mistaken for
"alive" (fails band crossings); static stripes on a turning cube (fails silhouette stability).
