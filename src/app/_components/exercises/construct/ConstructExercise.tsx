"use client"

import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import {type CustomOperator, type Expr, type PaletteItem, parseExpression, type TokenRange} from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";
import {useState} from "react";
import {exprDiff, exprEquals, paletteItemToString, substituteRoles} from "~/app/hooks/expr";
import UserFeedback from "~/app/_components/exercises/shared/UserFeedback";
import ExerciseShell from "~/app/_components/exercises/shared/ExerciseShell";

type ConstructExerciseProps = {
  palette: PaletteItem[];
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  answer: Expr;
  customOperators?: CustomOperator[];
  onAnswerAction?: (isCorrect: boolean) => void;
}

export default function ConstructExercise({ answer, palette, definitions, prompt, description, hint, customOperators = [], onAnswerAction }: ConstructExerciseProps) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [tokens, setTokens] = useState<PaletteItem[]>([]);
  const [errorRange, setErrorRange] = useState<TokenRange | null>(null);
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
      setLocked(true);
    } else {
      if (!isDuplicate) setAttempts(a => a + 1);
    }
    if (isMatch) setErrorRange(null);
    onAnswerAction?.(isMatch);
  }

  const checkAnswer = () => {
    if (locked) return;
    if (tokens.length === 0) {
      handleAnswer(false);
      return;
    }
    try {
      const userExpr = parseExpression(tokens.map(paletteItemToString).join(" "), customOperators);
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
      <ExerciseShell
        className="w-full"
        description={description}
        prompt={prompt}
        hint={hint}
        definitions={definitions}
        submitState={locked ? "correct" : isCorrect === false ? "incorrect" : "idle"}
        onSubmit={checkAnswer}
        feedback={submittedAnswer && isCorrect === false && <UserFeedback exerciseType="construct" userAnswer={submittedAnswer} correctAnswer={resolvedAnswer} definitions={definitions} attempts={attempts} />}
      >
        <DragAndDrop definitions={definitions} onTokensChangeAction={handleTokensChange} errorRange={errorRange} isCorrect={isCorrect} locked={locked} customOperatorItems={customOperators.map(op => ({ kind: "operator" as const, op: op.name }))}/>
      </ExerciseShell>

)
  ;
}