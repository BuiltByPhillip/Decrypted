import type { Expr, PaletteItem } from "~/app/hooks/parser";
import { operatorSymbol } from "~/app/hooks/parser";
import Dropable from "~/app/_components/exercises/construct/Dropable";
import { paletteItemToExpr } from "~/app/hooks/expr";

type ExprNodeProps = {
  expr: Expr;
  className?: string;
  slotIdPrefix?: string;
  onSlotFill?: (newExpr: Expr) => void;
  registerSlot?: (id: string, elem: HTMLDivElement | null, onFill: (item: PaletteItem) => void) => void // Register slot with the parent
  onStartDrag?: (expr: Expr, x: number, y: number, offsetX: number, offsetY: number) => void;
}

export default function ExprNode({ expr, className, slotIdPrefix, onStartDrag, onSlotFill, registerSlot }: ExprNodeProps) {

  function onFill(paletteItem: PaletteItem) {
    if (onSlotFill) {
      onSlotFill(paletteItemToExpr(paletteItem));
    }
  }

  // Leaf expressions - render their value directly
  switch (expr.kind) {
    case "int":
      return <span className="flex bg-dark h-10 w-10 cursor-pointer rounded-2xl justify-center items-center text-muted text-2xl select-none">{expr.value}</span>;
    case "var":
      return <span>{expr.name}</span>;
    case "role":
      return <span>{`{${expr.name}}`}</span>;
    case "placeholder":
      return <span>{`$${expr.index}`}</span>;
    case "slot":
      return <Dropable ref={(elem) => {
        registerSlot?.(slotIdPrefix ?? "", elem, onFill);
      }}/>
    case "binary":
      return (
        <div className="flex items-center gap-1">
          <ExprNode
            expr={expr.left}
            className={className}
            onStartDrag={onStartDrag}
            onSlotFill={(newExpr) => onSlotFill?.({...expr, left: newExpr})}
            slotIdPrefix={(slotIdPrefix + "") + "L"}
            registerSlot={registerSlot}
          />
          <span className="flex bg-dark h-10 w-10 cursor-pointer rounded-2xl justify-center items-center text-muted text-2xl select-none">{operatorSymbol[expr.op]}</span>
          <ExprNode
            expr={expr.right}
            className={className}
            onStartDrag={onStartDrag}
            onSlotFill={(newExpr) => onSlotFill?.({...expr, right: newExpr})}
            slotIdPrefix={(slotIdPrefix + "") + "R"}
            registerSlot={registerSlot}
          />
        </div>
      );
  }
}
