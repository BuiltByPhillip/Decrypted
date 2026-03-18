import ExerciseDescription from "~/app/_components/exercises/shared/ExerciseDescription";
import Input from "~/app/_components/exercises/shared/Input";
import type {SelectedDefinitions} from "~/app/exercise/page";
import type {Expr} from "~/app/hooks/parser";
import {useState} from "react";

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
        <div className="flex flex-col justify-center">
            <ExerciseDescription description={description} prompt={prompt} definitions={definitions}/>
            <Input placeholder="Enter your answer"/>
        </div>
    );
}