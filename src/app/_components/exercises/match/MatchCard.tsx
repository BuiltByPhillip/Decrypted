import { substituteRolesInString } from "~/app/hooks/expr";
import type { SelectedDefinitions } from "~/app/exercise/page";

type MatchCardProps = {
  label: string;
  className?: string;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  definitions: SelectedDefinitions;
};

/**
 * A card used in the match exercise, styled to match the select exercise options.
 * Used for both draggable source cards (right side) and drop slot cards (left side).
 */
export default function MatchCard({ label, className = "", onMouseDown, definitions }: MatchCardProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`border-muted bg-dark text-muted flex h-20 w-full items-center justify-center rounded-2xl border px-4 text-center font-medium opacity-70 transition duration-300 ease-in-out select-none ${className}`}
    >
      {substituteRolesInString(label, definitions)}
    </div>
  );
}
