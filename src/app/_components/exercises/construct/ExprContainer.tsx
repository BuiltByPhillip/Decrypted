import type { PaletteItem as Item } from "~/app/hooks/parser";
import PaletteItem from "~/app/_components/exercises/construct/PaletteItem";
import React from "react";
import { Plus, Minus, Search } from "lucide-react";

type ContainerProps = {
  category: "Operators" | "Values" | "Symbols"
  defaultItems: Item[]
  searchFn: (query: string) => Item[]
  onStartDrag: (item: Item, x: number, y: number, offsetX: number, offsetY: number) => void;
}

const COLLAPSED_WIDTH = 128; // 8rem
const EXPANDED_WIDTH = 550; // Fixed expanded width
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export default function ExprContainer({ category, defaultItems, searchFn, onStartDrag }: ContainerProps) {
  // Load expanded state from localStorage
  const [isExpanded, setExpanded] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(`exprContainer-${category}-expanded`);
    return saved === 'true';
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Save expanded state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem(`exprContainer-${category}-expanded`, String(isExpanded));
  }, [isExpanded, category]);

  // Compute displayed items based on search query
  const displayedItems = searchQuery.trim() === ""
    ? defaultItems
    : searchFn(searchQuery.trim());

  // Focus input when expanded, clear search after collapse animation
  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isExpanded) {
      // Delay clearing search until collapse animation finishes
      const timeout = setTimeout(() => setSearchQuery(""), 500);
      return () => clearTimeout(timeout);
    }
  }, [isExpanded]);

  const targetWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div
      data-drag-handle
      className="relative border border-muted rounded-2xl cursor-grab active:cursor-grabbing"
      style={{
        width: targetWidth,
        transition: `width 500ms ${EASING}`,
      }}
    >
      {/* Floating label */}
      <span
        className="absolute left-3 px-1 text-sm font-medium text-muted select-none whitespace-nowrap bg-[#121212]"
        style={{
          top: isExpanded ? '-0.65rem' : '1.75rem',
          transform: isExpanded ? 'translateY(0)' : 'translateY(-50%)',
          transition: `top 400ms ${EASING}, transform 400ms ${EASING}`,
        }}
      >
        {category}
      </span>

      {/* Toggle button - absolutely positioned */}
      <button
        onClick={() => setExpanded(!isExpanded)}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute right-3 z-10 bg-transparent border-none p-0 cursor-pointer flex items-center"
        style={{
          top: isExpanded ? '0.75rem' : '1.75rem',
          transform: isExpanded ? 'none' : 'translateY(-50%)',
          transition: `top 400ms ${EASING}, transform 400ms ${EASING}`,
        }}
      >
        {isExpanded
          ? <div className="rounded-full bg-mac-yellow"><Minus size={14} strokeWidth={3} className="text-medium"/></div>
          : <Plus size={14} strokeWidth={3} className="text-muted"/>
        }
      </button>

      {/* Spacer for collapsed state */}
      <div
        style={{
          height: isExpanded ? 0 : '2.5rem',
          transition: `height 400ms ${EASING}`,
        }}
      />

      {/* Expandable content */}
      <div
        className="pt-4"
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: `grid-template-rows 500ms ${EASING}`,
        }}
      >
        <div className="overflow-hidden">
          {/* Search input */}
          <div
            className="px-2 pb-1"
            style={{
              opacity: isExpanded ? 1 : 0,
              transition: 'opacity 300ms ease-out',
              transitionDelay: isExpanded ? '200ms' : '0ms',
            }}
          >
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Search..."
                className="w-auto rounded-lg pl-7 pr-2 pb-1 text-sm text-soft-white placeholder:text-muted focus:outline-none select-none cursor-text"
              />
            </div>
          </div>
          {/* Items */}
          <div
            className="flex flex-wrap gap-1 px-2 pb-2"
            style={{
              opacity: isExpanded ? 1 : 0,
              transition: 'opacity 300ms ease-out',
              transitionDelay: isExpanded ? '250ms' : '0ms',
            }}
          >
            {displayedItems.map((item, index) => (
              <PaletteItem item={item} onStartDrag={onStartDrag} key={index} />
            ))}
            {displayedItems.length === 0 && searchQuery.trim() !== "" && (
              <span className="text-muted text-sm">No results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}