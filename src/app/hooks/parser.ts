export type Code = {
  information: Information;
  step: Step[];
}

type Information = {
  name: string;
  participants: string[];
  definition: Definition[];
}

export type Definition = {
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
  palette?: PaletteItem[];
  options?: Expr[];
  answer: Expr[];
}

// Leaf expressions (no children)
export type LeafExpr =
  | { kind: "var"; name: string }
  | { kind: "role"; name: string }
  | { kind: "int"; value: number }
  | { kind: "placeholder"; index: number } // Defined by user "fill in value here" ($1, $2)
  | { kind: "slot" } // Empty drop target in UI
  | { kind: "constant"; symbol: ConstantSymbol};

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
] as const;

export type BinaryOp = typeof ALL_OPERATORS[number];
export type BinarySymbol = typeof BINARY_SYMBOLS[number];
export type UnarySymbol = typeof UNARY_SYMBOLS[number];
export type ConstantSymbol = typeof CONSTANT_SYMBOLS[number];

// Unary expression (one child)
// op can be null when the operator has been removed (symbol slot)
export type UnaryExpr = {
  kind: "unary";
  op: UnarySymbol | null;
  operand: Expr;
};

// Binary expression (two children)
// op can be null when the operator has been removed (operator slot)
export type BinaryExpr = {
  kind: "binary";
  op: BinaryOp | BinarySymbol | null;
  left: Expr;
  right: Expr;
};

// Combined expression type
export type Expr = LeafExpr | UnaryExpr | BinaryExpr

export type PaletteItem =
  | { kind: "var"; name: string }
  | { kind: "role"; name: string }
  | { kind: "int"; value: number }
  | { kind: "operator"; op: BinaryOp }
  | { kind: "binarySymbol"; op: BinarySymbol }
  | { kind: "unarySymbol"; op: UnarySymbol }
  | { kind: "constantSymbol"; op: ConstantSymbol }

// All operators as palette items - for use with "palette: *"
export const ALL_OPERATOR_PALETTE_ITEMS: PaletteItem[] = ALL_OPERATORS.map(op => ({ kind: "operator", op }));
export const ALL_SYMBOL_PALETTE_ITEMS: PaletteItem[] = [
  ...BINARY_SYMBOLS.map(op => ({ kind: "binarySymbol" as const, op })),
  ...UNARY_SYMBOLS.map(op => ({ kind: "unarySymbol" as const, op })),
  ...CONSTANT_SYMBOLS.map(op => ({ kind: "constantSymbol" as const, op })),
];

type TokenType = "NUMBER" | "VAR" | "OPERATOR" | "LPAR" | "RPAR" | "LBRACE" | "RBRACE" | "PLACEHOLDER" | "KEYWORD" | "COMMA" | "ROLE_REF" | "EOF";

type Token = {
  type: TokenType;
  value: string;
}

const EXERCISE_TYPES = [
  "construct",
  "fill",
  "select",
  "calculate"
] as const;

type ExerciseType = typeof EXERCISE_TYPES[number];

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
      while (j < input.length && /[a-zA-Z_]/.test(input[j] ?? "")) {
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

class ExpressionParser {
  private readonly tokens: Token[];
  private current: number = 0;

  peek(): Token { return this.tokens[this.current]!; }
  advance(): Token { return this.tokens[this.current++]!; }
  isAtEnd(): boolean { return this.peek().type === "EOF"}

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Expr {
    return this.parseExpression(0)
  }

  private precedence(op: string): number {
    if (op === "and" || op === "or") return 0; // weakest
    if (op === "<" || op === ">" || op === "=") return 1;
    if (op === "+" || op === "-") return 2;
    if (op === "*" || op === "mod" || op === "/") return 3;
    if (op === "^") return 4;  // strongest
    return 0;
  }

  private parsePrimary(): Expr {
    const token: Token = this.advance();

    switch (token.type) {
      case "NUMBER":
        return { kind: "int", value: Number(token.value) }
      case "VAR":
        return { kind: "var", name: token.value }
      case "PLACEHOLDER":
        // token.value is $1, $2, etc. - therefore we remove $
        return { kind: "placeholder", index: Number(token.value.slice(1)) }
      case "ROLE_REF":
        return { kind: "role", name: token.value };
      case "LPAR":
        const expr = this.parseExpression(0);
        if (this.peek().type !== "RPAR") {
          throw new Error("Expected closing parenthesis")
        }
        this.advance();
        return expr;
      default:
        throw new Error(`Unexpected token: ${token.type} '${token.value}'`);
    }
  }

  private parseExpression(minPrecedence: number): Expr {
    let left = this.parsePrimary();

    while (!this.isAtEnd() && this.peek().type === "OPERATOR" && this.precedence(this.peek().value) >= minPrecedence) {
      const op: string = this.advance().value;
      const prec: number = this.precedence(op);
      const right: Expr = this.parseExpression(prec + 1);
      left = this.makeNode(op, left, right);
    }
    return left;
  }

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

function parsePaletteItem(input: string): PaletteItem {
  const s = input.trim();

  // Operators
  if (s === "+") return { kind: "operator", op: "add"};
  if (s === "-") return { kind: "operator", op: "sub" };
  if (s === "^") return { kind: "operator", op: "pow"}
  if (s === "/") return { kind: "operator", op: "div" };
  if (s === "mod") return { kind: "operator", op: "mod" };
  if (s === "and") return { kind: "operator", op: "and" };
  if (s === "or") return { kind: "operator", op: "or" };
  if (s === "*") return { kind: "operator", op: "mul" };
  if (s === "<") return { kind: "operator", op: "less" };
  if (s === ">") return { kind: "operator", op: "greater" };
  if (s === "=" || s === "==") return { kind: "operator", op: "equal" };

  // Integer
  if (/^\d+$/.test(s)) {
    return { kind: "int", value: Number(s) };
  }
  // Role reference like {generator}
  if (s.startsWith("{") && s.endsWith("}")) {
    return { kind: "role", name: s.slice(1, -1) };
  }
  // Variable
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s)) {
    return { kind: "var", name: s };
  }

  throw new Error(`Invalid palette item: '${input}'`);

}

export function parse(input: string, startIndex: number): Code {
  const lines: string[] = input.split("\n");
  let code: Code = {
    information: { name: "", participants: [], definition: []},
    step: []
  }

  let i: number = startIndex;

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${line} - Line is undefined`);
    }

    if (line.startsWith("protocol:")) {
      code.information.name = line.replace("protocol:", "").trim();
    }
    else if (line.startsWith("participants:")) {
      code.information.participants =
        line.replace("participants:", "")
          .split(",")
          .map(p => p.trim())
    }
    else if (line.startsWith("define:")) {
      const [definition, nextI] = defineParse(lines, i)
      code.information.definition = definition
      i = nextI
    }
    else if (line.startsWith("step")) {
      const [step, nextI] = stepParse(lines, i);
      i = nextI
      code.step.push(step)
      continue
    }
    else if (line.trim() === "") {
      // Empty line
    }
    else {
      throw new Error(`Line ${i} - Unexpected string: '${line}'`);
    }
    i++
  }

  return code;
}

function defineParse(lines: string[], startIndex: number): [Definition[], number] {
  let i: number = startIndex + 1;
  let definitions: Definition[] = [];

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (!line || line.startsWith("step") || line.startsWith("protocol")) {
      break; // End of define block
    }

    const tokens: Token[] = tokenize(line);
    const def: Definition = parseDefinition(tokens);
    definitions.push(def);
    i++
  }
  return [definitions, i++];
}

function parseDefinition(tokens: Token[]): Definition {
  let i: number = 0;
  let definition: Definition = {role: "", symbols: []};

  // Expect: VARIABLE("generator")
  if (tokens[i]?.type !== "VAR") {
    throw new Error("Expected role name");
  }
  definition.role = tokens[i]!.value;
  i++;

  // Expect: KEYWORD("elem")
  if (tokens[i]?.type !== "KEYWORD" || tokens[i]?.value !== "elem") {
    throw new Error("Expected \\elem");
  }
  i++;

  // Expect: LBRACE
  if (tokens[i]?.type !== "LBRACE") {
    throw new Error("Expected {");
  }
  i++;

  // Collect options until RBRACE
  while (tokens[i] && tokens[i]?.type !== "RBRACE") {
    if (tokens[i]?.type === "VAR") {
      definition.symbols.push({ kind: "var", name: tokens[i]!.value });
    }
    i++;
  }

  return definition;
}

function stepParse(lines: string[], startIndex: number): [Step, number] {
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
      throw new Error(`Line ${line} - Line is undefined`);
    }

    if (line.startsWith("description:")) {
      currentStep.description = line.replace("description:", "").trim()
    }
    else if (line.startsWith("exercise:")) {
      const rest = line.replace("exercise:", "").trim()

      if (rest.length > 0) {
        throw new Error(`Line ${i} - Line is undefined`);
      }

      const [exercise, nextI] = exerciseParse(lines, i+1)
      i = nextI
      currentStep.exercise = exercise
      continue
    }
    else {
      return [currentStep, i]
    }
    i++
  }
  return [currentStep, i]
}

function exerciseParse(lines: string[], startIndex: number): [Exercise, number] {
  let i: number = startIndex;
  let pendingExercise: Partial<Exercise> = {};

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${i} - Line is undefined`);
    }

    if (line.startsWith("type:")) {
      const rest = line.replace("type:", "").trim()
      if (!isExerciseType(rest)) {
        throw new Error(`Line ${i} - Invalid exercise type ${line}`)
      }
      pendingExercise.type = rest
    }
    else if (line.startsWith("prompt:")) {
      pendingExercise.prompt = line.replace("prompt:", "").trim()
    }
    else if (line.startsWith("hint")) {
      pendingExercise.hint = line.replace("hint:", "").trim()
    }
    else if (line.startsWith("palette:")) {
      pendingExercise.palette = line.replace("palette:", "").trim()
        .split(",")
        .map(p => parsePaletteItem(p.trim()))
    }
    else if (line.startsWith("options:")) {
      const [options, nextI] = optionsParse(lines, i+1)
      if (options.length == 0) {
        throw new Error(`Line ${i} - No options for exercise type select`);
      }
      pendingExercise.options = options.map(opt => {
        const tokens = tokenize(opt);
        const parser = new ExpressionParser(tokens);
        return parser.parse()
      });
      i = nextI
      continue
    }
    else if (line.startsWith("answer:")) {
      const answerText = line.replace("answer:", "").trim()
      const tokens = tokenize(answerText)
      const parser = new ExpressionParser(tokens)
      pendingExercise.answer = [parser.parse()]
    }
    else {
      return [finalizeExercise(pendingExercise, startIndex), i]
    }
    i++
  }
  return [finalizeExercise(pendingExercise, startIndex), i]
}

function optionsParse(lines: string[], startIndex: number): [string[], number] {
  let i: number = startIndex;
  let options: string[] = [];

  while (i < lines.length) {
    const line: string | undefined = lines[i]?.trim()

    if (line == undefined) {
      throw new Error(`Line ${i} - Line is undefined`);
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
    throw new Error(`Line: ${line} - Exercise type must be specified`)
  }
  if (!fields.prompt) {
    throw new Error(`Line: ${line} - Exercise must have a prompt`)
  }
  if (!fields.answer) {
    throw new Error(`Line: ${line} - Exercise must have an answer`)
  }

  // Type-specific requirements
  if (fields.type === "construct" && !fields.palette) {
    throw new Error(`Line: ${line} - Exercise type construct must have a palette`)
  }

  return fields as Exercise
}

function isExerciseType(value: string): value is ExerciseType {
  return (EXERCISE_TYPES as readonly string[]).includes(value);
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
  lessequal: "\u2264",    // ≤
  greaterequal: "\u2265", // ≥
};
