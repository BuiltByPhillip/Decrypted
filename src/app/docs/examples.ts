const SHELL = (exercise: string) => `
protocol: Diffie-Hellman
define:
  type: select
  generator \\elem {g, x, a, b}
  prime \\elem {p, n, m, q}
  alice_secret \\elem {a, s, x}
  bob_secret \\elem {b, t, y}
step:
  description: Example step.
  exercise:
${exercise.split("\n").map((l) => `    ${l}`).join("\n")}
`.trim();

export const DOC_EXAMPLES = {
  select: SHELL(`type: select
  prompt: Choose Alice's secret exponent alice_secret
  hint: Choose a random integer in the range [2, prime-2]
  options:
    - 1
    - 7
    - prime-1
    - prime-2
  answer: 7`),

  construct: SHELL(`type: construct
  prompt: Construct the expression for Alice to calculate her public key A
  hint: Bob uses the same expression to calculate B
  answer: generator ^ alice_secret mod prime`),

  match: SHELL(`type: match
  prompt: Match each step in the Diffie-Hellman protocol with the right formula
  pairs:
    generator^alice_secret mod prime: Alice's public key
    generator^bob_secret mod prime: Bob's public key`),

  calculate: SHELL(`type: calculate
  prompt: Compute the shared key when alice_secret = 4, bob_secret = 5, prime = 23, generator = 5
  answer: 12`),
};
