"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Code2, Search, Loader2, Plus, Upload, Trash2, Edit3,
  CheckCircle2, AlertCircle, RefreshCw, X, ChevronLeft,
  ChevronRight, Database, FileText, Tag, Filter,
  BookOpen, Zap, Eye, Sparkles, Layers, Terminal,
  Lightbulb, HelpCircle, Check, ArrowRight, CornerDownLeft
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

const DIFFICULTY_CONFIG = {
  Easy: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    activeRing: "ring-2 ring-emerald-400 border-emerald-400 bg-emerald-500/20 text-emerald-300",
    desc: "Great for fundamentals & warm-up",
  },
  Medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    activeRing: "ring-2 ring-amber-400 border-amber-400 bg-amber-500/20 text-amber-300",
    desc: "Core algorithmic problem solving",
  },
  Hard: {
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    activeRing: "ring-2 ring-rose-400 border-rose-400 bg-rose-500/20 text-rose-300",
    desc: "Advanced data structures & optimization",
  },
};

const SUGGESTED_TAGS = [
  "Array", "String", "Hash Table", "Dynamic Programming",
  "Two Pointers", "Binary Search", "Tree", "Graph",
  "Sorting", "Stack", "Recursion", "Matrix", "Greedy", "Math"
];

const DEFAULT_SNIPPET_LANGUAGES = [
  { lang: "JavaScript", langSlug: "javascript", starter: "/**\n * @param {any} input\n * @return {any}\n */\nvar solution = function(input) {\n    \n};" },
  { lang: "Python3", langSlug: "python3", starter: "class Solution:\n    def solution(self, input):\n        pass" },
  { lang: "Java", langSlug: "java", starter: "class Solution {\n    public void solution(Object input) {\n        \n    }\n}" },
  { lang: "C++", langSlug: "cpp", starter: "class Solution {\npublic:\n    void solution() {\n        \n    }\n};" },
  { lang: "TypeScript", langSlug: "typescript", starter: "function solution(input: any): any {\n    \n};" },
];

const ITEMS_PER_PAGE = 15;

export default function QuestionManagerTab({ user = null }) {
  const { isDark } = useTheme();

  // ── State ──
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Modal active tab
  const [modalTab, setModalTab] = useState("basic"); // 'basic' | 'description' | 'hints' | 'snippets' | 'preview'

  // Structured Add/Edit form state
  const [formData, setFormData] = useState({
    frontendId: "1",
    title: "",
    difficulty: "Medium",
    description: "",
    constraints: "",
    topicTagsList: [],
    tagInput: "",
    hintsList: [""],
    examplesList: [{ input: "", output: "", explanation: "" }],
    codeSnippetsMap: {
      javascript: DEFAULT_SNIPPET_LANGUAGES[0].starter,
      python3: DEFAULT_SNIPPET_LANGUAGES[1].starter,
      java: DEFAULT_SNIPPET_LANGUAGES[2].starter,
      cpp: DEFAULT_SNIPPET_LANGUAGES[3].starter,
      typescript: DEFAULT_SNIPPET_LANGUAGES[4].starter,
    },
    activeSnippetLang: "javascript",
  });

  // Bulk upload state
  const [bulkJson, setBulkJson] = useState("");
  const [bulkPreviewCount, setBulkPreviewCount] = useState(0);
  const fileInputRef = useRef(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch Questions ──
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get("/questions");
      } catch (err1) {
        res = await api.get("/api/questions");
      }
      const data = res.data;
      if (data.success && Array.isArray(data.data)) {
        setQuestions(data.data);
      } else if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
      showToast("error", "Failed to fetch questions.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ── Filtering & Pagination ──
  const filtered = questions.filter((q) => {
    const matchDiff =
      difficultyFilter === "all" ||
      q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      q.title?.toLowerCase().includes(s) ||
      q.frontendId?.toString().includes(s) ||
      q.topicTags?.some((t) => t.name?.toLowerCase().includes(s));

    return matchDiff && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const numA = parseInt(a.frontendId, 10);
    const numB = parseInt(b.frontendId, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return (a.frontendId || "").localeCompare(b.frontendId || "");
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (validPage - 1) * ITEMS_PER_PAGE;
  const pageItems = sorted.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficultyFilter]);

  // ── Add / Edit Modal Controls ──
  const calculateNextId = () => {
    const maxId = questions.reduce((max, q) => {
      const n = parseInt(q.frontendId, 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0);
    return maxId > 0 ? (maxId + 1).toString() : (questions.length + 1).toString();
  };

  const resetForm = () => {
    const snippetsMap = {};
    DEFAULT_SNIPPET_LANGUAGES.forEach(item => {
      snippetsMap[item.langSlug] = item.starter;
    });

    setFormData({
      frontendId: calculateNextId(),
      title: "",
      difficulty: "Medium",
      description: "",
      constraints: "",
      topicTagsList: ["Array", "Algorithm"],
      tagInput: "",
      hintsList: [""],
      examplesList: [{ input: "", output: "", explanation: "" }],
      codeSnippetsMap: snippetsMap,
      activeSnippetLang: "javascript",
    });
    setModalTab("basic");
  };

  const openAddModal = async () => {
    resetForm();
    setEditingQuestion(null);
    setShowAddModal(true);

    try {
      const res = await api.get("/questions/next-id");
      if (res.data?.success && res.data?.nextId) {
        setFormData((prev) => ({ ...prev, frontendId: res.data.nextId }));
      }
    } catch {}
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);

    // Parse topic tags
    const tags = Array.isArray(question.topicTags)
      ? question.topicTags.map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean)
      : [];

    // Parse hints
    const hints = Array.isArray(question.hints) && question.hints.length > 0
      ? question.hints
      : [""];

    // Parse examples
    let examples = [{ input: "", output: "", explanation: "" }];
    if (Array.isArray(question.examples) && question.examples.length > 0) {
      examples = question.examples.map(ex => {
        if (typeof ex === "string") return { input: "", output: "", explanation: ex };
        return {
          input: ex.input || ex.exampleTestcases || "",
          output: ex.output || "",
          explanation: ex.explanation || ex.html || ""
        };
      });
    }

    // Parse code snippets
    const snippetsMap = {};
    DEFAULT_SNIPPET_LANGUAGES.forEach(item => {
      snippetsMap[item.langSlug] = item.starter;
    });
    if (Array.isArray(question.codeSnippets)) {
      question.codeSnippets.forEach(snip => {
        const slug = (snip.langSlug || snip.lang || "").toLowerCase();
        snippetsMap[slug] = snip.code;
      });
    }

    setFormData({
      frontendId: question.frontendId ? String(question.frontendId) : "",
      title: question.title || "",
      difficulty: question.difficulty || "Medium",
      description: question.description || "",
      constraints: question.constraints || "",
      topicTagsList: tags.length > 0 ? tags : ["Algorithm"],
      tagInput: "",
      hintsList: hints,
      examplesList: examples,
      codeSnippetsMap: snippetsMap,
      activeSnippetLang: "javascript",
    });
    setModalTab("basic");
    setShowAddModal(true);
  };

  // ── Tag Handlers ──
  const handleAddTag = (tagToAdd) => {
    const trimmed = (tagToAdd || formData.tagInput).trim();
    if (!trimmed) return;
    if (!formData.topicTagsList.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        topicTagsList: [...prev.topicTagsList, trimmed],
        tagInput: "",
      }));
    } else {
      setFormData(prev => ({ ...prev, tagInput: "" }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      topicTagsList: prev.topicTagsList.filter(t => t !== tagToRemove),
    }));
  };

  // ── Hint Handlers ──
  const handleHintChange = (index, value) => {
    const updated = [...formData.hintsList];
    updated[index] = value;
    setFormData(prev => ({ ...prev, hintsList: updated }));
  };

  const handleAddHint = () => {
    setFormData(prev => ({ ...prev, hintsList: [...prev.hintsList, ""] }));
  };

  const handleRemoveHint = (index) => {
    if (formData.hintsList.length <= 1) {
      setFormData(prev => ({ ...prev, hintsList: [""] }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      hintsList: prev.hintsList.filter((_, i) => i !== index),
    }));
  };

  // ── Example Handlers ──
  const handleExampleChange = (index, field, value) => {
    const updated = [...formData.examplesList];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, examplesList: updated }));
  };

  const handleAddExample = () => {
    setFormData(prev => ({
      ...prev,
      examplesList: [...prev.examplesList, { input: "", output: "", explanation: "" }],
    }));
  };

  const handleRemoveExample = (index) => {
    if (formData.examplesList.length <= 1) {
      setFormData(prev => ({ ...prev, examplesList: [{ input: "", output: "", explanation: "" }] }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      examplesList: prev.examplesList.filter((_, i) => i !== index),
    }));
  };

  // ── Snippet Handler ──
  const handleSnippetChange = (langSlug, code) => {
    setFormData(prev => ({
      ...prev,
      codeSnippetsMap: {
        ...prev.codeSnippetsMap,
        [langSlug]: code,
      },
    }));
  };

  // ── Form Submit ──
  const handleFormSubmit = async () => {
    if (!formData.title.trim()) {
      showToast("error", "Question title is required.");
      setModalTab("basic");
      return;
    }
    if (!formData.description.trim()) {
      showToast("error", "Question description is required.");
      setModalTab("description");
      return;
    }

    setActionLoading(true);

    // Format topic tags
    const topicTags = formData.topicTagsList.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));

    // Filter hints
    const hints = formData.hintsList.map(h => h.trim()).filter(Boolean);

    // Filter examples
    const examples = formData.examplesList
      .filter(ex => ex.input.trim() || ex.output.trim() || ex.explanation.trim())
      .map(ex => ({
        input: ex.input.trim(),
        output: ex.output.trim(),
        explanation: ex.explanation.trim(),
      }));

    // Format code snippets
    const codeSnippets = DEFAULT_SNIPPET_LANGUAGES.map(lang => ({
      lang: lang.lang,
      langSlug: lang.langSlug,
      code: formData.codeSnippetsMap[lang.langSlug] || lang.starter,
    }));

    const payload = {
      frontendId: formData.frontendId || null,
      title: formData.title.trim(),
      difficulty: formData.difficulty,
      description: formData.description.trim(),
      constraints: formData.constraints.trim(),
      topicTags,
      hints,
      examples,
      codeSnippets,
    };

    try {
      if (editingQuestion) {
        const res = await api.put(`/questions/${editingQuestion.questionId}`, payload);
        if (res.data.success) {
          showToast("success", `Question #${formData.frontendId} updated successfully!`);
          setShowAddModal(false);
          resetForm();
          fetchQuestions();
        } else {
          showToast("error", res.data.message || "Failed to update question.");
        }
      } else {
        const res = await api.post("/questions", payload);
        if (res.data.success) {
          showToast("success", `Question #${res.data?.data?.frontendId || formData.frontendId} added successfully!`);
          setShowAddModal(false);
          resetForm();
          fetchQuestions();
        } else {
          showToast("error", res.data.message || "Failed to add question.");
        }
      }
    } catch (err) {
      console.error("Error saving question:", err);
      showToast("error", err.response?.data?.message || "Failed to save question.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete Question ──
  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to permanently delete this question?")) return;

    setActionLoading(true);
    try {
      const res = await api.delete(`/questions/${questionId}`);
      if (res.data.success) {
        showToast("success", "Question deleted from database.");
        fetchQuestions();
      } else {
        showToast("error", res.data.message || "Failed to delete.");
      }
    } catch (err) {
      console.error("Error deleting question:", err);
      showToast("error", "Failed to delete question.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Bulk Upload ──
  const handleBulkJsonChange = (value) => {
    setBulkJson(value);
    try {
      const parsed = JSON.parse(value);
      setBulkPreviewCount(Array.isArray(parsed) ? parsed.length : 0);
    } catch {
      setBulkPreviewCount(0);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setBulkJson(content);
      try {
        const parsed = JSON.parse(content);
        setBulkPreviewCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setBulkPreviewCount(0);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
    } catch {
      showToast("error", "Invalid JSON format. Please check your syntax.");
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      showToast("error", "JSON must be an array of question objects.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post("/questions/bulk", { questions: parsed });
      if (res.data.success) {
        showToast("success", res.data.message || `Uploaded ${res.data.count} questions!`);
        setShowBulkModal(false);
        setBulkJson("");
        setBulkPreviewCount(0);
        fetchQuestions();
      } else {
        showToast("error", res.data.message || "Bulk upload failed.");
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      showToast("error", err.response?.data?.message || "Bulk upload failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Styles ──
  const cardBg = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const inputBg = isDark ? "bg-[#0B151E] border-white/10 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400";
  const modalBg = isDark ? "bg-[#070D18] border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900";
  const panelBg = isDark ? "bg-[#0B151E]/90 border-white/10" : "bg-slate-50 border-slate-200";

  // ── Stats ──
  const totalCount = questions.length;
  const easyCount = questions.filter((q) => q.difficulty === "Easy").length;
  const mediumCount = questions.filter((q) => q.difficulty === "Medium").length;
  const hardCount = questions.filter((q) => q.difficulty === "Hard").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold border animate-in fade-in slide-in-from-top-2 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 backdrop-blur-md"
              : "bg-rose-500/20 border-rose-400/40 text-rose-300 backdrop-blur-md"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 shadow-xl hover:border-white/20 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Questions</span>
            <div className="p-2 rounded-xl bg-white/5 text-slate-300 border border-white/10">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalCount}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 shadow-xl hover:border-emerald-500/30 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Easy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400">{easyCount}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 shadow-xl hover:border-amber-500/30 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Medium</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-400/20">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400">{mediumCount}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 shadow-xl hover:border-rose-500/30 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Hard</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-400/20">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400">{hardCount}</p>
        </div>
      </div>

      {/* ── Action Buttons + Search ── */}
      <div className={`p-5 rounded-2xl border ${cardBg} shadow-xl`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" /> Add Question
            </button>
            <button
              onClick={() => { setShowBulkModal(true); setBulkJson(""); setBulkPreviewCount(0); }}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> Bulk Upload JSON
            </button>
            <button
              onClick={fetchQuestions}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Right: Search + Filter */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border flex-1 lg:w-72 ${inputBg}`}>
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, #ID, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs w-full"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${inputBg}`}
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Questions Table ── */}
      <div className={`rounded-2xl border ${cardBg} shadow-xl overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            <span className="text-sm font-bold text-slate-400">Loading questions from database...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Code2 className="h-10 w-10 text-slate-500" />
            <p className="text-sm font-bold text-slate-400">
              {questions.length === 0
                ? 'No questions in the database yet. Click "Add Question" or "Bulk Upload JSON" to get started.'
                : "No questions match your search/filter."}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className={`grid grid-cols-[60px_1fr_110px_1fr_120px_110px] gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-wider border-b ${
              isDark ? "border-white/10 text-slate-500 bg-white/2" : "border-slate-100 text-slate-400 bg-slate-50"
            }`}>
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Tags</span>
              <span>Date Added</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Rows */}
            {pageItems.map((q) => {
              const diffStyle = DIFFICULTY_CONFIG[q.difficulty] || DIFFICULTY_CONFIG.Medium;
              return (
                <div
                  key={q.questionId}
                  className={`grid grid-cols-[60px_1fr_110px_1fr_120px_110px] gap-2 px-5 py-3.5 items-center border-b transition-colors ${
                    isDark
                      ? "border-white/5 hover:bg-white/[0.02]"
                      : "border-slate-50 hover:bg-slate-50"
                  }`}
                >
                  {/* Frontend ID */}
                  <span className="text-xs font-black text-amber-400">
                    #{q.frontendId || "—"}
                  </span>

                  {/* Title */}
                  <span className="text-xs font-bold text-slate-100 truncate pr-2" title={q.title}>
                    {q.title}
                  </span>

                  {/* Difficulty Badge */}
                  <span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${diffStyle.bg}`}>
                      {q.difficulty}
                    </span>
                  </span>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 overflow-hidden max-h-6">
                    {(q.topicTags || []).slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {(q.topicTags || []).length > 3 && (
                      <span className="text-[9px] font-bold text-slate-500">+{q.topicTags.length - 3}</span>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {q.createdAt
                      ? new Date(q.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setPreviewQuestion(q)}
                      title="Preview Candidate View"
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isDark ? "border-white/10 hover:bg-white/5 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(q)}
                      title="Edit Question"
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isDark ? "border-white/10 hover:bg-blue-500/10 text-blue-400" : "border-slate-200 hover:bg-blue-50 text-blue-500"
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.questionId)}
                      title="Delete Question"
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isDark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 hover:bg-rose-50 text-rose-500"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between px-5 py-3 border-t ${
                isDark ? "border-white/10" : "border-slate-100"
              }`}>
                <span className="text-[10px] font-bold text-slate-500">
                  Showing {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, sorted.length)} of {sorted.length} questions
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validPage <= 1}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isDark ? "border-white/10 hover:bg-white/5 text-slate-400 disabled:opacity-30" : "border-slate-200 hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                    }`}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 px-2">
                    {validPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validPage >= totalPages}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isDark ? "border-white/10 hover:bg-white/5 text-slate-400 disabled:opacity-30" : "border-slate-200 hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                    }`}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODERN ADD / EDIT QUESTION MODAL (STUDIO EDITOR)
         ══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border-2 shadow-2xl ${modalBg} overflow-hidden`}>
            
            {/* ── Modal Header ── */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  editingQuestion
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}>
                  {editingQuestion ? <Edit3 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 uppercase">
                      Problem #{formData.frontendId || "?"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {editingQuestion ? "Editing Mode" : "Question Studio Authoring"}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white truncate max-w-md sm:max-w-xl">
                    {formData.title ? formData.title : editingQuestion ? "Edit Question" : "Create New Problem"}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Navigation Tabs ── */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-white/[0.01] overflow-x-auto">
              {[
                { id: "basic", label: "1. Basics & Tags", icon: Layers },
                { id: "description", label: "2. Description & Constraints", icon: FileText },
                { id: "hints", label: "3. Hints & Examples", icon: Lightbulb },
                { id: "snippets", label: "4. Code Snippets", icon: Terminal },
                { id: "preview", label: "5. Live Preview", icon: Eye },
              ].map(tab => {
                const Icon = tab.icon;
                const active = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "border-cyan-400 text-cyan-300 bg-cyan-500/10 shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── Modal Body Content ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ── TAB 1: BASICS & TAGS ── */}
              {modalTab === "basic" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Problem Number & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Frontend #ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1"
                        value={formData.frontendId}
                        onChange={(e) => setFormData({ ...formData, frontendId: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-black text-amber-400 ${inputBg}`}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Problem Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Two Sum, LRU Cache, Binary Tree Maximum Path Sum"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      Difficulty Level *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Easy", "Medium", "Hard"].map((lvl) => {
                        const cfg = DIFFICULTY_CONFIG[lvl];
                        const active = formData.difficulty === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setFormData({ ...formData, difficulty: lvl })}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              active ? cfg.activeRing : `${panelBg} hover:border-white/20 text-slate-300`
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-black ${active ? cfg.color : "text-slate-200"}`}>{lvl}</span>
                              {active && <Check className={`h-4 w-4 ${cfg.color}`} />}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">{cfg.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Topic Tags */}
                  <div className={`p-4 rounded-2xl border ${panelBg} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-cyan-400" /> Topic Tags & Categories
                      </label>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {formData.topicTagsList.length} tags selected
                      </span>
                    </div>

                    {/* Tag input */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${inputBg}`}>
                      <input
                        type="text"
                        placeholder="Type a tag and press Enter (or click suggestions below)..."
                        value={formData.tagInput}
                        onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="bg-transparent outline-none text-xs w-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag()}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected Tags Chips */}
                    {formData.topicTagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.topicTagsList.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 animate-in zoom-in-95 duration-150"
                          >
                            {t}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Suggestions */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_TAGS.map((st) => {
                          const exists = formData.topicTagsList.includes(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => exists ? handleRemoveTag(st) : handleAddTag(st)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                exists
                                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                              }`}
                            >
                              {exists ? "✓ " : "+ "}{st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: DESCRIPTION & CONSTRAINTS ── */}
              {modalTab === "description" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Problem Description * (HTML / Rich Text Supported)
                      </label>
                      <span className="text-[10px] text-slate-500">Supports &lt;p&gt;, &lt;code&gt;, &lt;strong&gt;, &lt;pre&gt;</span>
                    </div>
                    <textarea
                      rows={8}
                      placeholder="<p>Given an array of integers <code>nums</code> and an integer <code>target</code>...</p>"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-3.5 py-3 rounded-2xl border text-xs font-mono resize-y leading-relaxed ${inputBg}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Constraints & Limits
                      </label>
                      <span className="text-[10px] text-slate-500">e.g. Array length, integer range</span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="<ul>&#10;  <li><code>2 &lt;= nums.length &lt;= 10^4</code></li>&#10;  <li><code>-10^9 &lt;= nums[i] &lt;= 10^9</code></li>&#10;</ul>"
                      value={formData.constraints}
                      onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                      className={`w-full px-3.5 py-3 rounded-2xl border text-xs font-mono resize-y ${inputBg}`}
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 3: HINTS & EXAMPLES ── */}
              {modalTab === "hints" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Dynamic Hints Builder */}
                  <div className={`p-4 rounded-2xl border ${panelBg} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Progressive Problem Hints
                      </label>
                      <button
                        type="button"
                        onClick={handleAddHint}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-400/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add Hint
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.hintsList.map((hint, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-400/80 shrink-0 w-12">
                            Hint {idx + 1}:
                          </span>
                          <input
                            type="text"
                            placeholder={`e.g. Try using a hash map to look up the complement in O(1)...`}
                            value={hint}
                            onChange={(e) => handleHintChange(idx, e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs ${inputBg}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHint(idx)}
                            className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Examples Builder */}
                  <div className={`p-4 rounded-2xl border ${panelBg} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-cyan-400" /> Example Test Cases
                      </label>
                      <button
                        type="button"
                        onClick={handleAddExample}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-500/20 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add Example
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.examplesList.map((ex, idx) => (
                        <div key={idx} className={`p-3.5 rounded-xl border border-white/5 bg-black/20 space-y-2.5 relative`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-cyan-300 uppercase">
                              Example {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExample(idx)}
                              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Input:</span>
                              <input
                                type="text"
                                placeholder='e.g. nums = [2,7,11,15], target = 9'
                                value={ex.input}
                                onChange={(e) => handleExampleChange(idx, "input", e.target.value)}
                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${inputBg}`}
                              />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Output:</span>
                              <input
                                type="text"
                                placeholder='e.g. [0,1]'
                                value={ex.output}
                                onChange={(e) => handleExampleChange(idx, "output", e.target.value)}
                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${inputBg}`}
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Explanation (optional):</span>
                            <input
                              type="text"
                              placeholder='e.g. Because nums[0] + nums[1] == 9, we return [0, 1].'
                              value={ex.explanation}
                              onChange={(e) => handleExampleChange(idx, "explanation", e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${inputBg}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: CODE STARTER SNIPPETS ── */}
              {modalTab === "snippets" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Starter Function Templates by Language
                    </label>
                    <span className="text-[10px] text-slate-500">Candidates start with this template in the code editor</span>
                  </div>

                  {/* Language Selector Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_SNIPPET_LANGUAGES.map(lang => {
                      const active = formData.activeSnippetLang === lang.langSlug;
                      return (
                        <button
                          key={lang.langSlug}
                          type="button"
                          onClick={() => setFormData({ ...formData, activeSnippetLang: lang.langSlug })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            active
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm"
                              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {lang.lang}
                        </button>
                      );
                    })}
                  </div>

                  {/* Code Editor Box */}
                  <div className="relative rounded-2xl border border-white/10 bg-[#060B12] overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Editing template for: <strong className="text-cyan-300">{formData.activeSnippetLang}</strong></span>
                      <span>Monospace Code</span>
                    </div>
                    <textarea
                      rows={10}
                      value={formData.codeSnippetsMap[formData.activeSnippetLang] || ""}
                      onChange={(e) => handleSnippetChange(formData.activeSnippetLang, e.target.value)}
                      className="w-full p-4 bg-transparent outline-none font-mono text-xs text-slate-200 resize-y leading-relaxed selection:bg-cyan-500/30"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 5: LIVE CANDIDATE PREVIEW ── */}
              {modalTab === "preview" && (
                <div className={`p-6 rounded-2xl border ${panelBg} space-y-5 animate-in fade-in duration-200`}>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-amber-400">#{formData.frontendId || "1"}</span>
                      <h3 className="text-base font-black text-white">{formData.title || "Untitled Problem"}</h3>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${DIFFICULTY_CONFIG[formData.difficulty]?.bg}`}>
                      {formData.difficulty}
                    </span>
                  </div>

                  {/* Tags */}
                  {formData.topicTagsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.topicTagsList.map(t => (
                        <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description Render */}
                  <div
                    className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed text-slate-300"
                    dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-slate-500 italic'>No description provided yet.</p>" }}
                  />

                  {/* Examples */}
                  {formData.examplesList.some(ex => ex.input || ex.output) && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Examples</h4>
                      {formData.examplesList.map((ex, idx) => (
                        ex.input || ex.output ? (
                          <div key={idx} className="p-3 rounded-xl border border-white/5 bg-black/30 text-xs font-mono space-y-1">
                            <div><strong className="text-slate-400">Input:</strong> {ex.input}</div>
                            <div><strong className="text-slate-400">Output:</strong> {ex.output}</div>
                            {ex.explanation && <div><strong className="text-slate-400">Explanation:</strong> {ex.explanation}</div>}
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {formData.constraints && (
                    <div className="pt-2">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Constraints</h4>
                      <div
                        className="text-xs text-slate-400 font-mono"
                        dangerouslySetInnerHTML={{ __html: formData.constraints }}
                      />
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ── Modal Footer Controls ── */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {modalTab !== "preview" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ["basic", "description", "hints", "snippets", "preview"];
                      const currentIdx = tabs.indexOf(modalTab);
                      if (currentIdx < tabs.length - 1) setModalTab(tabs[currentIdx + 1]);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Next Section <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />}
                  {editingQuestion ? "Update Question" : "Publish Question to Database"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════ BULK UPLOAD MODAL ══════════════ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 shadow-2xl ${modalBg} p-6`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Upload className="h-5 w-5 text-violet-400" />
                Bulk Upload Questions from JSON
              </h2>
              <button
                onClick={() => { setShowBulkModal(false); setBulkJson(""); setBulkPreviewCount(0); }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Upload File Button */}
            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "border-violet-400/30 bg-violet-400/10 text-violet-400 hover:bg-violet-400/20"
                    : "border-violet-500/30 bg-violet-50 text-violet-600 hover:bg-violet-100"
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Choose JSON File from Computer
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* JSON Textarea */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Paste JSON Array (or upload a file above)
              </label>
              <textarea
                rows={10}
                placeholder={'[\n  {\n    "title": "Two Sum",\n    "frontendId": "1",\n    "difficulty": "Easy",\n    "description": "Given an array...",\n    "topicTags": [{ "name": "Array", "slug": "array" }],\n    "hints": ["Try using a hash map"],\n    "codeSnippets": []\n  }\n]'}
                value={bulkJson}
                onChange={(e) => handleBulkJsonChange(e.target.value)}
                className={`w-full px-3.5 py-3 rounded-xl border text-xs font-mono resize-y ${inputBg}`}
              />
            </div>

            {/* Preview Count */}
            {bulkPreviewCount > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  {bulkPreviewCount} questions detected and ready to upload
                </span>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => { setShowBulkModal(false); setBulkJson(""); setBulkPreviewCount(0); }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={actionLoading || bulkPreviewCount === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload {bulkPreviewCount} Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PREVIEW MODAL ══════════════ */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 shadow-2xl ${modalBg} p-6`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-amber-400">#{previewQuestion.frontendId || "?"}</span>
                <h2 className="text-lg font-extrabold">{previewQuestion.title}</h2>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${DIFFICULTY_CONFIG[previewQuestion.difficulty]?.bg || ""}`}>
                  {previewQuestion.difficulty}
                </span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tags */}
            {previewQuestion.topicTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {previewQuestion.topicTags.map((tag, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div
              className={`prose prose-sm max-w-none text-xs leading-relaxed mb-4 ${isDark ? "prose-invert" : ""}`}
              dangerouslySetInnerHTML={{ __html: previewQuestion.description || "<p>No description</p>" }}
            />

            {/* Constraints */}
            {previewQuestion.constraints && (
              <div className="mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Constraints</h3>
                <div
                  className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  dangerouslySetInnerHTML={{ __html: previewQuestion.constraints }}
                />
              </div>
            )}

            {/* Hints */}
            {previewQuestion.hints?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Hints</h3>
                <ul className="space-y-1">
                  {previewQuestion.hints.map((hint, i) => (
                    <li key={i} className={`text-xs px-3 py-2 rounded-lg ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Snippets preview */}
            {previewQuestion.codeSnippets?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Code Snippets ({previewQuestion.codeSnippets.length} languages)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {previewQuestion.codeSnippets.map((s, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isDark ? "bg-cyan-500/10 border-cyan-400/20 text-cyan-400" : "bg-cyan-50 border-cyan-200 text-cyan-600"
                      }`}
                    >
                      {s.lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
