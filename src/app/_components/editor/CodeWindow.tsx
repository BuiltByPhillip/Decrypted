"use client"

import { darkTheme } from "~/app/codeMirrorTheme";
import CodeMirror from "@uiw/react-codemirror";

interface Props {
  code: string;
  onChange: (value: string) => void;
}

export default function CodeWindow({ code, onChange }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#393E46] border-b-[#5a6070]">
      <div className="border-medium flex items-center gap-2 border-b px-4 py-3" style={{ backgroundColor: "rgba(28, 33, 41, 0.8)" }}>
        <span className="bg-mac-red h-3 w-3 rounded-full" />
        <span className="bg-mac-yellow h-3 w-3 rounded-full" />
        <span className="bg-mac-green h-3 w-3 rounded-full" />
      </div>
      <CodeMirror
        height="500px"
        value={code}
        onChange={onChange}
        theme="none"
        extensions={[darkTheme]}
        placeholder="Enter your code here..."
        className="h-full"
      />
    </div>
  );
}
