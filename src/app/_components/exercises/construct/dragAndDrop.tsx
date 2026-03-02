"use client"

import { useRef, useState } from "react";
import Dropable from "~/app/_components/exercises/construct/Dropable";
import ExprContainer from "~/app/_components/exercises/construct/ExprContainer";
import type { Expr, PaletteItem as Item } from "~/app/hooks/parser";
import DragGhost from "~/app/_components/exercises/construct/DragGhost";
import ExprNode from "~/app/_components/exercises/construct/ExprNode";
import { paletteItemToExpr } from "~/app/hooks/expr";

export default function DragAndDrop() {
  const dropRef = useRef<HTMLDivElement>(null);
  const [expression, setExpression] = useState<Expr | null>(null);
  const [dragState, setDragState] = useState<{
    item: Item;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const checkDrop = (x:number, y:number) :  DOMRect | null => {
    const bounds = dropRef.current?.getBoundingClientRect();
    if (!bounds) return null;

    const isInside = (
      x >= bounds.left &&
      x <= bounds.right &&
      y <= bounds.bottom &&
      y >= bounds.top
    );

    return isInside ? bounds : null;
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

  return (
    <div className="flex flex-col items-center">
      <ExprContainer
        paletteItems={[{kind: "operator", op: "div"}, {kind: "operator", op: "mul"}]}
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
            const bounds = checkDrop(x, y);
            if (bounds && dragState) {
              setExpression(paletteItemToExpr(dragState.item));
            }
            setDragState(null);
          }}
        />
      )}
      <Dropable ref={dropRef}>
        {expression ? <ExprNode expr={expression} /> : <span className="text-muted">Drop here</span>}
      </Dropable>
    </div>


  );
}