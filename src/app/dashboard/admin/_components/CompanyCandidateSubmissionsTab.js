"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Code2, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, XCircle,
  Clock, Cpu, User, Eye, Copy, Check, FileCode, Terminal, Download,
  Layers, ExternalLink, ChevronRight
} from "lucide-react";
import { api } from "@/api";

export default function CompanyCandidateSubmissionsTab({ user, isDark }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch submissions from company endpoint
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/code/company/submissions?limit=100");
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.warn("Error fetching submissions:", err.message);
      showToast("error", "Failed to load candidate submissions.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter submissions by search and select options
  const filteredSubmissions = submissions.filter((sub) => {
    const candidateName = (
      (sub.user?.firstName || "") + " " + (sub.user?.lastName || "") + " " + (sub.user?.username || "")
    ).toLowerCase();
    const candidateEmail = (sub.user?.email || "").toLowerCase();
    const questionTitle = (sub.questionTitle || "Custom Playground").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      candidateName.includes(query) ||
      candidateEmail.includes(query) ||
      questionTitle.includes(query);

    const isAccepted =
      sub.statusId === 3 ||
      (sub.statusDescription || "").toLowerCase().includes("accepted");

    let matchesStatus = true;
    if (statusFilter === "accepted") matchesStatus = isAccepted;
    else if (statusFilter === "wrong") matchesStatus = !isAccepted && (sub.statusDescription || "").toLowerCase().includes("wrong");
    else if (statusFilter === "error") matchesStatus = !isAccepted && !(sub.statusDescription || "").toLowerCase().includes("wrong");

    let matchesLang = true;
    if (langFilter !== "all") {
      matchesLang = (sub.language || "").toLowerCase().includes(langFilter.toLowerCase());
    }

    return matchesSearch && matchesStatus && matchesLang;
  });

  // Calculate high-level stats
  const totalSubmissions = submissions.length;
  const acceptedCount = submissions.filter(
    (s) => s.statusId === 3 || (s.statusDescription || "").toLowerCase().includes("accepted")
  ).length;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;
  const uniqueCandidates = new Set(submissions.map((s) => s.userId || s.user?.email).filter(Boolean)).size;

  // Visual Theme Tokens
  const cardBg = isDark
    ? "bg-[#0c131d]/90 border-cyan-500/20 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const innerBg = isDark
    ? "bg-[#070b12]/80 border-cyan-500/10"
    : "bg-slate-50 border-slate-200";
  const inputCls = isDark
    ? "bg-[#070b12] border-cyan-500/20 text-white placeholder-slate-500 focus:border-cyan-400"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-3 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <p className="text-2xl font-black text-cyan-400">{totalSubmissions}</p>
            <span className="text-[10px] text-slate-400">All candidate runs</span>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileCode className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accepted Solutions</span>
            <p className="text-2xl font-black text-emerald-400">{acceptedCount}</p>
            <span className="text-[10px] text-emerald-400/80 font-medium">Passed all test cases</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pass Rate</span>
            <p className="text-2xl font-black text-indigo-400">{acceptanceRate}%</p>
            <span className="text-[10px] text-slate-400">Overall benchmark</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assessed Candidates</span>
            <p className="text-2xl font-black text-amber-400">{uniqueCandidates}</p>
            <span className="text-[10px] text-slate-400">Unique test takers</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, email, or question title..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${inputCls}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${inputCls}`}
            >
              <option value="all">All Statuses</option>
              <option value="accepted">Accepted (Passed)</option>
              <option value="wrong">Wrong Answer</option>
              <option value="error">Errors & Timeouts</option>
            </select>

            {/* Language Filter */}
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${inputCls}`}
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
              title="Refresh submissions"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Submissions Table ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">Loading candidate submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileCode className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Submissions Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "all" || langFilter !== "all"
                ? "Try adjusting your search query or filter options."
                : "Candidate test submissions will appear here once candidates run or submit solutions."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"} font-bold`}>
                  <th className="pb-3 pl-2">Candidate</th>
                  <th className="pb-3">Problem / Challenge</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3">Result</th>
                  <th className="pb-3">Runtime & Memory</th>
                  <th className="pb-3">Submitted</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((sub) => {
                  const candidateName =
                    (sub.user?.firstName || "") + (sub.user?.lastName ? " " + sub.user.lastName : "") ||
                    sub.user?.username ||
                    "Candidate";
                  const candidateEmail = sub.user?.email || "N/A";
                  const isAccepted =
                    sub.statusId === 3 ||
                    (sub.statusDescription || "").toLowerCase().includes("accepted");
                  const isWrong = (sub.statusDescription || "").toLowerCase().includes("wrong");

                  return (
                    <tr
                      key={sub.executionId}
                      className={`hover:bg-cyan-500/5 transition-colors group`}
                    >
                      {/* Candidate Column */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                            {candidateName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{candidateName}</p>
                            <p className="text-[10px] text-slate-400">{candidateEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Problem Column */}
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-200">
                            {sub.questionTitle || "Coding Playground"}
                          </p>
                          {sub.difficulty && (
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                                sub.difficulty.toLowerCase() === "easy"
                                  ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-400"
                                  : sub.difficulty.toLowerCase() === "hard"
                                  ? "bg-rose-500/15 border-rose-400/30 text-rose-400"
                                  : "bg-amber-500/15 border-amber-400/30 text-amber-400"
                              }`}
                            >
                              {sub.difficulty}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Language */}
                      <td className="py-3.5">
                        <span className="font-mono text-[11px] px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-cyan-300 font-semibold">
                          {sub.language || "code"}
                        </span>
                      </td>

                      {/* Result / Status */}
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                            isAccepted
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : isWrong
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                          }`}
                        >
                          {isAccepted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5" />
                          )}
                          {sub.statusDescription || "Executed"}
                        </span>
                      </td>

                      {/* Runtime & Memory */}
                      <td className="py-3.5">
                        <div className="space-y-0.5 text-[11px] text-slate-300 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-cyan-400" />
                            <span>{sub.executionTime ? `${sub.executionTime}s` : "0.02s"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Cpu className="h-3 w-3 text-slate-500" />
                            <span>{sub.memoryUsed ? `${sub.memoryUsed} KB` : "1.2 MB"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently"}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 font-bold text-xs flex items-center gap-1.5 ml-auto transition-all shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" /> Inspect Code
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inspect Candidate Code Modal ── */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 ${cardBg}`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-cyan-400 text-black uppercase">
                    Submission Inspection
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      selectedSubmission.statusId === 3 ||
                      (selectedSubmission.statusDescription || "").toLowerCase().includes("accepted")
                        ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                        : "bg-rose-500/20 border-rose-400/40 text-rose-300"
                    }`}
                  >
                    {selectedSubmission.statusDescription || "Executed"}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedSubmission.questionTitle || "Coding Playground Code"}
                </h3>
                <p className="text-xs text-slate-400">
                  Candidate:{" "}
                  <span className="text-cyan-300 font-semibold">
                    {(selectedSubmission.user?.firstName || "") +
                      " " +
                      (selectedSubmission.user?.lastName || "") ||
                      selectedSubmission.user?.username ||
                      "Candidate"}
                  </span>{" "}
                  ({selectedSubmission.user?.email || "N/A"})
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border ${innerBg}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Language</span>
                  <p className="font-mono font-extrabold text-cyan-300 mt-0.5">
                    {selectedSubmission.language || "Code"}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${innerBg}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Execution Time</span>
                  <p className="font-mono font-extrabold text-emerald-400 mt-0.5">
                    {selectedSubmission.executionTime ? `${selectedSubmission.executionTime}s` : "0.02s"}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${innerBg}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Memory Used</span>
                  <p className="font-mono font-extrabold text-indigo-400 mt-0.5">
                    {selectedSubmission.memoryUsed ? `${selectedSubmission.memoryUsed} KB` : "1.2 MB"}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${innerBg}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Submitted Date</span>
                  <p className="font-semibold text-slate-200 mt-0.5">
                    {selectedSubmission.createdAt
                      ? new Date(selectedSubmission.createdAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>

              {/* Source Code Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="h-4 w-4 text-cyan-400" /> Candidate Source Code
                  </span>
                  <button
                    onClick={() => handleCopyCode(selectedSubmission.sourceCode)}
                    className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-2xl border border-white/10 bg-[#070b12] p-4 font-mono text-xs text-slate-100 overflow-x-auto max-h-72">
                  <pre>{selectedSubmission.sourceCode || "// No code available"}</pre>
                </div>
              </div>

              {/* Output / Stdout / Stderr / Compile Error */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-amber-400" /> Execution Terminal & Results
                </span>

                <div className="rounded-2xl border border-white/10 bg-[#05080e] p-4 font-mono text-xs space-y-3">
                  {/* Standard Output */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Standard Output (stdout):</span>
                    <p className="text-emerald-300 mt-0.5 whitespace-pre-wrap">
                      {selectedSubmission.stdout || "(Empty output)"}
                    </p>
                  </div>

                  {/* Standard Error */}
                  {selectedSubmission.stderr && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase font-bold text-rose-400">Standard Error (stderr):</span>
                      <p className="text-rose-300 mt-0.5 whitespace-pre-wrap">{selectedSubmission.stderr}</p>
                    </div>
                  )}

                  {/* Compile Output */}
                  {selectedSubmission.compileOutput && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Compiler Diagnostic:</span>
                      <p className="text-amber-300 mt-0.5 whitespace-pre-wrap">{selectedSubmission.compileOutput}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/10 flex items-center justify-between gap-3 bg-black/20">
              <span className="text-[11px] text-slate-400">
                Evaluation ID: <span className="font-mono text-cyan-300">{selectedSubmission.executionId}</span>
              </span>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
