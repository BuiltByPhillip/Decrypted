
type InputProps = {
    placeholder?: string,
    className?: string,
}


export default function Input({ placeholder, className }: InputProps) {
    
    return (
        <input
            placeholder={placeholder ?? "Enter text"}
            className={`text-muted border-2 rounded-lg p-2 border-muted ${className}`}
        />
    );
}