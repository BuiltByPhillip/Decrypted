"use client"

import { darkTheme } from "~/app/codeMirrorTheme";
import CodeMirror from "@uiw/react-codemirror";

interface Props {
  code: string;
  onChange: (value: string) => void;
}

export default function CodeWindow({ code, onChange }: Props) {
  return (
    <CodeMirror
      height="518px"
      value={code}
      onChange={onChange}
      theme="none"
      extensions={[darkTheme]}
      placeholder="Enter your code here..."
      className="h-full"
    />
  );
}
