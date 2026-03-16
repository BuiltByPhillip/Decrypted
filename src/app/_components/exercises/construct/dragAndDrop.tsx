"use client"

import { useEffect, useRef, useState } from "react";
import ExprPalette from "~/app/_components/exercises/construct/ExprPalette";
import {
  ALL_OPERATOR_PALETTE_ITEMS,
  ALL_SYMBOL_PALETTE_ITEMS,
  ALL_SET_PALETTE_ITEMS,
  PAR_PALETTE_ITEMS,
  type Expr,
  type PaletteItem, parseExpression, type TokenRange,
} from "~/app/hooks/parser";
import {
  DEFAULT_VALUE_ITEMS,
  searchOperators,
  searchSets,
  searchSymbols,
  searchValues,
} from "~/app/_components/exercises/construct/paletteSearch";
import DragGhost from "~/app/_components/exercises/construct/DragGhost";
import {substituteRoles, exprEquals, paletteItemToString} from "~/app/hooks/expr";
import TrashContainer from "~/app/_components/exercises/construct/TrashContainer";
import DraggableWindow from "~/app/_components/exercises/construct/DraggableWindow";
import Button from "~/components/Button";
import type { SelectedDefinitions } from "~/app/exercise/page";
import TokenContainer from "~/app/_components/exercises/construct/TokenContainer";

type DragAndDropProps = {
  prompt?: string;
  description?: string;
  onTokensChangeAction?: (tokens: PaletteItem[]) => void;
  errorRange?: TokenRange | null;
  isCorrect?: boolean | null;
};

const TOKENS_STORAGE_KEY = "drag-and-drop-tokens";

function loadTokens(): PaletteItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(TOKENS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: PaletteItem[] | null) {
  if (typeof window === "undefined") return;
  if (tokens === null || tokens.length === 0) {
    localStorage.removeItem(TOKENS_STORAGE_KEY);
  } else {
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  }
}

export default function DragAndDrop({ description, prompt, onTokensChangeAction, errorRange, isCorrect }: DragAndDropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const hoveredGapRef = useRef<number | null>(null);

  const [tokens, setTokens] = useState<PaletteItem[]>([]);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isDragDisintegrating, setIsDragDisintegrating] = useState(false);

  function updateTokens(next: PaletteItem[]) {
    setTokens(next);
    saveTokens(next);
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

  useEffect(() => {
    const saved = loadTokens();
    if (saved) updateTokens(saved);
  }, []);

  type PaletteId = "operators" | "symbols" | "sets" | "values";
  const [stackOrder, setStackOrder] = useState<PaletteId[]>(["operators", "symbols", "sets", "values"]);

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
    // Token was already removed from `tokens` when drag started — just finalise
    updateTokens(tokens);
  };

  const onTokenStartDrag = (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    // Remove immediately so the gap collapses. Restoration happens on drop if needed.
    setTokens(tokens.filter((_, i) => i !== index));
    setDragCursorPos({ x, y });
    setIsDragDisintegrating(false);
    setDragState({ id: ++dragIdRef.current, item, x, y, offsetX, offsetY, tokenIndex: index });
  };

  return (
    <div ref={containerRef} className="flex flex-col relative w-full">
      {(description ?? prompt) && (
        <div className="flex flex-col items-center p-8 gap-3">
          {description && <span className="text-4xl font-bold text-gray">{description}</span>}
          {prompt && <span className="text-xl text-gray/70">{prompt}</span>}
        </div>
      )}
      <DraggableWindow
        id="operators"
        defaultPosition={{ x: 20, y: 20 }}
        zIndex={getZIndex("operators")}
        onBringToFront={() => bringToFront("operators")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Operators"
          defaultItems={[...PAR_PALETTE_ITEMS, ...ALL_OPERATOR_PALETTE_ITEMS]}
          searchFn={searchOperators}
          onStartDrag={onStartDrag}
          searchPlaceholder="Search..."
        />
      </DraggableWindow>
      <DraggableWindow
        id="symbols"
        defaultPosition={{ x: 20, y: 120 }}
        zIndex={getZIndex("symbols")}
        onBringToFront={() => bringToFront("symbols")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Symbols"
          defaultItems={ALL_SYMBOL_PALETTE_ITEMS}
          searchFn={searchSymbols}
          onStartDrag={onStartDrag}
          searchPlaceholder="Search..."
        />
      </DraggableWindow>
      <DraggableWindow
        id="sets"
        defaultPosition={{ x: 20, y: 220 }}
        zIndex={getZIndex("sets")}
        onBringToFront={() => bringToFront("sets")}
        containerRef={containerRef}
      >
        <ExprPalette
          category="Sets"
          defaultItems={ALL_SET_PALETTE_ITEMS}
          searchFn={searchSets}
          onStartDrag={onStartDrag}
          searchPlaceholder="Search..."
        />
      </DraggableWindow>
      <DraggableWindow
        id="values"
        defaultPosition={{ x: 20, y: 320 }}
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

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end pt-50">
        <div></div>
        <div className="flex flex-col">
          <Button
            variant="ghostMuted"
            className="flex justify-end pr-3 select-none"
            size="none"
            onClick={() => { updateTokens([]) }}
          >
            Clear expression
          </Button>
          <div className="flex items-center justify-center select-none border-1 border-muted w-150 h-30 rounded-2xl overflow-hidden px-3">
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
        <TrashContainer ref={trashRef} isDragging={!!dragState} isHovered={isOverTrash} className="ml-70"/>
      </div>
    </div>
  );
}
