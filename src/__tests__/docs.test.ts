import { describe, it, expect } from "vitest";
import { parse } from "../app/hooks/parser";
import { DOC_EXAMPLES, EL_GAMAL_EXAMPLE, DIFFIE_HELLMAN_EXAMPLE } from "../app/docs/examples";

// Inline wrapFragment so preview parsing is tested independently of the component
function wrapFragment(fragment: string): string {
  const lines = fragment.split("\n");
  const start = lines[0]?.trim() === "exercise:" ? 1 : 0;
  const indented = lines.slice(start).map(l => `    ${l}`).join("\n");
  return `title: Preview
define:
  type: select
  generator \\elem {g, h, k}
  prime \\elem {p, n, m, q}
  alice_secret \\elem {a, s, x}
  bob_secret \\elem {b, t, y}
step:
  description: Preview
  exercise:
${indented}`;
}

describe("docs examples", () => {
  for (const [name, program] of Object.entries(DOC_EXAMPLES)) {
    it(`parses the ${name} example without error`, () => {
      expect(() => parse(program)).not.toThrow();
    });
  }

  it("parses the El-Gamal example without error", () => {
    expect(() => parse(EL_GAMAL_EXAMPLE)).not.toThrow();
  });

  it("parses the Diffie-Hellman example without error", () => {
    expect(() => parse(DIFFIE_HELLMAN_EXAMPLE)).not.toThrow();
  });
});

describe("docs preview (wrapFragment)", () => {
  // Extract just the exercise block from each full example
  const exerciseFragments: Record<string, string> = {
    select: `type: select
  prompt: Choose Alice's secret exponent alice_secret
  hint: Choose a random integer in the range [2, prime-2]
  options:
    - 1
    - 7
    - prime-1
    - prime-2
  answer: 7`,
    construct: `type: construct
  prompt: Construct the expression for Alice to calculate her public key A
  hint: Bob uses the same expression to calculate B
  answer: generator ^ alice_secret mod prime`,
    match: `type: match
  prompt: Match each step in the Diffie-Hellman protocol with the right formula
  hint: Remember, Alice doesn't know {bob_secret} and Bob doesn't know {alice_secret}
  pairs:
    - {generator}^{alice_secret} mod {prime} -> Alice's public key
    - {generator}^{bob_secret} mod {prime} -> Bob's public key
    - B^{alice_secret} mod {prime} -> Alice's shared secret
    - A^{bob_secret} mod {prime} -> Bob's shared secret`,
    calculate: `type: calculate
  prompt: Compute the shared key when alice_secret = 4, bob_secret = 5, prime = 23, generator = 5
  answer: 12`,
  };

  for (const [name, fragment] of Object.entries(exerciseFragments)) {
    it(`preview wraps and parses the ${name} example without error`, () => {
      expect(() => parse(wrapFragment(fragment))).not.toThrow();
    });
  }
});
