"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Code2, Search, Loader2, BookOpen, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Shuffle, Lightbulb,
  FileCode, ArrowLeft, RefreshCw, Terminal, Play, List, Columns,
  Maximize2, Minimize2, Check, Copy, Tag
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

// Dynamically import CodeEditorWithRunner
const CodeEditorWithRunner = dynamic(
  () => import("@/components/CodeEditorWithRunner/page"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[550px] w-full flex flex-col items-center justify-center bg-[#1a1a1a] text-slate-400 gap-3 border border-white/10 rounded-xl">
        <Loader2 className="h-7 w-7 animate-spin text-[#00b8a3]" />
        <span className="text-xs font-mono font-bold tracking-wider text-slate-300">Loading FlowCode Editor...</span>
      </div>
    ),
  }
);

const LANG_MAP = {
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  python:     ["python3", "python", "py"],
  java:       ["java"],
  cpp:        ["cpp", "c++"],
  c:          ["c"],
  go:         ["golang", "go"],
  rust:       ["rust"],
};

export default function ProblemSolvingTab() {
  const { isDark } = useTheme();

  const [questions, setQuestions]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  const [search, setSearch]                   = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedTag, setSelectedTag]         = useState("all");

  const [selectedIndex, setSelectedIndex]     = useState(0);
  const [selectedLang, setSelectedLang]         = useState("javascript");
  const [viewMode, setViewMode]                 = useState("list"); // Default to "list" first as requested
  const [activeLeftTab, setActiveLeftTab]     = useState("description"); // "description" | "hints" | "tags"
  const [isFullScreen, setIsFullScreen]         = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        let res;
        try {
          res = await api.get("/questions");
        } catch (err1) {
          res = await api.get("/api/questions");
        }
        const json = res.data;
        const list = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        if (list.length > 0) {
          setQuestions(list);
          const twoSumIdx = list.findIndex((q) => q.frontendId === "1" || q.titleSlug === "two-sum");
          if (twoSumIdx !== -1) {
            setSelectedIndex(twoSumIdx);
          } else {
            setSelectedIndex(0);
          }
        } else {
          setError(json.message || "Failed to load questions.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Could not load questions. Please check server.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const selectedQuestion = questions[selectedIndex] || null;

  // Filtered list for Question Bank view mode
  const filteredQuestions = useMemo(() => {
    const list = questions.filter((q) => {
      const matchDiff = difficultyFilter === "all" || q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
      const matchSearch =
        !search ||
        q.title?.toLowerCase().includes(search.toLowerCase()) ||
        q.frontendId?.toString().includes(search) ||
        q.topicTags?.some((t) => t.name?.toLowerCase().includes(search.toLowerCase()));
      const matchTag =
        selectedTag === "all" ||
        q.topicTags?.some((t) => t.slug?.toLowerCase() === selectedTag.toLowerCase());

      return matchDiff && matchSearch && matchTag;
    });

    return list.sort((a, b) => {
      const numA = parseInt(a.frontendId, 10);
      const numB = parseInt(b.frontendId, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return (a.frontendId || "").localeCompare(b.frontendId || "");
    });
  }, [questions, search, difficultyFilter, selectedTag]);

  // Derive initial snippet for active question & selected language
  const currentSnippet = useMemo(() => {
    if (!selectedQuestion || !selectedQuestion.codeSnippets) return null;
    const matchSlugs = LANG_MAP[selectedLang] || [selectedLang];
    const match = selectedQuestion.codeSnippets.find((s) =>
      matchSlugs.includes(s.langSlug?.toLowerCase()) || matchSlugs.includes(s.lang?.toLowerCase())
    );
    return match ? match.code : null;
  }, [selectedQuestion, selectedLang]);

  // Helper for LeetCode difficulty color
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-[#00b8a3] bg-[#00b8a3]/10 border-[#00b8a3]/30";
      case "medium":
        return "text-[#ffc01e] bg-[#ffc01e]/10 border-[#ffc01e]/30";
      case "hard":
        return "text-[#ff375f] bg-[#ff375f]/10 border-[#ff375f]/30";
      default:
        return isDark ? "text-slate-300 bg-slate-500/10 border-slate-500/30" : "text-slate-700 bg-slate-200 border-slate-300";
    }
  };

  // Next / Prev handlers
  const handleNext = () => {
    if (selectedIndex < questions.length - 1) setSelectedIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedIndex((prev) => prev - 1);
  };
  const handleRandom = () => {
    const rand = Math.floor(Math.random() * questions.length);
    setSelectedIndex(rand);
  };

  // Dynamic theme class names
  const cardBg = isDark ? "bg-[#1a1a1a] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md";
  const headerBg = isDark ? "bg-[#242424] border-white/10" : "bg-slate-100 border-slate-200";
  const buttonNavBg = isDark
    ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900";
  const inputBg = isDark
    ? "bg-[#141414] border-white/10 text-white placeholder-slate-500"
    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400";
  const codeBoxBg = isDark ? "bg-[#ffffff0d] border-white/10 text-slate-200" : "bg-slate-100 border-slate-300 text-slate-800";
  const testcaseBg = isDark ? "bg-[#000000]/40 border-white/10 text-[#00b8a3]" : "bg-slate-100 border-slate-300 text-teal-700";

  return (
    <div className={`space-y-3 font-sans transition-all ${
      isFullScreen
        ? isDark
          ? "fixed inset-0 z-50 p-4 sm:p-6 bg-[#0B151E] text-white h-screen w-screen overflow-y-auto"
          : "fixed inset-0 z-50 p-4 sm:p-6 bg-slate-100 text-slate-900 h-screen w-screen overflow-y-auto"
        : "relative"
    }`}>

      {/* ── LEETCODE TOP TOOLBAR ───────────────────────────────────────────── */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border shadow-lg text-xs ${isDark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
        
        {/* Left: Problem navigation controls */}
        <div className="flex items-center gap-2">
          {/* Question Bank List button / Back button */}
          <button
            onClick={() => setViewMode(viewMode === "list" ? "split" : "list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-bold ${
              viewMode === "list"
                ? "bg-[#00b8a3] text-black border-[#00b8a3]"
                : buttonNavBg
            }`}
          >
            {viewMode === "list" ? (
              <>
                <List className="h-3.5 w-3.5" />
                <span>All Questions ({questions.length})</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
                <span>Back to Questions List</span>
              </>
            )}
          </button>

          <div className={`h-4 w-px mx-1 ${isDark ? "bg-white/10" : "bg-slate-300"}`} />

          {/* Prev / Next buttons */}
          <button
            onClick={handlePrev}
            disabled={selectedIndex === 0}
            title="Previous Problem"
            className={`p-1.5 rounded-xl border disabled:opacity-40 transition-all ${buttonNavBg}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={selectedIndex === questions.length - 1}
            title="Next Problem"
            className={`p-1.5 rounded-xl border disabled:opacity-40 transition-all ${buttonNavBg}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleRandom}
            title="Random Problem"
            className={`p-1.5 rounded-xl border transition-all ${buttonNavBg}`}
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>

          {/* Active Question Title Preview */}
          {selectedQuestion && (
            <span className={`font-extrabold hidden sm:inline-block ml-2 truncate max-w-[300px] ${isDark ? "text-white" : "text-slate-900"}`}>
              #{selectedQuestion.frontendId || selectedQuestion.questionId} — {selectedQuestion.title}
            </span>
          )}
        </div>

        {/* Right: Difficulty & Status Info & Maximize Button */}
        <div className="flex items-center gap-3">
          {selectedQuestion && (
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase ${getDifficultyBadge(selectedQuestion.difficulty)}`}>
              {selectedQuestion.difficulty}
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            {selectedIndex + 1} / {questions.length}
          </span>

          <div className={`h-4 w-px mx-0.5 ${isDark ? "bg-white/10" : "bg-slate-300"}`} />

          {/* Maximize / Fullscreen toggle button on the right */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen Workspace" : "Maximize Workspace (Occupies Complete Screen)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-extrabold ${
              isFullScreen
                ? "bg-amber-500 text-black border-amber-500 shadow-md"
                : buttonNavBg
            }`}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Maximize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── LOADING & ERROR STATES ────────────────────────────────────────── */}
      {loading && (
        <div className={`py-24 flex flex-col items-center justify-center gap-3 text-slate-400 rounded-3xl border ${cardBg}`}>
          <Loader2 className="h-8 w-8 animate-spin text-[#00b8a3]" />
          <p className="text-xs font-mono font-bold tracking-wide">Loading DSA Questions Dataset...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {/* ── MAIN WORKSPACE AREA ───────────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {/* VIEW MODE 1: FULL QUESTION BANK LIST ─────────────────────────── */}
          {viewMode === "list" && (
            <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>
              {/* Search & Filter Controls */}
              <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${headerBg}`}>
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, ID, or topic (e.g. Array, Two Sum)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-bold border outline-none focus:border-[#00b8a3] transition-all ${inputBg}`}
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {["all", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={`px-3 py-1.5 rounded-xl border transition-all capitalize ${
                        difficultyFilter === diff
                          ? diff === "Easy"
                            ? "bg-[#00b8a3] text-black border-[#00b8a3]"
                            : diff === "Medium"
                            ? "bg-[#ffc01e] text-black border-[#ffc01e]"
                            : diff === "Hard"
                            ? "bg-[#ff375f] text-white border-[#ff375f]"
                            : "bg-cyan-500 text-black border-cyan-500"
                          : buttonNavBg
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of Questions */}
              <div className="divide-y divide-slate-200/40 dark:divide-white/5 max-h-[620px] overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs italic">
                    No questions found matching your search filter.
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const globalIdx = questions.findIndex((item) => item.questionId === q.questionId);
                    const isSelected = selectedQuestion?.questionId === q.questionId;
                    return (
                      <div
                        key={q.questionId}
                        onClick={() => {
                          if (globalIdx !== -1) setSelectedIndex(globalIdx);
                          setViewMode("split");
                        }}
                        className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isSelected
                            ? isDark ? "bg-[#00b8a3]/10 border-l-4 border-l-[#00b8a3]" : "bg-teal-50 border-l-4 border-l-teal-600"
                            : isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="font-mono text-xs text-slate-400 font-bold w-12 shrink-0">
                            #{q.frontendId || q.questionId}
                          </span>
                          <div className="min-w-0 space-y-1">
                            <h4 className={`text-sm font-bold truncate hover:text-[#00b8a3] ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                              {q.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {q.topicTags?.slice(0, 4).map((tag) => (
                                <span
                                  key={tag.slug || tag.name}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                                  }`}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: LEETCODE SPLIT WORKSPACE ─────────────────────────── */}
          {viewMode === "split" && selectedQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              
              {/* ── LEFT PANEL: LEETCODE PROBLEM STATEMENT (5 cols) ────────── */}
              <div className={`lg:col-span-5 flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
                isFullScreen ? "h-[calc(100vh-90px)]" : "min-h-[650px] max-h-[820px]"
              } ${cardBg}`}>
                
                {/* LeetCode Tab Header */}
                <div className={`flex items-center border-b px-3 pt-2 gap-1 text-xs ${headerBg}`}>
                  <button
                    onClick={() => setActiveLeftTab("description")}
                    className={`px-3 py-2 font-bold rounded-t-xl transition-all border-b-2 ${
                      activeLeftTab === "description"
                        ? isDark ? "border-[#00b8a3] text-white bg-[#1a1a1a]" : "border-teal-600 text-teal-700 bg-white"
                        : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    Description
                  </button>

                  {selectedQuestion.hints && selectedQuestion.hints.length > 0 && (
                    <button
                      onClick={() => setActiveLeftTab("hints")}
                      className={`px-3 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                        activeLeftTab === "hints"
                          ? isDark ? "border-[#00b8a3] text-white bg-[#1a1a1a]" : "border-teal-600 text-teal-700 bg-white"
                          : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      Hints ({selectedQuestion.hints.length})
                    </button>
                  )}

                  {selectedQuestion.topicTags && selectedQuestion.topicTags.length > 0 && (
                    <button
                      onClick={() => setActiveLeftTab("tags")}
                      className={`px-3 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                        activeLeftTab === "tags"
                          ? isDark ? "border-[#00b8a3] text-white bg-[#1a1a1a]" : "border-teal-600 text-teal-700 bg-white"
                          : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <Tag className="h-3.5 w-3.5 text-sky-500" />
                      Topics
                    </button>
                  )}
                </div>

                {/* Left Panel Body */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed custom-scrollbar">
                  
                  {/* TAB 1: DESCRIPTION */}
                  {activeLeftTab === "description" && (
                    <div className="space-y-4">
                      {/* Title & Badges */}
                      <div className={`space-y-2 border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                        <h2 className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {selectedQuestion.frontendId || selectedQuestion.questionId}. {selectedQuestion.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase ${getDifficultyBadge(selectedQuestion.difficulty)}`}>
                            {selectedQuestion.difficulty}
                          </span>

                          {selectedQuestion.topicTags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag.slug || tag.name}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                              }`}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rendered LeetCode Description HTML */}
                      {selectedQuestion.description && (
                        <div
                          className={`prose max-w-none text-xs space-y-3 ${
                            isDark
                              ? "prose-invert text-slate-300 [&_p]:text-slate-300 [&_pre]:bg-[#ffffff0d] [&_pre]:border-white/10 [&_pre]:text-slate-200 [&_code]:text-[#eff1f6] [&_code]:bg-[#ffffff14] [&_strong]:text-white"
                              : "text-slate-700 [&_p]:text-slate-700 [&_pre]:bg-slate-100 [&_pre]:border-slate-300 [&_pre]:text-slate-900 [&_code]:text-teal-800 [&_code]:bg-slate-200/80 [&_strong]:text-slate-900"
                          } [&_p]:leading-relaxed [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:font-mono [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold`}
                          dangerouslySetInnerHTML={{ __html: selectedQuestion.description }}
                        />
                      )}

                      {/* Sample Test Case Box */}
                      {selectedQuestion.sampleTestCase && (
                        <div className={`space-y-1.5 pt-3 border-t ${isDark ? "border-white/10" : "border-slate-200"}`}>
                          <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                            Sample Test Case Input:
                          </p>
                          <pre className={`p-3 rounded-xl border font-mono text-[11px] whitespace-pre-wrap ${testcaseBg}`}>
                            {selectedQuestion.sampleTestCase}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: HINTS */}
                  {activeLeftTab === "hints" && selectedQuestion.hints && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4" /> Hints &amp; Approach Tips
                      </h3>
                      {selectedQuestion.hints.map((hint, idx) => (
                        <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-1 ${isDark ? "bg-[#242424] border-white/10 text-slate-200" : "bg-amber-50 border-amber-200 text-slate-800"}`}>
                          <strong className="text-amber-500 font-extrabold">Hint {idx + 1}:</strong>
                          <p className="leading-relaxed">{hint}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: TOPICS */}
                  {activeLeftTab === "tags" && selectedQuestion.topicTags && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-sky-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="h-4 w-4" /> Associated Topic Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.topicTags.map((tag) => (
                          <span
                            key={tag.slug || tag.name}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                              isDark ? "bg-[#242424] border-white/10 text-slate-200" : "bg-slate-100 border-slate-300 text-slate-800"
                            }`}
                          >
                            <Code2 className="h-3.5 w-3.5 text-sky-500" />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* ── RIGHT PANEL: CODE EDITOR & RUNNER (7 cols) ─────────────── */}
              <div className="lg:col-span-7 flex flex-col">
                <CodeEditorWithRunner
                  initialLanguage={selectedLang}
                  initialCode={currentSnippet}
                  initialStdin={selectedQuestion.sampleTestCase || ""}
                  onCodeChange={(code, lang) => setSelectedLang(lang)}
                />
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
}
