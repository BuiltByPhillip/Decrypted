import { operatorSymbol, type PaletteItem } from "~/app/hooks/parser";

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
        return <div>{operatorSymbol[item.op]}</div>
    }
  }

  return (
    <div
      className={`flex items-center justify-center bg-dark h-10 w-10 cursor-pointer rounded-2xl text-muted text-2xl select-none ${className}`}
    >
      {renderValue(item)}
    </div>
  );
}