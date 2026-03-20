"use client"

import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";
import Button from "~/components/Button";
import Hint from "~/app/_components/exercises/select/hint";
import type {SelectedDefinitions} from "~/app/exercise/page";
import type {Expr} from "~/app/hooks/parser";
import {useState} from "react";

type ButtonState = "Check answer" | "Correct!" | "Try again!"

type CalculateExerciseProps = {
    description: string;
    prompt: string;
    hint?: string;
    answer: Expr;
    onAnswerAction?: (isCorrect: boolean) => void;
    definitions: SelectedDefinitions;
}

export default function CalculateExercise({ description, prompt, hint, answer, onAnswerAction, definitions }: CalculateExerciseProps) {
    const [value, setValue] = useState("");
    const [locked, setLocked] = useState(false);
    const [submitButton, setSubmitButton] = useState<ButtonState>("Check answer");
    const [justCorrect, setJustCorrect] = useState(false);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const checkAnswer = () => {
        if (!value.trim() || locked) return;
        const isCorrect = answer.kind === "int" && Number(value.trim()) === answer.value;
        onAnswerAction?.(isCorrect);
        if (isCorrect) {
            setLocked(true);
            setSubmitButton("Correct!");
            setJustCorrect(true);
            setTimeout(() => setJustCorrect(false), 500);
        } else {
            setWrongAnswer(true);
            setSubmitButton("Try again!");
            setTimeout(() => {
                setValue("");
                setWrongAnswer(false);
            }, 550);
            setTimeout(() => setSubmitButton("Check answer"), 2500);
        }
    };

    const inputColor = () => {
        if (locked) return "border-green bg-green/10 text-green";
        if (wrongAnswer) return "border-danger bg-danger/10 text-muted animate-[shake_0.5s_ease-in-out]";
        if (value) return "border-amber text-muted";
        return "border-muted text-muted opacity-70";
    };

    return (
      <div className="flex w-full flex-col items-center">
        <ExerciseDescription
          description={description}
          prompt={prompt}
          definitions={definitions}
        />

        {/* Answer input — same spatial role and sizing as select option buttons */}
        <div className="w-full px-20 pb-10">
          <input
            value={value}
            onChange={(e) => !locked && setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder="Enter your answer"
            readOnly={locked}
            className={`bg-dark placeholder:text-muted/40 h-20 w-full cursor-text rounded-2xl border text-center text-2xl font-medium transition duration-300 ease-in-out outline-none ${inputColor()}`}
          />
        </div>

        <div className="relative flex w-full justify-center">
          <div className="flex flex-col items-center">
            {showHint && hint && (
              <span className="text-muted pb-1 text-sm">
                {hint}
              </span>
            )}
            <Button
              variant="submit"
              className="mt-3 w-100 py-3"
              onClick={checkAnswer}
            >
              {submitButton}
            </Button>
          </div>

          {hint && (
            <div className="absolute right-20 py-3">
              <Hint open={showHint} onClick={() => setShowHint((s) => !s)} />
            </div>
          )}
        </div>
      </div>
    );
}
