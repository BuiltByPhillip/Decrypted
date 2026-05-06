"use client"

import { useRef, useState } from "react";
import ExprPalette from "~/app/_components/exercises/construct/ExprPalette";
import {
  type PaletteItem, type TokenRange,
} from "~/app/hooks/parser";
import {
  DEFAULT_PALETTE_ITEMS,
  DEFAULT_VALUE_ITEMS,
  SLOT_BUDGET,
  estimateSlotCost,
  searchPalette,
  searchValues,
} from "~/app/_components/exercises/construct/paletteSearch";
import DragGhost from "~/app/_components/exercises/shared/dnd/DragGhost";
import { useDragSession } from "~/app/_components/exercises/shared/dnd/useDragSession";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";
import DraggableWindow from "~/app/_components/exercises/shared/dnd/DraggableWindow";
import DragHintOverlay from "~/app/_components/exercises/construct/DragHintOverlay";
import Button from "~/components/Button";
import TokenContainer, { type CombinedToken } from "~/app/_components/exercises/construct/TokenContainer";

type DragAndDropProps = {
  onTokensChangeAction?: (tokens: PaletteItem[]) => void;
  errorRange?: TokenRange | null;
  isCorrect?: boolean | null;
  locked?: boolean;
  hintPaused?: boolean;
  customOperatorItems?: PaletteItem[];
  priorityValueItems?: PaletteItem[];
  prefill?: PaletteItem[];
  defaultPaletteItems?: PaletteItem[];
  initialTokens?: PaletteItem[];
};


export default function DragAndDrop({ onTokensChangeAction, errorRange, isCorrect, locked, hintPaused, customOperatorItems = [], priorityValueItems = [], prefill = [], defaultPaletteItems, initialTokens }: DragAndDropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenContainerRef = useRef<HTMLDivElement>(null);
  const valuesPaletteRef = useRef<HTMLDivElement>(null);
  const operatorPaletteRef = useRef<HTMLDivElement>(null);
  const hoveredGapRef = useRef<number | null>(null);

  const [hintDismissed, setHintDismissed] = useState(() => {
    try { return !!localStorage.getItem("decrypted_drag_hint_seen"); } catch { return false; }
  });

  const dismissHint = () => {
    try { localStorage.setItem("decrypted_drag_hint_seen", "1"); } catch { /* private browsing */ }
    setHintDismissed(true);
  };

  // Single source-of-truth array. Seeded from saved state (if restoring) or frozen prefill tokens.
  const [tokens, setTokens] = useState<CombinedToken[]>(() =>
    initialTokens?.length
      ? initialTokens.map(token => ({ token, frozen: false }))
      : prefill.map(token => ({ token, frozen: true }))
  );
  const [isOutsideContainer, setIsOutsideContainer] = useState(false);

  function updateTokens(next: CombinedToken[]) {
    setTokens(next);
    onTokensChangeAction?.(next.map(t => t.token));
  }

  const { dragState, dragCursorPos, startDrag, moveDrag, endDrag } = useDragSession<PaletteItem>();
  const sourceTokenIndexRef = useRef<number | undefined>(undefined);

  type PaletteId = "palette" | "values";
  const [stackOrder, setStackOrder] = useState<PaletteId[]>(["palette", "values"]);

  const bringToFront = (id: PaletteId) => {
    setStackOrder(prev => [...prev.filter(item => item !== id), id]);
  };

  const getZIndex = (id: PaletteId) => {
    const index = stackOrder.indexOf(id);
    return index >= 0 ? index + 10 : 10;
  };



  const onStartDrag = (item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    if (locked) return;
    dismissHint();
    startDrag(item, x, y, offsetX, offsetY);
  };

  const onTokenStartDrag = (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    if (locked) return;
    dismissHint();
    // Remove immediately so the gap collapses. Restoration happens on drop if needed.
    const filtered = tokens.filter((_, i) => i !== index);
    setTokens(filtered);
    // Notify parent immediately so error/correct colors are cleared before indices shift.
    onTokensChangeAction?.(filtered.map(t => t.token));
    moveDrag(x, y);
    sourceTokenIndexRef.current = index;
    startDrag(item, x, y, offsetX, offsetY);
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full flex-col">
      <DragHintOverlay
        valuesPaletteRef={valuesPaletteRef}
        operatorPaletteRef={operatorPaletteRef}
        containerRef={tokenContainerRef}
        dismissed={hintDismissed}
        paused={hintPaused}
      />
      <DraggableWindow
        ref={operatorPaletteRef}
        defaultPosition={{ x: 0, y: 180 }}
        zIndex={getZIndex("palette")}
        onBringToFront={() => bringToFront("palette")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Palette"
          defaultItems={(() => {
            const prioritySlots = customOperatorItems.reduce((sum, item) => sum + estimateSlotCost(item), 0);
            const remaining = Math.max(0, Math.floor(SLOT_BUDGET - prioritySlots));
            const baseItems = defaultPaletteItems ?? DEFAULT_PALETTE_ITEMS;
            return [...customOperatorItems, ...baseItems.slice(0, remaining)];
          })()}
          searchFn={(q) => searchPalette(q, customOperatorItems)}
          onStartDrag={onStartDrag}
          searchPlaceholder="Search..."
        />
      </DraggableWindow>
      <DraggableWindow
        ref={valuesPaletteRef}
        defaultPosition={{ x: 0, y: 10 }}
        zIndex={getZIndex("values")}
        onBringToFront={() => bringToFront("values")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Values"
          defaultItems={(() => {
            const prioritySlots = priorityValueItems.reduce((sum, item) => sum + estimateSlotCost(item), 0);
            const remaining = Math.max(0, Math.floor(SLOT_BUDGET - prioritySlots));
            const filtered = DEFAULT_VALUE_ITEMS.filter(item =>
              !priorityValueItems.some(p =>
                (p.kind === "var" && item.kind === "var" && p.name === item.name) ||
                (p.kind === "int" && item.kind === "int" && p.value === item.value)
              )
            ).slice(0, remaining);
            return [...priorityValueItems, ...filtered].sort((a, b) =>
              a.kind === "var" && b.kind === "var" ? a.name.localeCompare(b.name) : 0
            );
          })()}
          searchFn={searchValues}
          onStartDrag={onStartDrag}
          searchPlaceholder="Create any variable or integer"
        />
      </DraggableWindow>

      {dragState && (
        <DragGhost
          key={dragState.id}
          startX={dragState.x}
          startY={dragState.y}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          onMove={(x, y) => {
            if (sourceTokenIndexRef.current !== undefined) {
              const bounds = tokenContainerRef.current?.getBoundingClientRect();
              const outside = !bounds || x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom;
              setIsOutsideContainer(outside);
            }
            moveDrag(x, y);
          }}
          onDrop={(x, y) => {
            setIsOutsideContainer(false);
            const gapIndex = hoveredGapRef.current;
            const srcIndex = sourceTokenIndexRef.current;

            if (gapIndex !== null) {
              // Token already removed from `tokens` (if from token list), insert directly
              const next = [...tokens];
              next.splice(gapIndex, 0, { token: dragState.item, frozen: false });
              updateTokens(next);
            } else if (srcIndex !== undefined) {
              // Dropped outside container — token was already removed, finalize the delete
              updateTokens([...tokens]);
            }
            // Palette items dropped outside container are discarded — nothing to do

            sourceTokenIndexRef.current = undefined;
            endDrag();
          }}
        >
          <ExprBlock item={dragState.item} isDeleteMode={isOutsideContainer} />
        </DragGhost>
      )}

      <div className="flex w-full flex-col items-center pt-10">
        <div className="flex flex-col pt-75">
          <Button
            variant="ghostMuted"
            className="w-fit self-end pr-3 select-none"
            size="none"
            onClick={() => {
              if (!locked) updateTokens(tokens.filter(t => t.frozen));
            }}
          >
            Clear expression
          </Button>
          <div ref={tokenContainerRef} className="border-muted flex h-30 w-150 items-center justify-center overflow-hidden rounded-2xl border px-3 select-none">
            <TokenContainer
              tokens={tokens}
              isDragging={!!dragState}
              dragPos={dragCursorPos}
              onGapHover={(index) => {
                hoveredGapRef.current = index;
              }}
              onTokenStartDrag={onTokenStartDrag}
              errorRange={errorRange}
              isCorrect={isCorrect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
