export function Badge({ label }: { label: string }) {
  return (
    <span className="border-green/30 text-green bg-green/5 rounded-lg border px-3 py-1 font-mono text-[12px]">
      {label}
    </span>
  );
}
