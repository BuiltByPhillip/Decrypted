import { useRef } from "react";
import { type PaletteItem } from "~/app/hooks/parser";
import useDraggable from "~/app/_components/exercises/shared/dnd/useDraggable";
import ExprBlock from "./ExprBlock";
import DisintegrateToken from "./DisintegrateToken";

type DragGhostProps = {
  paletteItem: PaletteItem;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  onDrop: (x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
  disintegrating?: boolean;
  onDisintegrateCompleteAction?: () => void;
};

export default function DragGhost({ paletteItem, onDrop, onMove, startX, startY, offsetX, offsetY, disintegrating, onDisintegrateCompleteAction }: DragGhostProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDraggable({ ref, startX, startY, offsetX, offsetY, onDrop, onMove });

  return (
    <div ref={ref} className="fixed">
      {disintegrating ? (
        <DisintegrateToken
          item={paletteItem}
          active={true}
          onCompleteAction={onDisintegrateCompleteAction ?? (() => {})}
        />
      ) : (
        <ExprBlock item={paletteItem} />
      )}
    </div>
  );
}