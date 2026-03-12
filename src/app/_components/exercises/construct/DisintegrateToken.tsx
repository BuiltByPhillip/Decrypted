"use client"

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PaletteItem } from "~/app/hooks/parser";
import ExprBlock from "~/app/_components/exercises/construct/ExprBlock";

type Particle = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rot: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
};

type Fragment = {
  id: number;
  path: string;
  tx: number;
  ty: number;
  rot: number;
  delay: number;
};

type DisintegrateTokenProps = {
  item: PaletteItem;
  active: boolean;
  onCompleteAction: () => void;
  className?: string;
  style?: React.CSSProperties;
};

// Irregular polygons that tile to cover the full element
const FRAGMENT_DEFS: Omit<Fragment, "id">[] = [
  { path: "polygon(0% 0%, 48% 0%, 40% 46%, 0% 40%)",          tx: -28, ty: -22, rot: -18, delay: 0   },
  { path: "polygon(48% 0%, 100% 0%, 100% 36%, 44% 46%)",       tx: 26,  ty: -28, rot: 14,  delay: 20  },
  { path: "polygon(0% 40%, 40% 46%, 34% 76%, 0% 70%)",         tx: -24, ty: 6,   rot: -12, delay: 30  },
  { path: "polygon(44% 46%, 100% 36%, 100% 66%, 38% 78%)",     tx: 22,  ty: 10,  rot: 16,  delay: 10  },
  { path: "polygon(0% 70%, 34% 76%, 30% 100%, 0% 100%)",       tx: -18, ty: 26,  rot: -8,  delay: 40  },
  { path: "polygon(38% 78%, 100% 66%, 100% 100%, 32% 100%)",   tx: 28,  ty: 22,  rot: 11,  delay: 25  },
];

const ASH_COLORS = ["#4b5563", "#6b7280", "#9ca3af", "#374151", "#d1d5db", "#52525b"];

export default function DisintegrateToken({ item, active, onCompleteAction, className, style }: DisintegrateTokenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [fragments, setFragments] = useState<(Fragment & { rect: DOMRect })[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [disintegrating, setDisintegrating] = useState(false);

  useEffect(() => {
    if (!active) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) {
      onCompleteAction();
      return;
    }

    setDisintegrating(true);

    const newFragments = FRAGMENT_DEFS.map((f, i) => ({ ...f, id: i, rect }));

    const newParticles: Particle[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: rect.left + Math.random() * rect.width,
      y: rect.top + Math.random() * rect.height,
      tx: (Math.random() - 0.35) * 90,
      ty: -(Math.random() * 70 + 15),
      rot: Math.random() * 540 - 270,
      size: Math.random() * 3 + 1,
      duration: 450 + Math.random() * 350,
      delay: Math.random() * 200,
      color: ASH_COLORS[Math.floor(Math.random() * ASH_COLORS.length)]!,
    }));

    setFragments(newFragments);
    setParticles(newParticles);

    const maxTime = Math.max(...newParticles.map(p => p.duration + p.delay));
    const timer = setTimeout(() => {
      setFragments([]);
      setParticles([]);
      setDisintegrating(false);
      onCompleteAction();
    }, maxTime);

    return () => clearTimeout(timer);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        ref={ref}
        style={disintegrating ? { animation: "token-disintegrate 0.35s ease-in forwards", ...style } : style}
      >
        <ExprBlock item={item} className={className} />
      </div>
      {(fragments.length > 0 || particles.length > 0) && typeof document !== "undefined" && createPortal(
        <>
          {fragments.map(f => (
            <div
              key={f.id}
              style={{
                position: "fixed",
                left: `${f.rect.left}px`,
                top: `${f.rect.top}px`,
                width: `${f.rect.width}px`,
                height: `${f.rect.height}px`,
                clipPath: f.path,
                animation: `fragment-fly 0.38s ease-in ${f.delay}ms forwards`,
                "--tx": `${f.tx}px`,
                "--ty": `${f.ty}px`,
                "--rot": `${f.rot}deg`,
                pointerEvents: "none",
                zIndex: 9999,
              } as React.CSSProperties}
            >
              <ExprBlock item={item} className={className} />
            </div>
          ))}
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: "fixed",
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: "1px",
                pointerEvents: "none",
                zIndex: 9999,
                animation: `particle-disintegrate ${p.duration}ms ease-out ${p.delay}ms forwards`,
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                "--rot": `${p.rot}deg`,
              } as React.CSSProperties}
            />
          ))}
        </>,
        document.body
      )}
    </>
  );
}
