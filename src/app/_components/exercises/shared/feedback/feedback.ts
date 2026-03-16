import {type Expr, symbolDisplay} from "~/app/hooks/parser";
import {exprEquals, findDiffPair, OP_TO_STRING} from "~/app/hooks/expr";
import type {SelectedDefinitions} from "~/app/exercise/page";

/**
 * Reverse-looks up which role name a given expression is assigned to in the definitions.
 * e.g. given `{kind: "var", name: "p"}` and definitions where `prime → p`, returns `"prime"`.
 */
function findRoleName(expr: Expr, definitions: SelectedDefinitions): string | undefined {
    return Object.entries(definitions).find(([, value]) => exprEquals(value, expr))?.[0];
}

/**
 * Generates a human-readable feedback message describing where and why
 * the user's expression differs from the correct answer.
 * @param answer - The correct expression (substituted)
 * @param userInput - The expression the user provided
 * @param definitions - The user's selected definitions, used to look up role names for specific feedback
 * @returns A feedback string, or null if the expressions are equal
 */
export function provideFeedback(answer: Expr, userInput: Expr, definitions?: SelectedDefinitions): string | null {
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

    // Both plain variables — look up role names from definitions for specific feedback
    if (userNode.kind === "var" && correctNode.kind === "var") {
        const correctRole = definitions ? findRoleName(correctNode, definitions) : undefined;
        return `${userNode.name} ${symbolDisplay["notelem"]} ${correctRole ?? correctNode.name}`;
    }

    // Wrong integer
    if (userNode.kind === "int" && correctNode.kind === "int") {
        return `The value ${userNode.value} is incorrect here.`;
    }

    // Different operators on otherwise matching trees
    if (userNode.kind === "binary" && correctNode.kind === "binary" && userNode.op !== correctNode.op) {
        return `The operator '${OP_TO_STRING[userNode.op!]}' used in your expression is incorrect.`;
    }

    // Structurally different shapes
    return `You have provided an invalid structure`;
}
