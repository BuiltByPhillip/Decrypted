import { describe, it, expect } from "vitest";
import { tokenize, parseExpression, parse } from "../app/hooks/parser";

// ─── tokenize ────────────────────────────────────────────────────────────────

describe("tokenize", () => {
  it("tokenizes a number", () => {
    const tokens = tokenize("42");
    expect(tokens[0]).toEqual({ type: "NUMBER", value: "42" });
  });

  it("tokenizes a variable", () => {
    const tokens = tokenize("x");
    expect(tokens[0]).toEqual({ type: "VAR", value: "x" });
  });

  it("tokenizes a multi-char variable", () => {
    const tokens = tokenize("alice");
    expect(tokens[0]).toEqual({ type: "VAR", value: "alice" });
  });

  it("tokenizes single-char operators", () => {
    const ops = ["+", "-", "*", "/", "^", "<", ">", "="];
    for (const op of ops) {
      const tokens = tokenize(op);
      expect(tokens[0]).toEqual({ type: "OPERATOR", value: op });
    }
  });

  it("tokenizes multi-char operators: mod, and, or", () => {
    expect(tokenize("mod")[0]).toEqual({ type: "OPERATOR", value: "mod" });
    expect(tokenize("and")[0]).toEqual({ type: "OPERATOR", value: "and" });
    expect(tokenize("or")[0]).toEqual({ type: "OPERATOR", value: "or" });
  });

  it("tokenizes parentheses", () => {
    expect(tokenize("(")[0]).toEqual({ type: "LPAR", value: "(" });
    expect(tokenize(")")[0]).toEqual({ type: "RPAR", value: ")" });
  });

  it("tokenizes keyword symbols with backslash prefix", () => {
    expect(tokenize("\\elem")[0]).toEqual({ type: "KEYWORD", value: "elem" });
    expect(tokenize("\\forall")[0]).toEqual({ type: "KEYWORD", value: "forall" });
    expect(tokenize("\\reals")[0]).toEqual({ type: "KEYWORD", value: "reals" });
    expect(tokenize("\\naturals")[0]).toEqual({ type: "KEYWORD", value: "naturals" });
  });

  it("tokenizes role references", () => {
    expect(tokenize("{generator}")[0]).toEqual({ type: "ROLE_REF", value: "generator" });
  });

  it("tokenizes placeholders", () => {
    expect(tokenize("$1")[0]).toEqual({ type: "PLACEHOLDER", value: "$1" });
    expect(tokenize("$42")[0]).toEqual({ type: "PLACEHOLDER", value: "$42" });
  });

  it("skips whitespace", () => {
    const tokens = tokenize("  x  ");
    expect(tokens[0]).toEqual({ type: "VAR", value: "x" });
    expect(tokens[1]).toEqual({ type: "EOF", value: "" });
  });

  it("always ends with EOF", () => {
    const tokens = tokenize("x + y");
    expect(tokens[tokens.length - 1]).toEqual({ type: "EOF", value: "" });
  });

  it("throws on unknown characters", () => {
    expect(() => tokenize("@")).toThrow();
  });

  it("throws on unknown backslash command", () => {
    expect(() => tokenize("\\unknown")).toThrow();
  });
});

// ─── parseExpression ─────────────────────────────────────────────────────────

describe("parseExpression", () => {
  // --- Leaf nodes ---

  it("parses a variable", () => {
    expect(parseExpression("x")).toMatchObject({ kind: "var", name: "x" });
  });

  it("parses an integer", () => {
    expect(parseExpression("42")).toMatchObject({ kind: "int", value: 42 });
  });

  it("parses a role reference", () => {
    expect(parseExpression("{generator}")).toMatchObject({ kind: "role", name: "generator" });
  });

  it("parses a placeholder", () => {
    expect(parseExpression("$1")).toMatchObject({ kind: "placeholder", index: 1 });
  });

  // --- Constants ---

  it("parses \\reals as a constant", () => {
    expect(parseExpression("\\reals")).toMatchObject({ kind: "constant", symbol: "reals" });
  });

  it("parses \\naturals as a constant", () => {
    expect(parseExpression("\\naturals")).toMatchObject({ kind: "constant", symbol: "naturals" });
  });

  it("parses \\emptyset as a constant", () => {
    expect(parseExpression("\\emptyset")).toMatchObject({ kind: "constant", symbol: "emptyset" });
  });

  it("parses all constant symbols without throwing", () => {
    const constants = ["emptyset", "reals", "naturals", "integers", "rationals", "complex", "powerset", "universal"];
    for (const c of constants) {
      expect(() => parseExpression(`\\${c}`)).not.toThrow();
    }
  });

  // --- Unary ---

  it("parses \\forall with an operand", () => {
    expect(parseExpression("\\forall x")).toMatchObject({
      kind: "unary",
      op: "forall",
      operand: { kind: "var", name: "x" },
    });
  });

  it("parses \\exists with an operand", () => {
    expect(parseExpression("\\exists n")).toMatchObject({
      kind: "unary",
      op: "exists",
      operand: { kind: "var", name: "n" },
    });
  });

  // --- Binary arithmetic ---

  it("parses addition", () => {
    expect(parseExpression("a + b")).toMatchObject({
      kind: "binary", op: "add",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses subtraction", () => {
    expect(parseExpression("a - b")).toMatchObject({
      kind: "binary", op: "sub",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses multiplication", () => {
    expect(parseExpression("a * b")).toMatchObject({
      kind: "binary", op: "mul",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses division", () => {
    expect(parseExpression("a / b")).toMatchObject({
      kind: "binary", op: "div",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses power", () => {
    expect(parseExpression("a ^ b")).toMatchObject({
      kind: "binary", op: "pow",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses mod", () => {
    expect(parseExpression("a mod b")).toMatchObject({
      kind: "binary", op: "mod",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses logical and", () => {
    expect(parseExpression("a and b")).toMatchObject({
      kind: "binary", op: "and",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses logical or", () => {
    expect(parseExpression("a or b")).toMatchObject({
      kind: "binary", op: "or",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses comparison operators", () => {
    expect(parseExpression("a < b")).toMatchObject({ kind: "binary", op: "less" });
    expect(parseExpression("a > b")).toMatchObject({ kind: "binary", op: "greater" });
    expect(parseExpression("a = b")).toMatchObject({ kind: "binary", op: "equal" });
  });

  // --- Precedence ---

  it("* binds tighter than +: a + b * c → add(a, mul(b, c))", () => {
    const result = parseExpression("a + b * c");
    expect(result).toMatchObject({
      kind: "binary", op: "add",
      left: { kind: "var", name: "a" },
      right: {
        kind: "binary", op: "mul",
        left: { kind: "var", name: "b" },
        right: { kind: "var", name: "c" },
      },
    });
  });

  it("* binds tighter than +: a * b + c → add(mul(a, b), c)", () => {
    const result = parseExpression("a * b + c");
    expect(result).toMatchObject({
      kind: "binary", op: "add",
      left: {
        kind: "binary", op: "mul",
        left: { kind: "var", name: "a" },
        right: { kind: "var", name: "b" },
      },
      right: { kind: "var", name: "c" },
    });
  });

  it("^ binds tighter than *", () => {
    const result = parseExpression("a * b ^ c");
    expect(result).toMatchObject({
      kind: "binary", op: "mul",
      right: { kind: "binary", op: "pow" },
    });
  });

  it("and/or are weaker than comparisons", () => {
    const result = parseExpression("a < b and c > d");
    expect(result).toMatchObject({
      kind: "binary", op: "and",
      left: { kind: "binary", op: "less" },
      right: { kind: "binary", op: "greater" },
    });
  });

  // --- Parentheses ---

  it("parentheses override precedence: (a + b) * c → mul(add(a,b), c)", () => {
    const result = parseExpression("(a + b) * c");
    expect(result).toMatchObject({
      kind: "binary", op: "mul",
      left: {
        kind: "binary", op: "add",
        left: { kind: "var", name: "a" },
        right: { kind: "var", name: "b" },
      },
      right: { kind: "var", name: "c" },
    });
  });

  it("throws on unclosed parenthesis", () => {
    expect(() => parseExpression("(a + b")).toThrow();
  });

  // --- Binary symbols (via keyword infix) ---
  // These require the while loop in parseExpression to handle KEYWORD tokens.
  // If these tests fail, extend parseExpression to accept KEYWORD as infix operators.

  it("parses \\elem as a binary infix operator", () => {
    const result = parseExpression("a \\elem \\naturals");
    expect(result).toMatchObject({
      kind: "binary", op: "elem",
      left: { kind: "var", name: "a" },
      right: { kind: "constant", symbol: "naturals" },
    });
  });

  it("parses \\subset as a binary infix operator", () => {
    const result = parseExpression("A \\subset B");
    expect(result).toMatchObject({
      kind: "binary", op: "subset",
      left: { kind: "var", name: "A" },
      right: { kind: "var", name: "B" },
    });
  });

  it("parses \\union as a binary infix operator", () => {
    expect(parseExpression("A \\union B")).toMatchObject({ kind: "binary", op: "union" });
  });

  it("parses \\rightarrow as a binary infix operator", () => {
    expect(parseExpression("a \\rightarrow b")).toMatchObject({ kind: "binary", op: "rightarrow" });
  });

  // --- Trailing tokens (regression for silent-ignore bug) ---

  it("throws on trailing token after valid expression", () => {
    expect(() => parseExpression("a + b c")).toThrow();
  });

  it("throws on trailing variable after g ^ a mod p", () => {
    expect(() => parseExpression("g ^ a mod p j")).toThrow();
  });

  it("throws on trailing number after expression", () => {
    expect(() => parseExpression("a + b 3")).toThrow();
  });
});

// ─── define block parsing ─────────────────────────────────────────────────────

describe("define block parsing", () => {
  it("parses a multi-element set", () => {
    const dsl = `protocol: Test
define:
    generator \\elem {g, x, a}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.symbols).toHaveLength(3);
  });

  it("parses a single-element set {g} (regression for ROLE_REF bug)", () => {
    const dsl = `protocol: Test
define:
    generator \\elem {g}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.symbols).toHaveLength(1);
    expect(result.information.definition[0]?.symbols[0]).toMatchObject({ kind: "var", name: "g" });
  });

  it("throws on duplicate symbols in a definition", () => {
    const dsl = `protocol: Test
define:
    generator \\elem {g, g, x}`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on missing \\elem", () => {
    const dsl = `protocol: Test
define:
    generator {g, x}`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("error message includes the line number", () => {
    const dsl = `protocol: Test
define:
    generator \\elem {g, g}`;
    expect(() => parse(dsl, 0)).toThrow(/Line 3/);
  });

  it("parses the role name correctly", () => {
    const dsl = `protocol: Test
define:
    prime \\elem {p, q}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.role).toBe("prime");
  });

  it("parses multiple definitions", () => {
    const dsl = `protocol: Test
define:
    generator \\elem {g, x}
    prime \\elem {p, q}`;
    const result = parse(dsl, 0);
    expect(result.information.definition).toHaveLength(2);
  });
});

// ─── construct exercise parsing ───────────────────────────────────────────────

describe("construct exercise parsing", () => {
  const constructDsl = `protocol: Test
define:
    generator \\elem {g, x}
    prime \\elem {p, q}
    secret \\elem {a, b}
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: {generator}, {secret}, {prime}, ^, mod
        answer: {generator} ^ {secret} mod {prime}`;

  it("parses a construct exercise without throwing", () => {
    expect(() => parse(constructDsl, 0)).not.toThrow();
  });

  it("parses the palette items", () => {
    const result = parse(constructDsl, 0);
    expect(result.step[0]?.exercise?.palette).toHaveLength(5);
  });

  it("parses the answer expression", () => {
    const result = parse(constructDsl, 0);
    expect(result.step[0]?.exercise?.answer).toHaveLength(1);
  });

  it("throws when construct exercise has no palette", () => {
    const dsl = `protocol: Test
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        answer: g ^ a mod p`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws when construct exercise has no answer", () => {
    const dsl = `protocol: Test
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: g, a, p, ^, mod`;
    expect(() => parse(dsl, 0)).toThrow();
  });
});

// ─── select exercise parsing ──────────────────────────────────────────────────

describe("select exercise parsing", () => {
  const selectDsl = `protocol: Test
step:
    description: Choose a value
    exercise:
        type: select
        prompt: Pick the right one
        options:
            - 1
            - 7
            - 23
        answer: 7`;

  it("parses a select exercise without throwing", () => {
    expect(() => parse(selectDsl, 0)).not.toThrow();
  });

  it("parses the correct number of options", () => {
    const result = parse(selectDsl, 0);
    expect(result.step[0]?.exercise?.options).toHaveLength(3);
  });

  it("parses the answer", () => {
    const result = parse(selectDsl, 0);
    expect(result.step[0]?.exercise?.answer?.[0]).toMatchObject({ kind: "int", value: 7 });
  });

  it("throws when select exercise has no options", () => {
    const dsl = `protocol: Test
step:
    description: Choose a value
    exercise:
        type: select
        prompt: Pick the right one
        answer: 7`;
    expect(() => parse(dsl, 0)).toThrow();
  });
});

// ─── general parse errors ─────────────────────────────────────────────────────

describe("parse error messages", () => {
  it("includes line number in error for invalid exercise type", () => {
    const dsl = `protocol: Test
step:
    description: Step
    exercise:
        type: invalid
        prompt: Prompt
        answer: x`;
    expect(() => parse(dsl, 0)).toThrow(/Line 5/);
  });

  it("throws on a step with no description", () => {
    const dsl = `protocol: Test
step:
    exercise:
        type: select
        prompt: Pick one
        options:
            - 1
        answer: 1`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on unknown top-level keyword", () => {
    expect(() => parse("unknown: value", 0)).toThrow();
  });
});

// ─── match exercise parsing ───────────────────────────────────────────────────

describe("match exercise parsing", () => {
  const matchDsl = `protocol: Test
step:
    description: Test step
    exercise:
        type: match
        prompt: Match the values
        pairs:
            - 0 -> Always produces 1
            - {prime}-1 -> Reveals group structure
            - 7 -> Valid choice`;

  it("parses a match exercise without throwing", () => {
    expect(() => parse(matchDsl, 0)).not.toThrow();
  });

  it("parses the correct number of pairs", () => {
    const result = parse(matchDsl, 0);
    expect(result.step[0]?.exercise?.pairs).toHaveLength(3);
  });

  it("parses pair left sides as strings", () => {
    const result = parse(matchDsl, 0);
    const pairs = result.step[0]?.exercise?.pairs!;
    expect(pairs[0]?.left).toBe("0");
    expect(pairs[1]?.left).toBe("{prime}-1");
    expect(pairs[2]?.left).toBe("7");
  });

  it("parses pair right sides as plain strings", () => {
    const result = parse(matchDsl, 0);
    const pairs = result.step[0]?.exercise?.pairs!;
    expect(pairs[0]?.right).toBe("Always produces 1");
    expect(pairs[1]?.right).toBe("Reveals group structure");
    expect(pairs[2]?.right).toBe("Valid choice");
  });

  it("throws when match exercise has no pairs", () => {
    const dsl = `protocol: Test
step:
    description: Test step
    exercise:
        type: match
        prompt: Match the values`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("does not require an answer field for match exercises", () => {
    const result = parse(matchDsl, 0);
    expect(result.step[0]?.exercise?.answer).toBeUndefined();
  });
});
