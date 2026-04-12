"use client"

import ExerciseShell from "~/app/_components/exercises/shared/ExerciseShell";
import type { SelectedDefinitions } from "~/app/exercise/page";
import { useEffect, useRef, useState } from "react";
import MatchCard from "~/app/_components/exercises/match/MatchCard";
import { useDragSession } from "~/app/_components/exercises/shared/dnd/useDragSession";
import DragElement from "~/app/_components/exercises/shared/dnd/DragElement";
import Button from "~/components/Button";

type MatchExerciseProps = {
  description: string;
  prompt: string;
  hint?: string;
  pairs: {left: string, right: string}[];
  onAnswerAction?: (isCorrect: boolean) => void;
  definitions: SelectedDefinitions;
};

/**
 * A matching exercise where the student pairs expressions to their corresponding labels or roles.
 *
 * The educational goal is to test whether students understand what each expression *means*
 * in the context of the protocol - not just whether they can construct or compute it.
 * For example, matching `g^a mod p` to "Alice's public key" in Diffie-Hellman.
 *
 * This is distinct from the other exercise types:
 * - Unlike `construct`, the expression is already given - the student identifies its meaning.
 * - Unlike `select`, there are multiple simultaneous decisions, not one isolated question.
 * - Unlike `calculate`, no computation is required - only conceptual understanding.
 *
 * Drag behaviour: uses DragElement so the actual card moves rather than a ghost clone.
 * Each slot always renders a dashed placeholder underneath so layout never shifts.
 */
export default function MatchExercise({ description, prompt, hint, pairs, onAnswerAction, definitions }: MatchExerciseProps) {
  const [locked, setLocked] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [hoveredPaletteEl, setHoveredPaletteEl] = useState<HTMLDivElement | null>(null);
  const [shuffledPairs] = useState(() => [...pairs].sort(() => Math.random() - 0.5));



  const wrongAnswerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (wrongAnswerTimer.current) clearTimeout(wrongAnswerTimer.current); }, []);

  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const paletteRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Maps each item label to its card wrapper div (palette or slot).
  // DragElement uses this to find the element to move.
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { dragState, startDrag, moveDrag, endDrag } = useDragSession<string>();

  const findHoveredSlot = (x: number, y: number): string | null => {
    for (const [key, ref] of Object.entries(slotRefs.current)) {
      const rect = ref?.getBoundingClientRect();
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return key;
      }
    }
    return null;
  };

  const findHoveredPaletteEl = (x: number, y: number): HTMLDivElement | null => {
    for (const ref of Object.values(paletteRefs.current)) {
      const rect = ref?.getBoundingClientRect();
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return ref ?? null;
      }
    }
    return null;
  };

  const handleStartDrag = (label: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (locked) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    startDrag(label, e.clientX, e.clientY, e.clientX - rect.left, e.clientY - rect.top);
    // Note: we do NOT remove the item from assignments here. The card must stay in the DOM
    // so DragElement can move it. The original slot is resolved at drop time.
  };

  const checkAnswer = () => {
    if (Object.keys(assignments).length !== shuffledPairs.length) return;
    const allCorrect = shuffledPairs.every(p => assignments[p.right] === p.left);
    if (allCorrect) {
      setLocked(true);
      onAnswerAction?.(true);
    } else {
      setWrongAnswer(true);
      wrongAnswerTimer.current = setTimeout(() => {
        setAssignments({});
        setWrongAnswer(false);
      }, 550);
    }
  };

  const assignedValues = new Set(Object.values(assignments));
  const unassignedItems = shuffledPairs.map(p => p.left).filter(left => !assignedValues.has(left));

  return (
    <ExerciseShell
      className="w-full max-w-3xl"
      footerClassName="max-w-3xl"
      description={description}
      prompt={prompt}
      hint={hint}
      definitions={definitions}
      submitState={locked ? "correct" : wrongAnswer ? "incorrect" : "idle"}
      onSubmit={checkAnswer}
    >
      {/* Reset button */}
      <Button
        variant="ghostMuted"
        className="flex w-full justify-end pr-3 select-none"
        size="none"
        onClick={() => { if (!locked) setAssignments({}); }}
      >
        Reset all
      </Button>

      {/* Source palette - unassigned cards */}
      <div className="border-muted grid grid-cols-2 gap-4 rounded-2xl border p-3 sm:grid-cols-4">
        {shuffledPairs.map((pair) => (
          <div key={pair.left} className="relative min-h-16 w-full">
            {/* Placeholder: always in flow so the grid slot never collapses when the card is dragging */}
            <div ref={el => { paletteRefs.current[pair.left] = el; }} className="absolute inset-0 rounded-2xl border border-dashed border-muted opacity-30" />
            {unassignedItems.includes(pair.left) && (
              <div
                ref={el => { cardRefs.current[pair.left] = el; }}
                className="absolute inset-0"
              >
                <MatchCard
                  label={pair.left}
                  className="cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:scale-103 hover:opacity-100"
                  onMouseDown={(e) => handleStartDrag(pair.left, e)}
                  definitions={definitions}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Drop slots */}
      <div className="flex flex-col gap-2 pt-7">
        {pairs.map((pair, i) => {
          const assigned = assignments[pair.right];
          const isBeingDraggedFromSlot = !!assigned && dragState?.item === assigned;
          const isHovered = hoveredSlot === pair.right && !!dragState;

          return (
            <div key={pair.right} className="grid grid-cols-2 gap-2">
              <MatchCard label={pair.right} definitions={definitions} />
              <div
                ref={el => { slotRefs.current[pair.right] = el; }}
                className="relative min-h-16 w-full"
              >
                {/* Drop zone indicator */}
                <div className={`absolute inset-0 rounded-2xl border transition duration-200 ${
                  assigned && !isBeingDraggedFromSlot ? "border-muted opacity-100" :
                  isHovered                           ? "border-dashed border-muted bg-muted-foreground/10 opacity-100" :
                                                        "border-dashed border-muted opacity-40"
                }`} />
                {/* Assigned card: kept in DOM during drag so DragElement can move it */}
                {assigned && (
                  <div
                    ref={el => { cardRefs.current[assigned] = el; }}
                    className="absolute inset-0"
                    style={
                      locked      ? { animation: "token-ripple 0.4s ease-in-out", animationDelay: `${i * 80}ms`, animationFillMode: "both" } :
                      wrongAnswer ? { animation: "shake 0.5s ease-in-out" } :
                      undefined
                    }
                  >
                    <MatchCard
                      label={assigned}
                      className={
                        locked      ? "text-success border-success border-2 cursor-default" :
                        wrongAnswer ? "text-danger border-danger border-2" :
                        "cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:scale-103 hover:opacity-100"
                      }
                      onMouseDown={locked || wrongAnswer ? undefined : (e) => handleStartDrag(assigned, e)}
                      definitions={definitions}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DragElement moves the actual card element instead of rendering a ghost clone */}
      {dragState && (
        <DragElement
          key={dragState.id}
          element={cardRefs.current[dragState.item] ?? null}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          resizeToHover={true}
          hoverElement={hoveredSlot ? (slotRefs.current[hoveredSlot] ?? null) : hoveredPaletteEl}
          onMove={(x, y) => {
            moveDrag(x, y);
            const slot = findHoveredSlot(x, y);
            setHoveredSlot(slot);
            setHoveredPaletteEl(slot ? null : findHoveredPaletteEl(x, y));
          }}
          onDrop={(x, y) => {
            const slot = findHoveredSlot(x, y);
            const originalSlot = Object.entries(assignments).find(([, v]) => v === dragState.item)?.[0];
            setAssignments(prev => {
              const next = { ...prev };
              if (originalSlot) delete next[originalSlot];
              if (slot) next[slot] = dragState.item;
              return next;
            });
            setHoveredSlot(null);
            setHoveredPaletteEl(null);
            endDrag();
          }}
        />
      )}
    </ExerciseShell>
  );
}
