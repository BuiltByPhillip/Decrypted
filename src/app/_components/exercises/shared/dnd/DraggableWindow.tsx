import React, { useEffect, useState, useRef, forwardRef } from "react";

type Position = { x: number; y: number };

type DraggableWindowProps = {
  defaultPosition: Position;
  children: React.ReactNode;
  zIndex?: number;
  onBringToFront?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

const DraggableWindow = forwardRef<HTMLDivElement, DraggableWindowProps>(
function DraggableWindow({ defaultPosition, children, zIndex = 0, onBringToFront, containerRef }: DraggableWindowProps, externalRef) {
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const resetPosition = () => {
    const windowWidth = windowRef.current?.getBoundingClientRect().width ?? 0;
    const containerWidth = containerRef?.current?.getBoundingClientRect().width ?? window.innerWidth;
    setPosition({
      x: Math.max(0, (containerWidth - windowWidth) / 2),
      y: defaultPosition.y,
    });
  };

  // Center horizontally on mount
  useEffect(() => {
    resetPosition();
  }, []);

  // Reset position when viewport is resized
  useEffect(() => {
    window.addEventListener("resize", resetPosition);
    return () => {
      window.removeEventListener("resize", resetPosition);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    onBringToFront?.();

    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;

    e.preventDefault();
    setIsDragging(true);
    const parentRect = containerRef?.current?.getBoundingClientRect();
    const offsetX = parentRect?.left ?? 0;
    const offsetY = parentRect?.top ?? 0;
    dragOffset.current = {
      x: e.clientX - offsetX - (position?.x ?? 0),
      y: e.clientY - offsetY - (position?.y ?? 0),
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    let currentPos = position ?? defaultPosition;

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
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const mergedRef = (node: HTMLDivElement | null) => {
    (windowRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof externalRef === "function") externalRef(node);
    else if (externalRef) (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={mergedRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: position?.x ?? 0,
        top: position?.y ?? defaultPosition.y,
        visibility: position ? "visible" : "hidden",
        cursor: isDragging ? "grabbing" : "default",
        zIndex: zIndex,
      }}
    >
      {children}
    </div>
  );
});

export default DraggableWindow;
