import React, { useEffect, useState, useRef } from "react";

type Position = { x: number; y: number };

type DraggableWindowProps = {
  id: string;
  defaultPosition: Position;
  children: React.ReactNode;
};

const STORAGE_KEY = "draggable-window-positions";

function loadPositions(): Record<string, Position> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, Position>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function getInitialPosition(id: string, defaultPosition: Position): Position {
  if (typeof window === "undefined") return defaultPosition;
  const positions = loadPositions();
  return positions[id] ?? defaultPosition;
}

export default function DraggableWindow({ id, defaultPosition, children }: DraggableWindowProps) {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  // Load saved position on mount (client-side only)
  useEffect(() => {
    setPosition(getInitialPosition(id, defaultPosition));
    setIsClient(true);
  }, [id, defaultPosition]);

  // Save position when it changes (debounced on drag end)
  const savePosition = (pos: Position) => {
    const positions = loadPositions();
    positions[id] = pos;
    savePositions(positions);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if clicking on the drag handle (data attribute)
    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;

    e.preventDefault();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    let currentPos = position;

    const handleMouseMove = (e: MouseEvent) => {
      currentPos = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      };
      setPosition(currentPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      savePosition(currentPos);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Don't render until client-side position is loaded to prevent flicker
  if (!isClient) {
    return null;
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {children}
    </div>
  );
}
