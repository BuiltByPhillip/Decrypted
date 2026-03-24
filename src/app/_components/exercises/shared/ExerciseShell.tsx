import type { SelectedDefinitions } from "~/app/exercise/page";
import React, { useState } from "react";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";
import Button from "~/components/Button";
import Hint from "~/app/_components/exercises/select/hint";

type ExerciseShellProps = {
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  submitState: "idle" | "correct" | "incorrect";
  onSubmit: () => void;
  feedback?: React.ReactNode;
  children: React.ReactNode;
}


export default function ExerciseShell({ description, prompt, hint, onSubmit, submitState, children, definitions, feedback }: ExerciseShellProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div>
      {/* Description & prompt */}
      <ExerciseDescription
        description={description}
        prompt={prompt}
        definitions={definitions}
      />

      {children}

      <div className="flex flex-col items-center pt-10">
        <div className="relative flex w-150 justify-center items-center">
          <div className="absolute bottom-full w-full flex flex-col items-center pb-2">
            {showHint && hint
              ? <span className="text-muted text-sm">{hint}</span>
              : feedback
            }
          </div>
          <Button variant="submit" className="w-100" onClick={onSubmit}>
            {submitState === "correct" ? "Correct!" : submitState === "incorrect" ? "Incorrect!" : "Check answer"}
          </Button>
          {hint && (
            <div className="absolute right-0">
              <Hint open={showHint} onClick={() => setShowHint(s => !s)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}