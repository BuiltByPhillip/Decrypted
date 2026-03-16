import type {Expr} from "~/app/hooks/parser";
import {provideFeedback} from "~/app/_components/exercises/shared/feedback/feedback";
import type {SelectedDefinitions} from "~/app/exercise/page";

type ConstructFeedbackProps = {
    userInput: Expr;
    answer: Expr;
    definitions?: SelectedDefinitions;
}


export default function ConstructFeedback({ userInput, answer, definitions }: ConstructFeedbackProps) {
    const feedback = provideFeedback(answer, userInput, definitions)
    
    return (
        <div>
            {feedback && <span className="text-danger">{feedback}</span>}
        </div>
    );
}