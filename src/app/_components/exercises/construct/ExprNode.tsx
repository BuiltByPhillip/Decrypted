import type { Expr, PaletteItem } from "~/app/hooks/parser";
import { operatorSymbol } from "~/app/hooks/parser";
import Dropable from "~/app/_components/exercises/construct/Dropable";

type ExprNodeProps = {
  expr: Expr;
  className?: string;
  onStartDrag?: (expr: Expr, x: number, y: number, offsetX: number, offsetY: number) => void;
}

export default function ExprNode({ expr, className, onStartDrag }: ExprNodeProps) {

  /*
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    onStartDrag(expr, e.clientX, e.clientY, offsetX, offsetY);
  };
   */

  // Leaf expressions - render their value directly
  switch (expr.kind) {
    case "int":
      return <span>{expr.value}</span>;
    case "var":
      return <span>{expr.name}</span>;
    case "role":
      return <span>{`{${expr.name}}`}</span>;
    case "placeholder":
      return <span>{`$${expr.index}`}</span>;
    case "slot":
      return <Dropable/>
    case "binary":
      return (
        <div className="flex items-center gap-1">
          <ExprNode expr={expr.left} className={className} onStartDrag={onStartDrag} />
          <span>{operatorSymbol[expr.op]}</span>
          <ExprNode expr={expr.right} className={className} onStartDrag={onStartDrag} />
        </div>
      );
  }
}
