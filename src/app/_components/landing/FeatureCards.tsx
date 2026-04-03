"use client"

import { useEffect, useRef, useState } from "react";

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    num: "01",
    title: "Define",
    body: "Describe your protocol in a simple DSL - roles, variables, steps. No config files, no boilerplate. Just write what you mean.",
    tag: "Write once.",
  },
  {
    num: "02",
    title: "Teach",
    body: "Your DSL becomes an interactive exercise - drag-and-drop expression building, multiple choice, and more. Students engage with the material rather than just reading it.",
    tag: "Scaffold learning.",
  },
  {
    num: "03",
    title: "Verify",
    body: "Students get immediate feedback on every attempt. Right or wrong, they know straight away - no waiting, no guessing.",
    tag: "Close the loop.",
  },
];

export default function FeatureCards() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCardsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardsRef} className="grid gap-5 sm:grid-cols-3">
      {FEATURES.map((f, i) => (
        <div
          key={f.num}
          className="group border-medium bg-dark/60 hover:border-muted relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-8 transition-all duration-300"
          style={{
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "translateY(0)" : "translateY(32px)",
            transitionProperty: "opacity, transform",
            transitionDuration: "0.6s",
            transitionTimingFunction: "ease",
            transitionDelay: `${i * 150}ms`,
          }}
        >
          {/* green accent bar - grows on group hover via CSS */}
          <div
            className="bg-green absolute top-8 left-0 w-0.5 rounded-r-full opacity-40 transition-all duration-500 group-hover:h-12 group-hover:opacity-100"
            style={{ height: "1.5rem" }}
          />

          <span className="text-medium absolute top-6 right-7 font-mono text-3xl font-bold tracking-widest">
            {f.num}
          </span>
          <h3 className="text-soft-white text-xl font-extrabold">{f.title}</h3>
          <p className="text-muted flex-1 text-sm leading-relaxed">{f.body}</p>
          <span className="text-green font-mono text-[11px] tracking-wider">
            {f.tag}
          </span>
        </div>
      ))}
    </div>
  );
}