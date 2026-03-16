import type {Expr} from "~/app/hooks/parser";


type SelectFeedbackProps = {
    results: [number, boolean][];
    options: Expr[];
    answers: Expr[];
}

function getFeedbackMessage(results: [number, boolean][], answers: Expr[]): string | null {
    if (results.length === 0) return null;

    const correctCount = results.filter(([, correct]) => correct).length;

    if (results.length > answers.length) {
        return "Think carefully — not all of these belong here. Re-read the definition and reconsider your selection.";
    }
    if (correctCount === 0) {
        return "None of these fit the definition. Go back and review what it says, then try again.";
    }
    if (correctCount > 0 && correctCount < answers.length) {
        return "Not quite right. Revisit the definition and think about what truly satisfies it.";
    }
    return null;
}

export default function SelectFeedback({ results, options, answers }: SelectFeedbackProps) {
    const message = getFeedbackMessage(results, answers);

    return (
        <div>
            {message && <span className="text-danger">{message}</span>}
        </div>
    );
}