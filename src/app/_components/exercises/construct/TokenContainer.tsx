"use client"

import { Fragment, useEffect, useRef, useState } from "react";
import type {PaletteItem, TokenRange} from "~/app/hooks/parser";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";

type TokenContainerProps = {
  tokens: PaletteItem[];
  isDragging: boolean;
  dragPos: { x: number; y: number } | null;
  draggingTokenIndex?: number;
  onGapHover: (index: number | null) => void;
  onTokenStartDrag: (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => void;
  errorRange?: TokenRange | null;
}

/* Props for gap */
type GapProps = {
  active: boolean;
  isDragging: boolean;
  isEmpty: boolean;
}

function Gap({ active, isDragging, isEmpty }: GapProps) {
  if (isEmpty) {
    return (
      <div className={`flex items-center justify-center h-10 rounded-xl transition-all duration-150 ease-out ${
        isDragging
          ? active ? "w-40 bg-accent opacity-90" : "w-24 bg-accent/20 opacity-60"
          : "w-24 opacity-50 text-muted text-base"
      }`}>
        {!isDragging && <span>Drop here</span>}
      </div>
    );
  }
  if (!isDragging) return null;
  return (
    <div className={`h-10 rounded-lg bg-accent transition-all duration-150 ease-out ${
      active ? "w-12 opacity-100" : "w-0 opacity-0"
    }`} />
  );
}

export default function TokenContainer({ tokens, isDragging, dragPos, draggingTokenIndex, onGapHover, onTokenStartDrag, errorRange }: TokenContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeGap, setActiveGap] = useState<number | null>(null);

  useEffect(() => {
    tokenRefs.current = tokenRefs.current.slice(0, tokens.length);
  }, [tokens.length]);

  useEffect(() => {
    if (!isDragging || !dragPos) {
      setActiveGap(null);
      onGapHover(null);
      return;
    }

    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    // Only activate when cursor is within range of the container (both axes)
    const inRange =
      dragPos.y >= bounds.top - 48 && dragPos.y <= bounds.bottom + 48 &&
      dragPos.x >= bounds.left - 48 && dragPos.x <= bounds.right + 48;
    if (!inRange) {
      setActiveGap(null);
      onGapHover(null);
      return;
    }

    if (tokens.length === 0) {
      setActiveGap(0);
      onGapHover(0);
      return;
    }

    // Find the gap the cursor belongs to using token midpoints
    let gap = 0;
    for (let i = 0; i < tokens.length; i++) {
      const ref = tokenRefs.current[i];
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (dragPos.x > rect.left + rect.width / 2) gap = i + 1;
    }

    setActiveGap(gap);
    onGapHover(gap);
    // onGapHover is a ref-setter in the parent — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragPos, isDragging, tokens]);

  return (
    <div ref={containerRef} className="flex items-center">
      <Gap active={activeGap === 0} isDragging={isDragging} isEmpty={tokens.length === 0} />
      {tokens.map((token, i) => (
        <Fragment key={i}>
          <div
            ref={el => { tokenRefs.current[i] = el; }}
            className={[
              draggingTokenIndex === i ? "opacity-0 pointer-events-none" : "",
              errorRange && i >= errorRange.start && i < errorRange.end ? "border-2 border-red-500 rounded-lg" : ""
            ].join(" ").trim() || undefined}
            onMouseDown={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              onTokenStartDrag(i, token, e.clientX, e.clientY, e.clientX - rect.left, e.clientY - rect.top);
            }}
          >
            <ExprBlock item={token} />
          </div>
          <Gap active={activeGap === i + 1} isDragging={isDragging} isEmpty={false} />
        </Fragment>
      ))}
    </div>
  );
}
