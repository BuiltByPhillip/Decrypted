"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { substituteRolesInString } from "~/app/hooks/expr";
import type { SelectedDefinitions } from "~/app/exercise/page";

type ExerciseDescriptionProps = {
  description?: string;
  definitions?: SelectedDefinitions;
  prompt?: string;
  className?: string;
};

export default function ExerciseDescription({ description, prompt, className, definitions }: ExerciseDescriptionProps) {
  const descRef = useRef<HTMLSpanElement>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);

  const resolvedDescription = definitions && description
    ? substituteRolesInString(description, definitions)
    : description;

  // Measure whether the description wraps at the large font size.
  // We temporarily force text-4xl metrics via inline style so the measurement
  // is always relative to the large size - this avoids a feedback loop where
  // switching to a smaller font makes the text fit, which would then trigger
  // a switch back to the large font, and so on.
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const prev = { fontSize: el.style.fontSize, lineHeight: el.style.lineHeight };
    el.style.fontSize = "2.25rem";   // text-4xl
    el.style.lineHeight = "2.5rem";  // text-4xl leading

    void el.offsetHeight; // force layout

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const wraps = el.scrollHeight > lineHeight * 1.5;

    el.style.fontSize = prev.fontSize;
    el.style.lineHeight = prev.lineHeight;

    setIsMultiLine(wraps);
  }, [resolvedDescription]);

  return (
    <div className={`flex flex-col items-center p-8 gap-3 ${className ?? ""}`}>
      <span
        ref={descRef}
        className={`font-bold text-gray text-center max-w-3xl ${isMultiLine ? "text-2xl" : "text-4xl"}`}
      >
        {resolvedDescription}
      </span>

      {prompt && (
        <span className="text-xl text-center text-gray/70 max-w-2xl">
          {definitions ? substituteRolesInString(prompt, definitions) : prompt}
        </span>
      )}
    </div>
  );
}
