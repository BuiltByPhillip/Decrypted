"use client"

import { useEffect, useRef, useState } from "react";
import Dropable from "~/app/_components/exercises/construct/Dropable";
import ExprPalette from "~/app/_components/exercises/construct/ExprPalette";
import {
  ALL_OPERATOR_PALETTE_ITEMS,
  ALL_OPERATORS,
  ALL_SYMBOL_PALETTE_ITEMS,
  type BinaryOp,
  type BinarySymbol,
  type Expr,
  type PaletteItem as Item,
} from "~/app/hooks/parser";
import {
  DEFAULT_VALUE_ITEMS,
  searchOperators,
  searchSymbols,
  searchValues,
} from "~/app/_components/exercises/construct/paletteSearch";
import DragGhost from "~/app/_components/exercises/construct/DragGhost";
import ExprNode from "~/app/_components/exercises/construct/ExprNode";
import { normalizeExpr, paletteItemToExpr } from "~/app/hooks/expr";
import TrashContainer from "~/app/_components/exercises/construct/TrashContainer";
import DraggableWindow from "~/app/_components/exercises/construct/DraggableWindow";
import Button from "~/components/Button";

const EXPRESSION_STORAGE_KEY = "drag-and-drop-expression";

function loadExpression(): Expr | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(EXPRESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveExpression(expr: Expr | null) {
  if (typeof window === "undefined") return;
  if (expr === null) {
    localStorage.removeItem(EXPRESSION_STORAGE_KEY);
  } else {
    localStorage.setItem(EXPRESSION_STORAGE_KEY, JSON.stringify(expr));
  }
}

export default function DragAndDrop() {
  const dropRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<Map<string, { element: HTMLDivElement; onFill: (item: Item) => void }>>(new Map());
  const [expression, setExpression] = useState<Expr | null>(null);

  // Load expression from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved = loadExpression();
    if (saved) setExpression(saved);
  }, []);
  const [dragState, setDragState] = useState<{
    item: Item;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    fromTree?: boolean;
    restoreExpr?: () => void;
  } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  // Track z-index stacking order (most recent at end)
  const [stackOrder, setStackOrder] = useState<string[]>(["operators", "symbols", "values"]);

  const bringToFront = (id: string) => {
    setStackOrder(prev => {
      // Remove id from current position and add to end (top)
      const filtered = prev.filter(item => item !== id);
      return [...filtered, id];
    });
  };

  const getZIndex = (id: string) => {
    const index = stackOrder.indexOf(id);
    return index >= 0 ? index + 10 : 10; // Base z-index of 10
  };

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

  const findSlotIdAt = (x: number, y: number): string | null => {
    for (const [id, slot] of slotsRef.current.entries()) {
      const bounds = slot.element.getBoundingClientRect();
      if (isInside(x, y, bounds)) return id;
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
        if (currentExpr) {
          setExpression(currentExpr);
          saveExpression(currentExpr);
        }
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
      saveExpression(null);
    } else {
      setExpression(normalized);
      saveExpression(normalized);
    }
  }

  // Save expression whenever it changes directly
  const setExpressionWithSave = (expr: Expr | null) => {
    setExpression(expr);
    saveExpression(expr);
  };

  return (
    <div className="flex flex-col relative w-full">
      <DraggableWindow
        id="operators"
        defaultPosition={{ x: 20, y: 20 }}
        zIndex={getZIndex("operators")}
        onBringToFront={() => bringToFront("operators")}
      >
        <ExprPalette
          category="Operators"
          defaultItems={ALL_OPERATOR_PALETTE_ITEMS}
          searchFn={searchOperators}
          onStartDrag={onStartDrag}
        />
      </DraggableWindow>
      <DraggableWindow
        id="symbols"
        defaultPosition={{ x: 20, y: 120 }}
        zIndex={getZIndex("symbols")}
        onBringToFront={() => bringToFront("symbols")}
      >
        <ExprPalette
          category="Symbols"
          defaultItems={ALL_SYMBOL_PALETTE_ITEMS}
          searchFn={searchSymbols}
          onStartDrag={onStartDrag}
        />
      </DraggableWindow>
      <DraggableWindow
        id="values"
        defaultPosition={{ x: 20, y: 220 }}
        zIndex={getZIndex("values")}
        onBringToFront={() => bringToFront("values")}
      >
        <ExprPalette
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
          onMove={(x, y) => {
            setIsOverTrash(!!checkTrash(x, y));
            setHoveredSlotId(findSlotIdAt(x, y));
          }}
          onDrop={(x, y) => {
            setIsOverTrash(false);
            setHoveredSlotId(null);
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
              setExpressionWithSave(paletteItemToExpr(dragState.item));
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
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div></div> {/* Empty div */}
        <div className="flex flex-col">
          <Button
            variant="ghostMuted"
            className="flex justify-end pr-13 select-none"
            size="none"
            onClick={() => {
              setExpression(null)
            }}
          >
            Clear expression
          </Button>
          <Dropable ref={dropRef} isDragging={!!dragState}>
            {<span className="flex items-center justify-center select-none text-muted border-1 border-muted w-150 h-30 rounded-2xl text-2xl">{expression ? <ExprNode expr={expression} registerSlot={registerSlot} onSlotFill={setNormalizedExpression} onStartDrag={onExprStartDrag} isDragging={!!dragState} hoveredSlotId={hoveredSlotId} /> : <span>Drop here</span>}</span>}
          </Dropable>
        </div>

        <TrashContainer ref={trashRef} isDragging={!!dragState} isHovered={isOverTrash} className="ml-50"/>
      </div>
      <div className="flex justify-center pt-20">
        <Button variant="submit" className="w-100">Check answer</Button>
      </div>
    </div>


  );
}