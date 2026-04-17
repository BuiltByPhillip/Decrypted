"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parse } from "~/app/hooks/parser";
import Button from "~/components/Button";
import { api } from "~/trpc/react";
import ExercisePreview from "~/app/editor/ExercisePreview";

function CodeWindowSkeleton() {
  return (
    <div className="border-medium flex h-full w-full flex-col overflow-hidden rounded-2xl border border-b-[#5a6070] font-mono text-[13px]">
      <div className="border-medium relative flex items-center border-b bg-[rgba(28,33,41,0.8)] px-4 py-3">
        <span className="bg-mac-red h-3 w-3 rounded-full" />
        <span className="bg-mac-yellow h-3 w-3 rounded-full ml-2" />
        <span className="bg-mac-green h-3 w-3 rounded-full ml-2" />
        <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.32em] text-muted uppercase">Exercise Editor</span>
      </div>

      <div className="flex-1 bg-[rgba(34,40,49,0.7)]">
        <div className="mt-4 mr-4 flex bg-[rgba(57,62,70,0.3)] leading-[1.4]">
          <span className="text-muted pr-2 pl-1.25">1</span>
          <span className="text-muted pl-4">Enter your code here...</span>
        </div>
      </div>
    </div>
  );
}

const CodeWindow = dynamic(() => import("~/app/_components/editor/CodeWindow"), {
  ssr: false,
  loading: () => <CodeWindowSkeleton />,
});

type EditorControlProps = {
  dsl?: string,
  id?: string,
}

export default function EditorControls({ dsl, id }: EditorControlProps) {
  const router = useRouter();
  const [code, setCode] = useState(dsl ?? "");
  const [debouncedDsl, setDebouncedDsl] = useState(dsl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const createExercise = api.exercise.create.useMutation();
  const editExercise = api.exercise.edit.useMutation();
  const isEditMode = !!id;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedDsl(code), 500);
    return () => clearTimeout(timeout);
  }, [code]);

  const previewProtocolName = useMemo(() => {
    try { return parse(debouncedDsl).information.name; } catch { return null; }
  }, [debouncedDsl]);

  const handleClick = async () => {
    try {
      if (code.trim() === "") throw new Error("No code entered");
      const parsed = parse(code, 0);
      setError(null);
      if (isEditMode) {
        editExercise.mutate({ id, dsl: code, name: parsed.information.name });
      } else {
        createExercise.mutate({ dsl: code, name: parsed.information.name });
      }
      router.push("/exercises");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      {/* split panel row */}
      <div className="flex items-start gap-8">

        {/* left: editor */}
        <div className="relative">
          {/* live preview toggle - absolutely positioned to the right of the editor */}
          {!showPreview && (
            <button
              onClick={() => setShowPreview(true)}
              className="absolute top-1 -translate-y-1/2 left-1/2 -translate-x-1/2 cursor-pointer font-mono text-xs text-green transition-colors duration-150 hover:text-green/70 z-10"
            >
              Open live preview
            </button>
          )}
          <div className="relative">
            {/* ambient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -m-12 rounded-full"
              style={{
                background: "radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 70%)",
              }}
            />
            <div className="relative p-6">
              {!showPreview && <span aria-hidden="true" className="border-green/60 absolute top-0 left-0 z-10 h-8 w-8 rounded-tl border-t border-l" />}
              {!showPreview && <span aria-hidden="true" className="border-green/60 absolute top-0 right-0 z-10 h-8 w-8 rounded-tr border-t border-r" />}
              {!showPreview && <span aria-hidden="true" className="border-green/60 absolute bottom-0 left-0 z-10 h-8 w-8 rounded-bl border-b border-l" />}
              {!showPreview && <span aria-hidden="true" className="border-green/60 absolute right-0 bottom-0 z-10 h-8 w-8 rounded-br border-b border-r" />}
              <div className={`h-128 overflow-hidden rounded-2xl transition-all duration-500 ${showPreview ? "w-[min(45vw,50rem)]" : "w-[min(80vw,55rem)]"}`} data-lenis-prevent>
                <CodeWindow code={code} onChange={setCode} />
              </div>
            </div>
          </div>

          {/* insert sample button below editor */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setCode(`protocol: Diffie-Hellman
custom:
    operator:
        name: SET
        type: BINARY
        commutative: true
        precedence: 4
define:
    type: select
    generator \\elem  {g, h, k}
    prime \\elem {p, n, m, q}
    alice_secret \\elem  {a, s, x}
    bob_secret \\elem  {b, t, y}
step:
    description: Alice chooses secret {alice_secret}
    exercise:
        type: select
        prompt: Choose a valid secret exponent for Alice's secret {alice_secret}
        hint: Choose a random integer in the range [2, {prime}-2]
        options:
            - 1
            - 7
            - {prime}-1
            - {prime}-2
        answer: 7
step:
    description: Alice computes her public key A
    exercise:
        type: construct
        prompt: Construct the expression for Alice to calculate her public key A
        hint: Bob uses the same expression to calculate B
        prefill: mod {prime}
        answer: {generator} ^ {alice_secret} mod {prime}
step:
    description: Alice sends A to Bob
step:
  description: Bob chooses secret {bob_secret}
  exercise:
      type: match
      prompt: Match each step in the Diffie-Hellman protocol with the right formula
      hint: Remember, Alice doesn't know {bob_secret} and Bob doesn't know {alice_secret}
      pairs:
          - {generator}^{alice_secret} mod {prime} -> Alice's public key
          - {generator}^{bob_secret} mod {prime} -> Bob's public key
          - B^{alice_secret} mod {prime} -> Alice's shared secret
          - A^{bob_secret} mod {prime} -> Bob's shared secret
step:
    description: Bob computes his public key B
    exercise:
        type: select
        prompt: Which expression does Bob use to calculate his public key B
        hint: Alice uses the same expression to calculate A
        options:
            - {bob_secret}^{generator} mod {prime}
            - {prime}^{bob_secret} mod {generator}
            - {generator}^{bob_secret} mod {prime}
        answer: {generator}^{bob_secret} mod {prime}
step:
    description: Bob sends B to Alice
step:
    description: Alice computes shared key
    exercise:
        type: calculate
        prompt: Compute the shared key for Alice and Bob, when {alice_secret} = 4, {bob_secret} = 5, {prime} = 23, {generator} = 5
        hint: The formula is A ^ {bob_secret} mod {prime} and B ^ {alice_secret} mod {prime}
        answer: 12`);
              }}
            >
              (Temporary) Insert code
            </Button>
          </div>
        </div>

        {/* right: preview */}
        {showPreview && (
          <div className="relative p-6">
            <div className="h-128 w-[min(45vw,50rem)] overflow-hidden rounded-2xl border border-[#393E46] border-b-[#5a6070]" data-lenis-prevent>
              <div className="border-medium relative flex items-center border-b bg-[rgba(28,33,41,0.8)] px-4 py-3">
                <button onClick={() => setShowPreview(false)} className="cursor-pointer">
                  <span className="bg-mac-red h-3 w-3 rounded-full block" />
                </button>
                <span className="bg-mac-yellow ml-2 h-3 w-3 rounded-full" />
                <span className="bg-mac-green ml-2 h-3 w-3 rounded-full" />
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-muted/40 uppercase">Protocol</span>
                  <span className="font-mono text-[10px] text-muted/40">/</span>
                  <span className="font-mono text-[10px] font-medium text-soft-white">
                    {previewProtocolName ?? "Preview"}
                  </span>
                </div>
              </div>
              <div className="h-full overflow-y-auto custom-scrollbar" data-lenis-prevent>
                <ExercisePreview dsl={debouncedDsl} />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* error + buttons centered below */}
      <div className="mt-4 flex flex-col items-center">
        <p className={`font-mono text-sm text-danger ${error ? "" : "select-none"}`}>
          {error ?? "\u00A0"}
        </p>
        <Button
          variant="submit"
          size="lg"
          className="mt-2 font-mono"
          onClick={handleClick}
        >
          {isEditMode ? "Save changes" : "Generate code"}
        </Button>
      </div>
    </>
  );

}
