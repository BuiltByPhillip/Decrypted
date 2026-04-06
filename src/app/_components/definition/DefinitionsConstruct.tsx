"use client"

"use client"

import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import type { Definition, Expr, PaletteItem } from "~/app/hooks/parser";
import type {SelectedDefinitions} from "~/app/exercise/page";
import Button from "~/components/Button";
import { useState } from "react";
import { parseConstructDefinition, paletteItemToString } from "~/app/hooks/expr";
import { parseExpression } from "~/app/hooks/parser";


type DefinitionsConstructProps = {
    definitions: Definition[];
    onSelect: (role: string, symbol: Expr) => void;
    selected: SelectedDefinitions;
}

export default function DefinitionsConstruct({ definitions, onSelect, selected }: DefinitionsConstructProps) {
    const [tokens, setTokens] = useState<PaletteItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const currentDefinition = definitions[currentIndex];

    const addDefinition = () => {
      if (!currentDefinition) return;
      const expr = parseExpression(tokens.map(paletteItemToString).join(" "));
      const symbol = parseConstructDefinition(expr, currentDefinition.role);
      onSelect(currentDefinition.role, symbol);
      setCurrentIndex(currentIndex + 1);
      setTokens([]);
    }

    if (!currentDefinition) return null;

    return (
      <div className="flex flex-col">
        <DragAndDrop
          key={currentIndex}
          onTokensChangeAction={setTokens}
          prefill={[
            { kind: "binarySymbol", op: "elem" },
            { kind: "role", name: currentDefinition.role },
          ]}
        />
        <Button
          variant="submit"
          onClick={addDefinition}
        >
          Add
        </Button>
      </div>
    );
}