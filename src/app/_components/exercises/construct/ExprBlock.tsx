import {
  operatorSymbol,
  type PaletteItem,
  symbolDisplay,
} from "~/app/hooks/parser";

type ExprBlockProps = {
  item: PaletteItem;
  className?: string;
}

export default function ExprBlock({ item, className }: ExprBlockProps) {

  const renderValue = (item: PaletteItem) => {
    switch (item.kind) {
      case "int":
        return <div>{item.value}</div>;
      case "var":
        return <div>{item.name}</div>;
      case "role":
        return <div>{item.name}</div>;
      case "operator":
        return <div>{operatorSymbol[item.op]}</div>;
      case "constantSymbol":
      case "unarySymbol":
      case "binarySymbol":
        return <div>{symbolDisplay[item.op]}</div>;
      case "LPAR":
        return <div>(</div>;
      case "RPAR":
        return <div>)</div>;
    }
  }

  return (
    <div
      className={`flex items-center justify-center h-10 min-w-10 px-2 cursor-pointer rounded-2xl text-2xl select-none hover:brightness-125 ${className ?? "bg-dark text-muted"}`}
    >
      {renderValue(item)}
    </div>
  );
}