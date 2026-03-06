import { operatorSymbol, type PaletteItem } from "~/app/hooks/parser";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";

type PaletteItemProps = {
  item: PaletteItem;
  onStartDrag: (item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => void;
  className?: string;
}

export default function PaletteItem({ item, onStartDrag, className }: PaletteItemProps) {

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    onStartDrag(item, e.clientX, e.clientY, offsetX, offsetY);
  };

  return (
    <div className={`w-fit ${className ?? ''}`} onMouseDown={handleMouseDown}>
      <ExprBlock item={item}/>
    </div>
  );
}