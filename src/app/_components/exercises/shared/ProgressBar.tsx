
type ProgressBarProps = {
    total: number;
    results: Record<number, boolean>;
}


export default function ProgressBar({ results, total }: ProgressBarProps) {

    return (
        <div className="flex flex-col w-5 h-150 rounded-full overflow-hidden">
            {Array.from({ length: total }, (_, index) => (
                <div
                    key={index}
                    style={{ height: `${100 / total}%` }}
                    className="relative w-full bg-muted/50 overflow-hidden">
                    {results[index] !== undefined && (
                        <svg className="absolute inset-x-0 top-0" style={{ height: "200%", animation: "wave-fill 0.6s ease-out forwards" }} viewBox="0 0 10 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            <path style={{ fill: results[index] ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)", transition: "fill 0.6s ease" }} d="M0,0 L10,0 L10,15 C9.31,15 9.44,17 8.75,17 C8.06,17 8.19,15 7.5,15 C6.81,15 6.94,13 6.25,13 C5.56,13 5.69,15 5,15 C4.31,15 4.44,17 3.75,17 C3.06,17 3.19,15 2.5,15 C1.81,15 1.94,13 1.25,13 C0.56,13 0.69,15 0,15 Z" />
                        </svg>
                    )}
                </div>
            ))}
        </div>
    );
}
