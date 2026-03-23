import type {Expr} from "~/app/hooks/parser";
import {provideFeedback} from "~/app/_components/exercises/shared/feedback/feedback";
import type {SelectedDefinitions} from "~/app/exercise/page";

type ConstructFeedbackProps = {
    userInput: Expr;
    answer: Expr;
    definitions?: SelectedDefinitions;
    attempts: number;
}


export default function ConstructFeedback({ userInput, answer, definitions, attempts }: ConstructFeedbackProps) {
    const feedback = attempts > 1 ? provideFeedback(answer, userInput, definitions) : "Not quite - try again.";

    return (
        <div>
            {feedback && <span className="text-danger">{feedback}</span>}
        </div>
    );
}