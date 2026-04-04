import { exprListContains, COMMUTATIVE_OPS, tokenToPaletteItem } from "~/app/hooks/expr";

export type Code = {
  information: Information;
  customOperators: CustomOperator[];
  step: Step[];
}

type Information = {
  name: string;
  definition: Definition[];
}

const DEFINITION_TYPES = [
  "select",    // Multiple choice picker
  "construct", // Drag-and-drop builder
] as const;

export type DefinitionType = typeof DEFINITION_TYPES[number];

export type Definition = {
  // Example: Select for the definitionsPicker or construct for a drag-and-drop
  type: DefinitionType;
  // Example: "generator", "prime", etc.
  role: string;
  // Example: [g, x, a, b] etc.
  symbols: Expr[];
}

type Step = {
  description: string;
  exercise?: Exercise;
}

type Exercise = {
  type: ExerciseType;
  prompt: string;
  hint?: string;
  options?: Expr[];
  pairs?: { left: string; right: string }[];
  prefill?: PaletteItem[];
  answer?: Expr[];
}

export type TokenRange = { start: number; end: number}

// Leaf expressions (no children)
export type LeafExpr =
  | { kind: "var"; name: string, tokenRange?: TokenRange }
  | { kind: "role"; name: string, tokenRange?: TokenRange }
  | { kind: "int"; value: number, tokenRange?: TokenRange }
  | { kind: "placeholder"; index: number, tokenRange?: TokenRange } // Defined by user "fill in value here" ($1, $2)
  | { kind: "slot", tokenRange?: TokenRange } // Empty drop target in UI
  | { kind: "constant"; symbol: ConstantSymbol, tokenRange?: TokenRange };

// Binary operator types - single source of truth
export const ALL_OPERATORS = [
  // logical
  "and", "or",
  // arithmetic
  "add", "sub",
  // multiplicative
  "mul", "div", "mod",
  // exponentiation
  "pow",
  // comparison
  "less", "greater", "equal"
] as const;

// Binary symbols (two operands: left OP right)
export const BINARY_SYMBOLS = [
  // Set theory / Relations
  "elem",           // ∈ element of
  "notelem",        // ∉ not element of
  "subset",         // ⊆ subset
  "union",          // ∪ union
  "intersection",   // ∩ intersection
  // Cryptographic
  "xor",            // ⊕ XOR
  "concat",         // || concatenation
  "congruent",      // ≡ congruent (mod)
  "notequal",       // ≠ not equal
  // Protocol arrows
  "leftarrow",      // ← assignment/receives
  "rightarrow",     // → sends/maps to
  "biarrow",        // ↔ bidirectional/iff
  "randomsample",   // ←$ random sampling
  // Number theory
  "divides",        // | divides
  "notdivides",     // ∤ does not divide
  // Other
  "lessequal",      // ≤ less than or equal
  "greaterequal",   // ≥ greater than or equal
] as const;

// Unary symbols (one operand: OP expr)
export const UNARY_SYMBOLS = [
  "forall",         // ∀x
  "exists",         // ∃x
] as const;

// Constant symbols (no operands)
export const CONSTANT_SYMBOLS = [
  "emptyset",       // ∅
  "reals",          // ℝ
  "naturals",       // ℕ
  "integers",       // ℤ
  "rationals",      // ℚ
  "complex",        // ℂ
  "powerset",       // ℙ
  "universal",      // 𝕌
] as const;

export type BinaryOp = typeof ALL_OPERATORS[number];
export type BinarySymbol = typeof BINARY_SYMBOLS[number];
export type UnarySymbol = typeof UNARY_SYMBOLS[number];
export type ConstantSymbol = typeof CONSTANT_SYMBOLS[number];

// Unary expression (one child)
// op can be null when the operator has been removed (symbol slot)
export type UnaryExpr = {
  kind: "unary";
  op: UnarySymbol | string | null;
  operand: Expr;
  tokenRange?: TokenRange
};

// Binary expression (two children)
// op can be null when the operator has been removed (operator slot)
export type BinaryExpr = {
  kind: "binary";
  op: BinaryOp | BinarySymbol | string | null;
  left: Expr;
  right: Expr;
  tokenRange?: TokenRange;
  opTokenIndex?: number;
};

export type CustomOperator = {
  name: string;
  type: "BINARY" | "UNARY";
  commutative: boolean;
  precedence: number;
};


// Combined expression type
export type Expr = LeafExpr | UnaryExpr | BinaryExpr

export type PaletteItem =
  | { kind: "var"; name: string }
  | { kind: "role"; name: string }
  | { kind: "int"; value: number }
  | { kind: "operator"; op: BinaryOp | string }
  | { kind: "binarySymbol"; op: BinarySymbol }
  | { kind: "unarySymbol"; op: UnarySymbol }
  | { kind: "constantSymbol"; op: ConstantSymbol }
  | { kind: "LPAR" }
  | { kind: "RPAR" }

// Binary symbols that belong to the Sets palette
export const SET_BINARY_SYMBOLS = ["elem", "notelem", "subset", "union", "intersection"] as const;

// Parenthesis palette items
export const PAR_PALETTE_ITEMS: PaletteItem[] = [
  { kind: "LPAR" },
  { kind: "RPAR" },
];

// All operators as palette items - for use with "palette: *"
export const ALL_OPERATOR_PALETTE_ITEMS: PaletteItem[] = ALL_OPERATORS.map(op => ({ kind: "operator", op }));

// Sets palette: set-theory binary ops + all number-set constants
export const ALL_SET_PALETTE_ITEMS: PaletteItem[] = [
  ...SET_BINARY_SYMBOLS.map(op => ({ kind: "binarySymbol" as const, op })),
  ...CONSTANT_SYMBOLS.map(op => ({ kind: "constantSymbol" as const, op })),
];

// Symbols palette: everything that isn't set-theory
const SET_BINARY_SET = new Set<string>(SET_BINARY_SYMBOLS);
export const ALL_SYMBOL_PALETTE_ITEMS: PaletteItem[] = [
  ...BINARY_SYMBOLS.filter(op => !SET_BINARY_SET.has(op)).map(op => ({ kind: "binarySymbol" as const, op })),
  ...UNARY_SYMBOLS.map(op => ({ kind: "unarySymbol" as const, op })),
];

type TokenType = "NUMBER" | "VAR" | "OPERATOR" | "LPAR" | "RPAR" | "LBRACE" | "RBRACE" | "PLACEHOLDER" | "KEYWORD" | "COMMA" | "ROLE_REF" | "EOF";

export type Token = {
  type: TokenType;
  value: string;
}

const EXERCISE_TYPES = [
  "construct", // Drag and drop
  "match", // Drag labels to expressions
  "select", // Multiple choice
  "calculate", // Computational exercise where the user performs a calculation
] as const;

export type ExerciseType = typeof EXERCISE_TYPES[number];

/**
 * Converts a raw expression string into a flat list of tokens.
 *
 * Recognises the following token types:
 * - `NUMBER`      - one or more digits, e.g. `42`
 * - `VAR`         - identifier starting with a letter or `_`, e.g. `alice`, `g`
 * - `OPERATOR`    - single-char operators (`+`, `-`, `*`, `/`, `^`, `<`, `>`, `=`)
 *                   and multi-char keywords (`mod`, `and`, `or`)
 * - `KEYWORD`     - backslash-prefixed symbol names, e.g. `\elem`, `\forall`
 * - `ROLE_REF`    - a role name wrapped in braces, e.g. `{prime}` -> value `"prime"`
 * - `PLACEHOLDER` - a `$`-prefixed numeric slot, e.g. `$1`
 * - `LPAR`/`RPAR` - parentheses `(` `)`
 * - `LBRACE`/`RBRACE` - bare braces `{` `}` (only when not a role reference)
 * - `COMMA`       - `,`
 * - `EOF`         - sentinel appended at the end of every token stream
 *
 * Whitespace (spaces, newlines, tabs) is silently skipped.
 * Throws if an unrecognised character is encountered.
 *
 * @param input - The raw expression string to tokenize.
 * @returns An ordered array of `Token` objects ending with an `EOF` token.
 */
export function tokenize(input: string): Token[] {
  function inner (i: number, acc: Token[]): Token[] {
    // Base case
    if (i >= input.length) {
      return [...acc, { type: "EOF", value: "" }];
    }
    // Skip whitespaces, new line, tabs
    if (input[i] === " " || input[i] === "\n" || input[i] === "\t") {
      return inner(i+1, acc)
    }
    // Check for numbers (Consumes all digits)
    if (/\d/.test(input[i] ?? "")) {
      let numStr = "";
      let j = i;
      while (j < input.length && /\d/.test(input[j] ?? "")) {
        numStr += input[j];
        j++;
      }
      return inner(j, [...acc, { type: "NUMBER", value: numStr}])
    }
    // Check for multi-char operators BEFORE variables (so they aren't consumed as a variable)
    if (input.substring(i, i + 3) === "mod") {
      return inner(i + 3, [...acc, { type: "OPERATOR", value: "mod" }]);
    }
    if (input.substring(i, i + 3) === "and") {
      return inner(i + 3, [...acc, { type: "OPERATOR", value: "and"}]);
    }
    if (input.substring(i, i + 2) === "or") {
      return inner(i + 2, [...acc, { type: "OPERATOR", value: "or"}]);
    }
    // Check for keywords/symbols (e.g., \elem, \subset, \forall)
    if (input[i] === "\\") {
      const match = input.substring(i + 1).match(/^[a-z]+/);
      if (!match) {
        throw new Error(`Expected command after: \\`);
      }
      if (([...CONSTANT_SYMBOLS, ...UNARY_SYMBOLS, ...BINARY_SYMBOLS] as readonly string[]).includes(match[0])) {
        return inner(i + 1 + match[0].length, [...acc, { type: "KEYWORD", value: match[0] }]);
      }
      throw new Error(`Unknown command: \\${match[0]}`);
    }
    // Check for variables
    if (/[a-zA-Z_]/.test(input[i] ?? "")) {
      let str: string = ""
      let j: number = i
      while (j < input.length && /[a-zA-Z_']/.test(input[j] ?? "")) {
        str += input[j];
        j++
      }
      return inner(j, [...acc, { type: "VAR", value: str }])
    }
    // Check for placeholders $1, $2, etc.
    if (input[i] === "$") {
      let numStr: string = "$";
      let j: number = i+1;
      while (j < input.length && /\d/.test(input[j] ?? "")) {
        numStr += input[j];
        j++;
      }
      return inner(j, [...acc, { type: "PLACEHOLDER", value: numStr }]);
    }
    // CHeck for comma
    if (input[i] === ",") {
      return inner(i+1, [...acc, { type: "COMMA", value: "," }]);
    }

    // Check for single-char operators
    if (input[i] === "*") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "*" }]);
    }
    if (input[i] === "/") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "/" }]);
    }
    if (input[i] === "^") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "^" }]);
    }
    if (input[i] === "+") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "+" }]);
    }
    if (input[i] === "-") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "-" }]);
    }
    if (input[i] === "<") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "<" }]);
    }
    if (input[i] === ">") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: ">" }]);
    }
    if (input[i] === "=") {
      return inner(i+1, [...acc, { type: "OPERATOR", value: "=" }]);
    }
    // Check for parentheses
    if (input[i] === "(") {
      return inner(i+1, [...acc, { type: "LPAR", value: "("}])
    }
    if (input[i] === ")") {
      return inner(i+1, [...acc, { type: "RPAR", value: ")"}])
    }
    // Check for braces
    if (input[i] === "{") {
      let j = i + 1;
      let name = "";
      while (j < input.length && /[a-zA-Z_]/.test(input[j] ?? "")) {
        name += input[j];
        j++;
      }
      if (input[j] === "}" && name.length > 0) {
        return inner(j + 1, [...acc, { type: "ROLE_REF", value: name }]);
      }
      // Fall through to regular LBRACE if not a role reference
      return inner(i + 1, [...acc, { type: "LBRACE", value: "{" }]);
    }

    if (input[i] === "}") {
      return inner(i+1, [...acc, { type: "RBRACE", value: "}"}])
    }
    throw new Error(`Unexpected character: ${input[i]}`);
  }
  return inner(0, [])
}

export function parseExpression(input: string, customOperators: CustomOperator[] = []): Expr {
  const tokens = tokenize(input);
  const parser = new ExpressionParser(tokens, customOperators);
  return parser.parse();
}

/**
 * Pratt parser (precedence climbing) that turns a token stream into an `Expr` tree.
 *
 * Operator precedence (low to high):
 * 1. `and`, `or`
 * 2. `<`, `>`, `=`, binary symbols (e.g. `\elem`)
 * 3. `+`, `-`
 * 4. `*`, `/`, `mod`
 * 5. `^`
 *
 * Custom operators defined in the DSL are slotted in at whatever precedence the
 * professor assigned them. Custom UNARY operators are recognised in `parsePrimary`
 * and applied as prefix operators; custom BINARY operators are treated like any
 * other infix operator in `parseExpression`.
 *
 * Typical usage is through the `parseExpression` helper rather than directly.
 */
class ExpressionParser {
  private readonly tokens: Token[];
  private current: number = 0;
  private readonly customOperators: CustomOperator[];

  /** Returns the current token without consuming it. */
  peek(): Token { return this.tokens[this.current]!; }

  /** Returns the current token and advances the cursor. */
  advance(): Token { return this.tokens[this.current++]!; }

  /** Returns true when the cursor is sitting on the EOF sentinel. */
  isAtEnd(): boolean { return this.peek().type === "EOF"}

  constructor(tokens: Token[], customOperators: CustomOperator[] = []) {
    this.tokens = tokens;
    this.customOperators = customOperators;
  }

  /**
   * Entry point - parses the full token stream and returns the root `Expr` node.
   * Throws if any tokens remain after the expression is parsed.
   *
   * @returns The root of the parsed expression tree.
   */
  parse(): Expr {
    const expr = this.parseExpression(0);
    if (!this.isAtEnd()) {
      throw new Error(`Unexpected token: '${this.peek().value}'`);
    }
    return expr;
  }

  /**
   * Returns the binding power of an operator string.
   * Custom operators use the precedence value from their DSL definition.
   * Returns 0 for unrecognised operators so they act as a stop condition.
   *
   * @param op - The operator string, e.g. `"mod"`, `"^"`, `"and"`.
   * @returns A numeric precedence level (higher binds tighter).
   */
  private precedence(op: string): number {
    const custom: CustomOperator | undefined = this.customOperators.find(c => c.name === op);
    if (custom) return custom.precedence;

    if (op === "and" || op === "or") return 1;
    if (op === "<" || op === ">" || op === "=") return 2;
    if ((BINARY_SYMBOLS as readonly string[]).includes(op)) return 2; // same level as comparisons
    if (op === "+" || op === "-") return 3;
    if (op === "*" || op === "mod" || op === "/") return 4;
    if (op === "^") return 5;  // strongest
    return 0;
  }

  /**
   * Parses the smallest indivisible unit of an expression (a "primary").
   * Handles literals, variables, role references, placeholders, parenthesised
   * sub-expressions, constant/unary symbols, and custom unary operators.
   * Throws on any token that cannot start a valid primary.
   *
   * @returns A leaf or unary `Expr` node.
   */
  private parsePrimary(): Expr {
    const start = this.current;
    const token: Token = this.advance();

    switch (token.type) {
      case "NUMBER":
        return { kind: "int", value: Number(token.value), tokenRange: { start, end: this.current} }
      case "VAR": {
        const custom = this.customOperators.find(op => op.name === token.value && op.type === "UNARY");
        if (custom) {
          const operand = this.parsePrimary();
          return { kind: "unary", op: custom.name, operand, tokenRange: { start, end: this.current } };
        }
        return { kind: "var", name: token.value, tokenRange: { start, end: this.current} }
      }
      case "PLACEHOLDER":
        // token.value is $1, $2, etc. - therefore we remove $
        return { kind: "placeholder", index: Number(token.value.slice(1)), tokenRange: { start, end: this.current} }
      case "ROLE_REF":
        return { kind: "role", name: token.value, tokenRange: { start, end: this.current} };
      case "LPAR":
        const expr = this.parseExpression(0);
        if (this.peek().type !== "RPAR") {
          throw new Error("Expected closing parenthesis")
        }
        this.advance();
        return { ...expr, tokenRange: { start, end: this.current}}
      case "KEYWORD":
        if ((CONSTANT_SYMBOLS as readonly string[]).includes(token.value))
          return { kind: "constant", symbol: token.value as ConstantSymbol, tokenRange: { start, end: this.current}}
        else if ((UNARY_SYMBOLS as readonly string[]).includes(token.value)) {
          const operand = this.parsePrimary()
          return { kind: "unary", op: token.value as UnarySymbol, operand: operand, tokenRange: { start, end: this.current}}
        }
        else {
          throw new Error(`Unexpected token: ${token.type} '${token.value}'`)
        }
      default:
        throw new Error(`Unexpected token: ${token.type} '${token.value}'`);
    }
  }

  /**
   * Parses an infix expression using precedence climbing.
   * Starts by parsing a primary, then repeatedly consumes operators whose
   * precedence is at least `minPrecedence`, building up a left-associative
   * binary tree. Right-associativity is achieved by passing `prec + 1` as
   * the minimum for the recursive right-hand call.
   *
   * @param minPrecedence - Only consume operators at or above this level.
   * @returns The root `Expr` node for this sub-expression.
   */
  private parseExpression(minPrecedence: number): Expr {
    let left = this.parsePrimary();

    while (!this.isAtEnd()) {
      const next = this.peek();

      if (next.type === "OPERATOR" && this.precedence(next.value) >= minPrecedence) {
        const opTokenIndex = this.current;
        const op: string = this.advance().value;
        const prec: number = this.precedence(op);
        const right: Expr = this.parseExpression(prec + 1);
        left = this.makeNode(op, left, right);
        left.tokenRange = { start: left.left.tokenRange!.start, end: this.current };
        left.opTokenIndex = opTokenIndex;
      }
      else if (next.type === "KEYWORD" && (BINARY_SYMBOLS as readonly string[]).includes(next.value) && this.precedence(next.value) >= minPrecedence) {
        const opTokenIndex = this.current;
        const op = this.advance().value as BinarySymbol;
        const right: Expr = this.parseExpression(this.precedence(op) + 1);
        left = { kind: "binary", op, left, right, tokenRange: { start: left.tokenRange!.start, end: this.current }, opTokenIndex };
      }
      else if (next.type === "VAR") {
        const custom = this.customOperators.find(op => op.name === next.value && op.type ===
          "BINARY");
        if (custom && custom.precedence >= minPrecedence) {
          const opTokenIndex = this.current;
          this.advance();
          const right = this.parseExpression(custom.precedence + 1);
          left = { kind: "binary", op: custom.name, left, right, tokenRange: { start: left.tokenRange!.start, end: this.current }, opTokenIndex };
        } else break;
      }
      else {
        break;
      }
    }
    return left;
  }

  /**
   * Constructs a `BinaryExpr` node from a raw operator string and its two operands.
   * Maps operator strings (e.g. `"^"`, `"mod"`) to their `BinaryOp` enum values.
   * Throws if the operator string is not in the known map.
   *
   * @param op - The raw operator string from the token stream.
   * @param left - The left operand expression.
   * @param right - The right operand expression.
   * @returns A `BinaryExpr` node with `tokenRange` and `opTokenIndex` unset
   *          (the caller in `parseExpression` fills those in).
   */
  private makeNode(op: string, left: Expr, right: Expr): BinaryExpr {
    const opMap: Record<string, BinaryOp> = {
      "^": "pow",
      "mod": "mod",
      "and": "and",
      "or": "or",
      "*": "mul",
      "/": "div",
      "+": "add",
      "-": "sub",
      "<": "less",
      ">": "greater",
      "=": "equal",
    };

    const binaryOp = opMap[op];
    if (!binaryOp) {
      throw new Error(`Unknown operator: ${op}`);
    }

    return { kind: "binary", op: binaryOp, left, right };
  }
}

export function parse(input: string, startIndex: number): Code {
  const lines: string[] = input.split("\n");
  let code: Code = {
    information: { name: "", definition: []},
    customOperators: [],
    step: []
  }

  let i: number = startIndex;

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${i + 1} - Line is undefined`);
    }

    if (line.startsWith("protocol:")) {
      code.information.name = line.replace("protocol:", "").trim();
    }
    else if (line.startsWith("custom:")) {
      const [operators, nextI] = customParse(lines, i)
      code.customOperators.push(...operators);
      for (const op of operators) {
        if (op.commutative) COMMUTATIVE_OPS.add(op.name);
      }
      i = nextI;
      continue
    }
    else if (line.startsWith("define:")) {
      const [definition, nextI] = defineParse(lines, i)
      code.information.definition = definition
      i = nextI
      continue
    }
    else if (line.startsWith("step")) {
      const [step, nextI] = stepParse(lines, i, code.customOperators);
      i = nextI
      code.step.push(step)
      continue
    }
    else if (line.trim() === "") {
      // Empty line
    }
    else {
      throw new Error(`Line ${i + 1} - Unexpected string: '${line}'`);
    }
    i++
  }

  return code;
}

function customParse(lines: string[], startIndex: number): [CustomOperator[], number] {
  let i: number = startIndex + 1;
  let operators: CustomOperator[] = [];

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim();

    if (!line || line.startsWith("step") || line.startsWith("protocol") || line.startsWith("define:")) {
      break;
    }

    if (line.startsWith("operator:")) {
      const [operator, nextI] = parseOperatorDef(lines, i);
      operators.push(operator);
      i = nextI;
      continue;
    }

    i++;
  }

  return [operators, i];
}

function parseOperatorDef(lines: string[], startIndex: number): [CustomOperator, number] {
  let i: number = startIndex + 1;
  let customOp: Partial<CustomOperator> = {};

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim();

    if (!line || line.startsWith("operator:") || line.startsWith("define:") || line.startsWith("step") || line.startsWith("protocol:")) {
      break;
    }

    if (line.startsWith("name:")) {
      if (customOp.name !== undefined) throw new Error(`Line ${i + 1} - Name defined multiple times`);
      customOp.name = line.replace("name:", "").trim();
    } else if (line.startsWith("type:")) {
      if (customOp.type !== undefined) throw new Error(`Line ${i + 1} - Type defined multiple times`);
      const typeValue = line.replace("type:", "").trim().toUpperCase();
      switch (typeValue) {
        case "BINARY":
        case "UNARY":
          customOp.type = typeValue;
          break;
        default:
          throw new Error(`Line ${i + 1} - Invalid custom operator type: '${typeValue}'`);
      }
    } else if (line.startsWith("commutative:")) {
      if (customOp.commutative !== undefined) throw new Error(`Line ${i + 1} - Commutative defined multiple times`);
      const commutativeValue = line.replace("commutative:", "").trim().toLowerCase();
      switch (commutativeValue) {
        case "true":
          customOp.commutative = true;
          break;
        case "false":
          customOp.commutative = false;
          break;
        default:
          throw new Error(`Line ${i + 1} - Commutative must be 'true' or 'false'`);
      }
    } else if (line.startsWith("precedence:")) {
      if (customOp.precedence !== undefined) throw new Error(`Line ${i + 1} - Precedence defined multiple times`);
      const raw = line.replace("precedence:", "").trim();
      if (!/^\d+$/.test(raw)) {
        throw new Error(`Line ${i + 1} - Precedence must be a number`);
      }
      const precValue = parseInt(raw, 10);
      if (precValue < 0) {
        throw new Error(`Line ${i + 1} - Precedence must be a non-negative number`);
      }
      customOp.precedence = precValue;
    }

    i++;
  }

  if (!customOp.name) throw new Error(`Line ${startIndex + 1} - Operator must have a name`);
  if (customOp.type === undefined) throw new Error(`Line ${startIndex + 1} - Operator must have a type`);
  if (customOp.precedence === undefined) throw new Error(`Line ${startIndex + 1} - Operator must have a precedence`);
  if (customOp.commutative === undefined) customOp.commutative = false; // default

  return [customOp as CustomOperator, i];
}

function defineParse(lines: string[], startIndex: number): [Definition[], number] {
  let i: number = startIndex + 1;
  let definitions: Definition[] = [];
  let type: DefinitionType = DEFINITION_TYPES[0];

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (!line || line.startsWith("step") || line.startsWith("protocol") || line.startsWith("custom:")) {
      break; // End of define block
    }

    if (line.startsWith("type:")) {
      const typeValue = line.replace("type:", "").trim();
      if (!isDefinitionType(typeValue)) {
        throw new Error(`Line ${i + 1} - Invalid definition type: '${typeValue}'`);
      }
      type = typeValue;
      i++;
      continue;
    }

    let tokens: Token[];
    try {
      tokens = tokenize(line);
    } catch (e) {
      throw new Error(`Line ${i + 1} - ${(e as Error).message}`);
    }
    const def: Definition = parseDefinition(tokens, type, i);
    definitions.push(def);
    i++
  }
  return [definitions, i++];
}

function parseDefinition(tokens: Token[], type: DefinitionType, line: number): Definition {
  let i: number = 0;
  let definition: Definition = {type, role: "", symbols: []};

  // Expect: VARIABLE("generator")
  if (tokens[i]?.type !== "VAR") {
    throw new Error(`Line ${line + 1} - Expected role name`);
  }
  definition.role = tokens[i]!.value;
  i++;

  // Expect: KEYWORD("elem")
  if (tokens[i]?.type !== "KEYWORD" || tokens[i]?.value !== "elem") {
    throw new Error(`Line ${line + 1} - Expected \\elem`);
  }
  i++;

  // {element} is tokenized as a single ROLE_REF token, handle it as a single-element set
  if (tokens[i]?.type === "ROLE_REF") {
    definition.symbols.push({ kind: "var", name: tokens[i]!.value });
    return definition;
  }

  // Expect: LBRACE
  if (tokens[i]?.type !== "LBRACE") {
    throw new Error(`Line ${line + 1} - Expected {`);
  }
  i++;

  // Collect options until RBRACE
  while (tokens[i] && tokens[i]?.type !== "RBRACE") {
    if (tokens[i]?.type === "VAR") {
      const expr: Expr = { kind: "var", name: tokens[i]!.value };
      if (exprListContains(expr, definition.symbols)) {
        throw new Error(`Line ${line + 1} - Cannot contain duplicate variable names`);
      }
      definition.symbols.push(expr);
    }
    i++;
  }

  return definition;
}

function stepParse(lines: string[], startIndex: number, customOperators: CustomOperator[] = []): [Step, number] {
  let i: number = startIndex + 1;

  let currentStep: Step = { description: "" }

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line === "") {
      // Skip empty line
      i++
      continue
    }

    if (line == undefined) {
      throw new Error(`Line ${i + 1} - Line is undefined`);
    }

    if (line.startsWith("description:")) {
      currentStep.description = line.replace("description:", "").trim()
    }
    else if (line.startsWith("exercise:")) {
      const rest = line.replace("exercise:", "").trim()

      if (rest.length > 0) {
        throw new Error(`Line ${i + 1} - Line is undefined`);
      }

      const [exercise, nextI] = exerciseParse(lines, i+1, customOperators)
      i = nextI
      currentStep.exercise = exercise
      continue
    }
    else {
      return [currentStep, i]
    }
    i++
  }
  if (!currentStep.description) {
    throw new Error(`Line ${startIndex + 1} - Step must have a description`)
  }
  return [currentStep, i]
}

function exerciseParse(lines: string[], startIndex: number, customOperators: CustomOperator[] = []): [Exercise, number] {
  let i: number = startIndex;
  let pendingExercise: Partial<Exercise> = {};

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${i + 1} - Line is undefined`);
    }

    if (!line || line.startsWith("step") || line.startsWith("description:") || line.startsWith("define:") || line.startsWith("custom:") || line.startsWith("protocol:")) {
      break;
    }

    if (line.startsWith("type:")) {
      if (pendingExercise.type)
        throw new Error(`Line ${i + 1} - Type defined multiple times`);
      const rest = line.replace("type:", "").trim()
      if (!isExerciseType(rest)) {
        throw new Error(`Line ${i + 1} - Invalid exercise type '${rest}'`)
      }
      pendingExercise.type = rest
    }
    else if (line.startsWith("prompt:")) {
      if (pendingExercise.prompt)
        throw new Error(`Line ${i + 1} - Prompt defined multiple times`);
      pendingExercise.prompt = line.replace("prompt:", "").trim()
    }
    else if (line.startsWith("hint")) {
      if (pendingExercise.hint)
        throw new Error(`Line ${i + 1} - Hint defined multiple times`);
      pendingExercise.hint = line.replace("hint:", "").trim()
    }
    else if (line.startsWith("pairs:")) {
      if (pendingExercise.pairs)
        throw new Error(`Line ${i + 1} - Pairs defined multiple times`);
      const [pairs, nextI] = pairsParse(lines, i+1)
      if (pairs.length == 0) {
        throw new Error(`Line ${i + 1} - No pairs for exercise type match`);
      }
      pendingExercise.pairs = pairs;
      i = nextI;
      continue;
    }
    else if (line.startsWith("options:")) {
      if (pendingExercise.options)
        throw new Error(`Line ${i + 1} - Options defined multiple times`);
      const [options, nextI] = optionsParse(lines, i+1)
      if (options.length == 0) {
        throw new Error(`Line ${i + 1} - No options for exercise type select`);
      }
      pendingExercise.options = options.map(opt => {
        try {
          const tokens = tokenize(opt);
          const parser = new ExpressionParser(tokens, customOperators);
          return parser.parse();
        } catch (e) {
          throw new Error(`Line ${i + 1} - ${(e as Error).message}`);
        }
      });
      i = nextI
      continue
    }
    else if (line.startsWith("prefill:")) {
      if (pendingExercise.prefill)
        throw new Error(`Line ${i + 1} - Prefill defined multiple times`);
      const prefillText = line.replace("prefill:", "").trim()
      try {
        const tokens: Token[] = tokenize(prefillText);
        pendingExercise.prefill = tokens
          .filter((t) => t.type !== "EOF")
          .map((item: Token): PaletteItem => tokenToPaletteItem(item));
      }
      catch (e) {
        throw new Error(`Line ${i + 1} - ${(e as Error).message}`);
      }
    }
    else if (line.startsWith("answer:")) {
      if (pendingExercise.answer)
        throw new Error(`Line ${i + 1} - Answer defined multiple times`);
      const answerText = line.replace("answer:", "").trim()
      try {
        const tokens = tokenize(answerText)
        const parser = new ExpressionParser(tokens, customOperators)
        pendingExercise.answer = [parser.parse()]
      } catch (e) {
        throw new Error(`Line ${i + 1} - ${(e as Error).message}`);
      }
    }
    else {
      throw new Error(`Line ${i + 1} - Unrecognized exercise field: '${line.split(":")[0]}'`)
    }
    i++
  }
  return [finalizeExercise(pendingExercise, startIndex), i]
}

/**
 * Parses a list of match pairs from DSL lines of the form `- <expr> -> <label>`.
 * The left side is parsed as an Expr, the right side is kept as a plain string.
 * Stops when it encounters a line that does not start with `-`.
 *
 * @param lines - All DSL lines
 * @param startIndex - The line index to start parsing from (first `-` line)
 * @returns A tuple of the parsed pairs and the index of the first unconsumed line
 */
function pairsParse(lines: string[], startIndex: number): [{ left: string; right: string }[], number] {
  let i: number = startIndex;
  let pairs: { left: string; right: string }[] = [];

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${i + 1} - Line is undefined`);
    }

    if (line.startsWith("-")) {
      const pair = line.replace("-", "").trim().split("->")
      if (pair.length !== 2) throw new Error(`Line ${i + 1} - Each pair must have exactly one '->'`);
      pairs.push({ left: pair[0]!.trim(), right: pair[1]!.trim() })
    }
    else {
      return [pairs, i]
    }
    i++
  }
  return [pairs, i]
}

function optionsParse(lines: string[], startIndex: number): [string[], number] {
  let i: number = startIndex;
  let options: string[] = [];

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${i + 1} - Line is undefined`);
    }

    if (line.startsWith("-")) {
      options.push(line.replace("-", "").trim())
    }
    else {
      return [options, i]
    }
    i++
  }
  return [options, i]
}

function finalizeExercise(fields: Partial<Exercise>, line: number): Exercise {
  if (!fields.type) {
    throw new Error(`Line ${line + 1} - Exercise type must be specified`)
  }
  const typeLabel = fields.type ? ` (type: ${fields.type})` : "";
  if (!fields.prompt) {
    throw new Error(`Line ${line + 1}${typeLabel} - Exercise must have a prompt`)
  }
  if (!fields.answer && fields.type !== "match") {
    throw new Error(`Line ${line + 1}${typeLabel} - Exercise must have an answer`)
  }

  // Type-specific requirements
  if (fields.type === "match" && !fields.pairs) {
    throw new Error(`Line ${line + 1}${typeLabel} - Exercise must have pairs`)
  }
  if (fields.type === "select" && !fields.options) {
    throw new Error(`Line ${line + 1}${typeLabel} - Exercise must have options`)
  }

  return fields as Exercise
}

function isExerciseType(value: string): value is ExerciseType {
  return (EXERCISE_TYPES as readonly string[]).includes(value);
}

function isDefinitionType(value: string): value is DefinitionType {
  return (DEFINITION_TYPES as readonly string[]).includes(value);
}

export const operatorSymbol: Record<string, string> = {
  mul: "\u00D7",
  div: "\u00F7",
  add: "\u002B",
  sub: "\u2212",
  pow: "^",
  mod: "mod",
  and: "\u2227",
  or: "\u2228",
  less: "\u003C",
  greater: "\u003E",
  equal: "\u003D",
};

// Display mapping for symbols
export const symbolDisplay: Record<string, string> = {
  elem: "\u2208",         // ∈
  notelem: "\u2209",      // ∉
  subset: "\u2286",       // ⊆
  union: "\u222A",        // ∪
  intersection: "\u2229", // ∩
  xor: "\u2295",          // ⊕
  concat: "||",           // ||
  congruent: "\u2261",    // ≡
  notequal: "\u2260",     // ≠
  leftarrow: "\u2190",    // ←
  rightarrow: "\u2192",   // →
  biarrow: "\u2194",      // ↔
  randomsample: "\u2190$",// ←$
  forall: "\u2200",       // ∀
  exists: "\u2203",       // ∃
  divides: "|",           // |
  notdivides: "\u2224",   // ∤
  emptyset: "\u2205",     // ∅
  reals: "\u211D",        // ℝ
  naturals: "\u2115",     // ℕ
  integers: "\u2124",     // ℤ
  rationals: "\u211A",    // ℚ
  complex: "\u2102",      // ℂ
  powerset: "\u2119",     // ℙ
  universal: "\uD835\uDD4C", // 𝕌
  lessequal: "\u2264",    // ≤
  greaterequal: "\u2265", // ≥
};
