import { useEffect, useRef, type RefObject } from "react";

type UseDraggableOptions = {
  ref: RefObject<HTMLElement | null>;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  onDrop: (x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
};

export default function useDraggable({
  ref,
  startX,
  startY,
  offsetX,
  offsetY,
  onDrop,
  onMove,
}: UseDraggableOptions) {
  const posRef = useRef({ startX, startY });
  const onDropRef = useRef(onDrop);
  const onMoveRef = useRef(onMove);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Offset by where the user clicked within the element
    element.style.left = startX - offsetX + "px";
    element.style.top = startY - offsetY + "px";

    const mousemove = (event: MouseEvent) => {
      const deltaX = posRef.current.startX - event.clientX;
      const deltaY = posRef.current.startY - event.clientY;

      posRef.current.startX = event.clientX;
      posRef.current.startY = event.clientY;

      element.style.top = element.offsetTop - deltaY + "px";
      element.style.left = element.offsetLeft - deltaX + "px";

      onMoveRef.current?.(event.clientX, event.clientY);
    };

    const mouseup = (event: MouseEvent) => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
      onDropRef.current(event.clientX, event.clientY);
    };

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);

    return () => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
