import ExerciseShell from "~/app/_components/exercises/shared/ExerciseShell";
import type { Expr } from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";
import { useState } from "react";
import MatchCard from "~/app/_components/exercises/match/MatchCard";

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

  const checkAnswer = () => {

  }

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
      <div>
        {/* Draggable objects */}
        <div className="grid grid-cols-4 gap-4 border border-muted rounded-2xl p-3">
          {pairs.map((pair) => (
            <MatchCard key={pair.left} className="" label={pair.left} definitions={definitions}/>
          ))}
        </div>

        {/* Droppable container and right pair */}
        <div>
          {pairs.map((pair) => (
            <MatchCard key={pair.right} className="" label={pair.right} definitions={definitions}/>
          ))}
        </div>
      </div>
    </ExerciseShell>
  );
}