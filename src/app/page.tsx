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

  const handleClick = () => {
    let userCode = parse(code, 0);
    console.log(userCode);
    sessionStorage.setItem("exerciseData", JSON.stringify(userCode))

    // Navigate to /exercise
    router.push("/exercise");
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-pattern text-cream">
      <div className="flex flex-col items-center">
        <div className="w-240 h-128 rounded-2xl overflow-hidden" data-lenis-prevent>
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
        <div>
          <Button
            className="bg-dark rounded-xl text-soft-white hover:shadow-[0_0_10px_theme(colors.muted)] px-3 py-1 transition duration-300 opacity-70 hover:cursor-pointer mt-10 border-2 border-medium hover:border-muted"
            size="lg"
            onClick={() => handleClick()}
          >
            Generate code
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setCode(`protocol: Diffie-Hellman
participants: Alice, Bob
define:
      generator \\elem  {g, x, a, b}
      prime \\elem {p, n, m, q}
      alice_secret \\elem  {a, s, x}
      bob_secret \\elem  {b, t, y}

step 1:
    description: Alice chooses secret {alice_secret}
    exercise:
        type: fill
        prompt: Choose Alice's secret exponent {alice_secret}
        hint: Choose a random integer in the range [2, {prime}-2]
        answer: 2 < $1 and $1 < {prime}-2
step 2:
    description: Alice computes her public key A
    exercise:
        type: construct
        prompt: Construct the expression for Alice to calculate her public key A
        hint: Bob uses the same expression to calculate B
        palette: {generator}, {alice_secret}, {prime}, ^, mod, *
        answer: {generator} ^ {alice_secret} mod {prime}
step 3:
    description: Alice sends A to Bob
step 4:
    description: Bob chooses secret {bob_secret}
    exercise:
        type: fill
        prompt: Choose Bob's secret exponent {bob_secret}
        hint: Choose a random integer in the range [2, {prime}-2]
        answer: 2 < $1 < {prime}-2
step 5:
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
step 6:
    description: Bob sends B to Alice
step 7:
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
