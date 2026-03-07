"use client"

import { useRef, useState } from "react";
import Dropable from "~/app/_components/exercises/construct/Dropable";
import ExprContainer from "~/app/_components/exercises/construct/ExprContainer";
import {
  ALL_OPERATOR_PALETTE_ITEMS,
  ALL_OPERATORS,
  ALL_SYMBOL_PALETTE_ITEMS,
  BINARY_SYMBOLS,
  UNARY_SYMBOLS,
  CONSTANT_SYMBOLS,
  operatorSymbol,
  symbolDisplay,
  type BinaryOp,
  type BinarySymbol,
  type Expr,
  type PaletteItem as Item,
} from "~/app/hooks/parser";
import DragGhost from "~/app/_components/exercises/construct/DragGhost";
import ExprNode from "~/app/_components/exercises/construct/ExprNode";
import { normalizeExpr, paletteItemToExpr } from "~/app/hooks/expr";
import TrashContainer from "~/app/_components/exercises/construct/TrashContainer";
import DraggableWindow from "~/app/_components/exercises/construct/DraggableWindow";

// Default items for Values: 1-10 and a-j
const DEFAULT_VALUE_ITEMS: Item[] = [
  ...Array.from({ length: 10 }, (_, i) => ({ kind: "int" as const, value: i + 1 })),
  ...Array.from({ length: 10 }, (_, i) => ({ kind: "var" as const, name: String.fromCharCode(97 + i) })),
];

// Search function for operators
function searchOperators(query: string): Item[] {
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
function searchSymbols(query: string): Item[] {
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
function searchValues(query: string): Item[] {
  const q = query.toLowerCase();
  const results: Item[] = [];
  const seen = new Set<string>();

  // If query is a number, add it as an int
  if (/^\d+$/.test(q)) {
    const value = parseInt(q, 10);
    results.push({ kind: "int", value });
    seen.add(`int:${value}`);
  }

  // If query matches variable pattern (a-z with optional prime)
  if (/^[a-z]'?$/.test(q)) {
    results.push({ kind: "var", name: q });
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

export default function DragAndDrop() {
  const dropRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<Map<string, { element: HTMLDivElement; onFill: (item: Item) => void }>>(new Map());
  const [expression, setExpression] = useState<Expr | null>(null);
  const [dragState, setDragState] = useState<{
    item: Item;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    fromTree?: boolean;
    restoreExpr?: () => void;
  } | null>(null);

  const registerSlot = (id: string, elem: HTMLDivElement | null, onFill: (item: Item) => void) => {
    elem ? slotsRef.current.set(id, {element: elem, onFill}) : slotsRef.current.delete(id)
  }

  const isInside = (x: number, y: number, bounds: DOMRect): boolean => {
    return (
      x >= bounds.left &&
      x <= bounds.right &&
      y <= bounds.bottom &&
      y >= bounds.top
    )
  }

  const findSlotAt = (x: number, y: number) => {
    for (const slot of slotsRef.current.values()) {
      const bounds = slot.element.getBoundingClientRect();

      if (isInside(x, y, bounds)) return slot;
    }
    return null;
  }

  const checkDrop = (x:number, y:number) :  DOMRect | null => {
    const bounds = dropRef.current?.getBoundingClientRect();
    if (!bounds) return null;

    return isInside(x, y, bounds) ? bounds : null;
  }

  const checkTrash = (x:number, y:number) => {
    const bounds = trashRef.current?.getBoundingClientRect();
    if (!bounds) return null;

    return isInside(x, y, bounds) ? bounds : null;
  }

  const onStartDrag = (item: Item, x: number, y: number, offsetX: number, offsetY: number) => {
    setDragState({
      item: item,
      x: x,
      y: y,
      offsetX: offsetX,
      offsetY: offsetY,
    })
  }

  const exprToPaletteItem = (expr: Expr): Item | null => {
    switch (expr.kind) {
      case "int":
        return { kind: "int", value: expr.value };
      case "var":
        return { kind: "var", name: expr.name };
      case "role":
        return { kind: "role", name: expr.name };
      case "constant":
        return { kind: "constantSymbol", op: expr.symbol };
      case "unary":
        if (expr.op === null) return null;
        return { kind: "unarySymbol", op: expr.op };
      case "binary":
        if (expr.op === null) return null;
        // Check if it's a regular operator or a binary symbol
        if ((ALL_OPERATORS as readonly string[]).includes(expr.op)) {
          return { kind: "operator", op: expr.op as BinaryOp };
        }
        return { kind: "binarySymbol", op: expr.op as BinarySymbol };
      default:
        return null;
    }
  };

  const onExprStartDrag = (expr: Expr, x: number, y: number, offsetX: number, offsetY: number, replaceWithSlot: () => void) => {
    const item = exprToPaletteItem(expr);
    if (!item) return;

    // Store current expression so we can restore if dropped in invalid area
    const currentExpr = expression;

    // Immediately remove the element from the tree - it's now "in hand"
    replaceWithSlot();

    setDragState({
      item,
      x,
      y,
      offsetX,
      offsetY,
      fromTree: true,
      restoreExpr: () => {
        if (currentExpr) setExpression(currentExpr);
      },
    });
  }

  // Wrapper that normalizes the expression before setting it
  // This collapses empty binary structures (op: null, left: slot, right: slot) to a single slot
  const setNormalizedExpression = (expr: Expr) => {
    const normalized = normalizeExpr(expr);
    // If the entire expression collapsed to a slot, clear it
    if (normalized.kind === "slot") {
      setExpression(null);
    } else {
      setExpression(normalized);
    }
  }

  return (
    <div className="relative w-full h-full">
      <DraggableWindow id="operators" defaultPosition={{ x: 20, y: 20 }}>
        <ExprContainer
          category="Operators"
          defaultItems={ALL_OPERATOR_PALETTE_ITEMS}
          searchFn={searchOperators}
          onStartDrag={onStartDrag}
        />
      </DraggableWindow>
      <DraggableWindow id="symbols" defaultPosition={{ x: 20, y: 120 }}>
        <ExprContainer
          category="Symbols"
          defaultItems={ALL_SYMBOL_PALETTE_ITEMS}
          searchFn={searchSymbols}
          onStartDrag={onStartDrag}
        />
      </DraggableWindow>
      <DraggableWindow id="values" defaultPosition={{ x: 20, y: 220 }}>
        <ExprContainer
          category="Values"
          defaultItems={DEFAULT_VALUE_ITEMS}
          searchFn={searchValues}
          onStartDrag={onStartDrag}
        />
      </DraggableWindow>

      {dragState && (
        <DragGhost
          paletteItem={dragState.item}
          startX={dragState.x}
          startY={dragState.y}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          onDrop={(x, y) => {
            const slot = findSlotAt(x, y);
            let handled = false;

            // Check if dropped in a slot
            if (slot && dragState) {
              slot.onFill(dragState.item);
              handled = true;
            }
            // Check if dropped in trash can (only matters for tree items)
            else if (checkTrash(x, y) && dragState.fromTree) {
              // Element is already removed, nothing more to do
              handled = true;
            }
            // Check if dropped on main canvas (only for palette items, not tree items)
            else if (checkDrop(x, y) && dragState && !dragState.fromTree) {
              setExpression(paletteItemToExpr(dragState.item));
              handled = true;
            }

            // If dropped in invalid area and came from tree, restore original
            if (!handled && dragState.fromTree && dragState.restoreExpr) {
              dragState.restoreExpr();
            }

            setDragState(null);
          }}
        />
      )}
      <Dropable ref={dropRef}>
        {expression ? <ExprNode expr={expression} registerSlot={registerSlot} onSlotFill={setNormalizedExpression} onStartDrag={onExprStartDrag} /> : <span className="flex items-center justify-center select-none text-muted border-2 border-muted w-150 h-30 rounded-2xl text-2xl">Drop here</span>}
      </Dropable>
      <TrashContainer ref={trashRef} className="absolute right-70 top-50" isDragging={!!dragState}/>
    </div>


  );
}