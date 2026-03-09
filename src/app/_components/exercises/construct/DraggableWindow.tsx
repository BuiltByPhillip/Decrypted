import React, { useEffect, useState, useRef } from "react";

type Position = { x: number; y: number };

type DraggableWindowProps = {
  id: string;
  defaultPosition: Position;
  children: React.ReactNode;
  zIndex?: number;
  onBringToFront?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
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

export default function DraggableWindow({ id, defaultPosition, children, zIndex = 0, onBringToFront, containerRef }: DraggableWindowProps) {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

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
    // Bring to front when clicked
    onBringToFront?.();

    // Only start drag if clicking on the drag handle (data attribute)
    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;

    e.preventDefault();
    setIsDragging(true);
    const parentRect = containerRef?.current?.getBoundingClientRect();
    const offsetX = parentRect?.left ?? 0;
    const offsetY = parentRect?.top ?? 0;
    dragOffset.current = {
      x: e.clientX - offsetX - position.x,
      y: e.clientY - offsetY - position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    let currentPos = position;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = windowRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const height = rect?.height ?? 0;

      const parentRect = containerRef?.current?.getBoundingClientRect();
      const offsetX = parentRect?.left ?? 0;
      const offsetY = parentRect?.top ?? 0;
      const parentWidth = parentRect?.width ?? window.innerWidth;
      const parentHeight = parentRect?.height ?? window.innerHeight;

      const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x - offsetX, parentWidth - width));
      const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y - offsetY, parentHeight - height));

      currentPos = { x, y };
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
      ref={windowRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "default",
        zIndex: zIndex,
      }}
    >
      {children}
    </div>
  );
}
