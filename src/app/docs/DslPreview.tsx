"use client";

import { parse } from "~/app/hooks/parser";
import SelectExercise from "~/app/_components/exercises/select/SelectExercise";
import ConstructExercise from "~/app/_components/exercises/construct/ConstructExercise";
import MatchExercise from "~/app/_components/exercises/match/MatchExercise";
import CalculateExercise from "~/app/_components/exercises/calculate/CalculateExercise";

const PREVIEW_DEFINITIONS = {
  generator: { kind: "var" as const, name: "g" },
  prime: { kind: "var" as const, name: "p" },
  alice_secret: { kind: "var" as const, name: "a" },
  bob_secret: { kind: "var" as const, name: "b" },
};

function wrapFragment(fragment: string): string {
  // Strip leading "exercise:" line if present, since the wrapper adds it
  const lines = fragment.split("\n");
  const start = lines[0]?.trim() === "exercise:" ? 1 : 0;
  const indented = lines.slice(start).map(l => `    ${l}`).join("\n");
  return `title: Preview
define:
  type: select
  generator \\elem {g, h, k}
  prime \\elem {p, n, m, q}
  alice_secret \\elem {a, s, x}
  bob_secret \\elem {b, t, y}
step:
  description: Preview
  exercise:
${indented}`;
}

export default function DslPreview({ code }: { code: string }) {
  let parsed;
  try {
    parsed = parse(wrapFragment(code));
  } catch (e) {
    return (
      <p className="p-4 font-mono text-[12px] text-red-400">
        Parse error: {(e as Error).message}
      </p>
    );
  }

  const step = parsed.step[0];
  const exercise = step?.exercise;
  if (!exercise || !step) return null;

  switch (exercise.type) {
    case "select":
      return (
        <SelectExercise
          description={step.description}
          prompt={exercise.prompt}
          hint={exercise.hint}
          options={exercise.options ?? []}
          answers={exercise.answer ?? []}
          definitions={PREVIEW_DEFINITIONS}
        />
      );
    case "construct":
      return (
        <ConstructExercise
          description={step.description}
          prompt={exercise.prompt}
          hint={exercise.hint}
          prefill={exercise.prefill}
          answer={exercise.answer![0]!}
          definitions={PREVIEW_DEFINITIONS}
        />
      );
    case "match":
      return (
        <MatchExercise
          description={step.description}
          prompt={exercise.prompt}
          hint={exercise.hint}
          pairs={exercise.pairs ?? []}
          definitions={PREVIEW_DEFINITIONS}
        />
      );
    case "calculate":
      return (
        <CalculateExercise
          description={step.description}
          prompt={exercise.prompt}
          hint={exercise.hint}
          answer={exercise.answer![0]!}
          definitions={PREVIEW_DEFINITIONS}
        />
      );
    default:
      return null;
  }
}
