export const DIFFIE_HELLMAN_EXAMPLE = `title: Diffie-Hellman Key Exchange

define:
  type: select
  generator \\elem {g, h, k}
  prime \\elem {p, q, r}
  alice_secret \\elem {a, s, x}
  bob_secret \\elem {b, t, y}

step:
  description: Alice and Bob agree on public parameters - a generator {generator} and a prime {prime}.

step:
  description: Alice chooses a secret exponent and computes her public key A.
  exercise:
    type: construct
    prompt: Build Alice's public key A
    palette: ARITHMETIC_OPERATORS
    answer: {generator} ^ {alice_secret} mod {prime}

step:
  description: Bob chooses a secret exponent and computes his public key B.
  exercise:
    type: construct
    prompt: Build Bob's public key B
    palette: ARITHMETIC_OPERATORS
    answer: {generator} ^ {bob_secret} mod {prime}

step:
  description: Alice and Bob exchange their public keys. Now each can derive the shared secret.
  exercise:
    type: match
    prompt: Match each party to the shared secret they compute
    pairs:
      - B^{alice_secret} mod {prime} -> Alice's shared secret
      - A^{bob_secret} mod {prime} -> Bob's shared secret

step:
  description: Verify the protocol with concrete values. Use generator = 2, prime = 11, alice_secret = 3, bob_secret = 4.
  exercise:
    type: calculate
    prompt: What is the shared secret?
    hint: Compute A = 2^3 mod 11, then raise it to bob_secret mod prime
    answer: 4`;

const SHELL = (exercise: string) => `
title: Diffie-Hellman
define:
  type: select
  generator \\elem {g, h, k}
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
  hint: Remember, Alice doesn't know {bob_secret} and Bob doesn't know {alice_secret}
  pairs:
    - {generator}^{alice_secret} mod {prime} -> Alice's public key
    - {generator}^{bob_secret} mod {prime} -> Bob's public key
    - B^{alice_secret} mod {prime} -> Alice's shared secret
    - A^{bob_secret} mod {prime} -> Bob's shared secret`),

  calculate: SHELL(`type: calculate
  prompt: Compute the shared key when alice_secret = 4, bob_secret = 5, prime = 23, generator = 5
  answer: 12`),
};

export const EL_GAMAL_EXAMPLE = `title: El-Gamal Encryption

define:
  type: select
  generator \\elem {g, h, j}
  prime \\elem {p, q, n}
  private_key \\elem {x, a, b}
  ephemeral \\elem {k, r, t}

step:
  description: The recipient generates a key pair. They choose a prime {prime}, a generator {generator}, and a private key {private_key}.
  exercise:
    type: construct
    prompt: Build the recipient's public key h
    palette: ARITHMETIC_OPERATORS
    answer: {generator} ^ {private_key} mod {prime}

step:
  description: To encrypt a message m, the sender picks a random ephemeral value {ephemeral} and computes the first ciphertext component.
  exercise:
    type: construct
    prompt: Build the first ciphertext component c1
    palette: ARITHMETIC_OPERATORS
    answer: {generator} ^ {ephemeral} mod {prime}

step:
  description: The sender uses the recipient's public key h to mask the message m.
  exercise:
    type: construct
    prompt: Build the second ciphertext component c2
    palette: ARITHMETIC_OPERATORS
    answer: m * h ^ {ephemeral} mod {prime}

step:
  description: To decrypt, the recipient first recovers the shared secret from c1 using their private key {private_key}.
  exercise:
    type: construct
    prompt: Compute the shared secret s from c1
    palette: ARITHMETIC_OPERATORS
    answer: c1 ^ {private_key} mod {prime}

step:
  description: The recipient now uses the shared secret s to recover the original message from c2.
  exercise:
    type: select
    prompt: How does the recipient recover message m?
    hint: s masks the message, so you need to invert it
    options:
      - c2 * s^(-1) mod {prime}
      - c2 + s mod {prime}
      - c2 \\xor s
      - c2 - s mod {prime}
    answer: c2 * s^(-1) mod {prime}`;

export const TLS_EXAMPLE = `title: TLS Handshake (Key Exchange)

define:
  type: select
  generator \\elem {g, h, k}
  prime \\elem {p, q, n}
  client_priv \\elem {c, a, x}
  server_priv \\elem {s, b, y}

step:
  description: The TLS handshake begins. The client sends a ClientHello with a random nonce and an ECDH key share derived from its private value {client_priv}.

step:
  description: The client computes its ECDH key share to include in the ClientHello.
  exercise:
    type: construct
    prompt: Build the client's ECDH public key share C
    palette: ARITHMETIC_OPERATORS
    answer: {generator} ^ {client_priv} mod {prime}

step:
  description: The server responds with a ServerHello and its own ECDH key share S, computed from its private value {server_priv}.
  exercise:
    type: construct
    prompt: Build the server's ECDH public key share S
    palette: ARITHMETIC_OPERATORS
    answer: {generator} ^ {server_priv} mod {prime}

step:
  description: Each party can now independently compute the pre-master secret using the other party's public key share.
  exercise:
    type: match
    prompt: Match each party to the pre-master secret they compute
    hint: Both computations must yield the same result for the handshake to succeed
    pairs:
      - S ^ {client_priv} mod {prime} -> Client's pre-master secret
      - C ^ {server_priv} mod {prime} -> Server's pre-master secret

step:
  description: Verify the key exchange with concrete values. Use generator = 2, prime = 11, client_priv = 3, server_priv = 5.
  exercise:
    type: calculate
    prompt: What is the pre-master secret?
    hint: Compute C = 2^3 mod 11 = 8, then raise it to server_priv mod prime
    answer: 10`;
