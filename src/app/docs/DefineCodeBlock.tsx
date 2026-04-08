"use client";

import dynamic from "next/dynamic";
import CodeBlock from "./CodeBlock";
import PreviewLoader from "./PreviewLoader";

const DefinePreview = dynamic(() => import("./DefinePreview"), { ssr: false, loading: PreviewLoader });

export default function DefineCodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <CodeBlock label={label} preview={<DefinePreview code={children} />}>
      {children}
    </CodeBlock>
  );
}
