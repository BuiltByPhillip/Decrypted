"use client";

import { api } from "~/trpc/react";
import type { Code, Expr } from "~/app/hooks/parser";
import { parse } from "~/app/hooks/parser";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;
import Button from "~/components/Button";
import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import { useLenis } from "~/components/SmoothScroll";
import DefinitionContainer from "~/app/_components/definition/DefinitionContainer";
import { substituteRolesInString } from "~/app/hooks/expr";
import DefinitionStep from "~/app/_components/definition/DefinitionStep";

type ExerciseComponents = {
  SelectExercise: AnyComponent | null;
  ConstructExercise: AnyComponent | null;
  MatchExercise: AnyComponent | null;
  CalculateExercise: AnyComponent | null;
  FinishScreen: AnyComponent | null;
  ProgressBar: AnyComponent | null;
  ExerciseDescription: AnyComponent | null;
};

// Map of <Role, Symbol>
export type SelectedDefinitions = Record<string, Expr>

export default function ExercisePage({ dsl, exerciseId }: { dsl: string; exerciseId: string }) {
  const submitRating = api.rating.create.useMutation();
  const [code] = useState<Code | null>(() => {
    try { return parse(dsl); } catch { return null; }
  });

  const [showExercises, setShowExercises] = useState(false);
  const [exerciseComponents, setExerciseComponents] = useState<ExerciseComponents>({
    SelectExercise: null,
    ConstructExercise: null,
    MatchExercise: null,
    CalculateExercise: null,
    FinishScreen: null,
    ProgressBar: null,
    ExerciseDescription: null,
  });
  const [definitions, setDefinitions] = useState<SelectedDefinitions>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showFinish, setShowFinish] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const lenis = useLenis();
  const exerciseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Flag to trigger scroll to first exercise after render
  const shouldScrollToFirst = useRef(false);

  // Snap scroll state
  const currentExerciseIndexRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const finishElementRef = useRef<HTMLDivElement | null>(null);
  const showFinishRef = useRef(false);
  const exercisesLengthRef = useRef(0);
  const exercisesRef = useRef<typeof exercises>([]);

  /* Load exercise components in the background after definition phase renders */
  useEffect(() => {
    Promise.all([
      import("~/app/_components/exercises/select/SelectExercise"),
      import("~/app/_components/exercises/construct/ConstructExercise"),
      import("~/app/_components/exercises/match/MatchExercise"),
      import("~/app/_components/exercises/calculate/CalculateExercise"),
      import("~/app/_components/exercises/FinishScreen"),
      import("~/app/_components/exercises/shared/ProgressBar"),
      import("~/app/_components/exercises/shared/ExerciseDescription"),
    ]).then(([Select, Construct, Match, Calculate, Finish, Progress, Description]) => {
      setExerciseComponents({
        SelectExercise: Select.default,
        ConstructExercise: Construct.default,
        MatchExercise: Match.default,
        CalculateExercise: Calculate.default,
        FinishScreen: Finish.default,
        ProgressBar: Progress.default,
        ExerciseDescription: Description.default,
      });
    });
  }, []);

  // Scroll to an exercise by index
  const scrollToExercise = useCallback((index: number) => {
    if (!lenis) return;

    const element = exerciseRefs.current.get(index);
    if (!element) return;

    currentExerciseIndexRef.current = index;
    setCurrentExerciseIndex(index);

    // CRITICAL: Update Lenis's internal dimensions before scrolling
    // Without this, Lenis may not know about newly added content
    lenis.resize();

    lenis.scrollTo(element, {
      duration: 1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
  }, [lenis]);

  // Disable scrolling on the definition step
  useEffect(() => {
    if (!lenis) return;
    if (showExercises) {
      lenis.start();
    } else {
      lenis.stop();
    }
  }, [showExercises, lenis]);

  // Re-snap to current exercise on window resize
  useEffect(() => {
    if (!showExercises || !lenis) return;

    const handleResize = () => {
      lenis.resize();
      const element = exerciseRefs.current.get(currentExerciseIndexRef.current);
      if (element) lenis.scrollTo(element, { immediate: true });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showExercises, lenis, scrollToExercise]);

  // Snap scroll: intercept wheel events and navigate between exercises
  useEffect(() => {
    if (!showExercises || !lenis) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const now = Date.now();
      if (now - lastScrollTimeRef.current < 800) return;
      if (Math.abs(e.deltaY) < 15) return; // ignore momentum tails

      lastScrollTimeRef.current = now;

      const currentIdx = currentExerciseIndexRef.current;

      if (e.deltaY > 0) {
        const nextIdx = currentIdx + 1;
        if (!exercisesRef.current[currentIdx]?.step.exercise) {
          setResults(prev => ({ ...prev, [currentIdx]: true }));
        }
        if (exerciseRefs.current.has(nextIdx)) {
          scrollToExercise(nextIdx);
        } else if (showFinishRef.current && finishElementRef.current) {
          currentExerciseIndexRef.current = exercisesLengthRef.current;
          lenis.resize();
          lenis.scrollTo(finishElementRef.current, { duration: 1, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
        }
      } else if (e.deltaY < 0) {
        if (currentIdx === exercisesLengthRef.current) {
          scrollToExercise(exercisesLengthRef.current - 1);
        } else if (currentIdx > 0) {
          scrollToExercise(currentIdx - 1);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) return;
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTimeRef.current < 800) return;
      lastScrollTimeRef.current = now;

      const currentIdx = currentExerciseIndexRef.current;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        const nextIdx = currentIdx + 1;
        if (!exercisesRef.current[currentIdx]?.step.exercise) {
          setResults(prev => ({ ...prev, [currentIdx]: true }));
        }
        if (exerciseRefs.current.has(nextIdx)) {
          scrollToExercise(nextIdx);
        } else if (showFinishRef.current && finishElementRef.current) {
          currentExerciseIndexRef.current = exercisesLengthRef.current;
          lenis.resize();
          lenis.scrollTo(finishElementRef.current, { duration: 1, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentIdx === exercisesLengthRef.current) {
          scrollToExercise(exercisesLengthRef.current - 1);
        } else if (currentIdx > 0) {
          scrollToExercise(currentIdx - 1);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [showExercises, lenis, scrollToExercise]);

  // Handle scroll to first exercise after content is rendered
  useEffect(() => {
    if (!shouldScrollToFirst.current || !showExercises || !lenis) return;

    shouldScrollToFirst.current = false;

    // Double requestAnimationFrame ensures:
    // 1. First rAF: Browser has processed the DOM changes
    // 2. Second rAF: Layout calculations are complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToExercise(0);
      });
    });
  }, [showExercises, lenis, scrollToExercise]);

  const onAnswerAction = useCallback((exerciseIndex: number, isCorrect: boolean) => {
    setResults(prev => ({ ...prev, [exerciseIndex]: isCorrect }));
  }, []);

  const handleFinish = () => {
    showFinishRef.current = true;
    currentExerciseIndexRef.current = exercisesLengthRef.current;
    setShowFinish(true);
  };

  useEffect(() => {
    if (!showFinish || !lenis) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lenis.resize();
        lenis.scrollTo("bottom", { duration: 2 });
      });
    });
  }, [showFinish, lenis]);

  const handleRestart = () => {
    currentExerciseIndexRef.current = 0;
    lastScrollTimeRef.current = 0;
    showFinishRef.current = false;
    setResults({});
    setShowFinish(false);
    setShowExercises(false);
    lenis?.scrollTo("top", { duration: 1.5 });
  };

  const setExerciseRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      exerciseRefs.current.set(index, el);
    } else {
      exerciseRefs.current.delete(index);
    }
  }, []);

  const updateDefinitions = (role: string, symbol: Expr) => {
    setDefinitions({ ...definitions, [role]: symbol });
  }

  const isFullyDefined = (): boolean => {
    if (!code) return false;
    return code.information.definition.length === Object.keys(definitions).length;
  }

  if (!code) {
    return <div>Failed to load exercise.</div>;
  }

  // Pre-filter exercises for cleaner rendering
  const exercises = code.step
    .map((step, stepIndex) => ({ step, stepIndex }))
    .filter(({ step }) =>
      !step.exercise ||
      (step.exercise?.type === "select" && step.exercise.options) ||
      (step.exercise?.type === "match" && step.exercise.pairs) ||
      (step.exercise?.type === "construct") ||
      (step.exercise?.type === "calculate"));

  exercisesLengthRef.current = exercises.length;
  exercisesRef.current = exercises;

  // Map real exercises (no description steps) to consecutive indices for ProgressBar / FinishScreen
  const realExerciseIndices = exercises
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => !!e.step.exercise)
    .map(({ i }) => i);

  const remappedResults: Record<number, boolean> = {};
  realExerciseIndices.forEach((exIdx, j) => {
    if (results[exIdx] !== undefined) remappedResults[j] = results[exIdx]!;
  });

  return (
    <main className="bg-pattern relative flex flex-col items-center justify-center pb-20">
      {/* Progress bar fixed to right side */}
      {
        showExercises && exerciseComponents.ProgressBar ? <div className="fixed top-1/2 right-5 -translate-y-1/2 z-50">
          <exerciseComponents.ProgressBar total={exercises.length} results={results} currentIndex={currentExerciseIndex} onSegmentClick={scrollToExercise} />
        </div> : null
      }

      {/* Definitions selected container fixed position */}
      <DefinitionContainer
        selected={new Map(Object.entries(definitions))}
        className="fixed top-7 left-10"
      />

      {/* Protocol name */}
      {code.information.name && (
        <div className="fixed top-7 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted/40 uppercase">Protocol</span>
          <span className="font-mono text-[10px] text-muted/40">/</span>
          <span className="font-mono text-xs font-medium text-soft-white">{code.information.name}</span>
        </div>
      )}

      {!showExercises && (
        <button
          onClick={() => setShowHowItWorks(true)}
          className="fixed top-7 right-10 cursor-pointer font-mono text-xs text-green transition-colors duration-150 hover:text-green/70 z-40"
        >
          How it works?
        </button>
      )}
      {/* How it works modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHowItWorks(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-medium/40 bg-[#141820] p-7"
            style={{ animation: "fade-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-5 text-sm font-semibold text-soft-white">How it works</p>
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex gap-3">
                <span className="mt-0.5 font-mono text-xs text-green">1.</span>
                <p className="text-xs leading-relaxed text-muted">
                  Assign a symbol to each role in the protocol. For example, if the roles are <span className="text-soft-white">Alice</span> and <span className="text-soft-white">Bob</span>, you might assign them the symbols <span className="text-soft-white">A</span> and <span className="text-soft-white">B</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 font-mono text-xs text-green">2.</span>
                <p className="text-xs leading-relaxed text-muted">
                  Your chosen symbols will be used throughout all the exercises.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 font-mono text-xs text-green">3.</span>
                <p className="text-xs leading-relaxed text-muted">
                  There is no right or wrong choice - just pick what makes sense to you.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="cursor-pointer rounded-lg bg-green/10 px-4 py-2 font-mono text-xs text-green transition-colors duration-150 hover:bg-green/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Definition selection */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center py-24">
        <span className="text-gray pb-5 text-xl font-medium tracking-wider uppercase">
          define symbols for exercises
        </span>
        <DefinitionStep
          definitions={code.information.definition}
          onSelect={updateDefinitions}
          selected={definitions}
          onComplete={() => {
            shouldScrollToFirst.current = true;
            setShowExercises(true);
          }}
        />
        <Button
          variant="submit"
          className={`m-10 w-50 transition delay-150 select-none ${!isFullyDefined() ? "pointer-events-none opacity-50" : "opacity-100"}`}
          onClick={() => {
            if (showExercises) {
              scrollToExercise(0);
            } else {
              shouldScrollToFirst.current = true;
              setShowExercises(true);
            }
          }}
        >
          Continue
        </Button>
      </div>

      {/* Exercise sections */}
      {showExercises &&
        exercises.map(({ step, stepIndex }, exerciseIndex) => {
          const isLastExercise = exerciseIndex === exercises.length - 1;
          return (
            <div
              key={stepIndex}
              ref={(el) => setExerciseRef(exerciseIndex, el)}
              className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 pr-10"
            >
              {showFinish && <div className="absolute inset-0 z-10" />}
              {step.exercise?.type === "select" && exerciseComponents.SelectExercise ? (
                <exerciseComponents.SelectExercise
                  options={step.exercise!.options!}
                  description={step.description}
                  prompt={step.exercise!.prompt}
                  hint={
                    step.exercise.hint
                      ? substituteRolesInString(step.exercise.hint, definitions)
                      : undefined
                  }
                  definitions={definitions}
                  answers={step.exercise!.answer ?? []}
                  onAnswerAction={(isCorrect: boolean) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                />
              ) : step.exercise?.type === "construct" && exerciseComponents.ConstructExercise ? (
                <exerciseComponents.ConstructExercise
                  answer={step.exercise.answer![0]!}
                  prefill={step.exercise.prefill}
                  palette={step.exercise.palette}
                  description={step.description}
                  prompt={step.exercise.prompt}
                  hint={
                    step.exercise.hint
                      ? substituteRolesInString(step.exercise.hint, definitions)
                      : undefined
                  }
                  definitions={definitions}
                  customOperators={code.customOperators}
                  onAnswerAction={(isCorrect: boolean) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                />
              ) : step.exercise?.type === "match" && exerciseComponents.MatchExercise ? (
                <exerciseComponents.MatchExercise
                  description={step.description}
                  prompt={step.exercise.prompt}
                  hint={step.exercise.hint}
                  definitions={definitions}
                  onAnswerAction={(isCorrect: boolean) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                  pairs={step.exercise.pairs!}
                />
              ) : step.exercise?.type === "calculate" && exerciseComponents.CalculateExercise ? (
                <exerciseComponents.CalculateExercise
                  description={step.description}
                  prompt={step.exercise.prompt}
                  hint={
                    step.exercise.hint
                      ? substituteRolesInString(step.exercise.hint, definitions)
                      : undefined
                  }
                  answer={step.exercise.answer![0]!}
                  definitions={definitions}
                  onAnswerAction={(isCorrect: boolean) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                />
              ) : !step.exercise && step.description && exerciseComponents.ExerciseDescription ? (
                <exerciseComponents.ExerciseDescription description={step.description} />
              ) : (
                <div>Something went wrong while rendering</div>
              )}

              <Button
                variant={
                  !step.exercise || results[exerciseIndex]
                    ? "submit"
                    : "continue"
                }
                className="w-50 transition delay-150 select-none"
                onClick={() => {
                  if (!step.exercise) {
                    setResults((prev) => ({ ...prev, [exerciseIndex]: true }));
                  }
                  if (isLastExercise) {
                    const unanswered = realExerciseIndices.some((idx) => results[idx] === undefined);
                    if (unanswered) {
                      setShowFinishConfirm(true);
                    } else {
                      handleFinish();
                    }
                  } else {
                    scrollToExercise(exerciseIndex + 1);
                  }
                }}
              >
                {isLastExercise
                  ? "Finish"
                  : !step.exercise || results[exerciseIndex]
                    ? "Continue"
                    : "Skip"}
              </Button>
            </div>
          );
        })}

      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border border-medium/40 bg-[#141820] p-6"
            style={{ animation: "fade-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) both" }}
          >
            <p className="mb-1 text-sm font-semibold text-soft-white">You still have unanswered exercises.</p>
            <p className="mb-6 text-xs leading-relaxed text-muted">
              Going back and completing them will help you get the most out of this exercise. Are you sure you want to finish now?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="cursor-pointer rounded-lg px-4 py-2 font-mono text-xs text-muted transition-colors duration-150 hover:bg-medium/30 hover:text-soft-white"
              >
                Go back
              </button>
              <button
                onClick={() => { setShowFinishConfirm(false); handleFinish(); }}
                className="cursor-pointer rounded-lg bg-danger/10 px-4 py-2 font-mono text-xs text-danger transition-colors duration-150 hover:bg-danger/20"
              >
                Finish anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinish && exerciseComponents.FinishScreen && (
        <div ref={finishElementRef}>
          <exerciseComponents.FinishScreen
            totalExercises={realExerciseIndices.length}
            results={remappedResults}
            onRestart={handleRestart}
            onRate={(rating: number) => submitRating.mutate({ exerciseId, rating })}
            surveyHref={`/survey/${exerciseId}`}
          />
        </div>
      )}
    </main>
  );
}
