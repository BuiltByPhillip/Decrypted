"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Hand, HandFist } from "lucide-react";

const STORAGE_KEY = "decrypted_drag_hint_seen";

type Rect = { left: number; top: number; width: number; height: number };
type Rects = { values: Rect; operators: Rect; container: Rect };
type Phase = "idle" | "hovering" | "grabbing" | "moving" | "at-target" | "hidden";

type Props = {
  valuesPaletteRef: React.RefObject<HTMLDivElement | null>;
  operatorPaletteRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dismissed: boolean;
  onDismiss: () => void;
};

export default function DragHintOverlay({ valuesPaletteRef, operatorPaletteRef, containerRef, dismissed, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);
  const [rects, setRects] = useState<Rects | null>(null);
  const rectsRef = useRef<Rects | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const readRects = useCallback((): Rects | null => {
    const vr = valuesPaletteRef.current?.getBoundingClientRect();
    const or = operatorPaletteRef.current?.getBoundingClientRect();
    const cr = containerRef.current?.getBoundingClientRect();
    if (!vr || !or || !cr) return null;
    return {
      values: { left: vr.left, top: vr.top, width: vr.width, height: vr.height },
      operators: { left: or.left, top: or.top, width: or.width, height: or.height },
      container: { left: cr.left, top: cr.top, width: cr.width, height: cr.height },
    };
  }, [valuesPaletteRef, operatorPaletteRef, containerRef]);

  // Show when the expression box enters the viewport, wait for scroll to settle first
  useEffect(() => {
    if (dismissed) return;
    const el = containerRef.current;
    if (!el) return;

    let waitCancelled = false;

    const waitForScrollSettle = (): Promise<void> =>
      new Promise(resolve => {
        let lastY = window.scrollY;
        let stableFrames = 0;
        const check = () => {
          if (waitCancelled) { resolve(); return; }
          if (Math.abs(window.scrollY - lastY) < 0.5) {
            stableFrames++;
            if (stableFrames >= 5) { resolve(); return; }
          } else {
            stableFrames = 0;
            lastY = window.scrollY;
          }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          waitCancelled = false;
          waitForScrollSettle().then(() => {
            if (waitCancelled) return;
            const r = readRects();
            if (r) {
              rectsRef.current = r;
              setRects(r);
              setVisible(true);
            }
          });
        } else {
          waitCancelled = true;
          setVisible(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      waitCancelled = true;
      observer.disconnect();
    };
  }, [dismissed, readRects, containerRef]);

  // Keep spotlight positions in sync with window resizes
  useEffect(() => {
    if (!visible || dismissed) return;
    const handleResize = () => {
      const r = readRects();
      if (r) {
        rectsRef.current = r;
        setRects(r);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visible, dismissed, readRects]);

  // Animation loop
  useEffect(() => {
    if (!visible || dismissed) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        const t = setTimeout(resolve, ms);
        timeouts.push(t);
      });

    const run = async () => {
      while (!cancelled) {
        const r = rectsRef.current;
        if (!r) { await wait(100); continue; }

        const startX = r.values.left + 17;
        const startY = r.values.top + r.values.height / 2 - 15;
        const endX = r.container.left + r.container.width / 2;
        const endY = r.container.top + r.container.height / 2 - 9;

        setCursorPos({ x: startX, y: startY });
        setPhase("hovering");
        await wait(900);
        if (cancelled) return;

        setPhase("grabbing");
        await wait(250);
        if (cancelled) return;

        setPhase("moving");
        await wait(16);
        if (cancelled) return;
        setCursorPos({ x: endX, y: endY });
        await wait(1100);
        if (cancelled) return;

        setPhase("at-target");
        await wait(700);
        if (cancelled) return;

        setPhase("hidden");
        await wait(350);
        if (cancelled) return;

        setCursorPos({ x: startX, y: startY });
        await wait(100);
        if (cancelled) return;
      }
    };

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [visible, dismissed]);

  if (!visible || !rects || dismissed) return null;

  const cursorVisible = phase !== "idle" && phase !== "hidden";
  const isGrabbing = phase === "grabbing" || phase === "moving" || phase === "at-target";
  const isMoving = phase === "moving";

  return (
    <>
      {cursorVisible && (
        <div
          className="pointer-events-none fixed top-0 left-0 z-[9999]"
          style={{
            transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
            transition: isMoving
              ? "transform 1s cubic-bezier(0.4,0,0.2,1)"
              : "none",
          }}
        >
          {isGrabbing
            ? <HandFist size={22} className="text-soft-white" />
            : <Hand size={22} className="text-muted" />
          }
        </div>
      )}

      {isGrabbing && cursorVisible && (
        <div
          className="pointer-events-none fixed top-0 left-0 z-[9998]"
          style={{
            transform: `translate(${cursorPos.x-8}px, ${cursorPos.y-9}px)`,
            transition: isMoving
              ? "transform 1s cubic-bezier(0.4,0,0.2,1)"
              : "none",
          }}
        >
          <div className="flex items-center justify-center h-9 min-w-9 px-2 rounded-xl text-xl select-none bg-dark/80 text-muted border border-muted/30">
            x
          </div>
        </div>
      )}
    </>
  );
}
