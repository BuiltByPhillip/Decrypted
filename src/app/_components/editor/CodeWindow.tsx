"use client"

import { darkTheme } from "~/app/codeMirrorTheme";
import CodeMirror from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";

interface Props {
  code: string;
  onChange: (value: string) => void;
}

const autoIndentAfterColon = Prec.highest(keymap.of([{
  key: "Enter",
  run: (view) => {
    const { state } = view;
    const { from } = state.selection.main;
    const line = state.doc.lineAt(from);
    const indent = line.text.match(/^(\s*)/)?.[1] ?? "";

    if (line.text.trimEnd().endsWith(":")) {
      view.dispatch(state.replaceSelection("\n" + indent + "    "));
      return true;
    }
    return false;
  }
}]));

export default function CodeWindow({ code, onChange }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#393E46] border-b-[#5a6070]">
      <div className="border-medium relative flex items-center border-b bg-[rgba(28,33,41,0.8)] px-4 py-3">
        <span className="bg-mac-red h-3 w-3 rounded-full" />
        <span className="bg-mac-yellow h-3 w-3 rounded-full ml-2" />
        <span className="bg-mac-green h-3 w-3 rounded-full ml-2" />
        <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.32em] text-muted uppercase">Exercise Editor</span>
      </div>
      <CodeMirror
        height="500px"
        value={code}
        onChange={onChange}
        theme="none"
        extensions={[darkTheme, autoIndentAfterColon]}
        placeholder="Enter your code here..."
        className="h-full"
      />
    </div>
  );
}
