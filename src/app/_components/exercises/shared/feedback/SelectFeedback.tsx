import type {Expr} from "~/app/hooks/parser";


type SelectFeedbackProps = {
    results: [number, boolean][];
}

function getFeedbackMessage(results: [number, boolean][]): string | null {
    if (results.length === 0) return null;

    return "Not quite - re-read the question carefully and try again."
}

export default function SelectFeedback({ results }: SelectFeedbackProps) {
    const message = getFeedbackMessage(results);

    return (
        <div>
            {message && <span className="text-danger">{message}</span>}
        </div>
    );
}