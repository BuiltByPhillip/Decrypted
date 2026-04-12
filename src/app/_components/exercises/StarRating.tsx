"use client"

import { useState } from "react";

type StarRatingProps = {
  onRate?: (rating: number) => void;
};

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function StarRating({ onRate }: StarRatingProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const active = hovered || rating;

  const handleClick = (value: number) => {
    setRating(value);
    setSubmitted(true);
    onRate?.(value);
  };

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <span
        className="text-xs tracking-widest uppercase transition-colors duration-300"
        style={{ color: submitted ? "var(--color-success)" : "rgba(148,163,184,0.4)" }}
      >
        {submitted ? "Thank you" : (active ? LABELS[active] : "Rate this exercise")}
      </span>

      <div
        className="flex"
        onMouseLeave={() => !submitted && setHovered(0)}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < active;
          const locked = submitted && i < rating;
          return (
            <button
              key={i}
              disabled={submitted}
              onMouseEnter={() => !submitted && setHovered(i + 1)}
              onClick={() => !submitted && handleClick(i + 1)}
              className="cursor-pointer disabled:cursor-default focus:outline-none px-1.5"
              aria-label={`Rate ${i + 1} star${i !== 0 ? "s" : ""}`}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                className="transition-all duration-150"
                style={{
                  transform: filled ? "scale(1.15)" : "scale(1)",
                  filter: locked ? "drop-shadow(0 0 4px rgba(92,232,138,0.4))" : "none",
                }}
              >
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={filled ? "#5ce88a" : "none"}
                  stroke={filled ? "#5ce88a" : "#334155"}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  style={{ transition: "fill 0.15s ease, stroke 0.15s ease" }}
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
