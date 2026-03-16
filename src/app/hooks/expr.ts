import type { SelectedDefinitions } from "~/app/exercise/page";
import { type Expr, type PaletteItem, symbolDisplay } from "~/app/hooks/parser";

/**
 * Replaces role references (e.g. `{generator}`, `{bob_secret}`) in an expression with the
 * actual symbols selected by the user.
 * @param e - The expression potentially containing role references
 * @param definitions - The user's selected symbol definitions
 * @returns A new expression with all role references substituted
 */
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

/** Operators where order doesn't matter: a + b === b + a */
const COMMUTATIVE_OPS = new Set(["equal", "add", "mul", "and", "or"]);

/**
 * Checks if two expressions are structurally and mathematically equal.
 * Commutative operators (e.g. `+`, `*`) are considered equal regardless of operand order.
 * @param a - The first expression
 * @param b - The second expression
 * @returns `true` if the expressions are equal, `false` otherwise
 */
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

/**
 * Returns the first mismatching sub-expression from the user's tree.
 * @param user - The expression built by the user
 * @param answer - The expected expression
 * @returns The deepest mismatching sub-expression, or `null` if they are equal
 */
export function exprDiff(user: Expr, answer: Expr): Expr | null {
  if (exprEquals(user, answer)) return null

  // Recurse deeper to find the mismatch
  if (user.kind === "unary" && answer.kind === "unary" && user.op === answer.op) {
    return exprDiff(user.operand, answer.operand)
  }

  // Different operator — highlight just the operator token when the user started correctly:
  // either the left children match exactly, or the user's left is a simple var matching
  // the leftmost leaf of the correct tree (e.g. `g = a mod p` vs `g^a mod p`).
  if (user.kind === "binary" && answer.kind === "binary" && user.op !== answer.op) {
    const leftMatches = exprEquals(user.left, answer.left);
    const startsCorrectly = user.left.kind === "var" && (() => {
      let e: Expr = answer;
      while (e.kind === "binary") e = e.left;
      while (e.kind === "unary") e = e.operand;
      return exprEquals(user.left, e);
    })();
    if ((leftMatches || startsCorrectly) && user.opTokenIndex !== undefined) {
      return { kind: "slot", tokenRange: { start: user.opTokenIndex, end: user.opTokenIndex + 1 } };
    }
  }

  // Recurse deeper to find the mismatch
  if (user.kind === "binary" && answer.kind === "binary" && user.op === answer.op) {
    if (COMMUTATIVE_OPS.has(user.op ?? "")) {
      // Standard order: if left matches, then mismatch must be on the right
      if (exprEquals(user.left, answer.left)) {
        return exprDiff(user.right, answer.right);
      }
      // Swapped order: if left matches right, then mismatch must be on the left
      if (exprEquals(user.left, answer.right)) {
        return exprDiff(user.right, answer.left);
      }
    }
    // Non-commutative: just recurse left first, then right
    return exprDiff(user.left, answer.left) ?? exprDiff(user.right, answer.right) ?? user;
  }
  return user; // Structural mismatch (different kind or operator)
}

/**
 * Walks both expression trees in parallel and returns the first pair of
 * sub-expressions that differ: [userNode, correctNode].
 * Unlike `exprDiff`, this returns both the user's wrong node AND the
 * corresponding correct node, enabling specific feedback messages.
 * Returns null if the expressions are equal.
 * @param user - The expression built by the user
 * @param answer - The expected expression
 * @returns A tuple [userNode, correctNode] at the first point of difference, or null if equal
 */
export function findDiffPair(user: Expr, answer: Expr): [Expr, Expr] | null {
  if (exprEquals(user, answer)) return null;

  // Same unary op — recurse into operand
  if (user.kind === "unary" && answer.kind === "unary" && user.op === answer.op) {
    return findDiffPair(user.operand, answer.operand);
  }

  // Same binary op — recurse into children
  if (user.kind === "binary" && answer.kind === "binary" && user.op === answer.op) {
    if (COMMUTATIVE_OPS.has(user.op ?? "")) {
      if (exprEquals(user.left, answer.left)) return findDiffPair(user.right, answer.right);
      if (exprEquals(user.left, answer.right)) return findDiffPair(user.right, answer.left);
    }
    return findDiffPair(user.left, answer.left) ?? findDiffPair(user.right, answer.right);
  }

  return [user, answer];
}

/** Maps operator names to their display symbols for string serialization */
export const OP_TO_STRING: Record<string, string> = {
  // Arithmetic / logic operators
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
  // Number theory
  divides: " | ",
  notdivides: " \u2224 ",
  lessequal: " \u2264 ",
  greaterequal: " \u2265 ",
  // Set theory / relations
  elem: " \u2208 ",
  notelem: " \u2209 ",
  subset: " \u2286 ",
  union: " \u222A ",
  intersection: " \u2229 ",
  // Cryptographic / protocol
  xor: " \u2295 ",
  concat: " || ",
  congruent: " \u2261 ",
  notequal: " \u2260 ",
  leftarrow: " \u2190 ",
  rightarrow: " \u2192 ",
  biarrow: " \u2194 ",
  randomsample: " \u2190$ ",
};

/**
 * Converts an expression into a string.
 * @param e - The expression that should be converted into a string
 * @returns The string equal to the expression `e`
 */
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

/**
 * Checks if an expression is contained in a list of expressions.
 * @param expr - The expression to search for
 * @param list - The list of expressions to search in
 * @returns `true` if the list contains an expression equal to `expr`
 */
export function exprListContains(expr: Expr, list: Expr[]): boolean {
  for (let i = 0; i < list.length; i++) {
    if (exprEquals(expr, list[i]!)) return true;
  }
  return false;
}

/**
 * Normalizes an expression by collapsing empty structures to slots.
 * A binary node is considered empty when its `op` is `null` and both children are slots.
 * A unary node is considered empty when its `op` is `null` and its operand is a slot.
 * @param e - The expression to normalize
 * @returns A new normalized expression
 */
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

/**
 * Converts a palette item to an expression.
 * Operator items become binary expressions with empty slots as placeholders for their operands.
 * @param item - The palette item to convert
 * @returns The corresponding expression
 */
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

/**
 * Converts a palette item to its string representation as expected by the parser.
 * @param item - The palette item to convert
 * @returns The string representation of the item
 */
export function paletteItemToString(item: PaletteItem): string {
  switch (item.kind) {
    case "var":
      return item.name;
    case "role":
      return item.name;
    case "int":
      return String(item.value);
    case "operator":
      return OP_TO_STRING[item.op] ?? item.op
    case "constantSymbol":
    case "unarySymbol":
    case "binarySymbol":
      return "\\" + item.op // Parser expects e.g. "\elem", "\natural", etc.
    case "LPAR":
      return "(";
    case "RPAR":
      return ")";
  }
}