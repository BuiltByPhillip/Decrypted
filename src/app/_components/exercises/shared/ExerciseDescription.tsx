
type ExerciseDescriptionProps = {
    description: string,
    prompt?: string,
}


export default function ExerciseDescription({ description, prompt }: ExerciseDescriptionProps) {
    
    return (
        <div className="flex flex-col items-center p-8 gap-3">
            {/* Description */}
            <span className="text-4xl font-bold text-gray">
                {description}
            </span>
            
            {/* Prompt*/}
            {prompt && <span className="text-xl text-gray/70">{prompt}</span>}
        </div>
    );
}