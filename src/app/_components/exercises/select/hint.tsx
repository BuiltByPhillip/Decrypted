"use client"

import { CircleHelp } from "lucide-react";

type HintProps = {
  open?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Hint({ open, onClick, className }: HintProps) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors duration-200 hover:cursor-pointer ${open ? "text-muted" : "text-muted/40 hover:text-muted"} ${className}`}
      aria-label="Toggle hint"
    >
      <CircleHelp size={22} />
    </button>
  );
}
