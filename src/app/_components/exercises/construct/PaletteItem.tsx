import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type PaletteItem } from "~/app/hooks/parser";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";

type PaletteItemProps = {
  item: PaletteItem;
  onStartDrag: (item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => void;
  className?: string;
}

function getTooltip(item: PaletteItem): string | null {
  switch (item.kind) {
    case "operator":
    case "binarySymbol":
    case "unarySymbol":
    case "constantSymbol":
      return item.op;
    case "int":
    case "var":
    case "role":
    case "LPAR":
    case "RPAR":
      return null;
  }
}

export default function PaletteItem({ item, onStartDrag, className }: PaletteItemProps) {
  const tooltip = getTooltip(item);
  const itemRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleMouseEnter = () => {
    if (!tooltip || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const pos = { x: rect.left + rect.width / 2, y: rect.top };
    timerRef.current = setTimeout(() => setTooltipPos(pos), 700);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltipPos(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltipPos(null);
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    onStartDrag(item, e.clientX, e.clientY, offsetX, offsetY);
  };

  return (
    <div
      ref={itemRef}
      className={`w-fit ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      <ExprBlock item={item}/>
      {tooltipPos && tooltip && createPortal(
        <span
          className="pointer-events-none fixed px-1.5 py-0.5 rounded text-xs text-muted bg-[#1e1e1e] border border-muted whitespace-nowrap z-[9999]"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 8, transform: "translate(-50%, -100%)" }}
        >
          {tooltip}
        </span>,
        document.body
      )}
    </div>
  );
}
