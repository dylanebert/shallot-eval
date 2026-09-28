import { expect, test } from "bun:test";
import { deriveResultKind, resultKindToPass } from "./result";

test("staging failure with successful build derives INCOMPLETE", () => {
    // The invariant: a staging failure (gate never ran, gateOk=null) with ok typecheck and build
    // derives INCOMPLETE, not PASS and not a crash.
    const kind = deriveResultKind(true, true, null);
    expect(kind).toBe("INCOMPLETE");
    expect(resultKindToPass(kind)).toBe(null);
}, 250);

test("determined typecheck or build failure derives FAIL", () => {
    // A staging failure does not launder a determined typecheck/build failure into INCOMPLETE.
    expect(deriveResultKind(false, true, null)).toBe("FAIL");
    expect(deriveResultKind(true, false, null)).toBe("FAIL");
    expect(deriveResultKind(false, false, null)).toBe("FAIL");
}, 250);
