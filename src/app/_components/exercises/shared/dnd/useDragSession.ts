import { useRef, useState } from "react";


export type DragSession<T> = {
  id: number;
  item: T;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Generic hook for managing drag state in any drag-and-drop exercise.
 *
 * T is the type of the dragged item — e.g. PaletteItem for construct, string for match.
 * The hook only tracks *what* is being dragged and *where* the cursor is.
 * Exercise-specific logic (trash detection, token arrays, assignments) stays in the exercise component.
 *
 * Usage:
 *   const { dragState, dragCursorPos, startDrag, moveDrag, endDrag } = useDragSession<MyType>();
 *
 * - startDrag: call on mousedown to begin a drag session
 * - moveDrag:  call in DragGhost's onMove to keep dragCursorPos current (used by drop zones)
 * - endDrag:   call when the drag is resolved (dropped, cancelled, or disintegration complete)
 */
export function useDragSession<T>() {
  const dragIdRef = useRef(0);
  const [dragState, setDragState] = useState<DragSession<T> | null>(null);
  const [dragCursorPos, setDragCursorPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const startDrag = (
    item: T,
    x: number,
    y: number,
    offsetX: number,
    offsetY: number,
  ) => {
    setDragState({ id: ++dragIdRef.current, item, x, y, offsetX, offsetY });
    setDragCursorPos({ x, y });
  };

  const moveDrag = (x: number, y: number) => {
    setDragCursorPos({ x, y });
  };

  const endDrag = () => {
    setDragState(null);
    setDragCursorPos(null);
  };

  return { dragState, dragCursorPos, startDrag, moveDrag, endDrag };
}
