import type { SelectedDefinitions } from "~/app/exercise/page";
import { type Expr, type PaletteItem, symbolDisplay } from "~/app/hooks/parser";

/* SubstituteRoles take an expressions containing role references ({generator}, {bob_secret}, etc) and replaces with actual user selected symbols */
export function substituteRoles(e: Expr, definitions: SelectedDefinitions): Expr {
  switch (e.kind) {
    case "role":
      return definitions[e.name] ?? e;

    // Leaf nodes - return as-is
    case "var":
    case "int":
    case "placeholder":
    case "slot":
    case "constant":
      return e;

    // Unary expression -  recursively substitute in child
    case "unary":
      return {
        kind: "unary",
        op: e.op,
        operand: substituteRoles(e.operand, definitions),
      };

    // Binary expression - recursively substitute in children
    case "binary":
      return {
        kind: "binary",
        op: e.op,
        left: substituteRoles(e.left, definitions),
        right: substituteRoles(e.right, definitions),
      };
  }
}

// Operators where order doesn't matter: a + b === b + a
const COMMUTATIVE_OPS = new Set(["equal", "add", "mul", "and", "or"]);

/* Checks if two expressions are structurally and mathematically equal */
export function exprEquals(a: Expr, b: Expr): boolean {
  if (a.kind !== b.kind) return false;

  switch (a.kind) {
    case "var":
      return b.kind === "var" && b.name === a.name;
    case "role":
      return b.kind === "role" && b.name === a.name;
    case "int":
      return b.kind === "int" && b.value === a.value;
    case "placeholder":
      return b.kind === "placeholder" && b.index === a.index;
    case "slot":
      return a.kind === "slot" && b.kind === "slot";
    case "constant":
      return b.kind === "constant" && a.symbol === b.symbol;
    case "unary":
      return b.kind === "unary" && a.op === b.op && exprEquals(a.operand,
        b.operand);
    case "binary":
      if (b.kind !== "binary" || a.op !== b.op) return false;

      // Check standard order
      const standardMatch = exprEquals(a.left, b.left) && exprEquals(a.right, b.right);

      // For commutative operators, also check swapped order
      if (a.op !== null && COMMUTATIVE_OPS.has(a.op)) {
        const swappedMatch = exprEquals(a.left, b.right) && exprEquals(a.right, b.left);
        return standardMatch || swappedMatch;
      }

      return standardMatch;
  }
}

// Operator symbols for string representation
const OP_TO_STRING: Record<string, string> = {
  pow: "^",
  mod: " mod ",
  mul: " * ",
  div: " / ",
  add: " + ",
  sub: " - ",
  less: " < ",
  greater: " > ",
  equal: " = ",
  and: " and ",
  or: " or ",
};

export function exprToString(e: Expr): string {
  switch (e.kind) {
    case "var":
      return e.name;
    case "role":
      return `{${e.name}}`;  // shouldn't appear after substitution
    case "int":
      return String(e.value);
    case "placeholder":
      return `$${e.index}`;
    case "slot":
      return "_";
    case "unary":
      const unaryOpStr = e.op === null ? "_" : symbolDisplay[e.op];
      return `${unaryOpStr}${exprToString(e.operand)}`;
    case "binary":
      const opStr = e.op === null ? " _ " : (OP_TO_STRING[e.op] ?? ` ${e.op} `);
      return `${exprToString(e.left)}${opStr}${exprToString(e.right)}`;
    case "constant":
      return e.symbol
  }
}

export function exprListContains(expr: Expr, list: Expr[]): boolean {
  for (let i = 0; i < list.length; i++) {
    if (exprEquals(expr, list[i]!)) return true;
  }
  return false;
}

/* Normalizes an expression by collapsing empty binary structures to slots.
   A binary is "empty" when op is null and both children are slots. */
export function normalizeExpr(e: Expr): Expr {
  switch (e.kind) {
    case "var":
    case "int":
    case "role":
    case "placeholder":
    case "slot":
    case "constant":
      return e;

    case "unary":
      const operand = normalizeExpr(e.operand)
      if (e.op === null && operand.kind === "slot") {
        return { kind: "slot" }
      }

      return { ...e, operand }
    case "binary":
      // First normalize children
      const left = normalizeExpr(e.left);
      const right = normalizeExpr(e.right);

      // If op is null and both children are slots, collapse to a single slot
      if (e.op === null && left.kind === "slot" && right.kind === "slot") {
        return { kind: "slot" };
      }

      // Return normalized binary
      return { ...e, left, right };
  }
}

/* Converts a palette item to an expression. Operators become binary expressions with empty slots. */
export function paletteItemToExpr(item: PaletteItem): Expr {
  switch (item.kind) {
    case "var":
      return { kind: "var", name: item.name };
    case "role":
      return { kind: "role", name: item.name };
    case "int":
      return { kind: "int", value: item.value };
    case "operator":
      return {
        kind: "binary",
        op: item.op,
        left: { kind: "slot" },
        right: { kind: "slot" },
      };
    case "constantSymbol":
      return { kind: "constant", symbol: item.op };
    case "unarySymbol":
      return { kind: "unary", op: item.op, operand: { kind: "slot"} }
    case "binarySymbol":
      return {
        kind: "binary",
        op: item.op,
        left: { kind: "slot" },
        right: { kind: "slot" },
      };
    case "LPAR":
    case "RPAR":
      return { kind: "slot" }; // parens are structural tokens, not standalone expressions
  }
}

/* Converts a flat list of palette tokens into an expression tree, respecting operator precedence. */
export function paletteItemsToExpr(items: PaletteItem[]): Expr {
  let pos = 0;

  function precedence(item: PaletteItem): number {
    if (item.kind === "binarySymbol") return 1;
    if (item.kind !== "operator") return -1;
    switch (item.op) {
      case "and": case "or":                          return 0;
      case "less": case "greater": case "equal":      return 1;
      case "add": case "sub":                         return 2;
      case "mul": case "div": case "mod":             return 3;
      case "pow":                                     return 4;
    }
  }

  function parsePrimary(): Expr {
    if (pos >= items.length) throw new Error("Unexpected end of expression");
    const item = items[pos++]!;
    switch (item.kind) {
      case "var":           return { kind: "var", name: item.name };
      case "int":           return { kind: "int", value: item.value };
      case "role":          return { kind: "role", name: item.name };
      case "constantSymbol": return { kind: "constant", symbol: item.op };
      case "unarySymbol": {
        const operand = parsePrimary();
        return { kind: "unary", op: item.op, operand };
      }
      case "LPAR": {
        const inner = parseExpr(0);
        if (pos < items.length && items[pos]?.kind === "RPAR") pos++;
        return inner;
      }
      default:
        throw new Error(`Unexpected token: ${item.kind}`);
    }
  }

  function parseExpr(minPrec: number): Expr {
    let left = parsePrimary();
    while (pos < items.length) {
      const op = items[pos]!;
      const prec = precedence(op);
      if (prec < 0 || prec < minPrec) break;
      pos++;
      const right = parseExpr(prec + 1);
      if (op.kind === "operator" || op.kind === "binarySymbol") {
        left = { kind: "binary", op: op.op, left, right };
      }
    }
    return left;
  }

  return parseExpr(0);
}