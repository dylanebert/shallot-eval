# color-on-key — expected artifacts (withheld)

Problem shape from `examples/recipes/respond-to-input` + `game-loop`: an edge-triggered input driving
a state change.

What a correct project does:
- a white cube; keyboard handling that turns its material green on Space and leaves it green

Gate observation: Playwright focuses the canvas; the probe captures white before the key and signals
readiness. Playwright then sends `keyboard.press("Space")` through Chromium's normal input path,
so listeners on the canvas, document or window can receive it. The probe captures again after key
completion, sampling green from 500ms through 3000ms at 250ms target intervals. Every sampled
colour must be green (g>110 and >r+40 and >b+40). This bounds the persistence witness; it does not
prove indefinite persistence or observe changes between samples. Actual capture times are recorded.
Starting white requires each channel >150 and max-minus-min <=20, allowing modest lighting tint
without accepting pink. All captures measure only foreground pixels differing from the border's
most frequent RGB colour by more than three levels, not a fixed region mixed with background.
No foreground makes that observation undetermined (INCOMPLETE if no determined check fails).
This assumes one cube against a plain background whose colour is dominant at the border; partial
border contact is allowed. Neither cube size nor central-region coverage is part of the prompt.
A scene green from the start fails "starts white". The original known-good fixtures use window and
document listeners; good-small keeps the window listener with a cube smaller than the former
sampling region. Known-bad fixtures listen to Enter, start pink, or return to white 1.2 seconds after Space.
The edge-near known-good touches the border. Incomplete fixtures have no cube or a starting white
cube indistinguishable from its white background.

Common failure modes this catches: nothing wired to the key (stays white); color toggles per-frame
instead of latching (may be caught by the flat 500ms settle); cube green from the start (fails "starts
white").
