"use client"

import type {SelectedDefinitions} from "~/app/exercise/page";
import type {Expr} from "~/app/hooks/parser";
import {useState} from "react";
import ExerciseShell from "~/app/_components/exercises/shared/ExerciseShell";

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
    const [wrongAnswer, setWrongAnswer] = useState(false);

    const checkAnswer = () => {
      if (!value.trim() || locked) return;
      const isCorrect = answer.kind === "int" && Number(value.trim()) === answer.value;
      onAnswerAction?.(isCorrect);
      if (isCorrect) {
          setLocked(true);
      } else {
          setWrongAnswer(true);
          setTimeout(() => {
              setValue("");
              setWrongAnswer(false);
          }, 550);
      }
    };

    const inputColor = () => {
        if (locked) return "border-green bg-green/10 text-green";
        if (wrongAnswer) return "border-danger bg-danger/10 text-muted animate-[shake_0.5s_ease-in-out]";
        if (value) return "border-amber text-muted";
        return "border-muted text-muted opacity-70";
    };

    return (
      <ExerciseShell
        className="flex w-full flex-col items-center"
        description={description}
        prompt={prompt}
        hint={hint}
        definitions={definitions}
        submitState={locked ? "correct" : wrongAnswer ? "incorrect" : "idle"}
        onSubmit={checkAnswer}
      >
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
      </ExerciseShell>
    );
}
