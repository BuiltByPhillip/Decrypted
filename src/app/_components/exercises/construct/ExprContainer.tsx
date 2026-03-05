import type { PaletteItem as Item } from "~/app/hooks/parser";
import PaletteItem from "~/app/_components/exercises/construct/PaletteItem";
import React from "react";
import { Plus, Minus } from "lucide-react";

type ContainerProps = {
  category: "Operators" | "Values" | "Symbols"
  paletteItems: Item[]
  onStartDrag: (item: Item, x: number, y: number, offsetX: number, offsetY: number) => void;
}


export default function ExprContainer({ category, paletteItems, onStartDrag }: ContainerProps) {
  const [isExpanded, setExpanded] = React.useState<boolean>(false);

  return (
    <div
      className={`
        bg-dark/70 border border-muted rounded-2xl overflow-hidden
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-150' : 'w-32'}
      `}
    >
      {/* Header row with category label and toggle button */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium text-muted select-none">{category}</span>
        <button
          onClick={() => setExpanded(!isExpanded)}
          className="bg-transparent border-none p-0 cursor-pointer flex items-center"
        >
          {isExpanded ? <Minus size={16} strokeWidth={3} className="text-muted" /> : <Plus size={16} strokeWidth={3} className="text-muted" />}
        </button>
      </div>

      {/* Expandable content area */}
      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-13 gap-1 px-2 pb-2">
            {paletteItems.map((item, index) => (
              <PaletteItem item={item} onStartDrag={onStartDrag} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}