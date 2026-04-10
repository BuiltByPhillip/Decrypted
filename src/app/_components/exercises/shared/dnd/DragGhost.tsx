"use client"

import { useRef } from "react";
import useDraggable from "~/app/_components/exercises/shared/dnd/useDraggable";

type DragGhostProps = {
  children: React.ReactNode;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  onDrop: (x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
};

/**
 * A floating element that follows the cursor during a drag.
 * Renders whatever children you pass — no domain coupling.
 *
 * The construct exercise passes ExprBlock or DisintegrateToken as children.
 * The match exercise passes a MatchCard as children.
 * Any future exercise can pass anything.
 */
export default function DragGhost({ children, onDrop, onMove, startX, startY, offsetX,
                                    offsetY }: DragGhostProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDraggable({ ref, startX, startY, offsetX, offsetY, onDrop, onMove });

  return (
    <div ref={ref} className="fixed z-50">
      {children}
    </div>
  );

}
