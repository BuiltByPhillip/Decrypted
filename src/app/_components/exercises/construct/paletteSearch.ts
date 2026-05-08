import {
  ALL_OPERATOR_PALETTE_ITEMS,
  BINARY_SYMBOLS,
  UNARY_SYMBOLS,
  CONSTANT_SYMBOLS,
  SET_BINARY_SYMBOLS,
  operatorSymbol,
  symbolDisplay,
  type PaletteItem as Item,
} from "~/app/hooks/parser";

// Curated default palette: 2 rows (~24 items) covering the most common items
export const DEFAULT_PALETTE_ITEMS: Item[] = [
  { kind: "LPAR" },
  { kind: "RPAR" },
  { kind: "operator", op: "and" },
  { kind: "operator", op: "or" },
  { kind: "operator", op: "add" },
  { kind: "operator", op: "sub" },
  { kind: "operator", op: "mul" },
  { kind: "operator", op: "div" },
  { kind: "operator", op: "mod" },
  { kind: "operator", op: "pow" },
  { kind: "operator", op: "equal" },
  { kind: "binarySymbol", op: "xor" },
  { kind: "binarySymbol", op: "concat" },
  { kind: "binarySymbol", op: "congruent" },
  { kind: "binarySymbol", op: "notequal" },
  { kind: "binarySymbol", op: "leftarrow" },
  { kind: "binarySymbol", op: "rightarrow" },
  { kind: "binarySymbol", op: "elem" },
  { kind: "unarySymbol", op: "forall" },
  { kind: "unarySymbol", op: "exists" },
  { kind: "constantSymbol", op: "integers" },
  { kind: "constantSymbol", op: "reals" },
  { kind: "constantSymbol", op: "naturals" },
];

function matchSymbols<K extends "binarySymbol" | "unarySymbol" | "constantSymbol">(
  ops: readonly string[], kind: K, q: string, results: Item[]
) {
  ops.forEach(op => {
    if (op.includes(q) || symbolDisplay[op]?.includes(q)) {
      results.push({ kind, op } as Item);
    }
  });
}

// Default items for Values: a-x (upper bound — actual count is trimmed dynamically)
export const DEFAULT_VALUE_ITEMS: Item[] = [
  ...Array.from({ length: 24 }, (_, i) => ({ kind: "var" as const, name: String.fromCharCode(97 + i) })),
];

// Slot budget constants derived from ExprBlock (min-w-10 px-2 text-2xl) + ExprPalette (550px, px-2, gap-1)
const BLOCK_MIN_WIDTH = 40; // min-w-10
const BLOCK_PADDING = 16;   // px-2 both sides
const CHAR_WIDTH = 14;       // ~text-2xl char width in px
const GAP = 4;               // gap-1
const SINGLE_CHAR_SLOT = BLOCK_MIN_WIDTH + GAP; // 44px

export const SLOT_BUDGET = 24; // slots per palette (12 per row × 2 rows)

export function estimateSlotCost(item: Item): number {
  let charCount: number;
  if (item.kind === "var") charCount = item.name.length;
  else if (item.kind === "int") charCount = String(item.value).length;
  else if (item.kind === "operator") charCount = (operatorSymbol[item.op] ?? item.op).length;
  else if (item.kind === "binarySymbol" || item.kind === "unarySymbol" || item.kind === "constantSymbol")
    charCount = (symbolDisplay[item.op] ?? item.op).length;
  else charCount = 1; // LPAR, RPAR
  const width = Math.max(BLOCK_MIN_WIDTH, charCount * CHAR_WIDTH + BLOCK_PADDING);
  return (width + GAP) / SINGLE_CHAR_SLOT;
}

const PAREN_SEARCH_TERMS: { item: Item; terms: string[] }[] = [
  { item: { kind: "LPAR" }, terms: ["(", "left", "paren", "parenthesis"] },
  { item: { kind: "RPAR" }, terms: [")", "right", "paren", "parenthesis"] },
];

const SET_BINARY_SET = new Set<string>(SET_BINARY_SYMBOLS);
const NON_SET_BINARY_SYMBOLS = BINARY_SYMBOLS.filter(op => !SET_BINARY_SET.has(op));

// Search function for operators
export function searchOperators(query: string, customItems: Item[] = []): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];

  ALL_OPERATOR_PALETTE_ITEMS.forEach(item => {
    if (item.kind !== "operator") return;
    if (item.op.includes(q)) { results.push(item); return; }
    const symbol = operatorSymbol[item.op];
    if (symbol && symbol.includes(q)) results.push(item);
  });

  customItems.forEach(item => {
    if (item.kind !== "operator") return;
    if (item.op.toLowerCase().includes(q)) results.push(item);
  });

  PAREN_SEARCH_TERMS.forEach(({ item, terms }) => {
    if (terms.some(t => t.includes(q))) results.push(item);
  });

  return results;
}

// Search function for symbols (excludes set-theory items)
export function searchSymbols(query: string): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];
  matchSymbols(NON_SET_BINARY_SYMBOLS, "binarySymbol", q, results);
  matchSymbols(UNARY_SYMBOLS, "unarySymbol", q, results);
  return results;
}

// Search function for sets
export function searchSets(query: string): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];
  matchSymbols(SET_BINARY_SYMBOLS, "binarySymbol", q, results);
  matchSymbols(CONSTANT_SYMBOLS, "constantSymbol", q, results);
  return results;
}

// Search function for the combined Palette (operators + symbols + sets)
export function searchPalette(query: string, customItems: Item[] = []): Item[] {
  return [...searchOperators(query, customItems), ...searchSymbols(query), ...searchSets(query)];
}

// Search function for values (numbers and variables)
export function searchValues(query: string): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];
  const seen = new Set<string>();

  // If query is a number, add it as an int
  if (/^-?\d+$/.test(q)) {
    const value = parseInt(q, 10);
    results.push({ kind: "int", value });
    seen.add(`int:${value}`);
  }

  // If query matches variable pattern (letters with optional prime)
  if (/^[a-zA-Z][a-zA-Z0-9_]*'?$/.test(query.trim())) {
    results.push({ kind: "var", name: query.trim() });
    seen.add(`var:${q}`);
  }

  // Add matching default numbers (1-10)
  for (let i = 1; i <= 10; i++) {
    if (String(i).startsWith(q) && !seen.has(`int:${i}`)) {
      results.push({ kind: "int", value: i });
      seen.add(`int:${i}`);
    }
  }

  // Add matching variables (a-z)
  for (let i = 0; i < 26; i++) {
    const name = String.fromCharCode(97 + i);
    if (name.startsWith(q) && !seen.has(`var:${name}`)) {
      results.push({ kind: "var", name });
      seen.add(`var:${name}`);
    }
  }

  // Add matching primed variables (a'-z')
  for (let i = 0; i < 26; i++) {
    const name = String.fromCharCode(97 + i) + "'";
    if (name.startsWith(q) && !seen.has(`var:${name}`)) {
      results.push({ kind: "var", name });
      seen.add(`var:${name}`);
    }
  }

  return results;
}
