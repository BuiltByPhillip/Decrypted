import { EditorView } from "@codemirror/view";

export const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "rgba(34, 40, 49, 0.7) !important",
    color: "#94a3b8 !important",
    fontSize: "13px",
  },
  ".cm-content": {
    padding: "16px",
    paddingLeft: "0",
    caretColor: "#60a5fa",
    color: "#94a3b8 !important",
  },
  ".cm-cursor": {
    borderLeftColor: "#60a5fa",
    borderLeftWidth: "2px",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-editor": {
    borderRadius: "1rem",
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
    scrollbarWidth: "thin",
    scrollbarColor: "#393E46 transparent",
  },
  ".cm-scroller::-webkit-scrollbar": {
    width: "10px",
    height: "10px",
  },
  ".cm-scroller::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "#393E46",
    borderRadius: "5px",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#94a3b8",
  },
  ".cm-scroller::-webkit-scrollbar-corner": {
    backgroundColor: "transparent",
  },
  ".cm-placeholder": {
    color: "#94a3b8",
  },
  // Line numbers / gutter
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    color: "#94a3b8",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(57, 62, 70, 0.3)",
    boxShadow: "12px 0 0 rgba(57, 62, 70, 0.3)",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(57, 62, 70, 0.3)",
  },
  // Text / syntax highlighting
  ".cm-line": {
    color: "#94a3b8 !important",
  },
  ".cm-string": { color: "#22c55e" },
  ".cm-number": { color: "#f59e0b" },
  ".cm-atom": { color: "#f59e0b" },
  ".cm-keyword": { color: "#94a3b8", fontWeight: "bold" },
  ".cm-property": { color: "#94a3b8" },
  ".cm-punctuation": { color: "#948979" },
  // Error styling
  ".cm-diagnostic": {
    textDecoration: "underline wavy red",
  },
  ".cm-lintRange-error": {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
});
