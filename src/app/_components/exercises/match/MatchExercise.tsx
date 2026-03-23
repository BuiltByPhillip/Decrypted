
type MatchExerciseProps = {

}

/**
 * A matching exercise where the student pairs expressions to their corresponding labels or roles.
 *
 * The educational goal is to test whether students understand what each expression *means*
 * in the context of the protocol — not just whether they can construct or compute it.
 * For example, matching `g^a mod p` to "Alice's public key" in Diffie-Hellman.
 *
 * This is distinct from the other exercise types:
 * - Unlike `construct`, the expression is already given — the student identifies its meaning.
 * - Unlike `select`, there are multiple simultaneous decisions, not one isolated question.
 * - Unlike `calculate`, no computation is required — only conceptual understanding.
 */
export default function MatchExercise({}: MatchExerciseProps) {

  return (
    <div>

    </div>
  );
}