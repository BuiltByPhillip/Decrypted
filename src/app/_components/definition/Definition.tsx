import Button from "~/components/Button";
import type { Expr } from "~/app/hooks/parser"
import { type ReactNode } from "react";

type DefinitionListProps = {
  children: ReactNode;
}

// Wrapper component that establishes the shared 3-column grid
export function DefinitionList({children}: DefinitionListProps) {
  return (
    <div className="grid grid-cols-[auto_auto_auto] items-center gap-y-4 gap-x-4">
      {children}
    </div>
  );
}

type DefinitionProps = {
  name: string;
  choices: Expr[];
  onChange: (role: string, symbol: Expr) => void;
  selected?: Expr;
}

// Uses display:contents so children participate in parent grid
export default function Definition({ choices, name, onChange, selected }: DefinitionProps) {
  const elementOf = "\u2208";
  const selectedName = selected?.kind === "var" ? selected.name : undefined;

  return (
    <div className="contents">

      {/* Col 1: invisible mirror of ∈ name — makes buttons the true center */}
      <div className="invisible flex items-center gap-x-2" aria-hidden="true">
        <span className="text-xl font-bold text-gray">{elementOf}</span>
        <span className="text-xl font-bold text-gray">{name}</span>
      </div>

      {/* Col 2: buttons — right-aligned so they sit flush against ∈ */}
      <div className="flex items-center justify-end">
        {choices.map(choice => {
          if (choice.kind === "var") {
            const isSelected: boolean = selectedName === choice.name;
            return (
              <Button
                key={choice.name}
                variant={"definition"}
                className={`mr-4 h-15 w-15
                ${isSelected ? "bg-green text-green-foreground -translate-y-1 scale-105" : "text-muted border border-muted"}
                ${selectedName && !isSelected ? "opacity-50" : ""}
                `}
                onClick={() => onChange(name, choice)}
              >
                {choice.name}
              </Button>
            );
          }
          return null;
        })}
      </div>

      {/* Col 3: visible ∈ name */}
      <div className="flex items-center gap-x-2">
        <span className="text-xl font-bold text-gray">{elementOf}</span>
        <span className="text-xl font-bold text-gray">{name}</span>
      </div>
    </div>
  );
}