import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";
import Input from "~/app/_components/exercises/shared/Input";
import type {SelectedDefinitions} from "~/app/exercise/page";
import type {Expr} from "~/app/hooks/parser";
import {useState} from "react";
import Hint from "~/app/_components/exercises/select/hint";

type CalculateExerciseProps = {
    description: string;
    prompt: string;
    hint?: string;
    answer: Expr;
    onAnswerAction?: (isCorrect: boolean) => void;
    definitions: SelectedDefinitions;
}

export default function CalculateExercise({ description, prompt, hint, answer, onAnswerAction, definitions }: CalculateExerciseProps) {
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    
    function handleAnswer(isCorrect: boolean) {
        setIsCorrect(isCorrect);
    }
    
    return (
        <div className="flex flex-col justify-center items-center">
            <ExerciseDescription description={description} prompt={prompt} definitions={definitions}/>
            <div className="flex flex-col items-center">
                <Hint hint={hint ?? null} className="self-end"/>
                <Input placeholder="Enter your answer"/>
            </div>
            
        </div>
    );
}