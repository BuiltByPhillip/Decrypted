"use client"

import Option from "~/app/_components/exercises/select/option"
import Button from "~/components/Button";
import Hint from "~/app/_components/exercises/select/hint";
import { useState } from "react";
import type { Expr } from "~/app/hooks/parser"
import { exprListContains, substituteRoles } from "~/app/hooks/expr";
import type { SelectedDefinitions } from "~/app/exercise/page";
import UserFeedback from "~/app/_components/exercises/shared/UserFeedback";

type SelectExerciseProps = {
  options: Expr[];
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  answers: Expr[];
  onAnswerAction?: (isCorrect: boolean) => void;
}

/**
 * A multiple-choice exercise component where the user selects one or more options and submits their answer.
 * Options are color-coded after submission: green for correct, red for incorrect, orange while selected but unsubmitted.
 *
 * @param options - The list of expressions to display as selectable answer buttons.
 * @param description - The main heading shown above the exercise (e.g. the set or expression being tested).
 * @param prompt - A sub-heading giving the user instructions (e.g. "Select all elements of the set").
 * @param hint - Optional hint text revealed via the hint button.
 * @param definitions - The user's selected role-to-expression definitions, used to substitute roles in rendered options.
 * @param answers - The list of expressions considered correct. An option is correct if it is contained within this list.
 * @param onAnswerAction - Optional callback fired after submission. Receives `true` if every selected option was correct, `false` otherwise.
 * @constructor
 */
export default function SelectExercise({options, description, prompt, hint, definitions, answers, onAnswerAction}: SelectExerciseProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<[number, boolean][]>([]);

  const checkAnswer = () => {
    if (selected.length === 0) return;
    const correctness: [number, boolean][] = selected.map(i => [i, exprListContains(options[i] as Expr, answers)]);
    setIsCorrect(correctness);
    onAnswerAction?.(correctness.every(([, correct]) => correct));
  }

  const handleSelect = (index: number) => {
    if (isCorrect.length > 0) return;
    selected.includes(index)
      ? setSelected(selected.filter(option => option !== index))
      : setSelected([...selected, index]);
  }

  const handleButtonColor = (i: number): string => {
    const result = isCorrect.find(([idx]) => idx === i);
    if (result !== undefined) {
      return result[1] // Checks if the boolean in the tuple is true
        ? "bg-green text-green-foreground"
        : "bg-danger text-black";
    }
    if (selected.includes(i)) return "bg-amber text-amber-foreground";
    return "bg-dark text-muted border border-muted opacity-70"
  }

  return (
    <div className="flex flex-col items-center w-full">

      <div className="flex flex-col items-center p-8 gap-3">
        {/* Description */}
        <span className="text-4xl font-bold text-gray">
          {description}
        </span>

        {/* Prompt*/}
        <span className="text-xl text-gray/70">{prompt}</span>
      </div>

      {/* Multiple-choice option buttons */}
      <div className="grid w-full grid-cols-2 gap-4 pb-10 px-20">
        {options.map((option, i) => (
          <Option
            key={i}
            className={`h-20 w-full hover:border-amber ${handleButtonColor(i)}`}
            text={substituteRoles(option, definitions!)}
            onClick={() => handleSelect(i)}
          />
        ))}
      </div>

      <div className="relative flex justify-center w-full">
        <div className="flex flex-col">
          {/* User feedback */}
          <UserFeedback exerciseType="select" />
          
          {/* Answer button */}
          <Button
              variant="submit"
              className={"w-100 py-3"}
              onClick={() => checkAnswer()}
          >
            Answer
          </Button>
        </div>
        

        {/* Hint button - conditionally rendered, positioned to the right */}
        {hint && (
          <div className="absolute right-0 py-3">
            <Hint hint={hint}/>
          </div>
        )}
      </div>

    </div>
  );
}