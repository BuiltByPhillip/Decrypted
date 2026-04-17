import { describe, it, expect } from "vitest";
import { tokenize, parseExpression, parse, collectRole } from "../app/hooks/parser";

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

  it("throws on placeholder syntax", () => {
    expect(() => tokenize("$1")).toThrow("Placeholder syntax ($1, $2, ...) is not supported");
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

  it("tokenizes a variable with an underscore", () => {
    expect(tokenize("_x")[0]).toEqual({ type: "VAR", value: "_x" });
    expect(tokenize("count_n")[0]).toEqual({ type: "VAR", value: "count_n" });
  });

  it("tokenizes a variable with a prime", () => {
    expect(tokenize("x'")[0]).toEqual({ type: "VAR", value: "x'" });
  });

  it("tokenizes a comma", () => {
    expect(tokenize(",")[0]).toEqual({ type: "COMMA", value: "," });
  });

  it("does not split 'android' into operator + var", () => {
    const tokens = tokenize("android");
    expect(tokens[0]).toEqual({ type: "VAR", value: "android" });
    expect(tokens[1]).toEqual({ type: "EOF", value: "" });
  });

  it("does not split 'modulo' into operator + var", () => {
    const tokens = tokenize("modulo");
    expect(tokens[0]).toEqual({ type: "VAR", value: "modulo" });
    expect(tokens[1]).toEqual({ type: "EOF", value: "" });
  });

  it("does not split 'orbit' into operator + var", () => {
    const tokens = tokenize("orbit");
    expect(tokens[0]).toEqual({ type: "VAR", value: "orbit" });
    expect(tokens[1]).toEqual({ type: "EOF", value: "" });
  });

  it("still tokenizes 'mod' alone as an operator", () => {
    expect(tokenize("mod")[0]).toEqual({ type: "OPERATOR", value: "mod" });
  });

  it("still tokenizes 'and' alone as an operator", () => {
    expect(tokenize("and")[0]).toEqual({ type: "OPERATOR", value: "and" });
  });

  it("still tokenizes 'or' alone as an operator", () => {
    expect(tokenize("or")[0]).toEqual({ type: "OPERATOR", value: "or" });
  });

  it("digits are not part of a variable name: x1 → VAR('x') + NUMBER('1')", () => {
    const tokens = tokenize("x1");
    expect(tokens[0]).toEqual({ type: "VAR", value: "x" });
    expect(tokens[1]).toEqual({ type: "NUMBER", value: "1" });
  });

  it("a number followed immediately by a letter: 42x → NUMBER('42') + VAR('x')", () => {
    const tokens = tokenize("42x");
    expect(tokens[0]).toEqual({ type: "NUMBER", value: "42" });
    expect(tokens[1]).toEqual({ type: "VAR", value: "x" });
  });

  it("tokenizes operators without surrounding spaces: a+b → 3 tokens", () => {
    const tokens = tokenize("a+b");
    expect(tokens[0]).toEqual({ type: "VAR", value: "a" });
    expect(tokens[1]).toEqual({ type: "OPERATOR", value: "+" });
    expect(tokens[2]).toEqual({ type: "VAR", value: "b" });
  });

  it("throws on $ with no digits", () => {
    expect(() => tokenize("$")).toThrow();
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

  it("throws on missing right operand", () => {
    expect(() => parseExpression("a +")).toThrow();
  });

  it("throws on empty input", () => {
    expect(() => parseExpression("")).toThrow();
  });

  it("throws on unregistered custom operator used in infix position", () => {
    expect(() => parseExpression("a SET b", [])).toThrow();
  });

  it("^ is left-associative: a ^ b ^ c → pow(pow(a,b), c)", () => {
    const result = parseExpression("a ^ b ^ c");
    expect(result).toMatchObject({
      kind: "binary", op: "pow",
      left: { kind: "binary", op: "pow", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } },
      right: { kind: "var", name: "c" },
    });
  });

  it("handles deeply nested parentheses", () => {
    expect(parseExpression("((a + b))")).toMatchObject({
      kind: "binary", op: "add",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("mod is left-associative: a mod b mod c → mod(mod(a,b), c)", () => {
    const result = parseExpression("a mod b mod c");
    expect(result).toMatchObject({
      kind: "binary", op: "mod",
      left: { kind: "binary", op: "mod", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } },
      right: { kind: "var", name: "c" },
    });
  });

  it("mixed same-precedence ops are left-associative: a + b - c → sub(add(a,b), c)", () => {
    const result = parseExpression("a + b - c");
    expect(result).toMatchObject({
      kind: "binary", op: "sub",
      left: { kind: "binary", op: "add", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } },
      right: { kind: "var", name: "c" },
    });
  });

  it("nested unary: \\forall \\forall x", () => {
    const result = parseExpression("\\forall \\forall x");
    expect(result).toMatchObject({
      kind: "unary", op: "forall",
      operand: { kind: "unary", op: "forall", operand: { kind: "var", name: "x" } },
    });
  });
});

// ─── define block parsing ─────────────────────────────────────────────────────

describe("define block parsing", () => {
  it("parses a multi-element set", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, x, a}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.symbols).toHaveLength(3);
  });

  it("parses a single-element set {g} (regression for ROLE_REF bug)", () => {
    const dsl = `title: Test
define:
    generator \\elem {g}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.symbols).toHaveLength(1);
    expect(result.information.definition[0]?.symbols[0]).toMatchObject({ kind: "var", name: "g" });
  });

  it("throws on duplicate symbols in a definition", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, g, x}`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on missing \\elem", () => {
    const dsl = `title: Test
define:
    generator {g, x}`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("error message includes the line number", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, g}`;
    expect(() => parse(dsl, 0)).toThrow(/Line 3/);
  });

  it("parses the role name correctly", () => {
    const dsl = `title: Test
define:
    prime \\elem {p, q}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.role).toBe("prime");
  });

  it("parses multiple definitions", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, x}
    prime \\elem {p, q}`;
    const result = parse(dsl, 0);
    expect(result.information.definition).toHaveLength(2);
  });

  it("parses numbers as valid symbols", () => {
    const dsl = `title: Test
define:
    exponent \\elem {2, 3, 65537}`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.symbols).toHaveLength(3);
    expect(result.information.definition[0]?.symbols[0]).toMatchObject({ kind: "int", value: 2 });
  });

  it("throws on duplicate numbers in a definition", () => {
    const dsl = `title: Test
define:
    exponent \\elem {2, 2}`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on empty symbol set", () => {
    const dsl = `title: Test
define:
    generator \\elem {}`;
    expect(() => parse(dsl, 0)).toThrow();
  });
});

describe("construct define block parsing", () => {
  it("parses a variables line into multiple definitions", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, prime, alice_secret`;
    const result = parse(dsl, 0);
    expect(result.information.definition).toHaveLength(3);
  });

  it("parses role names correctly", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, prime`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.role).toBe("generator");
    expect(result.information.definition[1]?.role).toBe("prime");
  });

  it("sets type to construct on each definition", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, prime`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.type).toBe("construct");
    expect(result.information.definition[1]?.type).toBe("construct");
  });

  it("sets symbols to empty array for each definition", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, prime`;
    const result = parse(dsl, 0);
    expect(result.information.definition[0]?.symbols).toHaveLength(0);
    expect(result.information.definition[1]?.symbols).toHaveLength(0);
  });

  it("throws when variables: is used without type: construct", () => {
    const dsl = `title: Test
define:
    variables: generator, prime`;
    expect(() => parse(dsl, 0)).toThrow(/'variables:' is only valid for type 'construct'/);
  });

  it("throws when variables: is used with type: select", () => {
    const dsl = `title: Test
define:
    type: select
    variables: generator, prime`;
    expect(() => parse(dsl, 0)).toThrow(/'variables:' is only valid for type 'construct'/);
  });
});

// ─── construct exercise parsing ───────────────────────────────────────────────

describe("construct exercise parsing", () => {
  const constructDsl = `title: Test
define:
    generator \\elem {g, x}
    prime \\elem {p, q}
    secret \\elem {a, b}
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        answer: {generator} ^ {secret} mod {prime}`;

  it("parses a construct exercise without throwing", () => {
    expect(() => parse(constructDsl, 0)).not.toThrow();
  });

  it("parses the answer expression", () => {
    const result = parse(constructDsl, 0);
    expect(result.step[0]?.exercise?.answer).toHaveLength(1);
  });

  it("throws when construct exercise has no answer", () => {
    const dsl = `title: Test
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("parses a single palette category", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    secret \\elem {x, y}
    prime \\elem {p, q}
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: ARITHMETIC_OPERATORS
        answer: {generator} ^ {secret} mod {prime}`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.palette).toEqual(["ARITHMETIC_OPERATORS"]);
  });

  it("parses multiple palette categories", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    secret \\elem {x, y}
    prime \\elem {p, q}
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: ARITHMETIC_OPERATORS, LOGICAL_OPERATORS
        answer: {generator} ^ {secret} mod {prime}`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.palette).toEqual(["ARITHMETIC_OPERATORS", "LOGICAL_OPERATORS"]);
  });

  it("throws on unknown palette category", () => {
    const dsl = `title: Test
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: ARITHMATIC_OPERATORS
        answer: {generator} ^ {secret} mod {prime}`;
    expect(() => parse(dsl, 0)).toThrow(/Unknown palette category/i);
  });

  it("throws when palette is defined multiple times", () => {
    const dsl = `title: Test
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: ARITHMETIC_OPERATORS
        palette: LOGICAL_OPERATORS
        answer: {generator} ^ {secret} mod {prime}`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("parses all valid palette categories without throwing", () => {
    const categories = [
      "ARITHMETIC_OPERATORS",
      "LOGICAL_OPERATORS",
      "COMPARISON_OPERATORS",
      "SET_THEORY_SYMBOLS",
      "CRYPTOGRAPHIC_SYMBOLS",
      "PROTOCOL_SYMBOLS",
      "NUMBER_THEORY_SYMBOLS",
      "QUANTIFIER_SYMBOLS",
      "NUMBER_SET_CONSTANTS",
    ];
    for (const category of categories) {
      const dsl = `title: Test
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        palette: ${category}
        answer: a`;
      expect(() => parse(dsl, 0)).not.toThrow();
    }
  });
});

// ─── select exercise parsing ──────────────────────────────────────────────────

describe("select exercise parsing", () => {
  const selectDsl = `title: Test
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
    const dsl = `title: Test
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
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: invalid
        prompt: Prompt
        answer: x`;
    expect(() => parse(dsl, 0)).toThrow(/Line 5/);
  });

  it("throws on a step with no description", () => {
    const dsl = `title: Test
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

  it("throws when answer is defined multiple times", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g
        answer: g ^ a`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("throws when prompt is defined multiple times", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: First prompt
        prompt: Second prompt
        answer: g`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("throws when exercise type is defined multiple times", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        type: select
        prompt: Build it
        answer: g`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("throws on multiple define blocks", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, x}
define:
    prime \\elem {p, q}`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });
});

// ─── match exercise parsing ───────────────────────────────────────────────────

describe("match exercise parsing", () => {
  const matchDsl = `title: Test
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
    const dsl = `title: Test
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

  it("throws on a pair with no -> separator", () => {
    const dsl = `title: Test
step:
    description: Test step
    exercise:
        type: match
        prompt: Match the values
        pairs:
            - just a label`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on a pair with multiple -> separators", () => {
    const dsl = `title: Test
step:
    description: Test step
    exercise:
        type: match
        prompt: Match the values
        pairs:
            - a -> b -> c`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on a pair with empty left and right sides", () => {
    const dsl = `title: Test
step:
    description: Test step
    exercise:
        type: match
        prompt: Match the values
        pairs:
            - ->`;
    expect(() => parse(dsl, 0)).toThrow();
  });
});

// ─── custom operator block parsing ───────────────────────────────────────────

describe("customParse - parseOperatorDef", () => {
  const binaryDsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        commutative: true
        precedence: 3
define:
    generator \\elem {g, x}`;

  const unaryDsl = `title: Test
custom:
    operator:
        name: HASH
        type: UNARY
        commutative: false
        precedence: 4`;

  it("parses a BINARY custom operator without throwing", () => {
    expect(() => parse(binaryDsl, 0)).not.toThrow();
  });

  it("stores the custom operator in code.customOperators", () => {
    const result = parse(binaryDsl, 0);
    expect(result.customOperators).toHaveLength(1);
  });

  it("parses the operator name correctly", () => {
    const result = parse(binaryDsl, 0);
    expect(result.customOperators[0]?.name).toBe("SET");
  });

  it("parses the operator type correctly", () => {
    const result = parse(binaryDsl, 0);
    expect(result.customOperators[0]?.type).toBe("BINARY");
  });

  it("parses commutative: true correctly", () => {
    const result = parse(binaryDsl, 0);
    expect(result.customOperators[0]?.commutative).toBe(true);
  });

  it("parses commutative: false correctly", () => {
    const result = parse(unaryDsl, 0);
    expect(result.customOperators[0]?.commutative).toBe(false);
  });

  it("parses the precedence correctly", () => {
    const result = parse(binaryDsl, 0);
    expect(result.customOperators[0]?.precedence).toBe(3);
  });

  it("parses a UNARY custom operator", () => {
    const result = parse(unaryDsl, 0);
    expect(result.customOperators[0]?.type).toBe("UNARY");
  });

  it("defaults commutative to false when omitted", () => {
    const dsl = `title: Test
custom:
    operator:
        name: XOP
        type: BINARY
        precedence: 2`;
    const result = parse(dsl, 0);
    expect(result.customOperators[0]?.commutative).toBe(false);
  });

  it("parses multiple custom operators", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        precedence: 3
    operator:
        name: HASH
        type: UNARY
        precedence: 4`;
    const result = parse(dsl, 0);
    expect(result.customOperators).toHaveLength(2);
    expect(result.customOperators[0]?.name).toBe("SET");
    expect(result.customOperators[1]?.name).toBe("HASH");
  });

  it("throws when name is missing", () => {
    const dsl = `title: Test
custom:
    operator:
        type: BINARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/name/i);
  });

  it("throws when type is missing", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/type/i);
  });

  it("throws when precedence is missing", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY`;
    expect(() => parse(dsl, 0)).toThrow(/precedence/i);
  });

  it("throws on invalid type value", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: TERNARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on non-numeric precedence", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        precedence: fast`;
    expect(() => parse(dsl, 0)).toThrow(/number/i);
  });

  it("throws on negative precedence", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        precedence: -1`;
    expect(() => parse(dsl, 0)).toThrow();
  });

  it("throws on duplicate name field", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        name: SET2
        type: BINARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("throws on duplicate type field", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        type: UNARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("throws on duplicate precedence field", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        precedence: 3
        precedence: 4`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("code.customOperators is empty when no custom block is present", () => {
    const result = parse(`title: Test`, 0);
    expect(result.customOperators).toHaveLength(0);
  });

  it("throws when name conflicts with a built-in arithmetic operator", () => {
    const dsl = `title: Test
custom:
    operator:
        name: mod
        type: BINARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/conflicts with built-in operator/i);
  });

  it("throws when name conflicts with a built-in operator regardless of case", () => {
    const dsl = `title: Test
custom:
    operator:
        name: MOD
        type: BINARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/conflicts with built-in operator/i);
  });

  it("preserves the original case of the operator name", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        precedence: 3`;
    const result = parse(dsl, 0);
    expect(result.customOperators[0]?.name).toBe("SET");
  });

  it("throws when name conflicts with a binary symbol", () => {
    const dsl = `title: Test
custom:
    operator:
        name: xor
        type: BINARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/conflicts with built-in operator/i);
  });

  it("throws when name conflicts with a unary symbol", () => {
    const dsl = `title: Test
custom:
    operator:
        name: forall
        type: UNARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/conflicts with built-in operator/i);
  });

  it("throws when name conflicts with a constant symbol", () => {
    const dsl = `title: Test
custom:
    operator:
        name: reals
        type: UNARY
        precedence: 3`;
    expect(() => parse(dsl, 0)).toThrow(/conflicts with built-in operator/i);
  });
});

// ─── custom operator expression parsing ──────────────────────────────────────

describe("custom operator expression parsing", () => {
  const binaryOps = [{ name: "SET", type: "BINARY" as const, commutative: true, precedence: 3 }];
  const unaryOps  = [{ name: "HASH", type: "UNARY" as const, commutative: false, precedence: 4 }];

  it("parses a BINARY custom operator as infix: a SET b", () => {
    const result = parseExpression("a SET b", binaryOps);
    expect(result).toMatchObject({
      kind: "binary",
      op: "SET",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("parses a UNARY custom operator as prefix: HASH x", () => {
    const result = parseExpression("HASH x", unaryOps);
    expect(result).toMatchObject({
      kind: "unary",
      op: "HASH",
      operand: { kind: "var", name: "x" },
    });
  });

  it("custom BINARY operator respects its precedence (lower than ^)", () => {
    // SET has precedence 3 (same as *), ^ has precedence 5 — so a ^ b SET c ^ d
    // should parse as (a^b) SET (c^d)
    const result = parseExpression("a ^ b SET c ^ d", binaryOps);
    expect(result).toMatchObject({
      kind: "binary",
      op: "SET",
      left: { kind: "binary", op: "pow" },
      right: { kind: "binary", op: "pow" },
    });
  });

  it("custom BINARY operator with lower precedence than + groups loosely", () => {
    // precedence 0 means weaker than and/or
    const weakOps = [{ name: "WEAK", type: "BINARY" as const, commutative: false, precedence: 0 }];
    const result = parseExpression("a + b WEAK c + d", weakOps);
    expect(result).toMatchObject({
      kind: "binary",
      op: "WEAK",
      left: { kind: "binary", op: "add" },
      right: { kind: "binary", op: "add" },
    });
  });

  it("unknown VAR name is NOT treated as a custom operator", () => {
    // Without registering SET, it should be parsed as a plain variable
    const result = parseExpression("SET", []);
    expect(result).toMatchObject({ kind: "var", name: "SET" });
  });

  it("answer expression using custom BINARY operator parses correctly via full DSL", () => {
    const dsl = `title: Test
custom:
    operator:
        name: SET
        type: BINARY
        commutative: false
        precedence: 3
step:
    description: Test
    exercise:
        type: construct
        prompt: Use SET
        answer: a SET b`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.answer?.[0]).toMatchObject({
      kind: "binary",
      op: "SET",
      left: { kind: "var", name: "a" },
      right: { kind: "var", name: "b" },
    });
  });

  it("answer expression using custom UNARY operator parses correctly via full DSL", () => {
    const dsl = `title: Test
custom:
    operator:
        name: HASH
        type: UNARY
        commutative: false
        precedence: 4
step:
    description: Test
    exercise:
        type: construct
        prompt: Use HASH
        answer: HASH x`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.answer?.[0]).toMatchObject({
      kind: "unary",
      op: "HASH",
      operand: { kind: "var", name: "x" },
    });
  });
});

// ─── prefill parsing ──────────────────────────────────────────────────────────

describe("prefill parsing", () => {
  const base = (prefill: string, answer = "{generator} ^ {secret} mod {prime}") => `title: Test
define:
    generator \\elem {g, x}
    prime \\elem {p, q}
    secret \\elem {a, b}
step:
    description: Compute public key
    exercise:
        type: construct
        prompt: Build the expression
        answer: ${answer}
        prefill: ${prefill}`;

  it("parses a simple variable prefill", () => {
    const result = parse(base("g", "g ^ {secret} mod {prime}"), 0);
    expect(result.step[0]?.exercise?.prefill).toContainEqual({ kind: "var", name: "g" });
  });

  it("parses an operator prefill", () => {
    const result = parse(base("mod"), 0);
    expect(result.step[0]?.exercise?.prefill).toContainEqual({ kind: "operator", op: "mod" });
  });

  it("parses a number prefill", () => {
    const result = parse(base("42", "{generator} + 42"), 0);
    expect(result.step[0]?.exercise?.prefill).toContainEqual({ kind: "int", value: 42 });
  });

  it("parses a role reference prefill", () => {
    const result = parse(base("{prime}"), 0);
    expect(result.step[0]?.exercise?.prefill).toContainEqual({ kind: "role", name: "prime" });
  });

  it("parses multiple tokens in a prefill", () => {
    const result = parse(base("g ^ a", "g ^ a mod {prime}"), 0);
    const prefill = result.step[0]?.exercise?.prefill!;
    expect(prefill).toContainEqual({ kind: "var", name: "g" });
    expect(prefill).toContainEqual({ kind: "operator", op: "^" });
    expect(prefill).toContainEqual({ kind: "var", name: "a" });
  });

  it("parses a realistic partial expression: mod {prime}", () => {
    const result = parse(base("mod {prime}"), 0);
    const prefill = result.step[0]?.exercise?.prefill!;
    expect(prefill).toContainEqual({ kind: "operator", op: "mod" });
    expect(prefill).toContainEqual({ kind: "role", name: "prime" });
  });

  it("parses a keyword symbol in prefill", () => {
    const result = parse(base("\\elem", "{generator} \\elem {prime}"), 0);
    expect(result.step[0]?.exercise?.prefill).toContainEqual({ kind: "binarySymbol", op: "elem" });
  });

  it("parses parentheses in prefill", () => {
    // LPAR/RPAR are structural and always valid - validation skips them
    const result = parse(base("( g )", "g ^ {secret}"), 0);
    const prefill = result.step[0]?.exercise?.prefill!;
    expect(prefill).toContainEqual({ kind: "LPAR" });
    expect(prefill).toContainEqual({ kind: "RPAR" });
  });

  it("prefill is undefined when not specified", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.prefill).toBeUndefined();
  });

  it("throws when prefill is defined multiple times", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g
        prefill: g
        prefill: a`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });

  it("throws for a placeholder token in prefill", () => {
    expect(() => parse(base("$1"), 0)).toThrow();
  });

  it("throws for a comma in prefill", () => {
    expect(() => parse(base("g , a"), 0)).toThrow();
  });

  it("throws for an unknown keyword in prefill", () => {
    expect(() => parse(base("\\unknown"), 0)).toThrow();
  });

  it("throws when prefill token does not appear in the answer", () => {
    // 'z' is a var not present in the default answer expression
    expect(() => parse(base("z"), 0)).toThrow(/does not appear in the answer/i);
  });

  it("throws when prefill operator appears more times than in answer", () => {
    // answer has one 'mod'; prefill has two - second 'mod' has no remaining position in the answer
    expect(() => parse(base("mod mod"), 0)).toThrow();
  });

  it("throws when prefill tokens are in the wrong order relative to the answer", () => {
    // answer is {generator} ^ {secret} mod {prime}: 'mod' comes after '{generator}'
    expect(() => parse(base("mod {generator}"), 0)).toThrow(/out of order/i);
  });

  it("allows non-contiguous prefill tokens that appear in the correct order", () => {
    // {generator} and {prime} are both in the answer and {generator} comes before {prime}
    expect(() => parse(base("{generator} {prime}"), 0)).not.toThrow();
  });

  it("error message includes line number for invalid prefill token", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g
        prefill: $1`;
    expect(() => parse(dsl, 0)).toThrow(/Line 8/);
  });
});

// ─── hint field ───────────────────────────────────────────────────────────────

describe("hint field parsing", () => {
  it("parses a hint on a construct exercise", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g
        hint: Try using the generator`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.hint).toBe("Try using the generator");
  });

  it("parses a hint on a select exercise", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: select
        prompt: Pick one
        options:
            - 1
            - 2
        answer: 1
        hint: Think about it`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.hint).toBe("Think about it");
  });

  it("hint is undefined when not specified", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.exercise?.hint).toBeUndefined();
  });

  it("throws when hint is defined multiple times", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: g
        hint: First hint
        hint: Second hint`;
    expect(() => parse(dsl, 0)).toThrow(/multiple times/i);
  });
});

// ─── calculate exercise parsing ───────────────────────────────────────────────

describe("calculate exercise parsing", () => {
  const calculateDsl = `title: Test
step:
    description: Compute the value
    exercise:
        type: calculate
        prompt: What is g ^ a mod p?
        answer: g ^ a mod p`;

  it("parses a calculate exercise without throwing", () => {
    expect(() => parse(calculateDsl, 0)).not.toThrow();
  });

  it("parses the exercise type as calculate", () => {
    const result = parse(calculateDsl, 0);
    expect(result.step[0]?.exercise?.type).toBe("calculate");
  });

  it("parses the answer expression", () => {
    const result = parse(calculateDsl, 0);
    expect(result.step[0]?.exercise?.answer).toHaveLength(1);
    expect(result.step[0]?.exercise?.answer?.[0]).toMatchObject({ kind: "binary", op: "mod" });
  });

  it("throws when calculate exercise has no answer", () => {
    const dsl = `title: Test
step:
    description: Compute the value
    exercise:
        type: calculate
        prompt: What is g ^ a mod p?`;
    expect(() => parse(dsl, 0)).toThrow();
  });
});

// ─── step without exercise ────────────────────────────────────────────────────

describe("step without exercise", () => {
  it("parses a step that has only a description", () => {
    const dsl = `title: Test
step:
    description: Just some context`;
    const result = parse(dsl, 0);
    expect(result.step[0]?.description).toBe("Just some context");
    expect(result.step[0]?.exercise).toBeUndefined();
  });

  it("parses multiple steps where some have no exercise", () => {
    const dsl = `title: Test
step:
    description: Context step
step:
    description: Exercise step
    exercise:
        type: construct
        prompt: Build it
        answer: g`;
    const result = parse(dsl, 0);
    expect(result.step).toHaveLength(2);
    expect(result.step[0]?.exercise).toBeUndefined();
    expect(result.step[1]?.exercise).toBeDefined();
  });
});

// ─── collectRole ─────────────────────────────────────────────────────────────

describe("collectRole", () => {
  it("returns empty set for a var leaf", () => {
    const result = collectRole({ kind: "var", name: "x" }, new Set());
    expect(result).toEqual(new Set());
  });

  it("returns empty set for an int leaf", () => {
    const result = collectRole({ kind: "int", value: 42 }, new Set());
    expect(result).toEqual(new Set());
  });


  it("collects a single role name", () => {
    const result = collectRole({ kind: "role", name: "prime" }, new Set());
    expect(result).toEqual(new Set(["prime"]));
  });

  it("preserves existing entries in acc", () => {
    const result = collectRole({ kind: "role", name: "prime" }, new Set(["generator"]));
    expect(result).toEqual(new Set(["generator", "prime"]));
  });

  it("does not add duplicates for the same role name", () => {
    const result = collectRole({ kind: "role", name: "prime" }, new Set(["prime"]));
    expect(result).toEqual(new Set(["prime"]));
  });

  it("collects role from a unary expression", () => {
    const result = collectRole(
      { kind: "unary", op: "forall", operand: { kind: "role", name: "prime" } },
      new Set()
    );
    expect(result).toEqual(new Set(["prime"]));
  });

  it("collects roles from both sides of a binary expression", () => {
    const result = collectRole(
      {
        kind: "binary",
        op: "add",
        left: { kind: "role", name: "generator" },
        right: { kind: "role", name: "prime" },
      },
      new Set()
    );
    expect(result).toEqual(new Set(["generator", "prime"]));
  });

  it("collects roles from a deeply nested expression", () => {
    const result = collectRole(
      {
        kind: "binary",
        op: "add",
        left: {
          kind: "binary",
          op: "mul",
          left: { kind: "role", name: "generator" },
          right: { kind: "var", name: "x" },
        },
        right: { kind: "role", name: "prime" },
      },
      new Set()
    );
    expect(result).toEqual(new Set(["generator", "prime"]));
  });

  it("returns empty set when no roles exist anywhere in the tree", () => {
    const result = collectRole(
      {
        kind: "binary",
        op: "add",
        left: { kind: "var", name: "a" },
        right: { kind: "int", value: 1 },
      },
      new Set()
    );
    expect(result).toEqual(new Set());
  });
});

// ─── validateCode (via parse) ─────────────────────────────────────────────────

describe("validateCode", () => {
  it("does not throw when all roles in answer are defined", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: {generator}`;
    expect(() => parse(dsl)).not.toThrow();
  });

  it("throws when a role in answer is not defined", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: {prime}`;
    expect(() => parse(dsl)).toThrow("Role '{prime}' is used but not defined in the define: block");
  });

  it("throws when a role in options is not defined", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
step:
    description: Step
    exercise:
        type: select
        prompt: Pick one
        options:
            - {generator}
            - {prime}
        answer: {generator}`;
    expect(() => parse(dsl)).toThrow("Role '{prime}' is used but not defined in the define: block");
  });

  it("does not throw when no roles are used and define block is absent", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: x + y`;
    expect(() => parse(dsl)).not.toThrow();
  });

  it("throws when a role is used but define block is entirely absent", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: {prime}`;
    expect(() => parse(dsl)).toThrow("Role '{prime}' is used but not defined in the define: block");
  });

  it("does not throw when multiple roles are all defined", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    prime \\elem {p, q}
step:
    description: Step
    exercise:
        type: construct
        prompt: Build it
        answer: {generator} + {prime}`;
    expect(() => parse(dsl)).not.toThrow();
  });
});

// ─── duplicate role definitions ───────────────────────────────────────────────

describe("duplicate role definitions", () => {
  it("throws when the same role is defined twice", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    generator \\elem {x, y}`;
    expect(() => parse(dsl)).toThrow();
  });

  it("does not throw when two different roles are defined", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    prime \\elem {p, q}`;
    expect(() => parse(dsl)).not.toThrow();
  });
});

// ─── duplicate symbols across roles ──────────────────────────────────────────

describe("duplicate symbols across roles", () => {
  it("throws when the same symbol appears in two different roles", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    prime \\elem {p, a}`;
    expect(() => parse(dsl)).toThrow();
  });

  it("does not throw when all symbols are unique across roles", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    prime \\elem {p, q}`;
    expect(() => parse(dsl)).not.toThrow();
  });

  it("treats uppercase and lowercase as distinct symbols", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a, b}
    prime \\elem {G, A, B}`;
    expect(() => parse(dsl)).not.toThrow();
  });

  it("throws when a symbol is shared across three roles", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, a}
    prime \\elem {p, q}
    secret \\elem {s, a}`;
    expect(() => parse(dsl)).toThrow();
  });
});

// ─── variables: field validation ─────────────────────────────────────────────

describe("variables: field validation", () => {
  it("throws when variables: is defined twice", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, prime
    variables: secret`;
    expect(() => parse(dsl)).toThrow("'variables:' is defined multiple times");
  });

  it("throws when the same role appears twice in variables:", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, generator`;
    expect(() => parse(dsl)).toThrow("Role 'generator' is defined multiple times");
  });

  it("does not throw when all role names in variables: are unique", () => {
    const dsl = `title: Test
define:
    type: construct
    variables: generator, prime, secret`;
    expect(() => parse(dsl)).not.toThrow();
  });

  it("throws when \\elem syntax is used in a construct block", () => {
    const dsl = `title: Test
define:
    type: construct
    generator \\elem {g, a, b}`;
    expect(() => parse(dsl)).toThrow("Use 'variables:' to declare roles for type 'construct'");
  });

  it("does not throw when \\elem syntax is used in a select block", () => {
    const dsl = `title: Test
define:
    type: select
    generator \\elem {g, a, b}`;
    expect(() => parse(dsl)).not.toThrow();
  });
});

// ─── role validation in prompt and hint ──────────────────────────────────────

describe("role validation in prompt and hint", () => {
  it("throws when an undefined role is used in a prompt", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, h, k}
step:
    description: Step
    exercise:
        type: construct
        prompt: Build {prime} something
        answer: {generator}`;
    expect(() => parse(dsl)).toThrow("Role '{prime}' is used but not defined in the define: block");
  });

  it("throws when an undefined role is used in a hint", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, h, k}
step:
    description: Step
    exercise:
        type: construct
        prompt: Build something
        hint: Think about {prime}
        answer: {generator}`;
    expect(() => parse(dsl)).toThrow("Role '{prime}' is used but not defined in the define: block");
  });

  it("does not throw when all roles in prompt and hint are defined", () => {
    const dsl = `title: Test
define:
    generator \\elem {g, h, k}
    prime \\elem {p, q}
step:
    description: Step
    exercise:
        type: construct
        prompt: Use {generator} and {prime}
        hint: Remember {prime}
        answer: {generator}`;
    expect(() => parse(dsl)).not.toThrow();
  });
});

// ─── select answer must match an option ──────────────────────────────────────

describe("select answer must match an option", () => {
  it("throws when the answer does not match any option", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: select
        prompt: Pick one
        options:
            - 1
            - 7
        answer: a`;
    expect(() => parse(dsl)).toThrow("Answer must match one of the options in a select exercise");
  });

  it("does not throw when the answer matches an option", () => {
    const dsl = `title: Test
step:
    description: Step
    exercise:
        type: select
        prompt: Pick one
        options:
            - 1
            - 7
        answer: 7`;
    expect(() => parse(dsl)).not.toThrow();
  });

  it("does not throw when the answer matches an option containing a role", () => {
    const dsl = `title: Test
define:
    prime \\elem {p, q}
step:
    description: Step
    exercise:
        type: select
        prompt: Pick one
        options:
            - 1
            - {prime}-1
        answer: {prime}-1`;
    expect(() => parse(dsl)).not.toThrow();
  });
});
