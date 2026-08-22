"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Play, RotateCcw, Trash2, Clock, Cpu, CheckCircle2,
  AlertCircle, XCircle, Code2, Terminal, Sparkles, Loader2,
  Copy, Check, FileCode, CornerDownLeft, Maximize2, Minimize2
} from "lucide-react";
import { JUDGE0_LANGUAGES } from "@/lib/judge0";
import { useTheme } from "@/custom_hook/UseTheme";

// Dynamically import Monaco Editor to prevent SSR window issues in Next.js
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full flex flex-col items-center justify-center bg-[#0d131f] text-slate-400 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <span className="text-xs font-mono font-bold tracking-wider">Loading Monaco Code Editor...</span>
    </div>
  ),
});

export default function CodeEditorWithRunner({
  initialLanguage = "javascript",
  initialCode = null,
  initialStdin = "",
  roomCode = null,
  onCodeChange = null,
  className = "",
}) {
  const { isDark } = useTheme();

  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(
    initialCode || JUDGE0_LANGUAGES[initialLanguage]?.defaultCode || JUDGE0_LANGUAGES.javascript.defaultCode
  );
  const [stdin, setStdin] = useState(initialStdin || "");
  const [activeTab, setActiveTab] = useState("output"); // "output" | "input" | "errors"

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (initialCode !== null && initialCode !== undefined) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  useEffect(() => {
    if (initialStdin !== undefined && initialStdin !== null) {
      setStdin(initialStdin);
    }
  }, [initialStdin]);

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcut for Run Code: Ctrl+Enter or Cmd+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const template = JUDGE0_LANGUAGES[newLang]?.defaultCode || "";
    setCode(template);
    if (onCodeChange) onCodeChange(template, newLang);
  };

  const handleResetCode = () => {
    const template = JUDGE0_LANGUAGES[language]?.defaultCode || "";
    setCode(template);
    if (onCodeChange) onCodeChange(template, language);
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = useCallback(async () => {
    if (loading || !code.trim()) return;

    setLoading(true);
    setActiveTab("output");
    setOutput({
      status: { id: 1, description: "Running..." },
      stdout: "",
      stderr: "",
      compile_output: "",
      time: "...",
      memory: "...",
    });

    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          language,
          stdin,
        }),
      });

      const data = await response.json();
      setOutput(data);

      // Auto switch to errors tab if compilation or runtime error occurred
      if (data.compile_output || (data.status && data.status.id >= 6 && data.status.id !== 3)) {
        if (data.compile_output) {
          setActiveTab("errors");
        }
      }
    } catch (err) {
      setOutput({
        success: false,
        status: { id: 13, description: "Network Error" },
        stderr: err.message || "Failed to reach execution server.",
        stdout: "",
        compile_output: "",
        time: "0.000s",
        memory: "0 KB",
      });
      setActiveTab("errors");
    } finally {
      setLoading(false);
    }
  }, [code, language, stdin, loading]);

  // Global keydown listener for running code outside editor focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode]);

  const currentLangMeta = JUDGE0_LANGUAGES[language] || JUDGE0_LANGUAGES.javascript;

  const isAccepted = output?.status?.id === 3;
  const isPending = output?.status?.id === 1 || output?.status?.id === 2;
  const isError = output?.status && output.status.id > 3;

  const containerBg = isDark ? "bg-[#080E18] border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md";
  const toolbarBg = isDark ? "bg-[#0B151E] border-white/10" : "bg-slate-100 border-slate-200";
  const selectBg = isDark ? "bg-[#080E18] border-white/10 text-slate-200" : "bg-white border-slate-300 text-slate-800";
  const btnBg = isDark ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white" : "bg-slate-200/80 border-slate-300 text-slate-700 hover:bg-slate-300 hover:text-slate-900";
  const terminalBg = isDark ? "bg-[#060B12] border-white/10" : "bg-slate-50 border-slate-200";
  const terminalHeaderBg = isDark ? "bg-[#090F1A] border-white/10" : "bg-slate-200/60 border-slate-300";

  return (
    <div
      className={`flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${containerBg} ${
        isFullScreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : "w-full"
      } ${className}`}
    >
      {/* ══════════════ 1. TOP TOOLBAR ══════════════ */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 ${toolbarBg}`}>
        {/* Left: Language Selector & Room Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Code2 className="h-4 w-4" />
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-bold outline-none hover:border-cyan-400/40 focus:border-cyan-400 transition-colors cursor-pointer ${selectBg}`}
            >
              {Object.entries(JUDGE0_LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key} className={isDark ? "bg-[#0B151E] text-white" : "bg-white text-slate-900"}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {roomCode && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-mono ${isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-200/60 border-slate-300 text-slate-600"}`}>
              <span>Room:</span>
              <span className="font-bold text-cyan-500">{roomCode}</span>
            </div>
          )}
        </div>

        {/* Right: Actions (Run, Reset, Copy, Expand) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetCode}
            title="Reset code template"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${btnBg}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy code"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${btnBg}`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${btnBg}`}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Primary RUN CODE Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleRunCode}
            className="flex items-center gap-2 rounded-xl bg-[#00b8a3] hover:bg-[#00a390] px-4 py-1.5 font-black text-xs text-black shadow-lg shadow-[#00b8a3]/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Code</span>
                <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-black font-extrabold">
                  Ctrl+↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════ 2. MONACO CODE EDITOR ══════════════ */}
      <div className={`relative ${isFullScreen ? "flex-1 min-h-[400px]" : "h-[420px]"} w-full ${isDark ? "bg-[#080E18]" : "bg-white"}`}>
        <Editor
          height="100%"
          language={currentLangMeta.monacoLanguage}
          value={code}
          theme={isDark ? "vs-dark" : "light"}
          onChange={(val) => {
            setCode(val || "");
            if (onCodeChange) onCodeChange(val || "", language);
          }}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* ══════════════ 3. INTERACTIVE TERMINAL & OUTPUT PANEL ══════════════ */}
      <div className={`flex flex-col border-t ${terminalBg}`}>
        {/* Terminal Header Tabs & Execution Status Meta */}
        <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs ${terminalHeaderBg}`}>
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                activeTab === "output"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" /> Output
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("input")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                activeTab === "input"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CornerDownLeft className="h-3.5 w-3.5" /> Custom Input (stdin)
            </button>

            {(output?.compile_output || output?.stderr) && (
              <button
                type="button"
                onClick={() => setActiveTab("errors")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  activeTab === "errors"
                    ? "bg-red-500/20 text-red-300 border border-red-400/30"
                    : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" /> Errors
              </button>
            )}
          </div>

          {/* Execution Metrics (Status, Time, Memory) */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {output?.status && (
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                  isAccepted
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : isPending
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {isAccepted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {output.status.description}
              </span>
            )}

            {output?.time && output.time !== "..." && (
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" /> {output.time}
              </span>
            )}

            {output?.memory && output.memory !== "..." && (
              <span className="text-slate-400 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-purple-400" /> {output.memory}
              </span>
            )}

            <button
              type="button"
              onClick={() => setOutput(null)}
              title="Clear Terminal"
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 font-mono text-xs max-h-56 overflow-y-auto">
          {/* TAB 1: OUTPUT */}
          {activeTab === "output" && (
            <div className="space-y-2">
              {!output ? (
                <p className="text-slate-500 italic">Click &quot;Run Code&quot; (or press Ctrl+Enter) to execute your program.</p>
              ) : isPending ? (
                <div className="flex items-center gap-2 text-cyan-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Compiling and executing in isolated sandbox...</span>
                </div>
              ) : output.stdout ? (
                <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed select-text font-mono font-medium">
                  {output.stdout}
                </pre>
              ) : output.compile_output || output.stderr ? (
                <div className="space-y-1">
                  <p className="text-amber-400 font-bold">⚠️ Execution completed with error/warning:</p>
                  <pre className="text-red-300 whitespace-pre-wrap leading-relaxed font-mono">
                    {output.compile_output || output.stderr}
                  </pre>
                </div>
              ) : (
                <p className="text-slate-400 italic">Program executed successfully with no stdout output.</p>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOM INPUT (STDIN) */}
          {activeTab === "input" && (
            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block font-sans">
                Enter standard input values for your program (stdin):
              </label>
              <textarea
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="e.g. 5&#10;10 20 30 40 50"
                className="w-full rounded-xl border border-white/10 bg-[#080E18] p-3 text-xs text-slate-200 font-mono outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          )}

          {/* TAB 3: ERRORS & COMPILATION OUTPUT */}
          {activeTab === "errors" && (
            <div className="space-y-2">
              {output?.compile_output && (
                <div className="space-y-1">
                  <p className="text-amber-400 font-bold flex items-center gap-1.5 font-sans text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5" /> Compilation Output:
                  </p>
                  <pre className="text-amber-200 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl whitespace-pre-wrap">
                    {output.compile_output}
                  </pre>
                </div>
              )}

              {output?.stderr && (
                <div className="space-y-1">
                  <p className="text-red-400 font-bold flex items-center gap-1.5 font-sans text-[11px]">
                    <XCircle className="h-3.5 w-3.5" /> Standard Error (stderr):
                  </p>
                  <pre className="text-red-200 bg-red-500/10 border border-red-500/20 p-3 rounded-xl whitespace-pre-wrap">
                    {output.stderr}
                  </pre>
                </div>
              )}

              {!output?.compile_output && !output?.stderr && (
                <p className="text-slate-500 italic">No runtime or compilation errors detected.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
