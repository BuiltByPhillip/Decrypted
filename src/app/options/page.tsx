import SelectExercise from "~/app/_components/exercises/select/SelectExercise";
import type { Expr } from "~/app/hooks/parser";

export default function OptionsPage() {
  const options: Expr[] = [
    { kind: "var", name: "A" },
    { kind: "var", name: "B" },
    { kind: "var", name: "C" },
    { kind: "var", name: "D" },
  ];

  const answers: Expr[] = [
    { kind: "var", name: "B" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-pattern p-8">
      <SelectExercise
        options={options}
        description="Bob computes his public key B"
        prompt="Which expression does Bob use to calculate his public key B"
        hint="This is an example of a hint"
        answers={answers}
      />
    </main>
  );
}