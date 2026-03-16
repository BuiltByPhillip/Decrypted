import Button from "~/components/Button";
import type { ButtonHTMLAttributes } from "react";
import type { Expr } from "~/app/hooks/parser";
import { exprToString } from "~/app/hooks/expr";

type OptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  text: Expr;
  selected?: boolean;
}

export default function Option({
  className = "",
  text,
  selected,
  ...props
}: OptionProps) {

  return (
    <Button
      variant="option"
      className={`${className}`}
      {...props}
    >
      {exprToString(text)}
    </Button>
  );
}