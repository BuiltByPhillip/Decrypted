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
import DragGhost from "~/app/_components/exercises/construct/DragGhost";
import TrashContainer from "~/app/_components/exercises/construct/TrashContainer";
import DraggableWindow from "~/app/_components/exercises/construct/DraggableWindow";
import Button from "~/components/Button";
import TokenContainer from "~/app/_components/exercises/construct/TokenContainer";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";
import type {SelectedDefinitions} from "~/app/exercise/page";

type DragAndDropProps = {
  prompt?: string;
  description?: string;
  onTokensChangeAction?: (tokens: PaletteItem[]) => void;
  errorRange?: TokenRange | null;
  isCorrect?: boolean | null;
  definitions?: SelectedDefinitions;
};


export default function DragAndDrop({ description, prompt, onTokensChangeAction, errorRange, isCorrect, definitions }: DragAndDropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const hoveredGapRef = useRef<number | null>(null);

  const [tokens, setTokens] = useState<PaletteItem[]>([]);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isDragDisintegrating, setIsDragDisintegrating] = useState(false);

  function updateTokens(next: PaletteItem[]) {
    setTokens(next);
    onTokensChangeAction?.(next)
  }

  const dragIdRef = useRef(0);
  const [dragState, setDragState] = useState<{
    id: number; // unique per drag — used as React key to force DragGhost remount
    item: PaletteItem;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    tokenIndex?: number; // set when dragging an existing token
  } | null>(null);



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
    setIsDragDisintegrating(false);
    setDragState({ id: ++dragIdRef.current, item, x, y, offsetX, offsetY });
  };

  const handleDragDisintegrateComplete = () => {
    setIsDragDisintegrating(false);
    setDragState(null);
    // Token was already removed from `tokens` when drag started — just finalize
    updateTokens(tokens);
  };

  const onTokenStartDrag = (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    // Remove immediately so the gap collapses. Restoration happens on drop if needed.
    const filtered = tokens.filter((_, i) => i !== index);
    setTokens(filtered);
    // Notify parent immediately so error/correct colors are cleared before indices shift.
    onTokensChangeAction?.(filtered);
    setDragCursorPos({ x, y });
    setIsDragDisintegrating(false);
    setDragState({ id: ++dragIdRef.current, item, x, y, offsetX, offsetY, tokenIndex: index });
  };

  return (
    <div ref={containerRef} className="flex flex-col relative w-full h-full">

      {/* Exercise description & prompt */}
      <ExerciseDescription description={description} prompt={prompt} definitions={definitions}/>
      
      <DraggableWindow
        defaultPosition={{ x: 0, y: 320 }}
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
        defaultPosition={{ x: 0, y: 140 }}
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
          paletteItem={dragState.item}
          startX={dragState.x}
          startY={dragState.y}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          onMove={(x, y) => {
            setIsOverTrash(!!checkTrash(x, y));
            setDragCursorPos({ x, y });
          }}
          disintegrating={isDragDisintegrating}
          onDisintegrateCompleteAction={handleDragDisintegrateComplete}
          onDrop={(x, y) => {
            setIsOverTrash(false);
            setDragCursorPos(null);
            const gapIndex = hoveredGapRef.current;
            const inTrash = !!checkTrash(x, y);
            const srcIndex = dragState.tokenIndex;

            if (inTrash) {
              if (srcIndex !== undefined) {
                // Keep dragState alive so the ghost stays visible for the disintegration
                setIsDragDisintegrating(true);
                return; // skip setDragState(null) below
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

            setDragState(null);
          }}
        />
      )}

      <div className="flex flex-col items-center pt-10 w-full">
        <div className="flex justify-end md:w-10/10 lg:w-9/10 xl:w-7/10 h-70 overflow-visible">
          <TrashContainer ref={trashRef} isDragging={!!dragState} isHovered={isOverTrash} className="" />
        </div>
        
        <div className="flex flex-col pt-5">
          <Button
            variant="ghostMuted"
            className="flex justify-end pr-3 select-none"
            size="none"
            onClick={() => { updateTokens([]) }}
          >
            Clear expression
          </Button>
          <div className="flex items-center justify-center select-none border border-muted w-150 h-30 rounded-2xl overflow-hidden px-3">
            <TokenContainer
              tokens={tokens}
              isDragging={!!dragState}
              dragPos={dragCursorPos}
              onGapHover={(index) => { hoveredGapRef.current = index; }}
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
