import {
  ALL_OPERATOR_PALETTE_ITEMS,
  BINARY_SYMBOLS,
  UNARY_SYMBOLS,
  CONSTANT_SYMBOLS,
  operatorSymbol,
  symbolDisplay,
  type PaletteItem as Item,
} from "~/app/hooks/parser";

// Default items for Values: 1-10 and a-j
export const DEFAULT_VALUE_ITEMS: Item[] = [
  ...Array.from({ length: 10 }, (_, i) => ({ kind: "int" as const, value: i + 1 })),
  ...Array.from({ length: 10 }, (_, i) => ({ kind: "var" as const, name: String.fromCharCode(97 + i) })),
];

// Search function for operators
export function searchOperators(query: string): Item[] {
  const q = query.toLowerCase();
  return ALL_OPERATOR_PALETTE_ITEMS.filter(item => {
    if (item.kind !== "operator") return false;
    // Match by operator name (e.g., "add", "mul")
    if (item.op.includes(q)) return true;
    // Match by display symbol (e.g., "+", "×")
    const symbol = operatorSymbol[item.op];
    if (symbol && symbol.includes(q)) return true;
    return false;
  });
}

// Search function for symbols
export function searchSymbols(query: string): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];

  // Search binary symbols
  BINARY_SYMBOLS.forEach(op => {
    if (op.includes(q) || symbolDisplay[op]?.includes(q)) {
      results.push({ kind: "binarySymbol", op });
    }
  });

  // Search unary symbols
  UNARY_SYMBOLS.forEach(op => {
    if (op.includes(q) || symbolDisplay[op]?.includes(q)) {
      results.push({ kind: "unarySymbol", op });
    }
  });

  // Search constant symbols
  CONSTANT_SYMBOLS.forEach(op => {
    if (op.includes(q) || symbolDisplay[op]?.includes(q)) {
      results.push({ kind: "constantSymbol", op });
    }
  });

  return results;
}

// Search function for values (numbers and variables)
export function searchValues(query: string): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];
  const seen = new Set<string>();

  // If query is a number, add it as an int
  if (/^\d+$/.test(q)) {
    const value = parseInt(q, 10);
    results.push({ kind: "int", value });
    seen.add(`int:${value}`);
  }

  // If query matches variable pattern (letters with optional prime)
  if (/^[a-zA-Z]+'?$/.test(query.trim())) {
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
