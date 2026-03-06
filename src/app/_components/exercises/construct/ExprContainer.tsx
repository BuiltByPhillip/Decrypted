import type { PaletteItem as Item } from "~/app/hooks/parser";
import PaletteItem from "~/app/_components/exercises/construct/PaletteItem";
import React from "react";
import { Plus, Minus } from "lucide-react";

type ContainerProps = {
  category: "Operators" | "Values" | "Symbols"
  paletteItems: Item[]
  onStartDrag: (item: Item, x: number, y: number, offsetX: number, offsetY: number) => void;
}

const COLLAPSED_WIDTH = 128; // 8rem
const CONTAINER_PADDING = 24; // px-2 + border
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export default function ExprContainer({ category, paletteItems, onStartDrag }: ContainerProps) {
  const [isExpanded, setExpanded] = React.useState(false);
  const [expandedWidth, setExpandedWidth] = React.useState<number | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Measure content width on mount and when items change
  React.useEffect(() => {
    if (!contentRef.current) return;

    const el = contentRef.current;
    const prevVisibility = el.style.visibility;
    const prevPosition = el.style.position;

    // Temporarily make visible to measure
    el.style.visibility = 'hidden';
    el.style.position = 'absolute';
    el.style.width = 'fit-content';

    setExpandedWidth(el.offsetWidth + CONTAINER_PADDING);

    el.style.visibility = prevVisibility;
    el.style.position = prevPosition;
    el.style.width = '';
  }, [paletteItems]);

  const targetWidth = isExpanded ? (expandedWidth ?? COLLAPSED_WIDTH) : COLLAPSED_WIDTH;

  return (
    <div
      className="bg-dark/70 border border-muted rounded-2xl overflow-hidden"
      style={{
        width: targetWidth,
        transition: `width 500ms ${EASING}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium text-muted select-none whitespace-nowrap">{category}</span>
        <button
          onClick={() => setExpanded(!isExpanded)}
          className="bg-transparent border-none p-0 cursor-pointer flex items-center ml-2"
        >
          {isExpanded
            ? <Minus size={16} strokeWidth={3} className="text-muted" />
            : <Plus size={16} strokeWidth={3} className="text-muted" />
          }
        </button>
      </div>

      {/* Expandable content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: `grid-template-rows 500ms ${EASING}`,
        }}
      >
        <div className="overflow-hidden">
          <div
            ref={contentRef}
            className="flex flex-wrap gap-1 px-2 pb-2"
            style={{
              width: expandedWidth ? expandedWidth - CONTAINER_PADDING : 'auto',
              opacity: isExpanded ? 1 : 0,
              transition: 'opacity 300ms ease-out',
              transitionDelay: isExpanded ? '250ms' : '0ms',
            }}
          >
            {paletteItems.map((item, index) => (
              <PaletteItem item={item} onStartDrag={onStartDrag} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}