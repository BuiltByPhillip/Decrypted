import { describe, it, expect } from "vitest";
import {
  exprEquals,
  exprToString,
  normalizeExpr,
  paletteItemToExpr,
  paletteItemToString,
  substituteRoles,
  substituteRolesInString,
  exprDiff,
  exprListContains,
  findDiffPair,
  COMMUTATIVE_OPS,
} from "../app/hooks/expr";
import { parseExpression } from "../app/hooks/parser";
import type { Expr, PaletteItem } from "../app/hooks/parser";

// ─── exprEquals ──────────────────────────────────────────────────────────────

describe("exprEquals", () => {
  it("two identical vars are equal", () => {
    expect(exprEquals({ kind: "var", name: "x" }, { kind: "var", name: "x" })).toBe(true);
  });

  it("vars with different names are not equal", () => {
    expect(exprEquals({ kind: "var", name: "x" }, { kind: "var", name: "y" })).toBe(false);
  });

  it("var and int are not equal", () => {
    expect(exprEquals({ kind: "var", name: "x" }, { kind: "int", value: 1 })).toBe(false);
  });

  it("identical ints are equal", () => {
    expect(exprEquals({ kind: "int", value: 42 }, { kind: "int", value: 42 })).toBe(true);
  });

  it("different ints are not equal", () => {
    expect(exprEquals({ kind: "int", value: 1 }, { kind: "int", value: 2 })).toBe(false);
  });

  it("identical role refs are equal", () => {
    expect(exprEquals({ kind: "role", name: "generator" }, { kind: "role", name: "generator" })).toBe(true);
  });

  it("different role refs are not equal", () => {
    expect(exprEquals({ kind: "role", name: "alice" }, { kind: "role", name: "bob" })).toBe(false);
  });

  it("identical placeholders are equal", () => {
    expect(exprEquals({ kind: "placeholder", index: 1 }, { kind: "placeholder", index: 1 })).toBe(true);
  });

  it("different placeholders are not equal", () => {
    expect(exprEquals({ kind: "placeholder", index: 1 }, { kind: "placeholder", index: 2 })).toBe(false);
  });

  it("two slots are equal", () => {
    expect(exprEquals({ kind: "slot" }, { kind: "slot" })).toBe(true);
  });

  it("identical constants are equal", () => {
    expect(exprEquals({ kind: "constant", symbol: "naturals" }, { kind: "constant", symbol: "naturals" })).toBe(true);
  });

  it("different constants are not equal", () => {
    expect(exprEquals({ kind: "constant", symbol: "reals" }, { kind: "constant", symbol: "naturals" })).toBe(false);
  });

  it("identical unary expressions are equal", () => {
    const a: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    const b: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    expect(exprEquals(a, b)).toBe(true);
  });

  it("unary expressions with different ops are not equal", () => {
    const a: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    const b: Expr = { kind: "unary", op: "exists", operand: { kind: "var", name: "x" } };
    expect(exprEquals(a, b)).toBe(false);
  });

  it("unary expressions with different operands are not equal", () => {
    const a: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    const b: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "y" } };
    expect(exprEquals(a, b)).toBe(false);
  });

  it("identical binary expressions are equal", () => {
    const a: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const b: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprEquals(a, b)).toBe(true);
  });

  it("binary expressions with different ops are not equal", () => {
    const a: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const b: Expr = { kind: "binary", op: "sub", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprEquals(a, b)).toBe(false);
  });

  // Commutativity
  it("add is commutative: a + b === b + a", () => {
    const ab: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(true);
  });

  it("mul is commutative: a * b === b * a", () => {
    const ab: Expr = { kind: "binary", op: "mul", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "mul", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(true);
  });

  it("equal is commutative: a = b === b = a", () => {
    const ab: Expr = { kind: "binary", op: "equal", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "equal", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(true);
  });

  it("sub is NOT commutative: a - b !== b - a", () => {
    const ab: Expr = { kind: "binary", op: "sub", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "sub", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(false);
  });

  it("div is NOT commutative: a / b !== b / a", () => {
    const ab: Expr = { kind: "binary", op: "div", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "div", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(false);
  });

  it("pow is NOT commutative: g ^ a !== a ^ g", () => {
    const ga: Expr = { kind: "binary", op: "pow", left: { kind: "var", name: "g" }, right: { kind: "var", name: "a" } };
    const ag: Expr = { kind: "binary", op: "pow", left: { kind: "var", name: "a" }, right: { kind: "var", name: "g" } };
    expect(exprEquals(ga, ag)).toBe(false);
  });

  it("mod is NOT commutative: a mod p !== p mod a", () => {
    const ap: Expr = { kind: "binary", op: "mod", left: { kind: "var", name: "a" }, right: { kind: "var", name: "p" } };
    const pa: Expr = { kind: "binary", op: "mod", left: { kind: "var", name: "p" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ap, pa)).toBe(false);
  });

  it("less is NOT commutative: a < b !== b < a", () => {
    const ab: Expr = { kind: "binary", op: "less", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "less", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(false);
  });

  it("g ^ a mod p does not equal g ^ a mod p with extra term", () => {
    const correct = parseExpression("g ^ a mod p");
    const withExtra = parseExpression("g ^ a mod p");
    // Structural equality — same tree should match
    expect(exprEquals(correct, withExtra)).toBe(true);
  });

  it("g ^ a mod p does not equal g ^ b mod p", () => {
    const correct = parseExpression("g ^ a mod p");
    const wrong = parseExpression("g ^ b mod p");
    expect(exprEquals(correct, wrong)).toBe(false);
  });

  it("nested commutativity: (a + b) * c === c * (b + a)", () => {
    const left = parseExpression("(a + b) * c");
    const right = parseExpression("c * (b + a)");
    expect(exprEquals(left, right)).toBe(true);
  });

  it("and is commutative: a and b === b and a", () => {
    const ab: Expr = { kind: "binary", op: "and", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "and", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(true);
  });

  it("or is commutative: a or b === b or a", () => {
    const ab: Expr = { kind: "binary", op: "or", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "or", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(ab, ba)).toBe(true);
  });
});

// ─── exprToString ─────────────────────────────────────────────────────────────

describe("exprToString", () => {
  it("var", () => {
    expect(exprToString({ kind: "var", name: "x" })).toBe("x");
  });

  it("int", () => {
    expect(exprToString({ kind: "int", value: 7 })).toBe("7");
  });

  it("role ref", () => {
    expect(exprToString({ kind: "role", name: "generator" })).toBe("{generator}");
  });

  it("placeholder", () => {
    expect(exprToString({ kind: "placeholder", index: 3 })).toBe("$3");
  });

  it("slot", () => {
    expect(exprToString({ kind: "slot" })).toBe("_");
  });

  it("constant", () => {
    expect(exprToString({ kind: "constant", symbol: "naturals" })).toBe("naturals");
  });

  it("unary forall", () => {
    const e: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    // symbolDisplay["forall"] = "∀"
    expect(exprToString(e)).toBe("\u2200x");
  });

  it("binary add", () => {
    const e: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprToString(e)).toBe("a + b");
  });

  it("binary sub", () => {
    const e: Expr = { kind: "binary", op: "sub", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprToString(e)).toBe("a - b");
  });

  it("binary pow", () => {
    const e: Expr = { kind: "binary", op: "pow", left: { kind: "var", name: "a" }, right: { kind: "int", value: 2 } };
    expect(exprToString(e)).toBe("a^2");
  });
});

// ─── normalizeExpr ───────────────────────────────────────────────────────────

describe("normalizeExpr", () => {
  it("leaves a var unchanged", () => {
    const e: Expr = { kind: "var", name: "x" };
    expect(normalizeExpr(e)).toEqual(e);
  });

  it("leaves a slot unchanged", () => {
    expect(normalizeExpr({ kind: "slot" })).toEqual({ kind: "slot" });
  });

  it("collapses null-op binary with two slots to a slot", () => {
    const e: Expr = { kind: "binary", op: null, left: { kind: "slot" }, right: { kind: "slot" } };
    expect(normalizeExpr(e)).toEqual({ kind: "slot" });
  });

  it("does NOT collapse null-op binary when one child is non-slot", () => {
    const e: Expr = { kind: "binary", op: null, left: { kind: "var", name: "x" }, right: { kind: "slot" } };
    expect(normalizeExpr(e)).toEqual(e);
  });

  it("collapses null-op unary with slot operand to a slot", () => {
    const e: Expr = { kind: "unary", op: null, operand: { kind: "slot" } };
    expect(normalizeExpr(e)).toEqual({ kind: "slot" });
  });

  it("does NOT collapse null-op unary with non-slot operand", () => {
    const e: Expr = { kind: "unary", op: null, operand: { kind: "var", name: "x" } };
    expect(normalizeExpr(e)).toEqual(e);
  });

  it("recursively normalizes binary children", () => {
    const e: Expr = {
      kind: "binary",
      op: "add",
      left: { kind: "binary", op: null, left: { kind: "slot" }, right: { kind: "slot" } },
      right: { kind: "var", name: "x" },
    };
    expect(normalizeExpr(e)).toEqual({
      kind: "binary",
      op: "add",
      left: { kind: "slot" },
      right: { kind: "var", name: "x" },
    });
  });
});

// ─── paletteItemToExpr ───────────────────────────────────────────────────────

describe("paletteItemToExpr", () => {
  it("var → var", () => {
    const item: PaletteItem = { kind: "var", name: "x" };
    expect(paletteItemToExpr(item)).toEqual({ kind: "var", name: "x" });
  });

  it("int → int", () => {
    const item: PaletteItem = { kind: "int", value: 5 };
    expect(paletteItemToExpr(item)).toEqual({ kind: "int", value: 5 });
  });

  it("role → role", () => {
    const item: PaletteItem = { kind: "role", name: "generator" };
    expect(paletteItemToExpr(item)).toEqual({ kind: "role", name: "generator" });
  });

  it("operator → binary with two slots", () => {
    const item: PaletteItem = { kind: "operator", op: "add" };
    expect(paletteItemToExpr(item)).toEqual({
      kind: "binary", op: "add",
      left: { kind: "slot" }, right: { kind: "slot" },
    });
  });

  it("constantSymbol → constant", () => {
    const item: PaletteItem = { kind: "constantSymbol", op: "naturals" };
    expect(paletteItemToExpr(item)).toEqual({ kind: "constant", symbol: "naturals" });
  });

  it("unarySymbol → unary with slot operand", () => {
    const item: PaletteItem = { kind: "unarySymbol", op: "forall" };
    expect(paletteItemToExpr(item)).toEqual({ kind: "unary", op: "forall", operand: { kind: "slot" } });
  });

  it("binarySymbol → binary with two slots", () => {
    const item: PaletteItem = { kind: "binarySymbol", op: "elem" };
    expect(paletteItemToExpr(item)).toEqual({
      kind: "binary", op: "elem",
      left: { kind: "slot" }, right: { kind: "slot" },
    });
  });

  it("LPAR → slot", () => {
    const item: PaletteItem = { kind: "LPAR" };
    expect(paletteItemToExpr(item)).toEqual({ kind: "slot" });
  });

  it("RPAR → slot", () => {
    const item: PaletteItem = { kind: "RPAR" };
    expect(paletteItemToExpr(item)).toEqual({ kind: "slot" });
  });
});

// ─── paletteItemToString ─────────────────────────────────────────────────────

describe("paletteItemToString", () => {
  it("var", () => {
    expect(paletteItemToString({ kind: "var", name: "x" })).toBe("x");
  });

  it("int", () => {
    expect(paletteItemToString({ kind: "int", value: 42 })).toBe("42");
  });

  it("role", () => {
    // roles are serialized as bare names (not {name}) — roundtrip goes through VAR token
    expect(paletteItemToString({ kind: "role", name: "generator" })).toBe("generator");
  });

  it("operator add → ' + '", () => {
    expect(paletteItemToString({ kind: "operator", op: "add" })).toBe(" + ");
  });

  it("operator pow → '^'", () => {
    expect(paletteItemToString({ kind: "operator", op: "pow" })).toBe("^");
  });

  it("constantSymbol → \\symbol", () => {
    expect(paletteItemToString({ kind: "constantSymbol", op: "naturals" })).toBe("\\naturals");
  });

  it("unarySymbol → \\symbol", () => {
    expect(paletteItemToString({ kind: "unarySymbol", op: "forall" })).toBe("\\forall");
  });

  it("binarySymbol → \\symbol", () => {
    expect(paletteItemToString({ kind: "binarySymbol", op: "elem" })).toBe("\\elem");
  });

  it("LPAR → '('", () => {
    expect(paletteItemToString({ kind: "LPAR" })).toBe("(");
  });

  it("RPAR → ')'", () => {
    expect(paletteItemToString({ kind: "RPAR" })).toBe(")");
  });
});

// ─── substituteRoles ─────────────────────────────────────────────────────────

describe("substituteRoles", () => {
  const defs = {
    generator: { kind: "var" as const, name: "g" },
    prime: { kind: "var" as const, name: "p" },
  };

  it("replaces a role with the selected value", () => {
    const e: Expr = { kind: "role", name: "generator" };
    expect(substituteRoles(e, defs)).toEqual({ kind: "var", name: "g" });
  });

  it("leaves a role unchanged if not in definitions", () => {
    const e: Expr = { kind: "role", name: "unknown" };
    expect(substituteRoles(e, defs)).toEqual(e);
  });

  it("leaves a var unchanged", () => {
    const e: Expr = { kind: "var", name: "x" };
    expect(substituteRoles(e, defs)).toEqual(e);
  });

  it("recursively substitutes in unary operand", () => {
    const e: Expr = { kind: "unary", op: "forall", operand: { kind: "role", name: "generator" } };
    expect(substituteRoles(e, defs)).toEqual({
      kind: "unary", op: "forall", operand: { kind: "var", name: "g" },
    });
  });

  it("recursively substitutes in binary children", () => {
    const e: Expr = {
      kind: "binary", op: "add",
      left: { kind: "role", name: "generator" },
      right: { kind: "role", name: "prime" },
    };
    expect(substituteRoles(e, defs)).toEqual({
      kind: "binary", op: "add",
      left: { kind: "var", name: "g" },
      right: { kind: "var", name: "p" },
    });
  });

  it("leaves non-role leaf kinds unchanged", () => {
    const constant: Expr = { kind: "constant", symbol: "naturals" };
    expect(substituteRoles(constant, defs)).toEqual(constant);
    const slot: Expr = { kind: "slot" };
    expect(substituteRoles(slot, defs)).toEqual(slot);
  });
});

// ─── substituteRolesInString ──────────────────────────────────────────────────

describe("substituteRolesInString", () => {
  const defs = {
    generator: { kind: "var" as const, name: "g" },
    prime: { kind: "var" as const, name: "p" },
  };

  it("replaces a single role reference", () => {
    expect(substituteRolesInString("The generator is {generator}", defs)).toBe("The generator is g");
  });

  it("replaces multiple role references", () => {
    expect(substituteRolesInString("{generator} and {prime}", defs)).toBe("g and p");
  });

  it("leaves unknown roles unchanged", () => {
    expect(substituteRolesInString("Choose {unknown}", defs)).toBe("Choose {unknown}");
  });

  it("returns the string unchanged when there are no role references", () => {
    expect(substituteRolesInString("No roles here", defs)).toBe("No roles here");
  });

  it("replaces a role with a complex expression string", () => {
    const complexDefs = {
      public_key: { kind: "binary" as const, op: "mod" as const, left: { kind: "binary" as const, op: "pow" as const, left: { kind: "var" as const, name: "g" }, right: { kind: "var" as const, name: "a" } }, right: { kind: "var" as const, name: "p" } },
    };
    expect(substituteRolesInString("Compute {public_key}", complexDefs)).toBe("Compute g^a mod p");
  });

  it("handles an empty string", () => {
    expect(substituteRolesInString("", defs)).toBe("");
  });
});

// ─── Round-trip tests ─────────────────────────────────────────────────────────
// These verify that paletteItemToString produces strings that parseExpression
// can round-trip correctly. This is the critical integration between the two.

describe("round-trip: token list → string → parseExpression", () => {
  it("simple addition: [a, +, b]", () => {
    const tokens: PaletteItem[] = [
      { kind: "var", name: "a" },
      { kind: "operator", op: "add" },
      { kind: "var", name: "b" },
    ];
    const str = tokens.map(paletteItemToString).join(" ");
    const expr = parseExpression(str);
    expect(expr).toMatchObject({ kind: "binary", op: "add" });
  });

  it("parenthesised expression: [(, a, +, b, ), *, c]", () => {
    const tokens: PaletteItem[] = [
      { kind: "LPAR" },
      { kind: "var", name: "a" },
      { kind: "operator", op: "add" },
      { kind: "var", name: "b" },
      { kind: "RPAR" },
      { kind: "operator", op: "mul" },
      { kind: "var", name: "c" },
    ];
    const str = tokens.map(paletteItemToString).join("");
    const expr = parseExpression(str);
    expect(expr).toMatchObject({
      kind: "binary", op: "mul",
      left: { kind: "binary", op: "add" },
    });
  });

  it("constant: [\\naturals]", () => {
    const tokens: PaletteItem[] = [{ kind: "constantSymbol", op: "naturals" }];
    const str = tokens.map(paletteItemToString).join(" ");
    expect(parseExpression(str)).toMatchObject({ kind: "constant", symbol: "naturals" });
  });

  it("unary: [\\forall, x]", () => {
    const tokens: PaletteItem[] = [
      { kind: "unarySymbol", op: "forall" },
      { kind: "var", name: "x" },
    ];
    const str = tokens.map(paletteItemToString).join(" ");
    expect(parseExpression(str)).toMatchObject({ kind: "unary", op: "forall" });
  });

  it("binary symbol infix: [a, \\elem, \\naturals]", () => {
    const tokens: PaletteItem[] = [
      { kind: "var", name: "a" },
      { kind: "binarySymbol", op: "elem" },
      { kind: "constantSymbol", op: "naturals" },
    ];
    const str = tokens.map(paletteItemToString).join(" ");
    expect(parseExpression(str)).toMatchObject({
      kind: "binary", op: "elem",
      left: { kind: "var", name: "a" },
      right: { kind: "constant", symbol: "naturals" },
    });
  });

  it("answer equivalence: student b + a matches professor answer a + b", () => {
    const professorExpr = parseExpression("a + b");
    const studentExpr = parseExpression("b + a");
    expect(exprEquals(studentExpr, professorExpr)).toBe(true);
  });

  it("answer non-equivalence: a - b does not match b - a", () => {
    const professorExpr = parseExpression("a - b");
    const studentExpr = parseExpression("b - a");
    expect(exprEquals(studentExpr, professorExpr)).toBe(false);
  });
});

// ─── exprDiff ─────────────────────────────────────────────────────────────────

describe("exprDiff", () => {
  it("returns null for equal expressions", () => {
    const e: Expr = { kind: "var", name: "x" };
    expect(exprDiff(e, e)).toBeNull();
  });

  it("returns the user node when top-level kinds differ", () => {
    const user: Expr = { kind: "var", name: "x" };
    const answer: Expr = { kind: "int", value: 1 };
    expect(exprDiff(user, answer)).toEqual(user);
  });

  it("returns the user node when vars differ", () => {
    const user: Expr = { kind: "var", name: "b" };
    const answer: Expr = { kind: "var", name: "g" };
    expect(exprDiff(user, answer)).toEqual(user);
  });

  it("recurses into matching unary to find inner mismatch", () => {
    const user: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    const answer: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "y" } };
    expect(exprDiff(user, answer)).toEqual({ kind: "var", name: "x" });
  });

  it("recurses into matching binary op to find inner mismatch", () => {
    const user: Expr = {
      kind: "binary", op: "pow",
      left: { kind: "var", name: "b" },
      right: { kind: "var", name: "a" },
    };
    const answer: Expr = {
      kind: "binary", op: "pow",
      left: { kind: "var", name: "g" },
      right: { kind: "var", name: "a" },
    };
    expect(exprDiff(user, answer)).toEqual({ kind: "var", name: "b" });
  });

  it("returns a slot for operator-only mismatch when operands match", () => {
    const user: Expr = {
      kind: "binary", op: "add",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
      opTokenIndex: 1,
    };
    const answer: Expr = {
      kind: "binary", op: "sub",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    };
    const result = exprDiff(user, answer);
    expect(result).toEqual({ kind: "slot", tokenRange: { start: 1, end: 2 } });
  });

  it("handles commutative mismatch: a + b vs a + c finds c/b", () => {
    const user: Expr = {
      kind: "binary", op: "add",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    };
    const answer: Expr = {
      kind: "binary", op: "add",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "c" },
    };
    expect(exprDiff(user, answer)).toEqual({ kind: "var", name: "b" });
  });
});

// ─── exprListContains ─────────────────────────────────────────────────────────

describe("exprListContains", () => {
  const list: Expr[] = [
    { kind: "var", name: "g" },
    { kind: "int", value: 5 },
    { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } },
  ];

  it("returns true when expr is in the list", () => {
    expect(exprListContains({ kind: "var", name: "g" }, list)).toBe(true);
  });

  it("returns true for commutative match (a + b matches b + a in list)", () => {
    const swapped: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprListContains(swapped, list)).toBe(true);
  });

  it("returns false when expr is not in the list", () => {
    expect(exprListContains({ kind: "var", name: "z" }, list)).toBe(false);
  });

  it("returns false for an empty list", () => {
    expect(exprListContains({ kind: "var", name: "x" }, [])).toBe(false);
  });
});

// ─── findDiffPair ─────────────────────────────────────────────────────────────

describe("findDiffPair", () => {
  it("returns null for equal expressions", () => {
    const e: Expr = { kind: "var", name: "x" };
    expect(findDiffPair(e, e)).toBeNull();
  });

  it("returns [userNode, correctNode] for differing leaf nodes", () => {
    const user: Expr = { kind: "var", name: "b" };
    const answer: Expr = { kind: "var", name: "g" };
    expect(findDiffPair(user, answer)).toEqual([user, answer]);
  });

  it("returns [userRole, correctRole] when roles are swapped", () => {
    const user: Expr = {
      kind: "binary", op: "pow",
      left: { kind: "role", name: "bob_secret" },
      right: { kind: "role", name: "alice_secret" },
    };
    const answer: Expr = {
      kind: "binary", op: "pow",
      left: { kind: "role", name: "generator" },
      right: { kind: "role", name: "alice_secret" },
    };
    expect(findDiffPair(user, answer)).toEqual([
      { kind: "role", name: "bob_secret" },
      { kind: "role", name: "generator" },
    ]);
  });

  it("recurses into matching unary to find the differing pair", () => {
    const user: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } };
    const answer: Expr = { kind: "unary", op: "forall", operand: { kind: "var", name: "y" } };
    expect(findDiffPair(user, answer)).toEqual([
      { kind: "var", name: "x" },
      { kind: "var", name: "y" },
    ]);
  });

  it("recurses into matching binary op to find the differing pair", () => {
    const user: Expr = {
      kind: "binary", op: "pow",
      left: { kind: "var", name: "b" },
      right: { kind: "var", name: "n" },
    };
    const answer: Expr = {
      kind: "binary", op: "pow",
      left: { kind: "var", name: "g" },
      right: { kind: "var", name: "n" },
    };
    expect(findDiffPair(user, answer)).toEqual([
      { kind: "var", name: "b" },
      { kind: "var", name: "g" },
    ]);
  });

  it("returns top-level pair when structures differ entirely", () => {
    const user: Expr = { kind: "var", name: "x" };
    const answer: Expr = { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(findDiffPair(user, answer)).toEqual([user, answer]);
  });
});

// ─── custom operator support in expr utilities ────────────────────────────────

describe("exprEquals with custom operators", () => {
  it("two identical custom binary expressions are equal", () => {
    const a: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const b: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprEquals(a, b)).toBe(true);
  });

  it("custom binary expressions with different op names are not equal", () => {
    const a: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const b: Expr = { kind: "binary", op: "XOR", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprEquals(a, b)).toBe(false);
  });

  it("commutative custom operator: a SET b equals b SET a after registering", () => {
    COMMUTATIVE_OPS.add("SET");
    const a: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const b: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(a, b)).toBe(true);
    COMMUTATIVE_OPS.delete("SET"); // clean up so other tests are unaffected
  });

  it("non-commutative custom operator: a FUNC b does NOT equal b FUNC a", () => {
    // FUNC is not in COMMUTATIVE_OPS
    const a: Expr = { kind: "binary", op: "FUNC", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const b: Expr = { kind: "binary", op: "FUNC", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
    expect(exprEquals(a, b)).toBe(false);
  });

  it("two identical custom unary expressions are equal", () => {
    const a: Expr = { kind: "unary", op: "HASH", operand: { kind: "var", name: "x" } };
    const b: Expr = { kind: "unary", op: "HASH", operand: { kind: "var", name: "x" } };
    expect(exprEquals(a, b)).toBe(true);
  });

  it("custom unary expressions with different operands are not equal", () => {
    const a: Expr = { kind: "unary", op: "HASH", operand: { kind: "var", name: "x" } };
    const b: Expr = { kind: "unary", op: "HASH", operand: { kind: "var", name: "y" } };
    expect(exprEquals(a, b)).toBe(false);
  });

  it("custom unary expressions with different ops are not equal", () => {
    const a: Expr = { kind: "unary", op: "HASH", operand: { kind: "var", name: "x" } };
    const b: Expr = { kind: "unary", op: "MAC", operand: { kind: "var", name: "x" } };
    expect(exprEquals(a, b)).toBe(false);
  });
});

describe("exprToString with custom operators", () => {
  it("renders a custom binary operator infix with spaces", () => {
    const e: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprToString(e)).toBe("a SET b");
  });

  it("renders a custom unary operator as prefix", () => {
    const e: Expr = { kind: "unary", op: "HASH", operand: { kind: "var", name: "x" } };
    expect(exprToString(e)).toBe("HASHx");
  });

  it("renders nested custom binary operators", () => {
    const inner: Expr = { kind: "binary", op: "SET", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const outer: Expr = { kind: "binary", op: "SET", left: inner, right: { kind: "var", name: "c" } };
    expect(exprToString(outer)).toBe("a SET b SET c");
  });
});

describe("custom operator parsing and equality round-trip", () => {
  const setOp = [{ name: "SET", type: "BINARY" as const, commutative: true, precedence: 3 }];
  const hashOp = [{ name: "HASH", type: "UNARY" as const, commutative: false, precedence: 4 }];

  it("parsed BINARY custom expression equals itself", () => {
    const expr = parseExpression("a SET b", setOp);
    expect(exprEquals(expr, expr)).toBe(true);
  });

  it("parsed UNARY custom expression equals itself", () => {
    const expr = parseExpression("HASH x", hashOp);
    expect(exprEquals(expr, expr)).toBe(true);
  });

  it("parsed custom binary expression does not equal a different structure", () => {
    const a = parseExpression("a SET b", setOp);
    const b = parseExpression("a SET c", setOp);
    expect(exprEquals(a, b)).toBe(false);
  });

  it("HASH applied to different values produces different expressions", () => {
    const a = parseExpression("HASH x", hashOp);
    const b = parseExpression("HASH y", hashOp);
    expect(exprEquals(a, b)).toBe(false);
  });
});
