import { useRef } from "react";
import { type PaletteItem } from "~/app/hooks/parser";
import useDraggable from "./useDraggable";
import ExprBlock from "./ExprBlock";

type DragGhostProps = {
  paletteItem: PaletteItem;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  onDrop: (x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
};

export default function DragGhost({ paletteItem, onDrop, onMove, startX, startY, offsetX, offsetY }: DragGhostProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDraggable({ ref, startX, startY, offsetX, offsetY, onDrop, onMove });

  return (
    <div ref={ref} className="fixed">
      <ExprBlock item={paletteItem} />
    </div>
  );
}