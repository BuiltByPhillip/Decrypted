import type { SelectedDefinitions } from "~/app/exercise/page";
import React, { useState } from "react";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";
import Button from "~/components/Button";
import Hint from "~/app/_components/exercises/select/hint";
import { substituteRolesInString } from "~/app/hooks/expr";

type ExerciseShellProps = {
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  submitState: "idle" | "correct" | "incorrect";
  onSubmit: () => void;
  feedback?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footerClassName?: string;
}


export default function ExerciseShell({ description, prompt, hint, onSubmit, submitState, children, definitions, feedback, className, footerClassName = "max-w-150" }: ExerciseShellProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className={className}>
      {/* Description & prompt */}
      <ExerciseDescription
        description={description}
        prompt={prompt}
        definitions={definitions}
      />

      {children}

      <div className="flex flex-col items-center pt-10">
        <div className={`relative flex w-full items-center justify-center ${footerClassName}`}>
          <div className="absolute bottom-full flex w-full flex-col items-center pb-2">
            {showHint && hint ? (
              <span className="text-muted text-sm">
                {substituteRolesInString(hint, definitions!)}
              </span>
            ) : (
              feedback
            )}
          </div>
          <Button variant="submit" className="w-[min(25rem,75vw)]" onClick={onSubmit}>
            {submitState === "correct"
              ? "Correct!"
              : submitState === "incorrect"
                ? "Incorrect!"
                : "Check answer"}
          </Button>
          {hint && (
            <div className="absolute right-0">
              <Hint open={showHint} onClick={() => setShowHint((s) => !s)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}