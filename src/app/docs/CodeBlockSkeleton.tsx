export default function CodeBlockSkeleton() {
  return (
    <div className="border-medium my-6 overflow-hidden rounded-xl border bg-[#0d1117]">
      {/* Header bar */}
      <div className="border-medium flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-mac-red h-2.5 w-2.5 rounded-full opacity-70" />
          <span className="bg-mac-yellow h-2.5 w-2.5 rounded-full opacity-70" />
          <span className="bg-mac-green h-2.5 w-2.5 rounded-full opacity-70" />
        </div>
        <div className="bg-medium h-3 w-10 animate-pulse rounded opacity-30" />
      </div>

      {/* Code lines */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="bg-medium h-3 w-3/4 animate-pulse rounded opacity-20" />
        <div className="bg-medium h-3 w-1/2 animate-pulse rounded opacity-20" />
        <div className="bg-medium h-3 w-5/6 animate-pulse rounded opacity-20" />
        <div className="bg-medium h-3 w-2/5 animate-pulse rounded opacity-20" />
      </div>
    </div>
  );
}
