import type { SelectedDefinitions } from "~/app/exercise/page";
import type { Expr, PaletteItem } from "~/app/hooks/parser";

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
      return e;

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

    case "binary":
      if (b.kind !== "binary" || a.op !== b.op) return false;

      // Check standard order
      const standardMatch = exprEquals(a.left, b.left) && exprEquals(a.right, b.right);

      // For commutative operators, also check swapped order
      if (COMMUTATIVE_OPS.has(a.op)) {
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
    case "binary":
      const opStr = OP_TO_STRING[e.op] ?? ` ${e.op} `;
      return `${exprToString(e.left)}${opStr}${exprToString(e.right)}`;
  }
}

export function exprListContains(expr: Expr, list: Expr[]): boolean {
  for (let i = 0; i < list.length; i++) {
    if (exprEquals(expr, list[i]!)) return true;
  }
  return false;
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
  }
}