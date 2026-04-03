"use client"

import { useEffect, useState } from "react";


export default function ScrollCue() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(true);
    window.addEventListener("scroll", onScroll, { once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
      style={{
        animation: "fade-up 0.5s ease forwards",
        animationDelay: "0.8s",
      }}
    >
      <div
        className={`flex flex-col items-center gap-2 ${scrolled ? "" : "animate-bounce"}`}
        style={{ animationDelay: "1.4s" }}
      >
              <span className="text-medium font-mono text-[9px] tracking-[0.3em] uppercase">
                scroll
              </span>
        <div className="from-medium h-8 w-px bg-gradient-to-b to-transparent" />
      </div>
    </div>
  );
}