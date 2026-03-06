import type { BinaryOp, Expr, PaletteItem } from "~/app/hooks/parser";
import Dropable from "~/app/_components/exercises/construct/Dropable";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";
import { paletteItemToExpr } from "~/app/hooks/expr";

type ExprNodeProps = {
  expr: Expr;
  className?: string;
  slotIdPrefix?: string;
  onSlotFill?: (newExpr: Expr) => void;
  registerSlot?: (id: string, elem: HTMLDivElement | null, onFill: (item: PaletteItem) => void) => void; // Register slot with the parent
  onStartDrag?: (expr: Expr, x: number, y: number, offsetX: number, offsetY: number, replaceWithSlot: () => void) => void;
}

export default function ExprNode({ expr, className, slotIdPrefix, onStartDrag, onSlotFill, registerSlot }: ExprNodeProps) {

  function onFill(paletteItem: PaletteItem) {
    if (onSlotFill) {
      onSlotFill(paletteItemToExpr(paletteItem));
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (!onStartDrag || !onSlotFill) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    onStartDrag(expr, e.clientX, e.clientY, offsetX, offsetY, () => onSlotFill({ kind: "slot" }));
  };

  // Handler for dragging operator - sets op to null instead of replacing entire expression
  const handleOperatorMouseDown = (e: React.MouseEvent<HTMLElement>, op: BinaryOp) => {
    if (!onStartDrag || !onSlotFill || expr.kind !== "binary") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // Create a fake "operator" expr for the drag ghost
    const operatorExpr: Expr = { kind: "binary", op, left: { kind: "slot" }, right: { kind: "slot" } };

    // If both children are slots, removing the operator leaves an empty structure
    // In that case, replace the entire binary with a single slot
    const bothChildrenAreSlots = expr.left.kind === "slot" && expr.right.kind === "slot";
    const replaceWith = bothChildrenAreSlots
      ? { kind: "slot" } as const
      : { ...expr, op: null };

    onStartDrag(operatorExpr, e.clientX, e.clientY, offsetX, offsetY, () => onSlotFill(replaceWith));
  };

  // Handler for filling an operator slot
  const onOperatorFill = (paletteItem: PaletteItem) => {
    if (expr.kind !== "binary" || paletteItem.kind !== "operator") return;
    onSlotFill?.({ ...expr, op: paletteItem.op });
  };

  // Leaf expressions - render their value directly
  switch (expr.kind) {
    case "int":
      return (
        <span onMouseDown={handleMouseDown}>
          <ExprBlock item={expr} />
        </span>
      );
    case "var":
      return <span onMouseDown={handleMouseDown}>{expr.name}</span>;
    case "role":
      return <span onMouseDown={handleMouseDown}>{`{${expr.name}}`}</span>;
    case "placeholder":
      return <span onMouseDown={handleMouseDown}>{`$${expr.index}`}</span>;
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
          {expr.op === null ? (
            // Operator slot - render a Dropable for dropping a new operator
            <Dropable
              ref={(elem) => {
                registerSlot?.((slotIdPrefix ?? "") + "OP", elem, onOperatorFill);
              }}
              className="h-10 w-10"
            />
          ) : (
            // Operator present - render it and make it draggable
            <span onMouseDown={(e) => handleOperatorMouseDown(e, expr.op!)}>
              <ExprBlock item={{ kind: "operator", op: expr.op }} />
            </span>
          )}
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
