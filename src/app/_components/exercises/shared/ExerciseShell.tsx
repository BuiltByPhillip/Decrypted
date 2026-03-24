import type { SelectedDefinitions } from "~/app/exercise/page";
import React from "react";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";

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


export default function ExerciseShell({}: ExerciseShellProps) {

  return (
    <div>
      <ExerciseDescription/>

    </div>
  );
}