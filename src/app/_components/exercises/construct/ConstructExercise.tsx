import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import type { Expr, PaletteItem } from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";

type ConstructExerciseProps = {
  palette: PaletteItem[];
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  answers: Expr[];
  onAnswerAction?: (isCorrect: boolean) => void;
}

export default function ConstructExercise({ answers, definitions, prompt, description, onAnswerAction }: ConstructExerciseProps) {
  return (
    <DragAndDrop answers={answers} definitions={definitions} prompt={prompt} description={description} onAnswerAction={onAnswerAction}/>
  );
}