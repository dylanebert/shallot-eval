# color-on-key — expected artifacts (withheld)

Problem shape from `examples/recipes/respond-to-input` + `game-loop`: an edge-triggered input driving
a state change.

What a correct project does:
- a white cube; keyboard handling that turns its material green on Space and leaves it green

Gate observation: Playwright focuses the canvas; the probe captures white before the key and signals
readiness. Playwright then sends `keyboard.press("Space")` through Chromium's normal input path,
so listeners on the canvas, document or window can receive it. The probe captures again after key
completion and 500ms, requiring green (g dominant). A scene green from the start fails "starts white".
The two known-good fixtures use window and document listeners; the known-bad listens to Enter.

Common failure modes this catches: nothing wired to the key (stays white); color toggles per-frame
instead of latching (may be caught by the flat 500ms settle); cube green from the start (fails "starts
white").
