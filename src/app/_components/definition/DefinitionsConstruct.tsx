"use client"

"use client"

import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import type { Definition, Expr, PaletteItem } from "~/app/hooks/parser";
import type {SelectedDefinitions} from "~/app/exercise/page";
import Button from "~/components/Button";
import { useState } from "react";
import { parseConstructDefinition, paletteItemToString, exprEquals, exprToString } from "~/app/hooks/expr";
import { parseExpression } from "~/app/hooks/parser";


type DefinitionsConstructProps = {
    definitions: Definition[];
    onSelect: (role: string, symbol: Expr) => void;
    selected: SelectedDefinitions;
    onComplete?: () => void;
}

export default function DefinitionsConstruct({ definitions, onSelect, selected, onComplete }: DefinitionsConstructProps) {
    const [tokens, setTokens] = useState<PaletteItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const currentDefinition = definitions[currentIndex];

    const addDefinition = () => {
      if (!currentDefinition) return;
      const expr = parseExpression(tokens.map(paletteItemToString).join(" "));
      const symbol = parseConstructDefinition(expr, currentDefinition.role);

      const conflict = Object.entries(selected).find(([, value]) => exprEquals(value, symbol));
      if (conflict) {
        setError(`'${exprToString(symbol)}' already belongs to role '${conflict[0]}'`);
        return;
      }

      setError(null);
      onSelect(currentDefinition.role, symbol);
      const isLast = currentIndex + 1 >= definitions.length;
      setCurrentIndex(currentIndex + 1);
      setTokens([]);
      if (isLast) onComplete?.();
    }

    if (!currentDefinition) return null;

    return (
      <div className="flex w-full flex-col">
        <DragAndDrop
          key={currentIndex}
          onTokensChangeAction={setTokens}
          prefill={[
            { kind: "binarySymbol", op: "elem" },
            { kind: "role", name: currentDefinition.role },
          ]}
        />
        {error && (
          <p className="pt-3 text-center text-sm text-red-500">{error}</p>
        )}
        <div className="flex justify-center pt-5">
          <Button
            variant="submit"
            className="w-100"
            onClick={addDefinition}
          >
            Add
          </Button>
        </div>
      </div>
    );
}