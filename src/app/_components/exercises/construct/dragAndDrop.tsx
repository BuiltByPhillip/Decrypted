"use client"

import { useRef, useState } from "react";
import Dropable from "~/app/_components/exercises/construct/Dropable";
import ExprContainer from "~/app/_components/exercises/construct/ExprContainer";
import { ALL_OPERATOR_PALETTE_ITEMS, type Expr, type PaletteItem as Item } from "~/app/hooks/parser";
import DragGhost from "~/app/_components/exercises/construct/DragGhost";
import ExprNode from "~/app/_components/exercises/construct/ExprNode";
import { normalizeExpr, paletteItemToExpr } from "~/app/hooks/expr";
import TrashContainer from "~/app/_components/exercises/construct/TrashContainer";

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
    replaceWithSlot?: () => void;
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
      case "binary":
        // Can't drag a binary with null operator
        if (expr.op === null) return null;
        return { kind: "operator", op: expr.op };
      default:
        return null;
    }
  };

  const onExprStartDrag = (expr: Expr, x: number, y: number, offsetX: number, offsetY: number, replaceWithSlot: () => void) => {
    const item = exprToPaletteItem(expr);
    if (!item) return;
    setDragState({
      item,
      x,
      y,
      offsetX,
      offsetY,
      replaceWithSlot,
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
    <div className="flex flex-col items-center">
      <ExprContainer
        paletteItems={[...ALL_OPERATOR_PALETTE_ITEMS, {kind: "int", value: 7}]}
        onStartDrag={onStartDrag}
      />
      {dragState && (
        <DragGhost
          paletteItem={dragState.item}
          startX={dragState.x}
          startY={dragState.y}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          onDrop={(x, y) => {
            const slot = findSlotAt(x, y);
            // Check if dropped in a slot
            if (slot && dragState) {
              slot.onFill(dragState.item) // Fill the slot
            }
            // Check if dropped in trash can
            else if (checkTrash(x, y) && dragState.replaceWithSlot) {
              dragState.replaceWithSlot();
            }
            // Check if dropped on main canvas (only for palette items, not tree items)
            else if (checkDrop(x, y) && dragState && !dragState.replaceWithSlot) {
              setExpression(paletteItemToExpr(dragState.item));
            }

            setDragState(null);
          }}
        />
      )}
      <Dropable ref={dropRef}>
        {expression ? <ExprNode expr={expression} registerSlot={registerSlot} onSlotFill={setNormalizedExpression} onStartDrag={onExprStartDrag} /> : <span className="text-muted">Drop here</span>}
      </Dropable>
      <TrashContainer ref={trashRef} className="absolute right-70 top-50" isDragging={!!dragState}/>
    </div>


  );
}