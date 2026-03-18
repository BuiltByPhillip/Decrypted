import {substituteRolesInString} from "~/app/hooks/expr";
import type {SelectedDefinitions} from "~/app/exercise/page";

type ExerciseDescriptionProps = {
    description: string,
    definitions: SelectedDefinitions;
    prompt?: string,
    className?: string,
    
}


export default function ExerciseDescription({ description, prompt, className, definitions }: ExerciseDescriptionProps) {
    
    return (
        <div className={`flex flex-col items-center p-8 gap-3 ${className}`}>
            {/* Description */}
            <span className="text-4xl font-bold text-gray">
                {definitions ? substituteRolesInString(description, definitions) : description}
            </span>
            
            {/* Prompt*/}
            {prompt && <span className="text-xl text-gray/70">{substituteRolesInString(prompt, definitions)}</span>}
        </div>
    );
}