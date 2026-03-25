"use client"

import { useEffect, useRef, useState } from "react";
import ExprPalette from "~/app/_components/exercises/construct/ExprPalette";
import {
  type PaletteItem, type TokenRange,
} from "~/app/hooks/parser";
import {
  DEFAULT_PALETTE_ITEMS,
  DEFAULT_VALUE_ITEMS,
  searchPalette,
  searchValues,
} from "~/app/_components/exercises/construct/paletteSearch";
import DragGhost from "~/app/_components/exercises/shared/dnd/DragGhost";
import { useDragSession } from "~/app/_components/exercises/shared/dnd/useDragSession";
import DisintegrateToken from "~/app/_components/exercises/construct/DisintegrateToken";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";
import TrashContainer from "~/app/_components/exercises/shared/dnd/TrashContainer";
import DraggableWindow from "~/app/_components/exercises/shared/dnd/DraggableWindow";
import Button from "~/components/Button";
import TokenContainer from "~/app/_components/exercises/construct/TokenContainer";
import type {SelectedDefinitions} from "~/app/exercise/page";

type DragAndDropProps = {
  onTokensChangeAction?: (tokens: PaletteItem[]) => void;
  errorRange?: TokenRange | null;
  isCorrect?: boolean | null;
  definitions?: SelectedDefinitions;
  locked?: boolean;
};


export default function DragAndDrop({ onTokensChangeAction, errorRange, isCorrect, definitions, locked }: DragAndDropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const hoveredGapRef = useRef<number | null>(null);

  const [tokens, setTokens] = useState<PaletteItem[]>([]);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isDragDisintegrating, setIsDragDisintegrating] = useState(false);

  function updateTokens(next: PaletteItem[]) {
    setTokens(next);
    onTokensChangeAction?.(next)
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

  const isInside = (x: number, y: number, bounds: DOMRect): boolean =>
    x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;

  const checkTrash = (x: number, y: number) => {
    const bounds = trashRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return isInside(x, y, bounds) ? bounds : null;
  };

  const onStartDrag = (item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    if (locked) return;
    setIsDragDisintegrating(false);
    startDrag(item, x, y, offsetX, offsetY);
  };

  const handleDragDisintegrateComplete = () => {
    setIsDragDisintegrating(false);
    sourceTokenIndexRef.current = undefined;
    endDrag();
    // Token was already removed from `tokens` when drag started — just finalize
    updateTokens(tokens);
  };

  const onTokenStartDrag = (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    if (locked) return;
    // Remove immediately so the gap collapses. Restoration happens on drop if needed.
    const filtered = tokens.filter((_, i) => i !== index);
    setTokens(filtered);
    // Notify parent immediately so error/correct colors are cleared before indices shift.
    onTokensChangeAction?.(filtered);
    moveDrag(x, y)
    setIsDragDisintegrating(false);
    sourceTokenIndexRef.current = index;
    startDrag(item, x, y, offsetX, offsetY);
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full flex-col">
      <DraggableWindow
        defaultPosition={{ x: 0, y: 180 }}
        zIndex={getZIndex("palette")}
        onBringToFront={() => bringToFront("palette")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Palette"
          defaultItems={DEFAULT_PALETTE_ITEMS}
          searchFn={searchPalette}
          onStartDrag={onStartDrag}
          searchPlaceholder="Search..."
        />
      </DraggableWindow>
      <DraggableWindow
        defaultPosition={{ x: 0, y: 10 }}
        zIndex={getZIndex("values")}
        onBringToFront={() => bringToFront("values")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Values"
          defaultItems={DEFAULT_VALUE_ITEMS}
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
            setIsOverTrash(!!checkTrash(x, y));
            moveDrag(x, y);
          }}
          onDrop={(x, y) => {
            setIsOverTrash(false);
            const gapIndex = hoveredGapRef.current;
            const inTrash = !!checkTrash(x, y);
            const srcIndex = sourceTokenIndexRef.current;

            if (inTrash) {
              if (srcIndex !== undefined) {
                // Keep dragState alive so the ghost stays visible for the disintegration
                setIsDragDisintegrating(true);
                return; // skip endDrag below
              }
              // Palette items dropped on trash are discarded — nothing to do
            } else if (gapIndex !== null) {
              // Token already removed from `tokens` (if from token list), insert directly
              const next = [...tokens];
              next.splice(gapIndex, 0, dragState.item);
              updateTokens(next);
            } else if (srcIndex !== undefined) {
              // Dropped nowhere valid: restore the token at its original position
              const next = [...tokens];
              next.splice(srcIndex, 0, dragState.item);
              setTokens(next);
            }

            sourceTokenIndexRef.current = undefined;
            endDrag();
          }}
        >
          {isDragDisintegrating ? (
            <DisintegrateToken
              item={dragState.item}
              active={true}
              onCompleteAction={handleDragDisintegrateComplete}
            />
          ) : (
            <ExprBlock item={dragState.item} />
          )}
        </DragGhost>
      )}

      <div className="flex w-full flex-col items-center pt-10">
        <div className="flex h-70 justify-end overflow-visible md:w-10/10 lg:w-9/10 xl:w-7/10">
          <TrashContainer
            ref={trashRef}
            isDragging={!!dragState}
            isHovered={isOverTrash}
            className=""
          />
        </div>

        <div className="flex flex-col pt-5">
          <Button
            variant="ghostMuted"
            className="flex justify-end pr-3 select-none"
            size="none"
            onClick={() => {
              if (!locked) updateTokens([]);
            }}
          >
            Clear expression
          </Button>
          <div className="border-muted flex h-30 w-150 items-center justify-center overflow-hidden rounded-2xl border px-3 select-none">
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
