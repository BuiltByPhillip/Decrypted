"use client"

import { useLayoutEffect, useRef } from "react";

type DragElementProps = {
  element: HTMLElement | null;
  offsetX: number;
  offsetY: number;
  onDrop: (x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
  /** When true, the element resizes to match the drop target it is hovering over. */
  resizeToHover?: boolean;
  /** The drop container currently being hovered. Update this as the cursor moves. */
  hoverElement?: HTMLElement | null;
};

/**
 * Moves an existing DOM element with the cursor by applying position:fixed inline styles.
 * Analogous to DragGhost, but targets a real element instead of rendering a clone.
 *
 * Mount this component when drag starts (same lifecycle as DragGhost - conditionally rendered
 * while dragState is set). It renders nothing; all behavior is applied to `element`.
 *
 * On mount: pins the element at its current screen position, adds mousemove/mouseup listeners.
 * On unmount: resets inline styles (called automatically when the parent clears dragState).
 *
 * Usage:
 *   <DragElement
 *     element={cardRefs.current[dragState.item]}
 *     offsetX={dragState.offsetX}
 *     offsetY={dragState.offsetY}
 *     onMove={(x, y) => { ... }}
 *     onDrop={(x, y) => { ... endDrag() }}
 *   />
 */
export default function DragElement({ element, offsetX, offsetY, onDrop, onMove, resizeToHover, hoverElement }: DragElementProps) {
  const onDropRef = useRef(onDrop);
  const onMoveRef = useRef(onMove);
  // Written on every render so the mousemove closure always sees the latest hover target
  const hoverElementRef = useRef(hoverElement);
  hoverElementRef.current = hoverElement;

  useLayoutEffect(() => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const originalWidth = rect.width;
    const originalHeight = rect.height;

    element.style.position = "fixed";
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${originalWidth}px`;
    element.style.zIndex = "50";
    element.style.pointerEvents = "none";

    const mousemove = (ev: MouseEvent) => {
      element.style.left = `${ev.clientX - offsetX}px`;
      element.style.top = `${ev.clientY - offsetY}px`;

      if (resizeToHover) {
        const target = hoverElementRef.current;
        if (target) {
          element.style.transition = "width 0.15s ease, height 0.15s ease";
          const targetRect = target.getBoundingClientRect();
          element.style.width = `${targetRect.width}px`;
          element.style.height = `${targetRect.height}px`;
        } else {
          element.style.transition = "width 0.3s ease-out, height 0.3s ease-out";
          element.style.width = `${originalWidth}px`;
          element.style.height = `${originalHeight}px`;
        }
      }

      onMoveRef.current?.(ev.clientX, ev.clientY);
    };

    const mouseup = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.width = "";
      element.style.height = "";
      element.style.zIndex = "";
      element.style.pointerEvents = "";
      element.style.transition = "";
      onDropRef.current(ev.clientX, ev.clientY);
    };

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);

    return () => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
