# falling-box — expected artifacts (withheld)

Problem shape from `examples/recipes/physics-playground`: a verifiable physics behavior.

What a correct project does:
- enables the physics plugin, a dynamic rigidbody box (blue) starting above a static floor collider
- gravity does the rest; the box falls and rests on the floor

Gate observation: after navigation and probe initialization, the probe waits for a 1280×720 canvas
and two animation frames, then samples the blue-pixel centroid for six seconds through public
capture. It does not reload or wait for the scene to settle before sampling. Descent means the last
visible centroid is >0.03 below the highest observed centroid; settled means the last two visible
samples agree within 0.01. The observation window must therefore catch the fall. It does not prove
floor contact, and disappearance after two stable visible samples is not ruled out. Adapter identity,
when available, is provenance only; software WebGPU remains eligible for the same assertions.

Common failure modes this catches: static box that never falls (fails "fell"); no visible blue box
(fails "on screen"); last two visible samples still moving by ≥0.01 (fails "settled").
