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
bands for moving outer edges. With no shared measurable spans, stability fails rather than passing.
The background may be bright or dark; it must be sufficiently uniform for the corner sample to
represent it. This rejects the Welcome-style turning striped fixture, including while allowing the
known-good's white bands to blend with a white background. It does not prove stability of edges
that cannot be distinguished from the background.

Common failure modes this catches: flat entity colour with no custom surface (fails band crossings);
a static pattern that never moves (fails the frame-delta check); a plain spinning cube mistaken for
"alive" (fails band crossings); static stripes on a turning cube (fails silhouette stability).
