"use client"

import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import {type CustomOperator, type Expr, type PaletteItem, parseExpression, type TokenRange, PALETTE_CATEGORIES} from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";
import { useState, useRef, useEffect } from "react";
import {exprDiff, exprEquals, paletteItemToString, substituteRoles, substituteRolesInPalette} from "~/app/hooks/expr";
import UserFeedback from "~/app/_components/exercises/shared/UserFeedback";
import ExerciseShell from "~/app/_components/exercises/shared/ExerciseShell";

type ConstructExerciseProps = {
  description: string;
  prompt: string;
  hint?: string;
  definitions?: SelectedDefinitions;
  prefill?: PaletteItem[];
  palette?: string[];
  answer: Expr;
  customOperators?: CustomOperator[];
  hintPaused?: boolean;
  onAnswerAction?: (isCorrect: boolean) => void;
  initialTokens?: PaletteItem[];
  initialLocked?: boolean;
  onStateChange?: (state: { tokens: PaletteItem[]; locked: boolean }) => void;
}

export default function ConstructExercise({ answer, prefill, palette, definitions, prompt, description, hint, customOperators = [], hintPaused, onAnswerAction, initialTokens, initialLocked, onStateChange }: ConstructExerciseProps) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(initialLocked ? true : null);
  const [locked, setLocked] = useState(initialLocked ?? false);
  const [tokens, setTokens] = useState<PaletteItem[]>(initialTokens ?? []);

  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => { onStateChangeRef.current = onStateChange; });
  useEffect(() => {
    onStateChangeRef.current?.({ tokens, locked });
  }, [tokens, locked]);
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

  function collectValueItems(expr: Expr): PaletteItem[] {
    if (expr.kind === "var") return [{ kind: "var", name: expr.name }];
    if (expr.kind === "int") return [{ kind: "int", value: expr.value }];
    if (expr.kind === "binary") return [...collectValueItems(expr.left), ...collectValueItems(expr.right)];
    if (expr.kind === "unary") return collectValueItems(expr.operand);
    return [];
  }

  const definitionItems: PaletteItem[] = Object.values(definitions ?? {})
    .flatMap((expr): PaletteItem[] =>
      expr.kind === "var" ? [{ kind: "var" as const, name: expr.name }]
      : expr.kind === "int" ? [{ kind: "int" as const, value: expr.value }]
      : []
    );

  const answerItems = collectValueItems(answer).filter(item =>
    !definitionItems.some(d =>
      (item.kind === "var" && d.kind === "var" && item.name === d.name) ||
      (item.kind === "int" && d.kind === "int" && item.value === d.value)
    )
  );

  const priorityValueItems: PaletteItem[] = [...definitionItems, ...answerItems];

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
        <DragAndDrop
          onTokensChangeAction={handleTokensChange}
          errorRange={errorRange}
          isCorrect={isCorrect}
          locked={locked}
          hintPaused={hintPaused}
          customOperatorItems={customOperators.map(op => ({ kind: "operator" as const, op: op.name }))}
          priorityValueItems={priorityValueItems}
          prefill={prefill && definitions ? substituteRolesInPalette(prefill, definitions) : prefill}
          defaultPaletteItems={palette?.flatMap(cat => PALETTE_CATEGORIES[cat] ?? [])}
          initialTokens={initialTokens}
        />
      </ExerciseShell>

)
  ;
}