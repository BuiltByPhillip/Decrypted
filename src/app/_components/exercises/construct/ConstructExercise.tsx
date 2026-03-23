"use client"

import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import {type Expr, type PaletteItem, parseExpression, type TokenRange} from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";
import Button from "~/components/Button";
import {useState} from "react";
import {exprDiff, exprEquals, paletteItemToString, substituteRoles} from "~/app/hooks/expr";
import Hint from "~/app/_components/exercises/select/hint";
import UserFeedback from "~/app/_components/exercises/shared/UserFeedback";

type ConstructExerciseProps = {
  palette: PaletteItem[];
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  answer: Expr;
  onAnswerAction?: (isCorrect: boolean) => void;
}

type ButtonState = "Check answer" | "Correct!" | "Incorrect!"

export default function ConstructExercise({ answer, definitions, prompt, description, hint, onAnswerAction }: ConstructExerciseProps) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [tokens, setTokens] = useState<PaletteItem[]>([]);
  const [errorRange, setErrorRange] = useState<TokenRange | null>(null);
  const [submitButton, setSubmitButton] = useState<ButtonState>("Check answer");
  const [submittedAnswer, setSubmittedAnswer] = useState<{ status: "valid"; expr: Expr } | { status: "invalid" } | null>(null);
  const [resolvedAnswer, setResolvedAnswer] = useState<Expr>(answer);
  const [attempts, setAttempts] = useState<number>(0);

  const handleTokensChange = (newTokens: PaletteItem[]) => {
    setTokens(newTokens);
    setErrorRange(null);
    setIsCorrect(null);
    setSubmittedAnswer(null);
  };

  function handleAnswer(isMatch: boolean, isDuplicate = false) {
    setIsCorrect(isMatch);
    if (isMatch) {
      setSubmitButton("Correct!");
    } else {
      setSubmitButton("Incorrect!");
      setTimeout(() => setSubmitButton("Check answer"), 2500);
      if (!isDuplicate) setAttempts(a => a + 1);
    }
    if (isMatch) setErrorRange(null);
    onAnswerAction?.(isMatch);
  }

  const checkAnswer = () => {
    if (tokens.length === 0) {
      handleAnswer(false);
      return;
    }
    try {
      const userExpr = parseExpression(tokens.map(paletteItemToString).join(" "));
      const resolved = definitions ? substituteRoles(answer, definitions) : answer;
      const isMatch = exprEquals(userExpr, resolved);
      const isDuplicate = submittedAnswer?.status === "valid" && exprEquals(userExpr, submittedAnswer.expr);
      setSubmittedAnswer({ status: "valid", expr: userExpr });
      setResolvedAnswer(resolved);
      if (isMatch) {
        handleAnswer(true);
      }
      else {
        const diff = exprDiff(userExpr, resolved);
        setErrorRange(diff?.tokenRange ?? null);
        handleAnswer(false, isDuplicate);
      }
    } catch {
      setSubmittedAnswer({ status: "invalid" });
      setErrorRange({ start: 0, end: tokens.length });
      handleAnswer(false, true);
    }
  };

  return (
      <div className="w-full">
        <DragAndDrop prompt={prompt} description={description} definitions={definitions} onTokensChangeAction={handleTokensChange} errorRange={errorRange} isCorrect={isCorrect}/>
        <div className="flex flex-col items-center pt-10 gap-2">
          {submittedAnswer && isCorrect === false && <UserFeedback exerciseType="construct" userAnswer={submittedAnswer} correctAnswer={resolvedAnswer} definitions={definitions} attempts={attempts} />}
          {showHint && hint && (
            <span className="text-muted text-sm pb-1">{hint}</span>
          )}
          <div className="relative flex w-150 justify-center items-center">
            <Button variant="submit" className="w-100" onClick={checkAnswer}>{submitButton}</Button>
            {hint && (
              <div className="absolute right-0">
                <Hint open={showHint} onClick={() => setShowHint(s => !s)} />
              </div>
            )}
          </div>
        </div>
      </div>

)
  ;
}