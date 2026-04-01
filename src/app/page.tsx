"use client";

import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { parse } from "~/app/hooks/parser"
import { useRouter } from "next/navigation";
import Button from "~/components/Button";
import { darkTheme } from "~/app/codeMirrorTheme";

export default function Home() {
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
  }
  return (
    <main className="bg-pattern text-cream flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div
          className="h-128 w-240 overflow-hidden rounded-2xl"
          data-lenis-prevent
        >
          <CodeMirror
            height="518px"
            value={code}
            onChange={setCode}
            theme="none"
            extensions={[darkTheme]}
            placeholder="Enter your code here..."
            className="h-full"
          />
        </div>
        {
          <p className={`mt-4 font-mono text-sm text-red-400 ${error ? "" : "select-none"}`}>
            {error ?? "\u00A0"}
          </p>
        }
        <div>
          <Button
            className="bg-dark text-soft-white hover:shadow-[0_0_10px_theme(colors.muted)] border-medium hover:border-muted mt-4 rounded-xl border-2 px-3 py-1 opacity-70 transition duration-300 hover:cursor-pointer"
            size="lg"
            onClick={() => handleClick()}
          >
            Generate code
          </Button>

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
        palette: {generator}, {alice_secret}, {prime}, ^, mod, *
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
    </main>
  );
}
