"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { useState } from "react";
import { parse } from "~/app/hooks/parser"

export default function TestPage() {
  const [code, setCode] = useState("");
  const [parsedOutput, setParsedOutput] = useState<string>("");
  const [error, setError] = useState<string>("");

  const generateCode = () => {
    try {
      const userCode = parse(code, 0);
      setParsedOutput(JSON.stringify(userCode, null, 2));
      setError("");
      console.log(userCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setParsedOutput("");
    }
  }

  const darkTheme = EditorView.theme({
    "&": {
      backgroundColor: "#222831",
    },
    ".cm-content": {
      padding: "24px",
      caretColor: "#DFD0B8",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-editor": {
      borderRadius: "1rem",
      backgroundColor: "#222831",
    },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      fontSize: "0.875rem",
      backgroundColor: "#222831",
      color: "#DFD0B8",
    },
    ".cm-line": {
      color: "#DFD0B8",
    },
    ".cm-activeLine": {
      backgroundColor: "#393E46",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#393E46",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "#393E46 !important",
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: "#393E46 !important",
    },
    ".cm-placeholder": {
      color: "#9ca3af",
    },
    ".cm-gutters": {
      backgroundColor: "#222831",
      borderRight: "none",
      color: "#948979",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      color: "#948979",
    },
    ".cm-scroller::-webkit-scrollbar": {
      width: "10px",
      height: "10px",
    },
    ".cm-scroller::-webkit-scrollbar-track": {
      backgroundColor: "#222831",
    },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      backgroundColor: "#948979",
      borderRadius: "5px",
    },
    ".cm-scroller::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#DFD0B8",
    },
  });

  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-medium to-dark text-cream p-8">
      <h1 className="text-4xl font-bold mb-8">Parser Test Page</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
        {/* Input Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Input</h2>
          <div className="w-full bg-dark rounded-2xl overflow-hidden">
            <CodeMirror
              height="500px"
              value={code}
              onChange={setCode}
              extensions={[darkTheme]}
              placeholder="Enter your code here..."
              className="h-full"
            />
          </div>
          <button
            className="bg-cream rounded-md text-medium px-6 py-2 hover:opacity-70 hover:cursor-pointer mt-6 font-semibold"
            onClick={generateCode}
          >
            Generate Code
          </button>
        </div>

        {/* Output Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Parsed Output</h2>
          <div className="w-full bg-dark rounded-2xl p-6 min-h-[500px] max-h-[500px] overflow-auto custom-scrollbar">
            {error ? (
              <div className="text-red-400 font-mono whitespace-pre-wrap">
                Error: {error}
              </div>
            ) : parsedOutput ? (
              <pre className="text-cream font-mono text-sm whitespace-pre-wrap">
                {parsedOutput}
              </pre>
            ) : (
              <p className="text-gray-400 italic">
                Click "Generate Code" to see the parsed structure
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
