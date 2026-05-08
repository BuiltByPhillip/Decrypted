import { describe, it, expect } from "vitest";
import { searchValues } from "~/app/_components/exercises/construct/paletteSearch";
import {
  exprEquals,
  exprToString,
  normalizeExpr,
  paletteItemToExpr,
  paletteItemToString,
  substituteRoles,
  substituteRolesInString,
  substituteRolesInPalette,
  parseConstructDefinition,
  exprDiff,
  exprListContains,
  findDiffPair,
  COMMUTATIVE_OPS,
  tokenToPaletteItem,
  getPreviewDefinition,
} from "../app/hooks/expr";
import { parseExpression } from "../app/hooks/parser";
import type { Code, Expr, PaletteItem } from "../app/hooks/parser";

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

  it("greater is NOT commutative: a > b !== b > a", () => {
    const ab: Expr = { kind: "binary", op: "greater", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    const ba: Expr = { kind: "binary", op: "greater", left: { kind: "var", name: "b" }, right: { kind: "var", name: "a" } };
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

  it("unary with null op renders as _operand", () => {
    const e: Expr = { kind: "unary", op: null, operand: { kind: "var", name: "x" } };
    expect(exprToString(e)).toBe("_x");
  });

  it("binary with null op renders as 'left _ right'", () => {
    const e: Expr = { kind: "binary", op: null, left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprToString(e)).toBe("a _ b");
  });

  it("custom op not in OP_TO_STRING falls back to ' OP '", () => {
    const e: Expr = { kind: "binary", op: "MYOP", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } };
    expect(exprToString(e)).toBe("a MYOP b");
  });

  it("nested expression renders with correct spacing", () => {
    const e: Expr = {
      kind: "binary", op: "mod",
      left: {
        kind: "binary", op: "pow",
        left: { kind: "var", name: "g" },
        right: { kind: "var", name: "a" },
      },
      right: { kind: "var", name: "p" },
    };
    expect(exprToString(e)).toBe("g^a mod p");
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

  it("does NOT collapse a non-null-op binary whose children are slots", () => {
    const e: Expr = { kind: "binary", op: "add", left: { kind: "slot" }, right: { kind: "slot" } };
    expect(normalizeExpr(e)).toEqual(e);
  });

  it("collapses deeply nested empty structure to a single slot", () => {
    // binary(null, unary(null, slot), slot) → binary(null, slot, slot) → slot
    const e: Expr = {
      kind: "binary", op: null,
      left: { kind: "unary", op: null, operand: { kind: "slot" } },
      right: { kind: "slot" },
    };
    expect(normalizeExpr(e)).toEqual({ kind: "slot" });
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
    expect(paletteItemToString({ kind: "role", name: "generator" })).toBe("{generator}");
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

  it("role item round-trips correctly through paletteItemToString → parseExpression", () => {
    // paletteItemToString claims to produce parser-ready strings. For a role item,
    // it should produce "{generator}" so the parser yields a ROLE_REF, not a VAR.
    const item: PaletteItem = { kind: "role", name: "generator" };
    const str = paletteItemToString(item);
    const result = parseExpression(str);
    expect(result).toMatchObject({ kind: "role", name: "generator" });
  });
});

// ─── getPreviewDefinition ─────────────────────────────────────────────────────

describe("getPreviewDefinition", () => {
  const makeCode = (defs: { role: string; symbols: Expr[] }[]): Code => ({
    information: {
      name: "Test Protocol",
      definition: defs.map((d) => ({ type: "select", role: d.role, symbols: d.symbols })),
    },
    customOperators: [],
    step: [],
  });

  it("maps each role to its first symbol", () => {
    const code = makeCode([
      { role: "generator", symbols: [{ kind: "var", name: "g" }, { kind: "var", name: "h" }] },
      { role: "prime",     symbols: [{ kind: "var", name: "p" }, { kind: "var", name: "n" }] },
    ]);
    const result = getPreviewDefinition(code);
    expect(result).toEqual({
      generator: { kind: "var", name: "g" },
      prime:     { kind: "var", name: "p" },
    });
  });

  it("returns an empty record when there are no definitions", () => {
    const code = makeCode([]);
    expect(getPreviewDefinition(code)).toEqual({});
  });

  it("works with a single definition", () => {
    const code = makeCode([
      { role: "secret", symbols: [{ kind: "var", name: "a" }] },
    ]);
    expect(getPreviewDefinition(code)).toEqual({
      secret: { kind: "var", name: "a" },
    });
  });

  it("ignores all symbols after the first", () => {
    const code = makeCode([
      { role: "key", symbols: [{ kind: "var", name: "x" }, { kind: "var", name: "y" }, { kind: "var", name: "z" }] },
    ]);
    const result = getPreviewDefinition(code);
    expect(result.key).toEqual({ kind: "var", name: "x" });
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

// ─── tokenToPaletteItem ───────────────────────────────────────────────────────

// ─── parseConstructDefinition ────────────────────────────────────────────────

describe("parseConstructDefinition", () => {
  it("returns the left side when format is correct", () => {
    const expr = parseExpression("g \\elem {generator}");
    expect(parseConstructDefinition(expr, "generator")).toMatchObject({ kind: "var", name: "g" });
  });

  it("works with an integer on the left", () => {
    const expr = parseExpression("7 \\elem {prime}");
    expect(parseConstructDefinition(expr, "prime")).toMatchObject({ kind: "int", value: 7 });
  });

  it("returns only the left side, not the role reference", () => {
    const expr = parseExpression("a \\elem {alice_secret}");
    const result = parseConstructDefinition(expr, "alice_secret");
    expect(result).toMatchObject({ kind: "var", name: "a" });
    expect(result).not.toHaveProperty("right");
  });

  it("throws when the expression is not a binary elem", () => {
    const expr = parseExpression("g + x");
    expect(() => parseConstructDefinition(expr, "generator")).toThrow("\\elem");
  });

  it("throws for a plain variable with no elem", () => {
    const expr = parseExpression("g");
    expect(() => parseConstructDefinition(expr, "generator")).toThrow();
  });

  it("throws when the right side is not a role reference", () => {
    const expr = parseExpression("g \\elem S");
    expect(() => parseConstructDefinition(expr, "generator")).toThrow("generator");
  });

  it("throws when the right side role does not match the expected role", () => {
    const expr = parseExpression("g \\elem {prime}");
    expect(() => parseConstructDefinition(expr, "generator")).toThrow("generator");
  });
});

// ─── substituteRolesInPalette ─────────────────────────────────────────────────

describe("substituteRolesInPalette", () => {
  it("replaces a role item with its resolved var", () => {
    const items: PaletteItem[] = [{ kind: "role", name: "prime" }];
    const defs = { prime: { kind: "var" as const, name: "p" } };
    expect(substituteRolesInPalette(items, defs)).toEqual([{ kind: "var", name: "p" }]);
  });

  it("leaves non-role items unchanged", () => {
    const items: PaletteItem[] = [
      { kind: "operator", op: "mod" },
      { kind: "var", name: "g" },
      { kind: "int", value: 7 },
    ];
    expect(substituteRolesInPalette(items, {})).toEqual(items);
  });

  it("substitutes only role items in a mixed list", () => {
    const items: PaletteItem[] = [
      { kind: "operator", op: "mod" },
      { kind: "role", name: "prime" },
    ];
    const defs = { prime: { kind: "var" as const, name: "p" } };
    expect(substituteRolesInPalette(items, defs)).toEqual([
      { kind: "operator", op: "mod" },
      { kind: "var", name: "p" },
    ]);
  });

  it("substitutes multiple role items", () => {
    const items: PaletteItem[] = [
      { kind: "role", name: "generator" },
      { kind: "operator", op: "^" },
      { kind: "role", name: "alice_secret" },
    ];
    const defs = {
      generator: { kind: "var" as const, name: "g" },
      alice_secret: { kind: "var" as const, name: "a" },
    };
    expect(substituteRolesInPalette(items, defs)).toEqual([
      { kind: "var", name: "g" },
      { kind: "operator", op: "^" },
      { kind: "var", name: "a" },
    ]);
  });

  it("leaves a role item unchanged when the role is not in definitions", () => {
    const items: PaletteItem[] = [{ kind: "role", name: "unknown" }];
    expect(substituteRolesInPalette(items, {})).toEqual([{ kind: "role", name: "unknown" }]);
  });

  it("returns an empty array unchanged", () => {
    expect(substituteRolesInPalette([], {})).toEqual([]);
  });

  it("substitutes a role resolved to an int", () => {
    const items: PaletteItem[] = [{ kind: "role", name: "prime" }];
    const defs = { prime: { kind: "int" as const, value: 23 } };
    expect(substituteRolesInPalette(items, defs)).toEqual([{ kind: "int", value: 23 }]);
  });
});

// ─── prefill round-trip: combined token list → answer check ──────────────────

describe("prefill answer-checking round-trip", () => {
  it("prefill + user tokens produce a parseable expression", () => {
    // Simulates: prefill = [mod, p], user tokens = [g, ^, a]
    // Combined list sent to answer checker: [g, ^, a, mod, p]
    const combined: PaletteItem[] = [
      { kind: "var", name: "g" },
      { kind: "operator", op: "^" },
      { kind: "var", name: "a" },
      { kind: "operator", op: "mod" },
      { kind: "var", name: "p" },
    ];
    const str = combined.map(paletteItemToString).join(" ");
    const expr = parseExpression(str);
    expect(expr).toMatchObject({ kind: "binary", op: "mod" });
  });

  it("combined tokens match the correct answer expression", () => {
    const combined: PaletteItem[] = [
      { kind: "var", name: "g" },
      { kind: "operator", op: "^" },
      { kind: "var", name: "a" },
      { kind: "operator", op: "mod" },
      { kind: "var", name: "p" },
    ];
    const str = combined.map(paletteItemToString).join(" ");
    const userExpr = parseExpression(str);
    const answerExpr = parseExpression("g ^ a mod p");
    expect(exprEquals(userExpr, answerExpr)).toBe(true);
  });

  it("combined tokens with wrong user section do not match the answer", () => {
    // User built [g, ^, b] instead of [g, ^, a], prefill is [mod, p]
    const combined: PaletteItem[] = [
      { kind: "var", name: "g" },
      { kind: "operator", op: "^" },
      { kind: "var", name: "b" },
      { kind: "operator", op: "mod" },
      { kind: "var", name: "p" },
    ];
    const str = combined.map(paletteItemToString).join(" ");
    const userExpr = parseExpression(str);
    const answerExpr = parseExpression("g ^ a mod p");
    expect(exprEquals(userExpr, answerExpr)).toBe(false);
  });

  it("prefill-only tokens (no user input) do not match a full answer", () => {
    // User added nothing; only prefill [mod, p] is present
    const combined: PaletteItem[] = [
      { kind: "operator", op: "mod" },
      { kind: "var", name: "p" },
    ];
    const str = combined.map(paletteItemToString).join(" ");
    expect(() => parseExpression(str)).toThrow();
  });
});

describe("tokenToPaletteItem", () => {
  it("converts a NUMBER token to an int palette item", () => {
    expect(tokenToPaletteItem({ type: "NUMBER", value: "42" })).toEqual({ kind: "int", value: 42 });
  });

  it("converts a single-digit NUMBER token", () => {
    expect(tokenToPaletteItem({ type: "NUMBER", value: "7" })).toEqual({ kind: "int", value: 7 });
  });

  it("converts a VAR token to a var palette item", () => {
    expect(tokenToPaletteItem({ type: "VAR", value: "g" })).toEqual({ kind: "var", name: "g" });
  });

  it("converts a multi-char VAR token", () => {
    expect(tokenToPaletteItem({ type: "VAR", value: "alice" })).toEqual({ kind: "var", name: "alice" });
  });

  it("converts an OPERATOR token to an operator palette item", () => {
    expect(tokenToPaletteItem({ type: "OPERATOR", value: "mod" })).toEqual({ kind: "operator", op: "mod" });
  });

  it("converts a single-char OPERATOR token", () => {
    expect(tokenToPaletteItem({ type: "OPERATOR", value: "^" })).toEqual({ kind: "operator", op: "^" });
  });

  it("converts LPAR token", () => {
    expect(tokenToPaletteItem({ type: "LPAR", value: "(" })).toEqual({ kind: "LPAR" });
  });

  it("converts RPAR token", () => {
    expect(tokenToPaletteItem({ type: "RPAR", value: ")" })).toEqual({ kind: "RPAR" });
  });

  it("converts a ROLE_REF token to a role palette item", () => {
    expect(tokenToPaletteItem({ type: "ROLE_REF", value: "prime" })).toEqual({ kind: "role", name: "prime" });
  });

  it("converts a ROLE_REF with a compound name", () => {
    expect(tokenToPaletteItem({ type: "ROLE_REF", value: "alice_secret" })).toEqual({ kind: "role", name: "alice_secret" });
  });

  it("converts a KEYWORD constant symbol", () => {
    expect(tokenToPaletteItem({ type: "KEYWORD", value: "naturals" })).toEqual({ kind: "constantSymbol", op: "naturals" });
  });

  it("converts a KEYWORD unary symbol", () => {
    expect(tokenToPaletteItem({ type: "KEYWORD", value: "forall" })).toEqual({ kind: "unarySymbol", op: "forall" });
  });

  it("converts a KEYWORD binary symbol", () => {
    expect(tokenToPaletteItem({ type: "KEYWORD", value: "elem" })).toEqual({ kind: "binarySymbol", op: "elem" });
  });

  it("throws for an unknown KEYWORD", () => {
    expect(() => tokenToPaletteItem({ type: "KEYWORD", value: "unknown" })).toThrow();
  });

  it("throws for a COMMA token", () => {
    expect(() => tokenToPaletteItem({ type: "COMMA", value: "," })).toThrow();
  });


  it("throws for an EOF token", () => {
    expect(() => tokenToPaletteItem({ type: "EOF", value: "" })).toThrow();
  });

  it("throws for a LBRACE token", () => {
    expect(() => tokenToPaletteItem({ type: "LBRACE", value: "{" })).toThrow();
  });

  it("throws for a RBRACE token", () => {
    expect(() => tokenToPaletteItem({ type: "RBRACE", value: "}" })).toThrow();
  });
});

describe("searchValues", () => {
  it("returns alphanumeric variable names like c1", () => {
    const results = searchValues("c1");
    expect(results).toContainEqual({ kind: "var", name: "c1" });
  });

  it("returns simple letter variables", () => {
    const results = searchValues("c");
    expect(results).toContainEqual({ kind: "var", name: "c" });
  });

  it("returns primed variables", () => {
    const results = searchValues("c'");
    expect(results).toContainEqual({ kind: "var", name: "c'" });
  });

  it("returns integer results for numeric input", () => {
    const results = searchValues("42");
    expect(results).toContainEqual({ kind: "int", value: 42 });
  });

  it("does not return a variable for a query starting with a digit", () => {
    const results = searchValues("1c");
    expect(results.every(r => r.kind !== "var" || r.name !== "1c")).toBe(true);
  });
});
