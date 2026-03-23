import type { Expr} from "~/app/hooks/parser";
import ConstructFeedback from "~/app/_components/exercises/shared/feedback/ConstructFeedback";
import SelectFeedback from "~/app/_components/exercises/shared/feedback/SelectFeedback";
import CalculateFeedback from "~/app/_components/exercises/shared/feedback/CalculateFeedback";
import FillFeedback from "~/app/_components/exercises/shared/feedback/FillFeedback";

type UserFeedbackProps =
    | { exerciseType: "select"; results: [number, boolean][]; options: Expr[]; answers: Expr[]; }
    | { exerciseType: "construct"; userAnswer?: { status: "valid"; expr: Expr } | { status: "invalid"; reason?: string }; correctAnswer?: Expr; definitions?: Record<string, Expr> }
    | { exerciseType: "calculate"; }
    | { exerciseType: "fill"; }


export default function UserFeedback(props: UserFeedbackProps) {
    switch (props.exerciseType) {
        case "select":
            return <SelectFeedback results={props.results} answers={props.answers} />;
        case "construct":
            if (props.userAnswer?.status === "invalid") {
                return <span className="text-danger text-sm">This expression is not valid — check your syntax.</span>;
            }
            if (props.userAnswer?.status === "valid" && props.correctAnswer) {
                return <ConstructFeedback userInput={props.userAnswer.expr} answer={props.correctAnswer} definitions={props.definitions} />;
            }
            return null;
        case "calculate":
            return <CalculateFeedback />;
        case "fill":
            return <FillFeedback />;
        default:
            throw new Error(`UserFeedback not implemented for: ${(props as {exerciseType: string}).exerciseType}`);
            
    }
    
}