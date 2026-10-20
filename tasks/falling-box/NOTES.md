# falling-box — expected artifacts (withheld)

Problem shape from `examples/recipes/physics-playground`: a verifiable physics behavior.

What a correct project does:
- enables the physics plugin, a dynamic rigidbody box (blue) starting above a static floor collider
- gravity does the rest; the box falls and rests on the floor

Gate observation: after navigation and probe initialization, the probe waits for a 1280×720 canvas
and two animation frames, then samples the blue-pixel centroid for six seconds through public
capture. It does not reload or wait for the scene to settle before sampling. Every capture must
contain blue pixels; missing samples are retained and fail visibility. Descent means the last visible
centroid is >0.03 below the highest observed centroid. Rest requires ≥1.5 seconds of visible samples
in the final two seconds, with a centroid range <0.01 over that interval. The observation window must
therefore catch the fall and its rest. This measures visible rest, not floor contact or physics
internals. Adapter identity, when available, is provenance only.

Known-bad fixtures cover a static box (no descent) and a visible floor without a collider (the box
falls through, disappears, and cannot establish visible rest).
