# color-on-key — expected artifacts (withheld)

Problem shape from `examples/recipes/respond-to-input` + `game-loop`: an edge-triggered input driving
a state change.

What a correct project does:
- a white cube; keyboard handling that turns its material green on Space and leaves it green

Gate observation: Playwright focuses the canvas; the probe captures white before the key and signals
readiness. Playwright then sends `keyboard.press("Space")` through Chromium's normal input path,
so listeners on the canvas, document or window can receive it. The probe captures again after key
completion and 500ms, requiring green (g dominant). Both captures measure only foreground pixels
that differ from the frame's border background by more than three RGB levels, rather than averaging
a fixed region with background. No foreground makes that observation undetermined (INCOMPLETE if
no determined check fails). This assumes one cube against a plain background represented by the
border; neither cube size nor central-region coverage is part of the prompt.
A scene green from the start fails "starts white". The original known-good fixtures use window and
document listeners; good-small keeps the window listener with a cube smaller than the former
sampling region. The known-bad listens to Enter; incomplete-no-cube has only the background.

Common failure modes this catches: nothing wired to the key (stays white); color toggles per-frame
instead of latching (may be caught by the flat 500ms settle); cube green from the start (fails "starts
white").
