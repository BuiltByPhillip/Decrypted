import {type Expr, symbolDisplay} from "~/app/hooks/parser";
import {findDiffPair} from "~/app/hooks/expr";


/**
 * Generates a human-readable feedback message describing where and why
 * the user's expression differs from the correct answer.
 * @param answer - The correct expression
 * @param userInput - The expression the user provided
 * @returns A feedback string, or null if the expressions are equal
 */
export function provideFeedback(answer: Expr, userInput: Expr): string | null {
    const pair = findDiffPair(userInput, answer);
    if (!pair) return null;

    const [userNode, correctNode] = pair;

    // Both are role references — most informative: roles were swapped
    if (userNode.kind === "role" && correctNode.kind === "role") {
        return `This position expects the '${correctNode.name}' role, but '${userNode.name}' was used instead.`;
    }

    // User used a role where a specific var/value was expected
    if (userNode.kind === "role" && correctNode.kind === "var") {
        return `The ${userNode.kind} does not belong here`;
    }

    // User used a plain variable where a role was expected
    if (userNode.kind === "var" && correctNode.kind === "role") {
        return `${userNode.name} ${symbolDisplay["notelem"]} ${correctNode.name}`;
    }

    // Both plain variables — wrong value
    if (userNode.kind === "var" && correctNode.kind === "var") {
        return `'${userNode.name}' is not the right value here.`;
    }

    // Wrong integer
    if (userNode.kind === "int" && correctNode.kind === "int") {
        return `The value ${userNode.value} is incorrect here.`;
    }

    // Different operators on otherwise matching trees
    if (userNode.kind === "binary" && correctNode.kind === "binary" && userNode.op !== correctNode.op) {
        return `The operator in your expression is incorrect.`;
    }

    // Structurally different shapes
    return `Part of your expression has an incorrect structure.`;
}
