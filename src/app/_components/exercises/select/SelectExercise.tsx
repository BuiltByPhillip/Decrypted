"use client"

import Option from "~/app/_components/exercises/select/option"
import Button from "~/components/Button";
import Hint from "~/app/_components/exercises/select/hint";
import { useState } from "react";
import type { Expr } from "~/app/hooks/parser"
import { exprListContains, substituteRoles } from "~/app/hooks/expr";
import type { SelectedDefinitions } from "~/app/exercise/page";
import UserFeedback from "~/app/_components/exercises/shared/UserFeedback";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";

type ButtonState = "Answer" | "Correct!" | "Try again!"

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
  const [locked, setLocked] = useState<boolean>(false);
  const [lastResults, setLastResults] = useState<[number, boolean][]>([]);
  const [submitButton, setSubmitButton] = useState<ButtonState>("Answer");
  const [justCorrect, setJustCorrect] = useState<boolean>(false);
  const [wrongAnswer, setWrongAnswer] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const checkAnswer = () => {
    if (selected.length === 0) return;
    const correctness: [number, boolean][] = selected.map(i => [i, exprListContains(options[i] as Expr, answers)]);
    const allCorrect = correctness.every(([, correct]) => correct) && correctness.length === answers.length;
    setLastResults(correctness);
    onAnswerAction?.(allCorrect);
    if (allCorrect) {
      setLocked(true);
      setSubmitButton("Correct!");
      setJustCorrect(true);
      setTimeout(() => setJustCorrect(false), 500);
    } else {
      setWrongAnswer(true);
      setSubmitButton("Try again!");
      setTimeout(() => {
        setSelected([]);
        setWrongAnswer(false);
      }, 550);
      setTimeout(() => setSubmitButton("Answer"), 2500);
    }
  }

  const handleSelect = (index: number) => {
    if (locked) return;
    selected.includes(index)
      ? setSelected(selected.filter(option => option !== index))
      : setSelected([...selected, index]);
  }

  const handleButtonColor = (i: number): string => {
    if (locked && selected.includes(i)) return "bg-green text-green-foreground";
    if (wrongAnswer && selected.includes(i)) return "bg-danger text-white";
    if (selected.includes(i)) return "bg-amber text-amber-foreground";
    return "bg-dark text-muted border border-muted opacity-70"
  }

  return (
    <div className="flex flex-col items-center w-full">

      {/* Exercise description & prompt */}
      <ExerciseDescription description={description} prompt={prompt} definitions={definitions}/>

      {/* Multiple-choice option buttons */}
      <div className="grid w-full grid-cols-2 gap-4 pb-10 px-20">
        {options.map((option, i) => (
          <Option
            key={i}
            className={`h-20 w-full hover:border-amber ${handleButtonColor(i)}`}
            text={substituteRoles(option, definitions!)}
            onClick={() => handleSelect(i)}
            justCorrect={justCorrect && selected.includes(i)}
            wrongAnswer={wrongAnswer && selected.includes(i)}
          />
        ))}
      </div>

      <div className="relative flex justify-center w-full">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* User feedback + hint float above button */}
            <div className="absolute bottom-full w-full flex flex-col items-center pb-2">
              {!locked && <UserFeedback exerciseType="select" results={lastResults} options={options} answers={answers} />}
              {showHint && hint && (
                <span className="text-muted text-sm pb-1">{hint}</span>
              )}
            </div>

            {/* Answer button */}
            <Button
                variant="submit"
                className={"w-100 py-3 mt-3"}
                onClick={() => checkAnswer()}
            >
              {submitButton}
            </Button>
          </div>
        </div>

        {/* Hint button - conditionally rendered, positioned to the right */}
        {hint && (
          <div className="absolute right-20 py-3">
            <Hint open={showHint} onClick={() => setShowHint(s => !s)} />
          </div>
        )}
      </div>

    </div>
  );
}