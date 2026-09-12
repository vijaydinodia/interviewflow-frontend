"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Code2, Plus, Search, Filter, Trash2, Edit2, Play, CheckCircle2,
  AlertCircle, Loader2, X, RefreshCw, Layers, Terminal, Sparkles, BookOpen
} from "lucide-react";
import { api } from "@/api";
import dynamic from "next/dynamic";

// Dynamically import CodeEditorWithRunner to avoid SSR issues
const CodeEditorWithRunner = dynamic(
  () => import("@/components/CodeEditorWithRunner/page"),
  { ssr: false }
);

const EMPTY_QUESTION = {
  title: "",
  difficulty: "Medium",
  description: "",
  topicTagsInput: "Algorithms, Problem Solving",
  constraints: "1 <= n <= 10^5",
  examples: [
    { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", expected: "[0, 1]" },
    { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", expected: "[1, 2]" },
  ],
};

export default function CompanyQuestionBankTab({ user, isDark }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_QUESTION);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch company's own custom questions (or platform questions if none yet)
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      // First try to fetch questions created by this company
      const res = await api.get("/questions/company/my-questions");
      if (res.data?.success) {
        setQuestions(res.data.data || []);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.warn("Could not fetch company questions, fetching public list:", err.message);
      try {
        const fallbackRes = await api.get("/questions");
        if (fallbackRes.data?.success) {
          setQuestions(fallbackRes.data.data || []);
        }
      } catch (e) {
        showToast("error", "Failed to load questions.");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_QUESTION);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setEditingId(q.questionId || q.id);
    const tagsStr = Array.isArray(q.topicTags)
      ? q.topicTags.map((t) => t.name || t).join(", ")
      : typeof q.topicTags === "string"
      ? q.topicTags
      : "";

    setFormData({
      title: q.title || "",
      difficulty: q.difficulty || "Medium",
      description: q.description || "",
      topicTagsInput: tagsStr || "Algorithms",
      constraints: q.constraints || "",
      examples: Array.isArray(q.examples) && q.examples.length > 0
        ? q.examples
        : [
            { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", expected: "[0, 1]" }
          ],
    });
    setModalOpen(true);
  };

  // Add / Remove Test Case Row
  const handleAddTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", expected: "" }],
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...formData.examples];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "output") {
      updated[index].expected = value;
    }
    setFormData((prev) => ({ ...prev, examples: updated }));
  };

  const handleRemoveTestCase = (index) => {
    if (formData.examples.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  // Save (Create or Update) Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("error", "Question title is required.");
      return;
    }
    if (!formData.description.trim()) {
      showToast("error", "Question description is required.");
      return;
    }

    // Process topic tags
    const tagsArray = formData.topicTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => ({ name: t, slug: t.toLowerCase().replace(/\s+/g, "-") }));

    const payload = {
      title: formData.title.trim(),
      difficulty: formData.difficulty,
      description: formData.description.trim(),
      topicTags: tagsArray,
      constraints: formData.constraints.trim(),
      examples: formData.examples.filter((ex) => ex.input.trim() !== ""),
    };

    setSaving(true);
    try {
      if (editingId) {
        // Update
        const res = await api.put(`/questions/${editingId}`, payload);
        if (res.data?.success) {
          showToast("success", "Question updated successfully!");
          setModalOpen(false);
          fetchQuestions();
        } else {
          showToast("error", res.data?.message || "Failed to update question.");
        }
      } else {
        // Create
        const res = await api.post("/questions", payload);
        if (res.data?.success) {
          showToast("success", "New question added to your company bank!");
          setModalOpen(false);
          fetchQuestions();
        } else {
          showToast("error", res.data?.message || "Failed to create question.");
        }
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Error saving question.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await api.delete(`/questions/${questionId}`);
      if (res.data?.success) {
        showToast("success", "Question deleted.");
        fetchQuestions();
      } else {
        showToast("error", res.data?.message || "Failed to delete question.");
      }
    } catch (err) {
      showToast("error", "Error deleting question.");
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      (q.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (q.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesDiff =
      difficultyFilter === "all" ||
      (q.difficulty || "").toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  const cardBg = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5" : "bg-slate-50 border-slate-100";
  const inputCls = `w-full rounded-xl border p-2.5 text-xs outline-none transition-colors focus:border-cyan-400 ${
    isDark
      ? "border-white/10 bg-[#080E18] text-white placeholder-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-900"
  }`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border ${
            toast.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
              : "bg-red-500/20 border-red-400/40 text-red-300"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl border bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border-cyan-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
              <Code2 className="h-4 w-4" /> Company Technical Assessment Bank
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Create &amp; Manage Your Hiring Challenges
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Build proprietary coding questions, define input/output test cases, and evaluate candidate engineering skills in live interviews and screening rounds.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:brightness-110 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add New Challenge
            </button>
            <button
              onClick={fetchQuestions}
              title="Refresh question bank"
              className={`p-2.5 rounded-xl border text-slate-400 hover:text-white transition-colors cursor-pointer ${
                isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-300"
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${cardBg}`}>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges by title..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none focus:border-cyan-400 ${
              isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-bold">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
              isDark ? "bg-[#0B151E] border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>
          <span className="text-xs font-mono text-slate-400 pl-2">
            ({filteredQuestions.length} challenges)
          </span>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-xs text-slate-400 font-mono">Loading company question bank...</span>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${cardBg}`}>
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Challenges Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || difficultyFilter !== "all"
              ? "No questions match your current search or filter."
              : "Your company question bank is currently empty. Create your first hiring challenge now!"}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all cursor-pointer"
          >
            + Create First Challenge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q, idx) => {
            const diffColor =
              q.difficulty === "Easy"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : q.difficulty === "Hard"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30";

            const tagList = Array.isArray(q.topicTags)
              ? q.topicTags.slice(0, 3)
              : [];

            const testCaseCount = Array.isArray(q.examples) ? q.examples.length : 0;

            return (
              <div
                key={q.questionId || q.id || idx}
                className={`p-5 rounded-2xl border transition-all hover:border-cyan-500/30 space-y-3.5 flex flex-col justify-between ${cardBg}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      #{q.frontendId || idx + 1}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase border ${diffColor}`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1 hover:text-cyan-400 transition-colors">
                    {q.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {(q.description || "").replace(/<[^>]*>?/gm, "")}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tagList.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-white/5 text-slate-300 border border-white/5"
                      >
                        {tag.name || tag}
                      </span>
                    ))}
                    {testCaseCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {testCaseCount} Test Cases
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className={`pt-3 border-t flex items-center justify-between ${isDark ? "border-white/5" : "border-slate-100"}`}>
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Preview &amp; Test Code
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(q)}
                      title="Edit question"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.questionId || q.id)}
                      title="Delete question"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════ CREATE / EDIT QUESTION MODAL ══════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] ${
              isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    {editingId ? "Edit Technical Challenge" : "Create New Hiring Challenge"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define problem statement, difficulty, and automated test cases
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-xs font-semibold overflow-y-auto flex-1">
              <div>
                <label className="block mb-1 font-bold text-slate-300">Challenge Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Design An In-Memory Transaction Log"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-slate-300">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-300">Topic Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.topicTagsInput}
                    onChange={(e) => setFormData({ ...formData, topicTagsInput: e.target.value })}
                    placeholder="e.g. Array, Hash Table, Algorithms"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the problem, requirements, inputs, and expected return value..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Constraints (optional)</label>
                <input
                  type="text"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="e.g. 1 <= nums.length <= 10^5, -10^9 <= target <= 10^9"
                  className={inputCls}
                />
              </div>

              {/* ── Test Cases Section ── */}
              <div className={`p-4 rounded-2xl border space-y-3 ${innerBg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-cyan-400">
                      Automated Evaluation Test Cases
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Candidates must pass these input/output test cases in the code editor
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-bold cursor-pointer"
                  >
                    + Add Test Case
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.examples.map((tc, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border space-y-2 relative ${
                        isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Case #{idx + 1}
                        </span>
                        {formData.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-slate-500 hover:text-rose-400 text-[10px]"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Input:</span>
                          <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
                            placeholder="e.g. nums = [2,7,11,15], target = 9"
                            className="w-full rounded-lg border border-white/10 bg-black/30 p-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Expected Output:</span>
                          <input
                            type="text"
                            value={tc.output || tc.expected}
                            onChange={(e) => handleTestCaseChange(idx, "output", e.target.value)}
                            placeholder="e.g. [0,1]"
                            className="w-full rounded-lg border border-white/10 bg-black/30 p-2 text-xs font-mono text-emerald-400 outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:brightness-110 shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{editingId ? "Update Challenge" : "Create Challenge"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ PREVIEW IN CODE RUNNER MODAL ══════════════ */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
              isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-3.5 border-b flex items-center justify-between shrink-0 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    <span>{previewQuestion.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                      Preview Sandbox
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Test solving and running this challenge before assigning to candidates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Editor Runner Box */}
            <div className="p-4 overflow-y-auto flex-1">
              <CodeEditorWithRunner
                initialLanguage="javascript"
                questionTitle={previewQuestion.title}
                questionDescription={previewQuestion.description}
                testCases={previewQuestion.examples || []}
                questionId={previewQuestion.frontendId || previewQuestion.questionId || 1}
                difficulty={previewQuestion.difficulty || "Medium"}
                isPlayground={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
