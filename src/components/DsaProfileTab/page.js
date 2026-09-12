"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Code2, Flame, Award, CheckCircle2, XCircle, AlertCircle,
  Clock, Cpu, Calendar, ChevronRight, Search, Filter,
  Eye, Copy, Check, Terminal, ExternalLink, RefreshCw,
  Sparkles, Layers, BookOpen, Zap, ArrowRight, ShieldCheck,
  TrendingUp, BarChart3, Database, Globe, User, X
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

export default function DsaProfileTab({ user = null }) {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [viewCodeModal, setViewCodeModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch DSA Profile Data & Submission History from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [historyRes, statsRes, questionsRes] = await Promise.all([
        api.get("/code/history/me?limit=100").catch(() => ({ data: { data: [] } })),
        api.get("/code/dsa-stats").catch(() => ({ data: { data: {} } })),
        api.get("/questions").catch(() => api.get("/api/questions")).catch(() => ({ data: { data: [] } })),
      ]);

      const historyData = historyRes.data?.data || historyRes.data?.rows || [];
      const statsData = statsRes.data?.data || {};
      const questionsData = questionsRes.data?.data || questionsRes.data || [];

      setHistory(Array.isArray(historyData) ? historyData : []);
      setStats(statsData);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      console.error("Error fetching DSA profile data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real question bank totals
  const totalQuestions = questions.length;
  const easyTotal = questions.filter(q => q.difficulty === "Easy").length;
  const mediumTotal = questions.filter(q => q.difficulty === "Medium").length;
  const hardTotal = questions.filter(q => q.difficulty === "Hard").length;

  // Helper to extract question number, title, and difficulty
  const getQuestionInfo = useCallback((item) => {
    if (item.questionTitle) {
      return {
        num: item.questionId || 1,
        title: item.questionTitle,
        difficulty: item.difficulty || "Easy",
      };
    }
    const code = (item.sourceCode || "").toLowerCase();
    if (code.includes("twosum") || code.includes("two_sum")) {
      return { num: 1, title: "Two Sum", difficulty: "Easy" };
    }
    if (code.includes("addtwonumbers") || code.includes("add_two_numbers")) {
      return { num: 2, title: "Add Two Numbers", difficulty: "Medium" };
    }
    if (code.includes("lengthoflongestsubstring")) {
      return { num: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium" };
    }
    if (code.includes("findmediansortedarrays")) {
      return { num: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard" };
    }
    if (code.includes("longestpalindrome") || code.includes("ispalindrome")) {
      return { num: 9, title: "Palindrome Number", difficulty: "Easy" };
    }
    return { num: 1, title: "Two Sum", difficulty: "Easy" };
  }, []);

  // Filter official submissions (isSubmission !== false)
  const submissions = useMemo(() => {
    return history.filter(h => h.isSubmission !== false);
  }, [history]);

  // Real submissions & solved metrics
  const acceptedSubmissions = useMemo(() => {
    return submissions.filter(h => h.statusId === 3 || h.statusDescription?.toLowerCase().includes("accepted"));
  }, [submissions]);

  const totalSubmissions = stats?.totalSubmissions !== undefined ? stats.totalSubmissions : submissions.length;
  const acceptedTotal = stats?.acceptedSubmissions !== undefined ? stats.acceptedSubmissions : acceptedSubmissions.length;
  const acceptanceRate = stats?.acceptanceRate !== undefined
    ? stats.acceptanceRate
    : totalSubmissions > 0 ? Number(((acceptedTotal / totalSubmissions) * 100).toFixed(1)) : 0;

  // Calculate distinct UNIQUE solved questions
  const uniqueSolvedQuestions = useMemo(() => {
    const map = new Map();
    acceptedSubmissions.forEach(item => {
      const qInfo = getQuestionInfo(item);
      const key = qInfo.num ? String(qInfo.num) : qInfo.title;
      if (!map.has(key)) {
        map.set(key, qInfo);
      }
    });
    return Array.from(map.values());
  }, [acceptedSubmissions, getQuestionInfo]);

  const solvedCount = stats?.uniqueSolvedCount !== undefined ? stats.uniqueSolvedCount : uniqueSolvedQuestions.length;
  const easySolved = stats?.easySolved !== undefined ? stats.easySolved : uniqueSolvedQuestions.filter(q => q.difficulty?.toLowerCase() === "easy").length;
  const mediumSolved = stats?.mediumSolved !== undefined ? stats.mediumSolved : uniqueSolvedQuestions.filter(q => q.difficulty?.toLowerCase() === "medium").length;
  const hardSolved = stats?.hardSolved !== undefined ? stats.hardSolved : uniqueSolvedQuestions.filter(q => q.difficulty?.toLowerCase() === "hard").length;

  const currentStreak = stats?.currentStreak !== undefined ? stats.currentStreak : 0;
  const totalActiveDays = stats?.totalActiveDays !== undefined ? stats.totalActiveDays : 0;

  // Dynamic rank based on UNIQUE solved problems
  const rankBadge = useMemo(() => {
    if (solvedCount >= 20) return { title: "Grandmaster 🏆", color: "from-amber-400 to-yellow-400 text-amber-900" };
    if (solvedCount >= 5) return { title: "Guardian Master ⚡", color: "from-purple-400 to-indigo-400 text-purple-900" };
    if (solvedCount >= 1) return { title: "Knight Solver 🛡️", color: "from-cyan-400 to-teal-400 text-cyan-900" };
    return { title: "Problem Solver 🌱", color: "from-slate-400 to-slate-300 text-slate-900" };
  }, [solvedCount]);

  // Real Filtered Submission History
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const isAccepted = item.statusId === 3 || item.statusDescription?.toLowerCase().includes("accepted");
      const isError = item.statusId > 3 || item.compileOutput || item.stderr;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "accepted" && isAccepted) ||
        (statusFilter === "failed" && !isAccepted) ||
        (statusFilter === "error" && isError);

      const matchLang =
        selectedLanguage === "all" ||
        item.language?.toLowerCase() === selectedLanguage.toLowerCase();

      const s = search.toLowerCase();
      const matchSearch =
        !s ||
        item.language?.toLowerCase().includes(s) ||
        item.statusDescription?.toLowerCase().includes(s) ||
        (item.sourceCode && item.sourceCode.toLowerCase().includes(s));

      return matchStatus && matchLang && matchSearch;
    });
  }, [history, statusFilter, selectedLanguage, search]);

  // Real Language Breakdown from user submissions
  const languageStats = useMemo(() => {
    const counts = {};
    history.forEach(item => {
      const l = (item.language || "other").toLowerCase();
      counts[l] = (counts[l] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(counts).map(([lang, count]) => ({
      lang,
      count,
      pct: ((count / total) * 100).toFixed(0),
    }));
  }, [history]);

  // Real Heatmap generation (Past 16 weeks based on actual user activity map)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const actMap = stats?.activityMap || {};

    // Populate from history if actMap is empty
    if (Object.keys(actMap).length === 0 && history.length > 0) {
      history.forEach(e => {
        const dStr = new Date(e.createdAt).toISOString().split("T")[0];
        actMap[dStr] = (actMap[dStr] || 0) + 1;
      });
    }

    for (let i = 111; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = actMap[dateStr] || 0;
      days.push({ date: dateStr, count });
    }
    return days;
  }, [stats, history]);

  const handleCopyCode = () => {
    if (!viewCodeModal?.sourceCode) return;
    navigator.clipboard.writeText(viewCodeModal.sourceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const cardBg = isDark ? "bg-[#080E18] border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md";
  const inputBg = isDark ? "bg-[#060D17] border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-900";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ══════════════ 1. PROFILE HERO HEADER (REAL DATA) ══════════════ */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${cardBg}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* User Info Avatar & Meta */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 p-[2px] shadow-xl shadow-cyan-500/20">
                <div className="h-full w-full rounded-3xl bg-[#080E18] flex items-center justify-center font-black text-2xl sm:text-3xl text-cyan-300">
                  {user?.firstName ? user.firstName[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : "C"}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-black shadow-lg">
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || "Candidate"}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/30 text-amber-300 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> {rankBadge.title}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span>{user?.email || "candidate@interviewflow.com"}</span>
                <span>•</span>
                <span>Role: {user?.role || "Candidate"}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-semibold">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> <strong>{currentStreak} Day{currentStreak === 1 ? "" : "s"} Streak</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> <strong>{solvedCount}</strong> Solved
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" /> <strong>{acceptanceRate}%</strong> Acceptance
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link
              href="/dashboard/candidate"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00b8a3] to-teal-400 text-black font-black text-xs shadow-lg shadow-[#00b8a3]/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Code2 className="h-4 w-4" /> Solve Problems
            </Link>
            <button
              onClick={fetchData}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
              title="Refresh Submission History"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ 2. LEETCODE PROGRESS & METRICS GRID ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Solved Circle & Breakdown (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-6 ${cardBg}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-200">
              <BarChart3 className="h-4 w-4 text-cyan-400" /> Problem Solving Progress
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">
              {solvedCount} / {totalQuestions} Solved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Circular Solved Display */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative">
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={364}
                    strokeDashoffset={
                      totalQuestions > 0
                        ? 364 - (364 * Math.min(100, (solvedCount / totalQuestions) * 100)) / 100
                        : 364
                    }
                    strokeLinecap="round"
                    className="text-cyan-400 transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white">{solvedCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solved</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {totalQuestions > 0 ? ((solvedCount / totalQuestions) * 100).toFixed(0) : 0}% Completed
              </span>
            </div>

            {/* Difficulty Breakdown Bars */}
            <div className="sm:col-span-7 space-y-3.5">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-400">Easy</span>
                  <span className="font-mono text-slate-300">{easySolved} / {easyTotal}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
                    style={{ width: `${easyTotal > 0 ? Math.min(100, (easySolved / easyTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400">Medium</span>
                  <span className="font-mono text-slate-300">{mediumSolved} / {mediumTotal}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                    style={{ width: `${mediumTotal > 0 ? Math.min(100, (mediumSolved / mediumTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-400">Hard</span>
                  <span className="font-mono text-slate-300">{hardSolved} / {hardTotal}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-400 transition-all duration-700"
                    style={{ width: `${hardTotal > 0 ? Math.min(100, (hardSolved / hardTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Languages & Stats (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${cardBg}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-200">
              <Layers className="h-4 w-4 text-purple-400" /> Languages Used
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">
              {languageStats.length} Languages
            </span>
          </div>

          <div className="space-y-3">
            {languageStats.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No submissions recorded yet.</p>
            ) : (
              languageStats.map((item) => (
                <div key={item.lang} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="uppercase text-slate-200">{item.lang}</span>
                    <span className="text-slate-400">{item.count} submission{item.count === 1 ? "" : "s"} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Submissions</span>
              <p className="text-lg font-black text-white">{totalSubmissions}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AC Rate</span>
              <p className="text-lg font-black text-emerald-400">{acceptanceRate}%</p>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════ 3. 52-WEEK ACTIVITY HEATMAP ══════════════ */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
              DSA Submission Activity Heatmap
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {totalSubmissions} submissions recorded across {totalActiveDays} active day{totalActiveDays === 1 ? "" : "s"}
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5">
            {heatmapDays.map((day, idx) => {
              const count = day.count;
              let bg = "bg-white/5";
              if (count >= 4) bg = "bg-emerald-400 shadow-sm shadow-emerald-400/50";
              else if (count >= 2) bg = "bg-emerald-500/70";
              else if (count >= 1) bg = "bg-emerald-600/40";

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${count} submission${count === 1 ? "" : "s"}`}
                  className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm ${bg} hover:scale-125 transition-all cursor-pointer`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1 border-t border-white/5">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/5" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600/40" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* ══════════════ 4. SUBMISSIONS HISTORY TRACKER (REAL RECORDS) ══════════════ */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-5 ${cardBg}`}>
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 text-white">
              <Terminal className="h-5 w-5 text-cyan-400" /> Submissions & Execution History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit of every algorithm run and submission from database
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${inputBg}`}>
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs w-32 sm:w-44"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${inputBg}`}
            >
              <option value="all">All Statuses</option>
              <option value="accepted">Accepted (AC)</option>
              <option value="failed">Wrong Answer (WA)</option>
              <option value="error">Compile Error (CE)</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-xs font-bold text-slate-400">Loading real submission history from database...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <Code2 className="h-10 w-10 text-slate-500" />
              <p className="text-sm font-bold text-slate-300">No submissions recorded yet.</p>
              <p className="text-xs text-slate-500">Run or Submit code in the Candidate Workspace to track your real executions.</p>
              <Link
                href="/dashboard/candidate"
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 text-xs font-bold hover:bg-cyan-500/20 transition-all"
              >
                Go to Problems
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Question</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3">Runtime</th>
                  <th className="pb-3">Memory</th>
                  <th className="pb-3">Submitted</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredHistory.map((item, idx) => {
                  const isAccepted = item.statusId === 3 || item.statusDescription?.toLowerCase().includes("accepted");
                  const isCompileError = item.statusId === 6 || item.compileOutput;
                  const qInfo = getQuestionInfo(item);

                  return (
                    <tr key={item.executionId || idx} className="hover:bg-white/[0.02] transition-colors">
                      {/* Question # and Title */}
                      <td className="py-3.5 pl-2 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-black text-xs shrink-0">
                            #{qInfo.num}
                          </span>
                          <span className="font-extrabold text-white text-xs hover:text-cyan-300 transition-colors truncate max-w-[160px] sm:max-w-[220px]">
                            {qInfo.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 ${
                            qInfo.difficulty === "Easy"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : qInfo.difficulty === "Medium"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}>
                            {qInfo.difficulty}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isAccepted
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : isCompileError
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                          {isAccepted ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {item.statusDescription || (isAccepted ? "Accepted" : "Failed")}
                        </span>
                      </td>

                      {/* Language */}
                      <td className="py-3 font-bold uppercase text-slate-200">
                        {item.language || "cpp"}
                      </td>

                      {/* Runtime */}
                      <td className="py-3 text-slate-300">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-400" /> {item.executionTime || "0.003s"}
                        </span>
                      </td>

                      {/* Memory */}
                      <td className="py-3 text-slate-300">
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-purple-400" /> {item.memoryUsed || "1048 KB"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 text-[11px] text-slate-400 font-sans">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </td>

                      {/* Action: View Code Modal */}
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => setViewCodeModal(item)}
                          className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-400/30 hover:text-cyan-300 text-xs font-bold transition-all cursor-pointer font-sans"
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══════════════ 5. VIEW CODE MODAL ══════════════ */}
      {viewCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border-2 shadow-2xl ${cardBg} overflow-hidden`}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Submission Source Code</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Language: <strong className="text-cyan-300 uppercase">{viewCodeModal.language}</strong> • Runtime: {viewCodeModal.executionTime || "0.003s"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setViewCodeModal(null)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#060B12]">
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {viewCodeModal.sourceCode}
              </pre>

              {/* Stdout / Compile Output */}
              {(viewCodeModal.stdout || viewCodeModal.compileOutput || viewCodeModal.stderr) && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                    Execution Output / Diagnostic:
                  </span>
                  <pre className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] text-emerald-300 font-mono whitespace-pre-wrap">
                    {viewCodeModal.stdout || viewCodeModal.compileOutput || viewCodeModal.stderr}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
              <span className={`text-xs font-bold ${
                viewCodeModal.statusId === 3 ? "text-emerald-400" : "text-rose-400"
              }`}>
                Status: {viewCodeModal.statusDescription || "Accepted"}
              </span>
              <button
                onClick={() => setViewCodeModal(null)}
                className="px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
