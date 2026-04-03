"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { parse } from "~/app/hooks/parser";
import Button from "~/components/Button";

function CodeWindowSkeleton() {
  return (
    <div
      className="h-full w-full rounded-2xl"
      style={{
        backgroundColor: "rgba(34, 40, 49, 0.7)",
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: "13px",
        paddingTop: "16px",
      }}
    >
      <div className="flex" style={{ backgroundColor: "rgba(57, 62, 70, 0.3)", marginRight: "16px", lineHeight: "1.4" }}>
        <span style={{ color: "#94a3b8", paddingLeft: "5px", paddingRight: "8px" }}>1</span>
        <span style={{ color: "#94a3b8", paddingLeft: "16px" }}>Enter your code here...</span>
      </div>
    </div>
  );
}

const CodeWindow = dynamic(() => import("~/app/_components/editor/CodeWindow"), {
  ssr: false,
  loading: () => <CodeWindowSkeleton />,
});

export default function EditorControls() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    try {
      if (code.trim() === "") throw new Error("No code entered");
      const userCode = parse(code, 0);
      setError(null);
      sessionStorage.setItem("exerciseData", JSON.stringify(userCode));
      router.push("/exercise");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      {/* label */}
      <div className="mb-4 flex w-full items-center gap-3">
        <span className="bg-green/30 h-px flex-1" />
        <span className="text-muted font-mono text-[10px] tracking-[0.32em] uppercase">Exercise Editor</span>
        <span className="bg-green/30 h-px flex-1" />
      </div>

      {/* editor row */}
      <div className="relative">
        {/* editor with glow + corners */}
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
            <span aria-hidden="true" className="border-green/60 absolute top-0 left-0 z-10 h-8 w-8 rounded-tl border-t border-l" />
            <span aria-hidden="true" className="border-green/60 absolute top-0 right-0 z-10 h-8 w-8 rounded-tr border-t border-r" />
            <span aria-hidden="true" className="border-green/60 absolute bottom-0 left-0 z-10 h-8 w-8 rounded-bl border-b border-l" />
            <span aria-hidden="true" className="border-green/60 absolute right-0 bottom-0 z-10 h-8 w-8 rounded-br border-b border-r" />
            <div className="h-128 w-240 overflow-hidden rounded-2xl" data-lenis-prevent>
              <CodeWindow code={code} onChange={setCode} />
            </div>
          </div>
        </div>

        {/* insert button absolutely to the right of the editor */}
        <Button
          className="absolute top-1/2 -translate-y-1/2 left-full ml-4"
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
      generator \\elem  {g, x, a, b}
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

      {/* error + generate button centered below editor */}
      <div className="mt-4 flex flex-col items-center">
        <p className={`font-mono text-sm text-danger ${error ? "" : "select-none"}`}>
          {error ?? "\u00A0"}
        </p>
        <Button
          variant="submit"
          className="mt-2 border-2 px-3 py-1"
          size="lg"
          onClick={handleClick}
        >
          Generate code
        </Button>
      </div>
    </>
  );

}
