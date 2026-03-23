"use client"

import type { Code, Expr } from "~/app/hooks/parser";
import SelectExercise from "~/app/_components/exercises/select/SelectExercise";
import Button from "~/components/Button";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLenis } from "~/components/SmoothScroll";
import ConstructExercise from "~/app/_components/exercises/construct/ConstructExercise";
import DefinitionContainer from "~/app/_components/definition/DefinitionContainer";
import FinishScreen from "~/app/_components/exercises/FinishScreen";
import CalculateExercise from "~/app/_components/exercises/calculate/CalculateExercise";
import { substituteRolesInString } from "~/app/hooks/expr";
import DefinitionStep from "~/app/_components/definition/DefinitionStep";
import ProgressBar from "~/app/_components/exercises/shared/ProgressBar";
import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";

// Map of <Role, Symbol>
export type SelectedDefinitions = Record<string, Expr>

export default function ExercisePage() {
  const [code, setCode] = useState<Code | null>(null);
  const [showExercises, setShowExercises] = useState(false);
  const [definitions, setDefinitions] = useState<SelectedDefinitions>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showFinish, setShowFinish] = useState(false);

  const lenis = useLenis();
  const exerciseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Flag to trigger scroll to first exercise after render
  const shouldScrollToFirst = useRef(false);

  // Snap scroll state
  const currentExerciseIndexRef = useRef(0);
  const isSnapScrollingRef = useRef(false);
  const finishElementRef = useRef<HTMLDivElement | null>(null);
  const showFinishRef = useRef(false);
  const exercisesLengthRef = useRef(0);

  useEffect(() => {
    const rawData = sessionStorage.getItem("exerciseData");
    if (rawData) {
      setCode(JSON.parse(rawData) as Code);
    }
  }, []);

  // Scroll to an exercise by index
  const scrollToExercise = useCallback((index: number) => {
    if (!lenis) return;

    const element = exerciseRefs.current.get(index);
    if (!element) return;

    currentExerciseIndexRef.current = index;

    // CRITICAL: Update Lenis's internal dimensions before scrolling
    // Without this, Lenis may not know about newly added content
    lenis.resize();

    lenis.scrollTo(element, {
      duration: 2,
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

  // Snap scroll: intercept wheel events and navigate between exercises
  useEffect(() => {
    if (!showExercises || !lenis) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (isSnapScrollingRef.current) return;

      const currentIdx = currentExerciseIndexRef.current;

      if (e.deltaY > 0) {
        const nextIdx = currentIdx + 1;
        if (exerciseRefs.current.has(nextIdx)) {
          isSnapScrollingRef.current = true;
          setTimeout(() => { isSnapScrollingRef.current = false; }, 900);
          scrollToExercise(nextIdx);
        } else if (showFinishRef.current && finishElementRef.current) {
          // Last exercise → scroll to finish screen
          isSnapScrollingRef.current = true;
          setTimeout(() => { isSnapScrollingRef.current = false; }, 900);
          currentExerciseIndexRef.current = exercisesLengthRef.current;
          lenis.resize();
          lenis.scrollTo(finishElementRef.current, { duration: 2 });
        }
      } else if (e.deltaY < 0) {
        if (currentIdx === exercisesLengthRef.current) {
          // At finish screen → scroll back to last exercise
          isSnapScrollingRef.current = true;
          setTimeout(() => { isSnapScrollingRef.current = false; }, 900);
          scrollToExercise(exercisesLengthRef.current - 1);
        } else if (currentIdx > 0) {
          isSnapScrollingRef.current = true;
          setTimeout(() => { isSnapScrollingRef.current = false; }, 900);
          scrollToExercise(currentIdx - 1);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    return () => window.removeEventListener("wheel", handleWheel, { capture: true });
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
    isSnapScrollingRef.current = false;
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
    if (!code) {
      return false;
    }
    return code.information.definition.length === Object.keys(definitions).length;
  }

  if (!code) {
    return <div>Loading...</div>;
  }

  // Pre-filter exercises for cleaner rendering
  const exercises = code.step
    .map((step, stepIndex) => ({ step, stepIndex }))
    .filter(({ step }) =>
      !step.exercise ||
      (step.exercise?.type === "select" && step.exercise.options) ||
      (step.exercise?.type === "construct" && step.exercise.palette) ||
      (step.exercise?.type === "calculate"));

  exercisesLengthRef.current = exercises.length;

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
        showExercises ? <div className="fixed top-1/2 right-5 -translate-y-1/2">
          <ProgressBar total={realExerciseIndices.length} results={remappedResults} />
        </div> : null
      }

      {/* Definitions selected container fixed position */}
      <DefinitionContainer
        selected={new Map(Object.entries(definitions))}
        className="fixed top-7 left-10"
      />
      {/* Definition selection */}
      <div className="flex min-h-screen flex-col items-center justify-center">
        <span className="text-gray pb-5 text-xl font-medium tracking-wider uppercase">
          define symbols for exercises
        </span>
        <DefinitionStep
          definitions={code.information.definition}
          onSelect={updateDefinitions}
          selected={definitions}
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
          const prevStep = exerciseIndex > 0 ? exercises[exerciseIndex - 1] : null;
          const isUnlocked =
            exerciseIndex === 0 ||
            results[exerciseIndex - 1] ||
            (prevStep !== null && !prevStep?.step.exercise);
          if (!isUnlocked) return null;

          return (
            <div
              key={stepIndex}
              ref={(el) => setExerciseRef(exerciseIndex, el)}
              className="flex min-h-screen w-full flex-col items-center justify-center gap-8"
            >
              {step.exercise?.type === "select" ? (
                <SelectExercise
                  options={step.exercise!.options!}
                  description={step.description}
                  prompt={step.exercise!.prompt}
                  hint={
                    step.exercise.hint
                      ? substituteRolesInString(step.exercise.hint, definitions)
                      : undefined
                  }
                  definitions={definitions}
                  answers={step.exercise!.answer}
                  onAnswerAction={(isCorrect) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                />
              ) : step.exercise?.type === "construct" ? (
                <ConstructExercise
                  palette={step.exercise!.palette!}
                  answer={step.exercise.answer[0]!}
                  description={step.description}
                  prompt={step.exercise.prompt}
                  hint={
                    step.exercise.hint
                      ? substituteRolesInString(step.exercise.hint, definitions)
                      : undefined
                  }
                  definitions={definitions}
                  onAnswerAction={(isCorrect) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                />
              ) : step.exercise?.type === "fill" ? (
                <div>Empty placeholder</div>
              ) : step.exercise?.type === "calculate" ? (
                <CalculateExercise
                  description={step.description}
                  prompt={step.exercise.prompt}
                  hint={
                    step.exercise.hint
                      ? substituteRolesInString(step.exercise.hint, definitions)
                      : undefined
                  }
                  answer={step.exercise.answer[0]!}
                  definitions={definitions}
                  onAnswerAction={(isCorrect) =>
                    onAnswerAction(exerciseIndex, isCorrect)
                  }
                />
              ) : !step.exercise && step.description? (
                  <ExerciseDescription description={step.description} />
              ) : (
                <div>Something went wrong while rendering</div>
              )}

              <Button
                variant="submit"
                className={`w-50 transition delay-150 select-none ${step.exercise && !results[exerciseIndex] ? "pointer-events-none opacity-50" : "opacity-100"}`}
                onClick={() => {
                  if (isLastExercise) {
                    handleFinish();
                  } else {
                    scrollToExercise(exerciseIndex + 1);
                  }
                }}
              >
                {isLastExercise ? "Finish" : "Continue"}
              </Button>
            </div>
          );
        })}

      {showFinish && (
        <div ref={finishElementRef}>
          <FinishScreen
            totalExercises={realExerciseIndices.length}
            results={remappedResults}
            onRestart={handleRestart}
          />
        </div>
      )}
    </main>
  );
}
