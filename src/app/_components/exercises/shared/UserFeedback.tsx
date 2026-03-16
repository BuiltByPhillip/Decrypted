import type {ExerciseType} from "~/app/hooks/parser";

type UserFeedbackProps = {
    exerciseType: ExerciseType
}


export default function UserFeedback({ exerciseType }: UserFeedbackProps) {
    switch (exerciseType) {
        case "select":
            return (
                <div>
                    Under construction
                </div>
            );
        case "construct":
            return (
                <div>
                    Under construction
                </div>
            );
        case "calculate":
            return (
                <div>
                    Under construction
                </div>
            );
        case "fill":
            return (
                <div>
                    Under construction
                </div>
            );
        default:
            throw new Error(`UserFeedback not implemented for exercise type: ${exerciseType}`);
            
    }
    
}