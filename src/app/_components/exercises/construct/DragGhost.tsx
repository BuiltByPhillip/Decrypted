import { useRef } from "react";
import { operatorSymbol, type PaletteItem } from "~/app/hooks/parser";
import useDraggable from "./useDraggable";

type DragGhostProps = {
  paletteItem: PaletteItem;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  onDrop: (x: number, y: number) => void;
};

export default function DragGhost({ paletteItem, onDrop, startX, startY, offsetX, offsetY }: DragGhostProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDraggable({ ref, startX, startY, offsetX, offsetY, onDrop });

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
      ref={ref}
      className="flex bg-dark fixed h-10 w-10 cursor-pointer rounded-2xl justify-center items-center text-muted text-2xl select-none"
    >
      {/* Remember to render the Expr type with the map operatorSymbol inside Parser.ts */}
      {renderValue(paletteItem)}
    </div>
  );
}