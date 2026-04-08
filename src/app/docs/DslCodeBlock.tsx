"use client";

import dynamic from "next/dynamic";
import CodeBlock from "./CodeBlock";
import PreviewLoader from "./PreviewLoader";

const DslPreview = dynamic(() => import("./DslPreview"), { ssr: false, loading: PreviewLoader });

export default function DslCodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <CodeBlock label={label} preview={<DslPreview code={children} />}>
      {children}
    </CodeBlock>
  );
}
