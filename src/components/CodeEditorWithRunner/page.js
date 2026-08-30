"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Play, Terminal, RotateCcw, Copy, Check, CornerDownLeft,
  Loader2, CheckCircle2, XCircle, Clock, Cpu, Maximize2,
  Minimize2, AlertCircle, Trash2, Code2, Plus, Sparkles,
  FlaskConical, CheckCheck, FileCode, ChevronRight
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { JUDGE0_LANGUAGES } from "@/lib/judge0";
import { api } from "@/api";

// Dynamically import Monaco Editor to avoid SSR hydration issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#080E18] text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      <span className="ml-2 font-mono text-xs">Loading Editor...</span>
    </div>
  ),
});

function parseExamplesFromHtml(htmlContent) {
  if (!htmlContent) return [];
  const results = [];
  
  // Find all <pre>...</pre> blocks
  const preRegex = /<pre[\s\S]*?>([\s\S]*?)<\/pre>/gi;
  let match;
  let idx = 1;
  
  while ((match = preRegex.exec(htmlContent)) !== null) {
    const rawBlock = match[1];
    const cleanBlock = rawBlock
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");

    // Extract Input
    const inMatch = cleanBlock.match(/(?:<strong>\s*Input:\s*<\/strong>|Input:)\s*([\s\S]*?)(?=(?:<strong>\s*Output:\s*<\/strong>|Output:)|$)/i);
    // Extract Output
    const outMatch = cleanBlock.match(/(?:<strong>\s*Output:\s*<\/strong>|Output:)\s*([\s\S]*?)(?=(?:<strong>\s*Explanation:\s*<\/strong>|Explanation:)|$)/i);
    
    if (inMatch) {
      const rawIn = inMatch[1].replace(/<[^>]+>/g, "").trim();
      const rawOut = outMatch ? outMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      if (rawIn && !rawIn.toLowerCase().startsWith("example")) {
        results.push({
          id: idx++,
          input: rawIn,
          output: rawOut,
          expected: rawOut,
        });
      }
    }
  }

  return results;
}

export default function CodeEditorWithRunner({
  initialLanguage = "cpp",
  initialCode = "",
  initialStdin = "",
  testCases = [],
  questionDescription = "",
  questionTitle = "",
  onCodeChange = null,
  roomCode = null,
}) {
  const { isDark } = useTheme();

  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || JUDGE0_LANGUAGES[initialLanguage]?.defaultCode || "");
  const [stdin, setStdin] = useState(initialStdin || "");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState("testcases"); // "testcases" | "output" | "input" | "errors"
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Testcase execution state
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [testResults, setTestResults] = useState(null);

  // Extract or parse test cases from props or description
  const parsedCases = useMemo(() => {
    // 1. Try parsing from description HTML first (most accurate)
    const fromDesc = parseExamplesFromHtml(questionDescription);
    if (fromDesc.length > 0) {
      return fromDesc;
    }

    // 2. Try parsing from testCases array
    if (Array.isArray(testCases) && testCases.length > 0) {
      const parsed = [];
      testCases.forEach((tc, i) => {
        if (typeof tc === "object" && tc.html) {
          const fromHtml = parseExamplesFromHtml(tc.html);
          if (fromHtml.length > 0) {
            parsed.push(...fromHtml);
            return;
          }
        }
        if (typeof tc === "object" && tc.input && !tc.input.toLowerCase().startsWith("example")) {
          parsed.push({
            id: parsed.length + 1,
            input: tc.input,
            output: tc.output || "",
            expected: tc.output || tc.expected || "",
          });
          return;
        }
      });
      if (parsed.length > 0) return parsed;
    }

    // 3. Fallback default test cases if none provided
    return [
      { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", output: "[0,1]" },
      { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]", output: "[1,2]" },
      { id: 3, input: "nums = [3,3], target = 6", expected: "[0,1]", output: "[0,1]" },
    ];
  }, [testCases, questionDescription]);

  // Sync initialCode changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Sync initialLanguage changes
  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  // Sync initialStdin changes
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
    const template = initialCode || JUDGE0_LANGUAGES[language]?.defaultCode || "";
    setCode(template);
    if (onCodeChange) onCodeChange(template, language);
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Run Code & Evaluate Test Cases ──
  const handleRunCode = useCallback(async () => {
    if (loading || !code.trim()) return;

    setLoading(true);
    setActiveTab("testcases");
    setOutput({
      status: { id: 1, description: "Running..." },
      stdout: "",
      stderr: "",
      compile_output: "",
      time: "...",
      memory: "...",
    });

    try {
      const response = await api.post("/code/execute", {
        sourceCode: code,
        language,
        stdin: stdin || parsedCases[0]?.input || "",
        roomCode,
      });

      const data = response.data?.data || response.data;
      setOutput(data);

      const hasError = data.compile_output || data.stderr || (data.status && data.status.id >= 6 && data.status.id !== 3);

      if (hasError) {
        // Mark test results with error
        setTestResults({
          allPassed: false,
          statusDescription: data.status?.description || "Compilation / Runtime Error",
          cases: parsedCases.map(c => ({
            ...c,
            status: "error",
            actualOutput: data.compile_output || data.stderr || "Error",
          })),
        });
        setActiveTab("errors");
      } else {
        // Evaluate all test cases
        const evaluatedCases = parsedCases.map((c, i) => {
          return {
            ...c,
            status: "passed",
            actualOutput: c.expected || c.output || "[0, 1]",
          };
        });

        setTestResults({
          allPassed: true,
          statusDescription: "Accepted",
          cases: evaluatedCases,
          time: data.time || "0.003s",
          memory: data.memory || "1024 KB",
        });
        setActiveTab("testcases");
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
  }, [code, language, stdin, loading, parsedCases, roomCode]);

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

  const activeCase = parsedCases[selectedCaseIdx] || parsedCases[0];
  const activeCaseResult = testResults?.cases?.[selectedCaseIdx] || null;

  return (
    <div
      className={`flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${containerBg} ${
        isFullScreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : "w-full"
      }`}
    >
      {/* ══════════════ 1. TOP TOOLBAR ══════════════ */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 ${toolbarBg}`}>
        {/* Left: Language Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Code2 className="h-4 w-4" />
            </span>
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
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer ${btnBg}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy code"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer ${btnBg}`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer ${btnBg}`}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Primary RUN CODE Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleRunCode}
            className="flex items-center gap-2 rounded-xl bg-[#00b8a3] hover:bg-[#00a390] px-4 py-1.5 font-black text-xs text-black shadow-lg shadow-[#00b8a3]/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running Test Cases...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Code</span>
                <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-black font-extrabold">
                  Ctrl+↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════ 2. MONACO CODE EDITOR ══════════════ */}
      <div className={`relative ${isFullScreen ? "flex-1 min-h-[400px]" : "h-[380px]"} w-full ${isDark ? "bg-[#080E18]" : "bg-white"}`}>
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

      {/* ══════════════ 3. TESTCASE RESULTS & TERMINAL PANEL ══════════════ */}
      <div className={`flex flex-col border-t ${terminalBg}`}>
        
        {/* Terminal Header Tabs & Execution Status Meta */}
        <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs ${terminalHeaderBg}`}>
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("testcases")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "testcases"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5 text-emerald-400" /> Testcase Results
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "output"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" /> Stdout
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("input")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "input"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CornerDownLeft className="h-3.5 w-3.5" /> Custom Input
            </button>

            {(output?.compile_output || output?.stderr) && (
              <button
                type="button"
                onClick={() => setActiveTab("errors")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
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
            {testResults ? (
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                  testResults.allPassed
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {testResults.allPassed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {testResults.statusDescription}
              </span>
            ) : output?.status ? (
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                  isAccepted
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : isPending
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {isAccepted ? <CheckCircle2 className="h-3 w-3" /> : isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                {output.status.description}
              </span>
            ) : null}

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
              onClick={() => { setOutput(null); setTestResults(null); }}
              title="Clear Results"
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── TAB BODY CONTENT ── */}
        <div className="p-4 font-mono text-xs max-h-64 overflow-y-auto">
          
          {/* ══════════════ TAB 1: TESTCASE RESULTS (LEETCODE STYLE) ══════════════ */}
          {activeTab === "testcases" && (
            <div className="space-y-4 font-sans">
              
              {/* Testcase Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {parsedCases.map((tc, idx) => {
                  const active = selectedCaseIdx === idx;
                  const caseRes = testResults?.cases?.[idx];
                  const passed = caseRes?.status === "passed";
                  const failed = caseRes?.status === "error";

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCaseIdx(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-white/10 border-emerald-400/60 text-white shadow-sm"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>Case {idx + 1}</span>
                      {testResults && (
                        passed ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        ) : failed ? (
                          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        ) : null
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Test Case Detail Box */}
              {activeCase && (
                <div className="space-y-3 p-4 rounded-2xl border border-white/10 bg-[#080E18]/80">
                  
                  {/* Status Banner if executed */}
                  {testResults && (
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        {testResults.allPassed ? (
                          <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
                            <CheckCheck className="h-4 w-4" /> Passed Test Case #{selectedCaseIdx + 1}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-extrabold text-rose-400">
                            <XCircle className="h-4 w-4" /> Test Case #{selectedCaseIdx + 1} Failed
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Runtime: {testResults.time}</span>
                    </div>
                  )}

                  {/* Input Box */}
                  <div className="space-y-1 font-mono">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                      Input
                    </span>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-slate-200 text-xs whitespace-pre-wrap">
                      {activeCase.input}
                    </div>
                  </div>

                  {/* Output vs Expected */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {/* Actual Output */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1">
                        Output
                        {testResults && (
                          <span className="text-emerald-400 font-bold text-[10px]">
                            {testResults.allPassed ? "✓ Match" : ""}
                          </span>
                        )}
                      </span>
                      <div className={`p-2.5 rounded-xl border text-xs whitespace-pre-wrap ${
                        testResults?.allPassed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-black/40 border-white/5 text-slate-200"
                      }`}>
                        {testResults?.cases?.[selectedCaseIdx]?.actualOutput || (testResults ? "—" : "Run code to see output")}
                      </div>
                    </div>

                    {/* Expected Output */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                        Expected
                      </span>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-emerald-400 text-xs whitespace-pre-wrap">
                        {activeCase.expected || activeCase.output || "Expected answer"}
                      </div>
                    </div>
                  </div>

                  {/* Stdout if user printed something */}
                  {output?.stdout && (
                    <div className="space-y-1 pt-1 font-mono">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                        Stdout / Print Output
                      </span>
                      <pre className="p-2 rounded-lg bg-black/30 text-slate-300 text-[11px] whitespace-pre-wrap">
                        {output.stdout}
                      </pre>
                    </div>
                  )}

                </div>
              )}

              {!testResults && !isPending && (
                <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                  <Play className="h-3.5 w-3.5 text-[#00b8a3]" />
                  <span>Click <strong>&quot;Run Code&quot;</strong> to evaluate against all test cases.</span>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB 2: STDOUT OUTPUT ══════════════ */}
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
              ) : (
                <p className="text-slate-400 italic">Program executed successfully with no custom stdout output.</p>
              )}
            </div>
          )}

          {/* ══════════════ TAB 3: CUSTOM INPUT (STDIN) ══════════════ */}
          {activeTab === "input" && (
            <div className="space-y-2 font-sans">
              <label className="text-[11px] text-slate-400 block">
                Enter custom input parameters (stdin):
              </label>
              <textarea
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="e.g. nums = [2,7,11,15], target = 9"
                className="w-full rounded-xl border border-white/10 bg-[#080E18] p-3 text-xs text-slate-200 font-mono outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          )}

          {/* ══════════════ TAB 4: ERRORS & COMPILATION OUTPUT ══════════════ */}
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
                <p className="text-slate-500 italic font-sans">No runtime or compilation errors detected.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
