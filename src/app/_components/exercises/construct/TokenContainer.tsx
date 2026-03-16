"use client"

import { Fragment, useLayoutEffect, useRef } from "react";
import type {PaletteItem, TokenRange} from "~/app/hooks/parser";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";

type TokenContainerProps = {
  tokens: PaletteItem[];
  isDragging: boolean;
  dragPos: { x: number; y: number } | null;
  onGapHover: (index: number | null) => void;
  onTokenStartDrag: (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => void;
  errorRange?: TokenRange | null;
  isCorrect?: boolean | null;
}

function EmptyGap({ isDragging }: { isDragging: boolean }) {
  return (
    <div className={`flex items-center justify-center h-10 rounded-xl transition-all duration-150 ease-out ${
      isDragging ? "w-40 bg-accent opacity-90" : "w-24 opacity-50 text-muted text-base"
    }`}>
      {!isDragging && <span>Drop here</span>}
    </div>
  );
}

export default function TokenContainer({ tokens, isDragging, dragPos, onGapHover, onTokenStartDrag, errorRange, isCorrect }: TokenContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gapRefs = useRef<(HTMLDivElement | null)[]>([]);
  // True on the very first useLayoutEffect call after a drag begins.
  // Used to skip CSS transition so the gap snaps to its correct size immediately,
  // preventing the "collapse then expand" flash.
  const isFirstDragFrameRef = useRef(false);

  useLayoutEffect(() => {
    tokenRefs.current = tokenRefs.current.slice(0, tokens.length);
    gapRefs.current = gapRefs.current.slice(0, tokens.length + 1);
  }, [tokens.length]);

  // Mark the first frame of a new drag before the gap-calculation effect runs.
  useLayoutEffect(() => {
    if (isDragging) isFirstDragFrameRef.current = true;
  }, [isDragging]);

  useLayoutEffect(() => {
    const clearGaps = () => {
      gapRefs.current.forEach(ref => {
        if (!ref) return;
        ref.style.transition = "none";
        ref.style.width = "0px";
        ref.style.opacity = "0";
      });
      onGapHover(null);
    };

    if (!isDragging || !dragPos) { clearGaps(); return; }

    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const inRange =
      dragPos.y >= bounds.top - 48 && dragPos.y <= bounds.bottom + 48 &&
      dragPos.x >= bounds.left - 48 && dragPos.x <= bounds.right + 48;
    if (!inRange) { clearGaps(); return; }

    if (tokens.length === 0) { onGapHover(0); return; }

    let gap = 0;
    for (let i = 0; i < tokens.length; i++) {
      const ref = tokenRefs.current[i];
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (dragPos.x > rect.left + rect.width / 2) gap = i + 1;
    }

    // On the first frame of a drag, skip transition so the gap appears instantly.
    // getBoundingClientRect() above forces a reflow, which would cause a CSS transition
    // from w-0→w-12 even inside useLayoutEffect — so we bypass React state entirely
    // and manipulate the DOM directly here.
    const skipTransition = isFirstDragFrameRef.current;
    isFirstDragFrameRef.current = false;
    const transition = skipTransition ? "none" : "width 150ms ease-out, opacity 150ms ease-out";

    gapRefs.current.forEach((ref, i) => {
      if (!ref) return;
      ref.style.transition = transition;
      ref.style.width = i === gap ? "48px" : "0px";
      ref.style.opacity = i === gap ? "1" : "0";
    });

    onGapHover(gap);
    // onGapHover is a ref-setter in the parent — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragPos, isDragging, tokens]);

  const shakeDelay = errorRange ? errorRange.start * 80 : 0;

  return (
    <div
      ref={containerRef}
      className="flex items-center"
      style={isCorrect === false ? { animation: `shake 0.5s ease-in-out`, animationDelay: `${shakeDelay}ms`, animationFillMode: "both" } : undefined}
    >
      {tokens.length === 0 ? (
        <EmptyGap isDragging={isDragging} />
      ) : (
        <>
          {/* Gap before first token — always in DOM, width controlled via ref */}
          <div ref={el => { gapRefs.current[0] = el; }} className="h-10 rounded-lg bg-accent shrink-0" />
          {tokens.map((token, i) => {
            const isTokenCorrect = isCorrect === true || (isCorrect === false && errorRange !== null && errorRange !== undefined && i < errorRange.start);
            const tokenRippleDelay = i * 80;
            const tokenColorDelay = isTokenCorrect ? tokenRippleDelay : shakeDelay;

            return (
              <Fragment key={i}>
                <div
                  ref={el => { tokenRefs.current[i] = el; }}
                  style={isTokenCorrect ? { animation: `token-ripple 0.4s ease-in-out`, animationDelay: `${tokenRippleDelay}ms`, animationFillMode: "both" } : undefined}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    onTokenStartDrag(i, token, e.clientX, e.clientY, e.clientX - rect.left, e.clientY - rect.top);
                  }}
                >
                  <ExprBlock
                    item={token}
                    className={
                      isCorrect === true ? "bg-dark text-success border-2 border-success rounded-2xl" :
                      errorRange && i >= errorRange.start && i < errorRange.end ? "bg-dark text-danger border-2 border-danger rounded-2xl" :
                      errorRange && i < errorRange.start ? "bg-dark text-success border-2 border-success rounded-2xl" :
                      undefined
                    }
                    style={{ transitionDelay: `${tokenColorDelay}ms` }}
                  />
                </div>
                {/* Gap after token i — always in DOM, width controlled via ref */}
                <div ref={el => { gapRefs.current[i + 1] = el; }} className="h-10 rounded-lg bg-accent shrink-0" />
              </Fragment>
            );
          })}
        </>
      )}
    </div>
  );
}
