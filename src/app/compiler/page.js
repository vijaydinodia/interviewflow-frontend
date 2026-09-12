"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Play, Loader2, Terminal, Code2, RotateCcw, Copy,
  Check, Clock, Cpu, CheckCircle2, XCircle, AlertCircle, Zap, ArrowLeft, Home,
  LayoutDashboard, Sun, Moon, User, LogIn, Sparkles
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

// Dynamically import Monaco to avoid SSR window errors
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
      <span className="text-sm font-mono">Loading Monaco editor...</span>
    </div>
  ),
});

// Supported languages list
const LANGUAGES = [
  {
    id: 63,
    value: "javascript",
    name: "JavaScript",
    monacoLang: "javascript",
    starter: `// JavaScript (Node.js)\nconsole.log("Hello, World!");`,
  },
  {
    id: 71,
    value: "python",
    name: "Python 3",
    monacoLang: "python",
    starter: `# Python 3\nprint("Hello, World!")`,
  },
  {
    id: 62,
    value: "java",
    name: "Java",
    monacoLang: "java",
    starter: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  },
  {
    id: 50,
    value: "c",
    name: "C",
    monacoLang: "c",
    starter: `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  },
  {
    id: 54,
    value: "cpp",
    name: "C++",
    monacoLang: "cpp",
    starter: `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  },
  {
    id: 74,
    value: "typescript",
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
  const { isDark, toggleTheme } = useTheme();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].starter);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const editorRef = useRef(null);

  // Check if visitor has an active session (optional, not required)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("interviewflow_session");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

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

  // Run code against backend Judge0 execution engine
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
      const langValue = selectedLang.value || selectedLang.monacoLang || "javascript";
      const res = await api.post("/code/execute", {
        sourceCode: code,
        language: langValue,
        stdin,
      });

      const data = res.data;

      if (!data.success) {
        setError(data.message || "Execution failed. Please try again.");
        return;
      }

      setResult(data.data || data);
    } catch (err) {
      setError(err.response?.data?.message || "Execution error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleRun);
  };

  const output = result?.stdout || "";
  const errOut = result?.stderr || "";
  const compileErr = result?.compile_output || "";

  const containerBg = isDark ? "bg-[#0B151E] text-white" : "bg-slate-100 text-slate-900";
  const headerBg = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200 shadow-sm";
  const panelBg = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200 shadow-md";
  const subHeaderBg = isDark ? "bg-[#090F1A] border-white/10" : "bg-slate-50 border-slate-200";

  const getDashboardUrl = () => {
    if (!user) return "/login";
    const r = (user.role || "").toLowerCase();
    if (r === "superadmin") return "/dashboard/super-admin";
    if (r === "admin" || r === "company") return "/dashboard/admin";
    if (r === "interviewer") return "/dashboard/interviewer";
    return "/dashboard/candidate";
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col ${containerBg}`}>
      {/* Dedicated top navigation bar */}
      <header className={`sticky top-0 z-50 flex items-center justify-between border-b px-4 sm:px-6 py-3 ${headerBg}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-emerald-400 text-black font-extrabold text-xs shadow-md">
              iF
            </div>
            <span className="font-extrabold text-base tracking-tight hidden sm:inline">
              Interview<span className="text-cyan-400">Flow</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Navigation Links */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Home className="h-3.5 w-3.5 text-cyan-400" />
            <span>Home</span>
          </Link>

          {user ? (
            <Link
              href={getDashboardUrl()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <LogIn className="h-3.5 w-3.5 text-cyan-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Center Badge: Open Practice Indicator */}
        <div className="hidden md:flex items-center gap-2 font-black text-xs">
          <span className="px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            Free Open Code Runner • Practice Without Login
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
          </button>

          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Judge0 Sandbox</span>
          </span>
        </div>
      </header>

      {/* Main compiler workspace */}
      <main className="flex-1 p-4 sm:p-6 mx-auto max-w-7xl w-full space-y-4">
        {/* Practice Banner for Guests */}
        {!user && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border border-cyan-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Open for Everyone:</strong> You can write, execute, and test code freely.{" "}
                <Link href="/login" className="text-cyan-400 underline font-bold hover:text-cyan-300">
                  Sign in
                </Link>{" "}
                anytime to save execution history and schedule 1-to-1 mock interviews!
              </span>
            </div>
            <Link
              href="/register"
              className="px-3 py-1 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shrink-0 hover:bg-cyan-400 transition-all hidden sm:inline-block"
            >
              Create Free Account
            </Link>
          </div>
        )}

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
              <span className="text-[10px] font-mono text-slate-400">Monaco Code Engine</span>
            </div>

            <div className="h-[420px] sm:h-[480px]">
              <Editor
                height="100%"
                language={selectedLang.monacoLang}
                value={code}
                theme={isDark ? "vs-dark" : "light"}
                onChange={(val) => setCode(val || "")}
                onMount={handleEditorMount}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  lineNumbers: "on",
                  wordWrap: "on",
                }}
              />
            </div>
          </div>

          {/* Stdin Panel (1/3 cols) */}
          <div className={`rounded-2xl border overflow-hidden flex flex-col ${panelBg}`}>
            <div className={`flex items-center justify-between border-b px-4 py-2 text-xs ${subHeaderBg}`}>
              <div className="flex items-center gap-2 font-bold">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                <span>Custom Input (stdin)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Optional</span>
            </div>

            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Provide standard input here (one value per line)..."
              className={`flex-1 p-3 font-mono text-xs outline-none resize-none min-h-[140px] sm:min-h-0 ${
                isDark ? "bg-[#080E18] text-slate-200 placeholder-slate-600" : "bg-white text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Terminal / Output Panel */}
        <div className={`rounded-2xl border overflow-hidden flex flex-col ${panelBg}`}>
          <div className={`flex items-center justify-between border-b px-4 py-2.5 text-xs ${subHeaderBg}`}>
            <div className="flex items-center gap-2 font-bold">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Program Output &amp; Terminal</span>
            </div>

            {/* Execution status badges */}
            {result && (
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${statusColor(result.status?.id)}`}>
                  <StatusIcon id={result.status?.id} />
                  <span>{result.status?.description || "Finished"}</span>
                </span>

                {result.time && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Clock className="h-3 w-3" /> {result.time}
                  </span>
                )}

                {result.memory && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Cpu className="h-3 w-3" /> {result.memory}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-4 font-mono text-xs min-h-[120px] max-h-[260px] overflow-y-auto">
            {loading && (
              <div className="flex items-center gap-2 text-cyan-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Executing code in sandbox...</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{error}</span>
              </div>
            )}

            {!loading && compileErr && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                  <XCircle className="h-3.5 w-3.5" /> Compilation Error
                </p>
                <pre className="text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">
                  {compileErr}
                </pre>
              </div>
            )}

            {!loading && result && output && (
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
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
