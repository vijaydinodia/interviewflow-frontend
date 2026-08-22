"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Play, Loader2, Terminal, Code2, RotateCcw, Copy,
  Check, Clock, Cpu, CheckCircle2, XCircle, AlertCircle, Zap, ArrowLeft, Home, LayoutDashboard, Sun, Moon
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

// Dynamically import Monaco to avoid SSR window errors
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
      <span className="text-sm font-mono">Loading editor...</span>
    </div>
  ),
});

// ── Supported Languages ───────────────────────────────────────────────────────
const LANGUAGES = [
  {
    id: 63,
    name: "JavaScript",
    monacoLang: "javascript",
    starter: `// JavaScript (Node.js)\nconsole.log("Hello, World!");`,
  },
  {
    id: 71,
    name: "Python 3",
    monacoLang: "python",
    starter: `# Python 3\nprint("Hello, World!")`,
  },
  {
    id: 62,
    name: "Java",
    monacoLang: "java",
    starter: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  },
  {
    id: 50,
    name: "C",
    monacoLang: "c",
    starter: `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  },
  {
    id: 54,
    name: "C++",
    monacoLang: "cpp",
    starter: `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  },
  {
    id: 74,
    name: "TypeScript",
    monacoLang: "typescript",
    starter: `// TypeScript\nconst message: string = "Hello, World!";\nconsole.log(message);`,
  },
];

function statusColor(id) {
  if (id === 3) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (id === 1 || id === 2) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
}

function StatusIcon({ id }) {
  if (id === 3) return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (id === 1 || id === 2) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  return <XCircle className="h-3.5 w-3.5" />;
}

export default function CompilerPage() {
  const { isDark, toggleTheme }          = useTheme();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode]                 = useState(LANGUAGES[0].starter);
  const [stdin, setStdin]               = useState("");
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [copied, setCopied]             = useState(false);
  const editorRef                       = useRef(null);

  const handleLangChange = (e) => {
    const lang = LANGUAGES.find((l) => l.id === Number(e.target.value));
    if (lang) {
      setSelectedLang(lang);
      setCode(lang.starter);
      setResult(null);
      setError("");
    }
  };

  const handleReset = () => {
    setCode(selectedLang.starter);
    setResult(null);
    setError("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    if (loading) return;
    if (!code.trim()) {
      setError("Please write some code before running.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: selectedLang.id,
          stdin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Execution failed. Please try again.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleRun);
  };

  const output     = result?.stdout || "";
  const errOut     = result?.stderr || "";
  const compileErr = result?.compile_output || "";

  const containerBg = isDark ? "bg-[#0B151E] text-white" : "bg-slate-100 text-slate-900";
  const headerBg    = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200 shadow-sm";
  const panelBg     = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200 shadow-md";
  const subHeaderBg = isDark ? "bg-[#090F1A] border-white/10" : "bg-slate-50 border-slate-200";

  return (
    <div className={`min-h-screen font-sans flex flex-col ${containerBg}`}>
      
      {/* ── DEDICATED COMPILER TOP NAVIGATION BAR ───────────────────────────── */}
      <header className={`sticky top-0 z-50 flex items-center justify-between border-b px-5 py-3 ${headerBg}`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-emerald-400 text-black font-extrabold text-xs shadow-md">
              iF
            </div>
            <span className="font-extrabold text-base tracking-tight hidden sm:inline">
              Interview<span className="text-cyan-400">Flow</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Quick Navigation Buttons */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Home className="h-3.5 w-3.5 text-cyan-400" />
            <span>Home</span>
          </Link>

          <Link
            href="/dashborads/candidateDashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Center Badge */}
        <div className="hidden md:flex items-center gap-2 font-black text-xs">
          <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" /> FlowCode Dedicated Compiler
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
          </button>

          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Isolated Sandbox</span>
          </span>
        </div>
      </header>

      {/* ── DEDICATED COMPILER WORKSPACE ──────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 mx-auto max-w-7xl w-full space-y-4">
        
        {/* Toolbar: Language selector & Actions */}
        <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${panelBg}`}>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <select
              value={selectedLang.id}
              onChange={handleLangChange}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                isDark ? "bg-[#0B151E] border-white/10 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-800"
              }`}
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className={isDark ? "bg-[#0B151E]" : "bg-white"}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset code template"
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                isDark ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handleCopy}
              title="Copy code"
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                isDark ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {/* Run Code Button */}
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#00b8a3] hover:bg-[#00a390] px-4 py-1.5 text-xs font-black text-black shadow-lg active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Code</span>
                  <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-black font-extrabold">
                    Ctrl+↵
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Editor & Stdin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monaco Editor (2/3 cols) */}
          <div className={`lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col ${panelBg}`}>
            <div className={`flex items-center justify-between border-b px-4 py-2 text-xs ${subHeaderBg}`}>
              <div className="flex items-center gap-2 font-bold">
                <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>{selectedLang.name} Editor</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Monaco Editor</span>
            </div>
            <div className="h-[460px] w-full">
              <Editor
                height="100%"
                language={selectedLang.monacoLang}
                value={code}
                theme={isDark ? "vs-dark" : "light"}
                onChange={(v) => setCode(v || "")}
                onMount={handleEditorMount}
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
                }}
              />
            </div>
          </div>

          {/* Stdin Panel (1/3 col) */}
          <div className={`flex flex-col rounded-2xl border overflow-hidden ${panelBg}`}>
            <div className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-bold ${subHeaderBg}`}>
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              <span>Standard Input (stdin)</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={"Enter program input here...\n\nExample:\n5\n10 20 30 40 50"}
              rows={12}
              className="flex-1 resize-none bg-transparent p-4 text-xs font-mono outline-none placeholder-slate-500"
            />
          </div>
        </div>

        {/* Output Console Panel */}
        <div className={`rounded-2xl border overflow-hidden ${panelBg}`}>
          <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs ${subHeaderBg}`}>
            <div className="flex items-center gap-2 font-bold">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Output Console</span>
            </div>

            {result?.status && (
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${statusColor(result.status.id)}`}>
                  <StatusIcon id={result.status.id} />
                  {result.status.description}
                </span>

                {result.time && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-cyan-400" /> {result.time}
                  </span>
                )}

                {result.memory && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-purple-400" /> {result.memory}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="min-h-36 p-4 font-mono text-xs max-h-60 overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2 text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading && !error && (
              <div className="flex items-center gap-2 text-cyan-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Compiling and executing in isolated sandbox...</span>
              </div>
            )}

            {!loading && result && compileErr && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <AlertCircle className="h-3.5 w-3.5" /> Compilation Error
                </p>
                <pre className="text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">
                  {compileErr}
                </pre>
              </div>
            )}

            {!loading && result && output && (
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed select-text font-medium">
                {output}
              </pre>
            )}

            {!loading && result && errOut && !compileErr && (
              <div className="space-y-1 mt-2">
                <p className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                  <XCircle className="h-3.5 w-3.5" /> Runtime Error (stderr)
                </p>
                <pre className="text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">
                  {errOut}
                </pre>
              </div>
            )}

            {!loading && result && !output && !compileErr && !errOut && (
              <p className="text-slate-500 italic">Program ran successfully with no stdout output.</p>
            )}

            {!loading && !result && !error && (
              <p className="text-slate-500 italic">
                Output will appear here after you click <strong className="text-slate-300">Run Code</strong> (or press Ctrl+Enter).
              </p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
