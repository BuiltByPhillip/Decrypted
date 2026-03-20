
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
                    className={`w-full border border-dark ${results[index] ? "bg-green/90" : "bg-muted/70"}`} />
            ))}
        </div>
    );
}
