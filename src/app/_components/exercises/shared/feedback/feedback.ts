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

/** Walks to the leftmost leaf of an expression tree. */
function leftmostLeaf(expr: Expr): Expr {
    let e: Expr = expr;
    while (e.kind === "binary") e = e.left;
    while (e.kind === "unary") e = e.operand;
    return e;
}

/**
 * Generates a human-readable feedback message describing where and why
 * the user's expression differs from the correct answer.
 * @param answer - The correct expression (substituted)
 * @param userInput - The expression the user provided
 * @param attempts - The amount of attempts the user has spent on the exercise
 * @param definitions - The user's selected definitions, used to look up role names for specific feedback
 * @returns A feedback string, or null if the expressions are equal
 */
export function provideFeedback(answer: Expr, userInput: Expr, attempts: number, definitions?: SelectedDefinitions): string | null {
    const pair = findDiffPair(userInput, answer);
    if (!pair) return null;

    const [userNode, correctNode] = pair;
    const revealExtra: boolean = attempts > 4

    // Both are role references — most informative: roles were swapped
    if (userNode.kind === "role" && correctNode.kind === "role") {
      if (revealExtra) return `This position expects the '${correctNode.name}' role, but '${userNode.name}' was used instead`
        return `This position expects '${correctNode.name}'.`;
    }

    // User used a role where a specific var/value was expected
    if (userNode.kind === "role" && correctNode.kind === "var") {
      if (revealExtra) return `This position expects a plain variable, not ${userNode.name} from the definition`
        return `This position expects a variable.`;
    }

    // User used a plain variable where a role was expected
    if (userNode.kind === "var" && correctNode.kind === "role") {
      if (revealExtra) return `This position expects a variable ${symbolDisplay["elem"]} ${correctNode.name}, but ${userNode.name} ${symbolDisplay["notelem"]} ${correctNode.name}`;
        return `This position expects a variable ${symbolDisplay["elem"]} ${correctNode.name}`;
    }
    
    // User used an integer where a variable was expected
    if (userNode.kind === "int" && correctNode.kind === "var") {
        const correctRole = definitions ? findRoleName(correctNode, definitions) : undefined;
        if (revealExtra) return `This position expects a variable ${symbolDisplay["elem"]} ${correctRole ?? correctNode.name}, but received ${userNode.value}`;
        return `This position expects a variable ${symbolDisplay["elem"]} ${correctRole ?? correctNode.name}.`;
    }

    // Both plain variables — look up role names from definitions for specific feedback
    if (userNode.kind === "var" && correctNode.kind === "var") {
        const correctRole = definitions ? findRoleName(correctNode, definitions) : undefined;
        if (revealExtra) return `This position expects a variable ${symbolDisplay["elem"]} ${correctRole ?? correctNode.name}, but ${userNode.name} ${symbolDisplay["notelem"]} ${correctRole ?? correctNode.name}`;
        return `This position expects a variable ${symbolDisplay["elem"]} ${correctRole ?? correctNode.name}.`;
    }

    // Wrong integer
    if (userNode.kind === "int" && correctNode.kind === "int") {
        if (revealExtra) return `This position expects a specific integer value, which is not ${userNode.value}`;
        return `This position expects a specific integer value.`;
    }

    // Different operators — report the operator when:
    // 1. The left children match exactly (same structure, only op differs), or
    // 2. The user's left child is a simple var matching the leftmost leaf of the correct tree,
    //    meaning the user started correctly but used the wrong operator (e.g. g = a mod p vs g^a mod p)
    if (userNode.kind === "binary" && correctNode.kind === "binary" && userNode.op !== correctNode.op) {
        const leftMatches = exprEquals(userNode.left, correctNode.left);
        const startsCorrectly = userNode.left.kind === "var" && exprEquals(userNode.left, leftmostLeaf(correctNode));
        if (leftMatches || startsCorrectly) {
            const opDisplay = OP_TO_STRING[userNode.op!] ?? userNode.op;
            if (revealExtra) return `Check the operator used here, as ${opDisplay} was used`;
            return `Check the operator used here.`;
        }
    }

    // Structurally different shapes
    return `The structure here is not quite right.`;
}
