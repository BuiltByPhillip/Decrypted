"use client";

import { useMemo } from "react";
import { parse } from "~/app/hooks/parser";
import { getPreviewDefinition, substituteRolesInString } from "~/app/hooks/expr";
import SelectExercise from "~/app/_components/exercises/select/SelectExercise";
import ConstructExercise from "~/app/_components/exercises/construct/ConstructExercise";
import MatchExercise from "~/app/_components/exercises/match/MatchExercise";
import CalculateExercise from "~/app/_components/exercises/calculate/CalculateExercise";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";

type ExercisePreviewProps = {
  dsl: string;
}

export default function ExercisePreview({ dsl }: ExercisePreviewProps) {
  const parsed = useMemo(() => {
    try {
      return { ok: true, code: parse(dsl) } as const;
    } catch (e) {
      return { ok: false, error: (e as Error).message } as const;
    }
  }, [dsl]);

  if (!parsed.ok) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-sm text-danger">{parsed.error}</p>
      </div>
    );
  }

  const { code } = parsed;
  const definitions = getPreviewDefinition(code);

  return (
    <div className="flex flex-col bg-pattern gap-24 overflow-y-auto px-8 py-16 min-h-full">
      {code.step.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          {step.exercise?.type === "select" ? (
            <SelectExercise
              options={step.exercise.options!}
              description={step.description}
              prompt={step.exercise.prompt}
              hint={step.exercise.hint ? substituteRolesInString(step.exercise.hint, definitions) : undefined}
              definitions={definitions}
              answers={step.exercise.answer ?? []}
            />
          ) : step.exercise?.type === "construct" ? (
            <ConstructExercise
              answer={step.exercise.answer![0]!}
              prefill={step.exercise.prefill}
              palette={step.exercise.palette}
              description={step.description}
              prompt={step.exercise.prompt}
              hint={step.exercise.hint ? substituteRolesInString(step.exercise.hint, definitions) : undefined}
              definitions={definitions}
              customOperators={code.customOperators}
            />
          ) : step.exercise?.type === "match" ? (
            <MatchExercise
              description={step.description}
              prompt={step.exercise.prompt}
              hint={step.exercise.hint}
              definitions={definitions}
              pairs={step.exercise.pairs!}
            />
          ) : step.exercise?.type === "calculate" ? (
            <CalculateExercise
              description={step.description}
              prompt={step.exercise.prompt}
              hint={step.exercise.hint ? substituteRolesInString(step.exercise.hint, definitions) : undefined}
              answer={step.exercise.answer![0]!}
              definitions={definitions}
            />
          ) : (
            <ExerciseDescription
              description={step.description}
              definitions={definitions}
            />
          )}
        </div>
      ))}
    </div>
  );
}
