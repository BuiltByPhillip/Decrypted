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
        return `Wrong answer, because ${userNode.name} ${symbolDisplay["notelem"]} ${correctNode.name}`;
    }
    
    // User used an integer where a variable was expected
    if (userNode.kind === "int" && correctNode.kind === "var") {
        const correctRole = definitions ? findRoleName(correctNode, definitions) : undefined;
        return `This position expects a variable ${symbolDisplay["elem"]} ${correctRole ?? correctNode.name}, but received ${userNode.value}.`;
    }

    // Both plain variables — look up role names from definitions for specific feedback
    if (userNode.kind === "var" && correctNode.kind === "var") {
        const correctRole = definitions ? findRoleName(correctNode, definitions) : undefined;
        return `Wrong answer, because ${userNode.name} ${symbolDisplay["notelem"]} ${correctRole ?? correctNode.name}`;
    }

    // Wrong integer
    if (userNode.kind === "int" && correctNode.kind === "int") {
        return `The value ${userNode.value} is incorrect here.`;
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
            return `The operator '${opDisplay}' is incorrect here.`;
        }
    }

    // Structurally different shapes
    return `You have provided an invalid structure.`;
}
