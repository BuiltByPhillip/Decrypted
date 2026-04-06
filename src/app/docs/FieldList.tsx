type Field = {
  name: string;
  description: string;
};

type FieldListProps = {
  required: Field[];
  optional: Field[];
};

function FieldRow({ field, required }: { field: Field; required: boolean }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
          required
            ? "bg-green/10 text-green border-green/20 border"
            : "bg-medium/30 text-muted border-medium border"
        }`}
      >
        {required ? "required" : "optional"}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-soft-white font-mono text-[13px]">{field.name}</span>
        <span className="text-muted text-xs leading-relaxed">{field.description}</span>
      </div>
    </li>
  );
}

export default function FieldList({ required, optional }: FieldListProps) {
  return (
    <div className="border-medium bg-[#0d1117] my-6 rounded-xl border overflow-hidden">
      <div className="border-medium border-b px-5 py-3">
        <span className="text-dark-foreground font-mono text-[11px] font-semibold tracking-widest uppercase">
          Fields
        </span>
      </div>
      <ul className="divide-medium divide-y px-5">
        {required.map((field) => (
          <FieldRow key={field.name} field={field} required={true} />
        ))}
        {optional.map((field) => (
          <FieldRow key={field.name} field={field} required={false} />
        ))}
      </ul>
    </div>
  );
}
