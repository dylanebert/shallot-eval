// Pure derivation of a graded task's result kind from its three determined inputs — typecheck ok,
// build ok, gate ok. No side effects or browser-driver imports: `grade.ts` is a top-level script
// (argv parsing, top-level await) that is not imported by tests, so this sibling module is
// what a test imports and calls directly instead of reading `grade.ts`'s source as an AST.
//
// INCOMPLETE means no failure was determined but a required observation is unavailable, whether
// the browser gate never ran or a completed probe could not measure a task property. A determined
// typecheck, build or task-assertion failure still outranks an unavailable observation.
export type ResultKind = "PASS" | "FAIL" | "INCOMPLETE";

/** A missing observation never counts as success; a determined task failure remains decisive. */
export function deriveGateOk(checks: readonly { ok: boolean | null }[]): boolean | null {
    if (checks.some((check) => check.ok === false)) return false;
    if (checks.some((check) => check.ok === null)) return null;
    return true;
}

export function deriveResultKind(
    typecheckOk: boolean,
    buildOk: boolean,
    gateOk: boolean | null,
): ResultKind {
    // A determined failure is decisive regardless of whether the gate ever ran.
    if (typecheckOk === false || buildOk === false) return "FAIL";
    // Typecheck and build both held; the gate is the only remaining input. Its null means the browser
    // gate could not determine a required observation — INCOMPLETE.
    if (gateOk === null) return "INCOMPLETE";
    return gateOk ? "PASS" : "FAIL";
}

export function resultKindToPass(kind: ResultKind): boolean | null {
    return kind === "PASS" ? true : kind === "FAIL" ? false : null;
}
