"use client"

import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import {type Expr, type PaletteItem, parseExpression} from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";
import Button from "~/components/Button";
import {useState} from "react";
import {exprEquals, paletteItemToString, substituteRoles} from "~/app/hooks/expr";

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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [tokens, setTokens] = useState<PaletteItem[]>([]);

  const checkAnswer = () => {
    if (tokens.length === 0 || !answers || answers.length === 0) {
      setIsCorrect(false);
      onAnswerAction?.(false);
      return;
    }
    try {
      const userExpr = parseExpression(tokens.map(paletteItemToString).join(" "));
      const isMatch = answers.some(answer => {
        const resolved = definitions ? substituteRoles(answer, definitions) : answer;
        return exprEquals(userExpr, resolved);
      });
      setIsCorrect(isMatch);
      onAnswerAction?.(isMatch);
    } catch {
      setIsCorrect(false);
      onAnswerAction?.(false);
    }
  };

  return (
      <div>
        <DragAndDrop prompt={prompt} description={description} onTokensChangeAction={setTokens}/>
        <div className="flex flex-col items-center pt-10 gap-2">
          <Button variant="submit" className="w-100" onClick={checkAnswer}>Check answer</Button>
          {isCorrect === true && <span className="text-green-500">Correct!</span>}
          {isCorrect === false && <span className="text-red-500">Incorrect, try again.</span>}
        </div>
      </div>

)
  ;
}