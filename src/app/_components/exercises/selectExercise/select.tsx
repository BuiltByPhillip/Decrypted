"use client"

import Option from "~/app/_components/exercises/selectExercise/option"
import Button from "~/components/Button";
import Hint from "~/app/_components/exercises/selectExercise/hint";
import { useState } from "react";
import type { Expr } from "~/app/hooks/parser"
import { exprListContains, substituteRoles } from "~/app/hooks/expr";
import type { SelectedDefinitions } from "~/app/exercise/page";

type SelectExerciseProps = {
  options: Expr[];
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  answers: Expr[];
  onAnswerAction?: (isCorrect: boolean) => void;
}

export default function SelectExercise({options, description, prompt, hint, definitions, answers, onAnswerAction}: SelectExerciseProps) {
  const [selected, setSelected] = useState<number[]>([]);

  const checkAnswer = () => {
    const selectedExprs: Expr[] = selected.map(i => options[i] as Expr);
    const isCorrect = selectedExprs.length > 0 && selectedExprs.every(expr => exprListContains(expr, answers));
    onAnswerAction?.(isCorrect);
  }

  const handleSelect = (index: number) => {
    selected.includes(index)
      ? setSelected(selected.filter(option => option !== index))
      : setSelected([...selected, index]);
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
            className={`h-20 w-full hover:border-amber ${selected.includes(i) ? "bg-amber text-amber-foreground" : "text-muted border bg-dark border-muted opacity-70"}`}
            text={substituteRoles(option, definitions!)}
            onClick={() => handleSelect(i)}
          />
        ))}
      </div>

      <div className="relative flex justify-center w-full">
        {/* Answer button */}
        <Button
          variant="submit"
          className={"w-100 py-3"}
          onClick={() => checkAnswer()}
        >
          Answer
        </Button>

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