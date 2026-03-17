import Button from "~/components/Button";
import type { ButtonHTMLAttributes } from "react";
import type { Expr } from "~/app/hooks/parser";
import { exprToString } from "~/app/hooks/expr";

type OptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  text: Expr;
  selected?: boolean;
  justCorrect?: boolean;
  wrongAnswer?: boolean;
}

export default function Option({
  className = "",
  text,
  selected,
  justCorrect,
  wrongAnswer,
  ...props
}: OptionProps) {

  return (
    <Button
      variant="option"
      className={`relative overflow-hidden ${className} ${wrongAnswer ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
      {...props}
    >
      {exprToString(text)}
      {justCorrect && (
        <span className="pointer-events-none absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer-sweep_0.65s_ease-in-out]" />
      )}
    </Button>
  );
}