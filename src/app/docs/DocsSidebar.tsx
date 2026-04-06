"use client";

import { useEffect, useState } from "react";

const NAV = [
  {
    group: "Getting Started",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Quick Start", href: "#quick-start" },
      { label: "Installation", href: "#installation" },
    ],
  },
  {
    group: "DSL Reference",
    items: [
      { label: "Syntax Overview", href: "#syntax-overview" },
      { label: "Define Block", href: "#define-block" },
      { label: "Step Block", href: "#step-block" },
      { label: "Expressions", href: "#expressions" },
    ],
  },
  {
    group: "Exercise Types",
    items: [
      { label: "Multiple Choice", href: "#select" },
      { label: "Drag And Drop", href: "#construct" },
      { label: "Match", href: "#match" },
      { label: "Calculate", href: "#calculate" },
    ],
  },
  {
    group: "Configuration",
    items: [
      { label: "Custom Operators", href: "#custom-operators" },
      { label: "Roles & Symbols", href: "#roles-and-symbols" },
    ],
  },
];

const ALL_IDS = NAV.flatMap((s) => s.items.map((i) => i.href.slice(1)));

export default function DocsSidebar() {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const updateActive = () => {
      const threshold = window.innerHeight * 0.35;

      let activeId = "";
      for (const id of ALL_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) {
          activeId = id;
        }
      }
      setActiveId(activeId);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, []);

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pb-12 pr-6 scrollbar-hide">
        <div className="mb-6">
          <span className="text-green font-mono text-[10px] tracking-[0.32em] uppercase">
            Documentation
          </span>
        </div>

        <nav className="flex flex-col gap-6">
          {NAV.map((section) => (
            <div key={section.group}>
              <span className="text-dark-foreground mb-2 block text-[11px] font-semibold tracking-widest uppercase">
                {section.group}
              </span>
              <div className="border-medium flex flex-col border-l pl-3">
                {section.items.map((item) => {
                  const id = item.href.slice(1);
                  const isActive = activeId === id;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`block py-1 text-sm transition-colors duration-150 ${
                        isActive ? "text-soft-white font-medium" : "text-muted hover:text-soft-white"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
