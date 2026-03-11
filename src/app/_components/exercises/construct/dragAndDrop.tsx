"use client"

import { useEffect, useRef, useState } from "react";
import ExprPalette from "~/app/_components/exercises/construct/ExprPalette";
import {
  ALL_OPERATOR_PALETTE_ITEMS,
  ALL_SYMBOL_PALETTE_ITEMS,
  ALL_SET_PALETTE_ITEMS,
  PAR_PALETTE_ITEMS,
  type Expr,
  type PaletteItem, parseExpression,
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
  answers?: Expr[];
  definitions?: SelectedDefinitions;
  prompt?: string;
  description?: string;
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

export default function DragAndDrop({ answers, definitions, description, prompt }: DragAndDropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const hoveredGapRef = useRef<number | null>(null);

  const [tokens, setTokens] = useState<PaletteItem[]>([]);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [dragState, setDragState] = useState<{
    item: PaletteItem;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    tokenIndex?: number; // set when dragging an existing token
  } | null>(null);

  useEffect(() => {
    const saved = loadTokens();
    if (saved) setTokens(saved);
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
    setDragState({ item, x, y, offsetX, offsetY });
  };

  const onTokenStartDrag = (index: number, item: PaletteItem, x: number, y: number, offsetX: number, offsetY: number) => {
    // Don't remove the token yet — keep it as an invisible placeholder so the
    // layout doesn't collapse. Removal and insertion both happen on drop.
    setDragState({ item, x, y, offsetX, offsetY, tokenIndex: index });
  };

  const checkAnswer = () => {
    if (tokens.length === 0 || !answers || answers.length === 0) {
      setIsCorrect(false);
      return;
    }
    try {
      const userExpr = parseExpression(tokens.map(paletteItemToString).join(" "));
      const isMatch = answers.some(answer => {
        const resolved = definitions ? substituteRoles(answer, definitions) : answer;
        return exprEquals(userExpr, resolved);
      });
      setIsCorrect(isMatch);
    } catch {
      setIsCorrect(false);
    }
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
          paletteItem={dragState.item}
          startX={dragState.x}
          startY={dragState.y}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          onMove={(x, y) => {
            setIsOverTrash(!!checkTrash(x, y));
            setDragCursorPos({ x, y });
          }}
          onDrop={(x, y) => {
            setIsOverTrash(false);
            setDragCursorPos(null);
            const gapIndex = hoveredGapRef.current;
            const inTrash = !!checkTrash(x, y);
            const srcIndex = dragState.tokenIndex;

            if (inTrash) {
              if (srcIndex !== undefined) {
                // Remove the placeholder from the list
                const next = tokens.filter((_, i) => i !== srcIndex);
                setTokens(next);
                saveTokens(next);
              }
              // Palette items dropped on trash are discarded — nothing to do
            } else if (gapIndex !== null) {
              let next = [...tokens];
              if (srcIndex !== undefined) {
                // Remove placeholder first, then adjust gap index for the shift
                next = next.filter((_, i) => i !== srcIndex);
                const insertAt = gapIndex > srcIndex ? gapIndex - 1 : gapIndex;
                next.splice(insertAt, 0, dragState.item);
              } else {
                next.splice(gapIndex, 0, dragState.item);
              }
              setTokens(next);
              saveTokens(next);
            }
            // Dropped nowhere valid: if from token list, placeholder is still in
            // the list and becomes visible again when dragState clears. No restore needed.

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
            onClick={() => { setTokens([]); saveTokens(null); }}
          >
            Clear expression
          </Button>
          <div className="flex items-center justify-center select-none border-1 border-muted w-150 h-30 rounded-2xl overflow-hidden px-3">
            <TokenContainer
              tokens={tokens}
              isDragging={!!dragState}
              dragPos={dragCursorPos}
              draggingTokenIndex={dragState?.tokenIndex}
              onGapHover={(index) => { hoveredGapRef.current = index; }}
              onTokenStartDrag={onTokenStartDrag}
            />
          </div>
        </div>
        <TrashContainer ref={trashRef} isDragging={!!dragState} isHovered={isOverTrash} className="ml-70"/>
      </div>

      <div className="flex flex-col items-center pt-10 gap-2">
        <Button variant="submit" className="w-100" onClick={checkAnswer}>Check answer</Button>
        {isCorrect === true && <span className="text-green-500">Correct!</span>}
        {isCorrect === false && <span className="text-red-500">Incorrect, try again.</span>}
      </div>
    </div>
  );
}
