import type { Expr } from "~/app/hooks/parser";
import { operatorSymbol } from "~/app/hooks/parser";

type ExprNodeProps = {
  expr: Expr;
}

export default function ExprNode({ expr }: ExprNodeProps) {
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
    case "binary":
      return (
        <div className="flex items-center gap-1">
          <ExprNode expr={expr.left} />
          <span>{operatorSymbol[expr.op]}</span>
          <ExprNode expr={expr.right} />
        </div>
      );
  }
}
