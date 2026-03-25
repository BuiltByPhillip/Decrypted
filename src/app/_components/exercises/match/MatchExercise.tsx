"use client"

import ExerciseShell from "~/app/_components/exercises/shared/ExerciseShell";
import type { SelectedDefinitions } from "~/app/exercise/page";
import { useRef, useState } from "react";
import MatchCard from "~/app/_components/exercises/match/MatchCard";
import { useDragSession } from "~/app/_components/exercises/shared/dnd/useDragSession";
import DragGhost from "~/app/_components/exercises/shared/dnd/DragGhost";

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
 * in the context of the protocol — not just whether they can construct or compute it.
 * For example, matching `g^a mod p` to "Alice's public key" in Diffie-Hellman.
 *
 * This is distinct from the other exercise types:
 * - Unlike `construct`, the expression is already given — the student identifies its meaning.
 * - Unlike `select`, there are multiple simultaneous decisions, not one isolated question.
 * - Unlike `calculate`, no computation is required — only conceptual understanding.
 */
export default function MatchExercise({ description, prompt, hint, pairs, onAnswerAction, definitions }: MatchExerciseProps) {
  const [locked, setLocked] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
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

  const handleStartDrag = (label: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (locked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // If this item is already assigned to a slot, remove the assignment so it can be reassigned
    const existingSlot = Object.entries(assignments).find(([, v]) => v === label)?.[0];
    if (existingSlot) {
      setAssignments(prev => {
        const next = { ...prev };
        delete next[existingSlot];
        return next;
      });
    }

    startDrag(label, e.clientX, e.clientY, offsetX, offsetY);
  };

  const checkAnswer = () => {
    if (Object.keys(assignments).length !== pairs.length) return;
    const allCorrect = pairs.every(p => assignments[p.right] === p.left);
    if (allCorrect) {
      setLocked(true);
      onAnswerAction?.(true);
    } else {
      setWrongAnswer(true);
      setTimeout(() => {
        setAssignments({});
        setWrongAnswer(false);
      }, 550);
    }
  };

  // Items that have not yet been assigned to any slot
  const unassignedItems = pairs.map(p => p.left).filter(
    left => !Object.values(assignments).includes(left)
  );

  return (
    <ExerciseShell
      className=""
      description={description}
      prompt={prompt}
      hint={hint}
      definitions={definitions}
      submitState={locked ? "correct" : wrongAnswer ? "incorrect" : "idle"}
      onSubmit={checkAnswer}
    >
      {/* Draggable source cards — only shows unassigned items */}
      <div className="border-muted grid grid-cols-4 gap-4 rounded-2xl border p-3">
        {pairs.map((pair) => (
          unassignedItems.includes(pair.left) ? (
            <MatchCard
              key={pair.left}
              label={pair.left}
              className="cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:scale-103 hover:opacity-100"
              onMouseDown={(e) => handleStartDrag(pair.left, e)}
              definitions={definitions}
            />
          ) : (
            // Placeholder so the grid doesn't collapse when an item is dragged out
            <div key={pair.left} className="h-20 w-full rounded-2xl border border-dashed border-muted opacity-30" />
          )
        ))}
      </div>

      {/* Drop slots — each row has the right label and an empty/filled slot */}
      <div className="flex flex-col gap-2 pt-7">
        {pairs.map((pair) => {
          const assigned = assignments[pair.right];
          const isHovered = hoveredSlot === pair.right && !!dragState;
          return (
            <div key={pair.right} className="grid grid-cols-2 gap-2">
              <MatchCard label={pair.right} definitions={definitions} />
              <div
                ref={el => { slotRefs.current[pair.right] = el; }}
                className={`flex h-20 w-full items-center justify-center rounded-2xl border border-dashed transition duration-200 ${
                  isHovered ? "border-amber bg-amber/10 opacity-100" :
                  assigned ? "border-muted opacity-100" :
                  "border-muted opacity-40"
                }`}
              >
                {assigned && (
                  <MatchCard
                    label={assigned}
                    className="cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:scale-103 hover:opacity-100"
                    onMouseDown={(e) => handleStartDrag(assigned, e)}
                    definitions={definitions}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag ghost — follows the cursor */}
      {dragState && (
        <DragGhost
          key={dragState.id}
          startX={dragState.x}
          startY={dragState.y}
          offsetX={dragState.offsetX}
          offsetY={dragState.offsetY}
          onMove={(x, y) => {
            moveDrag(x, y);
            setHoveredSlot(findHoveredSlot(x, y));
          }}
          onDrop={(x, y) => {
            const slot = findHoveredSlot(x, y);
            if (slot) {
              setAssignments(prev => ({ ...prev, [slot]: dragState.item }));
            }
            setHoveredSlot(null);
            endDrag();
          }}
        >
          <MatchCard label={dragState.item} className="opacity-90 shadow-lg" definitions={definitions}/>
        </DragGhost>
      )}
    </ExerciseShell>
  );
}
