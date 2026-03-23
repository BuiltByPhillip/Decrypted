import type {Expr} from "~/app/hooks/parser";


type SelectFeedbackProps = {
    results: [number, boolean][];
    answers: Expr[];
}

function getFeedbackMessage(results: [number, boolean][], answers: Expr[]): string | null {
    if (results.length === 0) return null;

    return "Not quite - re-read the question carefully and try again."
}

export default function SelectFeedback({ results, answers }: SelectFeedbackProps) {
    const message = getFeedbackMessage(results, answers);

    return (
        <div>
            {message && <span className="text-danger">{message}</span>}
        </div>
    );
}