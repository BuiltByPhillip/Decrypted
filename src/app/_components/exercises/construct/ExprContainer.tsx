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

  // Measure content width on mount
  React.useEffect(() => {
    if (!contentRef.current || expandedWidth !== null) return;

    const el = contentRef.current;

    // Temporarily position absolute with fit-content to measure natural width
    const prevStyles = {
      visibility: el.style.visibility,
      position: el.style.position,
      width: el.style.width,
    };

    el.style.visibility = 'hidden';
    el.style.position = 'absolute';
    el.style.width = 'fit-content';

    const measuredWidth = el.offsetWidth + CONTAINER_PADDING;

    // Restore original styles
    el.style.visibility = prevStyles.visibility;
    el.style.position = prevStyles.position;
    el.style.width = prevStyles.width;

    setExpandedWidth(measuredWidth);
  }, [paletteItems, expandedWidth]);

  const targetWidth = isExpanded ? (expandedWidth ?? COLLAPSED_WIDTH) : COLLAPSED_WIDTH;

  return (
    <div
      className="relative border border-muted rounded-2xl"
      style={{
        width: targetWidth,
        transition: `width 500ms ${EASING}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 h-10">
        {/* Floating label */}
        <span
          className="absolute left-3 px-1 text-sm font-medium text-muted select-none whitespace-nowrap bg-[#121212]"
          style={{
            top: isExpanded ? '-0.5rem' : '0.7rem',
            transition: `top 400ms ${EASING}`,
          }}
        >
          {category}
        </span>

        {/* Spacer to push button right */}
        <div />

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!isExpanded)}
          className="bg-transparent border-none p-0 cursor-pointer flex items-center"
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