import { expect, test } from "bun:test";
import { deriveGateOk, deriveResultKind, resultKindToPass } from "./result";

test("staging failure with successful build derives INCOMPLETE", () => {
    // The invariant: a staging failure (gate never ran, gateOk=null) with ok typecheck and build
    // derives INCOMPLETE, not PASS and not a crash.
    const kind = deriveResultKind(true, true, null);
    expect(kind).toBe("INCOMPLETE");
    expect(resultKindToPass(kind)).toBe(null);
}, 250);

test("an unmeasurable outline with passing bands and motion derives INCOMPLETE", () => {
    const gateOk = deriveGateOk([{ ok: null }, { ok: true }, { ok: true }]);
    expect(gateOk).toBeNull();
    expect(deriveResultKind(true, true, gateOk)).toBe("INCOMPLETE");
});

test("determined observations remain PASS or FAIL, including beside an unknown", () => {
    expect(deriveGateOk([{ ok: true }, { ok: true }])).toBe(true);
    expect(deriveGateOk([{ ok: false }, { ok: true }])).toBe(false);
    expect(deriveGateOk([{ ok: null }, { ok: false }])).toBe(false);
    expect(deriveResultKind(true, true, deriveGateOk([{ ok: null }, { ok: false }]))).toBe("FAIL");
});

test("determined typecheck or build failure derives FAIL", () => {
    // A staging failure does not launder a determined typecheck/build failure into INCOMPLETE.
    expect(deriveResultKind(false, true, null)).toBe("FAIL");
    expect(deriveResultKind(true, false, null)).toBe("FAIL");
    expect(deriveResultKind(false, false, null)).toBe("FAIL");
}, 250);
