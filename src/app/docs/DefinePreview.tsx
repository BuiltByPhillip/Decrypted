"use client";

import { useState } from "react";
import { parse } from "~/app/hooks/parser";
import type { Expr } from "~/app/hooks/parser";
import type { SelectedDefinitions } from "~/app/exercise/page";
import DefinitionStep from "~/app/_components/definition/DefinitionStep";

function wrapDefineFragment(fragment: string): string {
  const indented = fragment.split("\n").map(l => `  ${l}`).join("\n");
  return `title: Preview\ndefine:\n${indented}\nstep:\n  description: Preview`;
}

export default function DefinePreview({ code }: { code: string }) {
  const [selected, setSelected] = useState<SelectedDefinitions>({});

  let parsed;
  try {
    parsed = parse(wrapDefineFragment(code));
  } catch (e) {
    return (
      <p className="p-4 font-mono text-[12px] text-red-400">
        Parse error: {(e as Error).message}
      </p>
    );
  }

  const definitions = parsed.information.definition;
  if (!definitions.length) return null;

  const onSelect = (role: string, symbol: Expr) => {
    setSelected(prev => ({ ...prev, [role]: symbol }));
  };

  return (
    <div className="px-6 pt-6">
      <DefinitionStep
        definitions={definitions}
        onSelect={onSelect}
        selected={selected}
      />
    </div>
  );
}
