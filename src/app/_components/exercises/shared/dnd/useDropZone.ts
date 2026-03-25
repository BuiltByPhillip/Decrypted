import { type RefObject } from "react";

/**
 * Returns true when the drag cursor is within the bounds of the referenced element.
 *
 * Designed for single drop targets (e.g. the trash can).
 * For multiple drop zones (e.g. match exercise slots), do NOT call this in a loop.
 * Instead, iterate over a refs map manually in your onMove callback.
 *
 * @param ref     - ref attached to the drop target element
 * @param dragPos - current cursor position from useDragSession, or null when not dragging
 * @param padding - optional px expansion of the hit area on all sides (default 0)
 */
export function useDropZone(
  ref: RefObject<HTMLElement | null>,
  dragPos: { x: number; y: number } | null,
  padding = 0,
): boolean {
  if (!dragPos) return false;
  const bounds = ref.current?.getBoundingClientRect();
  if (!bounds) return false;
  return (
    dragPos.x >= bounds.left - padding &&
    dragPos.x <= bounds.right + padding &&
    dragPos.y >= bounds.top - padding &&
    dragPos.y <= bounds.bottom + padding
  );
}
