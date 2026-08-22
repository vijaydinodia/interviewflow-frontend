"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bug, AlertTriangle, CheckCircle2, Clock, Upload, Image as ImageIcon,
  Send, RefreshCw, X, ShieldAlert, Filter, Search, User, ExternalLink,
  ChevronRight, Trash2, Eye, Tag
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function ReportBugTab({ user = null, isAdmin = false }) {
  const { isDark } = useTheme();

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General UI");
  const [severity, setSeverity] = useState("medium");
  const [photoUrl, setPhotoUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
    fetchBugs();
  }, [user]);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("interviewflow_token");
      const isSuperOrAdmin = isAdmin || user?.role?.toLowerCase().includes("admin");
      const url = isSuperOrAdmin
        ? "http://localhost:5000/api/bugs/all"
        : user?.userId || user?.email
        ? `http://localhost:5000/api/bugs/my-bugs?userId=${user?.userId || ""}&userEmail=${user?.email || ""}`
        : "http://localhost:5000/api/bugs/all";

      const res = await fetch(url, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      console.log("[ReportBugTab] fetchBugs response:", data);
      if (data.success && Array.isArray(data.data)) {
        setBugs(data.data);
      } else {
        setBugs([]);
        if (!data.success) {
          console.warn("[ReportBugTab] fetchBugs error:", data.message);
        }
      }
    } catch (err) {
      console.error("Error fetching bugs:", err);
      setBugs([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert uploaded image file to base64 string for photoUrl preview & persistence
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ type: "error", text: "Image file size should be less than 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMsg({ type: "error", text: "Please enter a bug title and description." });
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const token = localStorage.getItem("interviewflow_token");
      const payload = {
        userId: user?.userId || null,
        userName: user?.fullName || user?.name || user?.email || "Anonymous",
        userEmail: user?.email || "",
        userRole: user?.role || "candidate",
        title,
        description,
        category,
        severity,
        photoUrl,
        pageUrl,
      };

      const res = await fetch("http://localhost:5000/api/bugs/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMsg({ type: "success", text: "Bug report submitted successfully!" });
        setTitle("");
        setDescription("");
        setPhotoUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchBugs();
      } else {
        setMsg({ type: "error", text: data.message || "Failed to submit bug report." });
      }
    } catch (err) {
      console.error("Bug submit error:", err);
      setMsg({ type: "error", text: "Server error submitting bug. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      const token = localStorage.getItem("interviewflow_token");
      const res = await fetch(`http://localhost:5000/api/bugs/${bugId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBugs();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleDeleteBug = async (bugId) => {
    if (!window.confirm("Are you sure you want to permanently delete this bug report?")) return;
    try {
      const token = localStorage.getItem("interviewflow_token");
      const res = await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Bug report deleted successfully." });
        if (selectedBug && (selectedBug.bugId === bugId || selectedBug.bug_id === bugId)) {
          setSelectedBug(null);
        }
        fetchBugs();
      }
    } catch (err) {
      console.error("Delete bug error:", err);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "low":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      default:
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusBadge = (st) => {
    switch (st?.toLowerCase()) {
      case "resolved":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "in_progress":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "closed":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      default:
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    }
  };

  const filteredBugs = bugs.filter((b) => {
    const matchSearch =
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.userName?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const cardBg = isDark ? "bg-[#080E18] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md";
  const headerBg = isDark ? "bg-[#090F1A] border-white/10" : "bg-slate-100 border-slate-200";
  const inputBg = isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900";

  return (
    <div className="space-y-6 font-sans">

      {/* ── TOP BANNER ──────────────────────────────────────────────────────── */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-wrap items-center justify-between gap-4 ${cardBg}`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">
                {(isAdmin || user?.role?.toLowerCase().includes("admin")) ? "All Platform Bug Reports & Governance" : "Report a Bug & Track Progress"}
              </h2>
              {(isAdmin || user?.role?.toLowerCase().includes("admin")) && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black uppercase tracking-wider">
                  Super Admin View
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {(isAdmin || user?.role?.toLowerCase().includes("admin"))
                ? "Triage, update status, and inspect all reported bugs across the entire InterviewFlow platform."
                : "Submit bug reports with screenshots and track your bug resolution progress in real-time."}
            </p>
          </div>
        </div>

        <button
          onClick={fetchBugs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* ── BUG PROGRESS STATS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border shadow-lg space-y-1 ${cardBg}`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reports</span>
            <Bug className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{bugs.length}</p>
          <span className="text-[10px] text-slate-400">Submitted bugs</span>
        </div>

        <div className={`p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 shadow-lg space-y-1 ${cardBg}`}>
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black text-cyan-400">
            {bugs.filter((b) => !b.status || b.status === "open").length}
          </p>
          <span className="text-[10px] text-cyan-300/70">Awaiting triage</span>
        </div>

        <div className={`p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-lg space-y-1 ${cardBg}`}>
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {bugs.filter((b) => b.status === "in_progress").length}
          </p>
          <span className="text-[10px] text-amber-300/70">Under active fix</span>
        </div>

        <div className={`p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-lg space-y-1 ${cardBg}`}>
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Resolved</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {bugs.filter((b) => b.status === "resolved" || b.status === "closed").length}
          </p>
          <span className="text-[10px] text-emerald-300/70">Successfully fixed</span>
        </div>
      </div>

      {/* ── SECTION 1: SUBMIT BUG REPORT FORM ──────────────────────────────── */}
      <form onSubmit={handleSubmit} className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
        <h3 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Submit New Bug Report
        </h3>

        {msg && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
            msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            <span>{msg.text}</span>
            <button type="button" onClick={() => setMsg(null)}><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Bug Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monaco Editor not loading on Python language select"
              className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none focus:border-cyan-400 transition-all ${inputBg}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${inputBg}`}
              >
                <option value="General UI">General UI / Layout</option>
                <option value="Compiler Engine">FlowCode Compiler</option>
                <option value="Interview Room">1:1 Interview Room</option>
                <option value="Authentication">Auth &amp; Login</option>
                <option value="Mentorship Portal">Mentorship Portal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${inputBg}`}
              >
                <option value="low">Low (Cosmetic)</option>
                <option value="medium">Medium (Normal)</option>
                <option value="high">High (Major Feature)</option>
                <option value="critical">Critical (Blocking)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400">Detailed Bug Description *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain steps to reproduce the bug, what happened vs what was expected..."
            className={`w-full p-2.5 rounded-xl text-xs font-medium border outline-none focus:border-cyan-400 transition-all ${inputBg}`}
          />
        </div>

        {/* File / Screenshot Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-cyan-400" /> Upload Screenshot / Photo (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={`w-full text-xs p-1.5 rounded-xl border cursor-pointer ${inputBg}`}
            />
          </div>

          {photoUrl && (
            <div className="flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-black/20">
              <img src={photoUrl} alt="Preview" className="h-12 w-16 object-cover rounded-lg border border-white/10" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-400 block">Screenshot Attached</span>
                <span className="text-[10px] text-slate-400 truncate block">{photoUrl.slice(0, 30)}...</span>
              </div>
              <button
                type="button"
                onClick={() => { setPhotoUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="p-1 text-slate-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] text-slate-400 font-mono">
            Reporter: <strong className="text-cyan-400">{user?.fullName || user?.email || "Anonymous"}</strong> ({user?.role || "User"})
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:brightness-110 text-white font-extrabold text-xs shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Submitting Bug...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Submit Bug Report</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── SECTION 2: SUBMITTED BUGS TABLE ────────────────────────────────── */}
      <div className={`rounded-3xl border shadow-xl overflow-hidden ${cardBg}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-slate-100">
              {(isAdmin || user?.role?.toLowerCase().includes("admin")) ? "All Platform Bug Reports" : "My Submitted Bug Reports"}
            </h3>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filteredBugs.length} {filteredBugs.length === 1 ? "report" : "reports"}
            </span>
          </div>
        </div>

        {/* Table Header Controls */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${headerBg}`}>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bugs by title, reporter, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none min-w-[240px] ${inputBg}`}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl border capitalize transition-all ${
                  statusFilter === st
                    ? "bg-cyan-500 text-black border-cyan-500"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-black uppercase tracking-wider text-slate-400 ${headerBg}`}>
                <th className="p-3.5">Date &amp; Time</th>
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">Title &amp; Category</th>
                <th className="p-3.5">Photo</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Loading bug reports...
                  </td>
                </tr>
              ) : filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No bug reports found.
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => {
                  const createdAtFormatted = new Date(bug.createdAt || bug.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <tr key={bug.bugId || bug.bug_id} className="hover:bg-white/5 transition-colors">
                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-cyan-400" />
                          <span>{createdAtFormatted}</span>
                        </div>
                      </td>

                      {/* User Details */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-200 flex items-center gap-1">
                            <User className="h-3 w-3 text-purple-400" />
                            <span>{bug.userName || bug.user_name || "Anonymous"}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            ID: <span className="text-cyan-400">{(bug.userId || bug.user_id || "N/A").slice(0, 8)}</span> | <span className="capitalize">{bug.userRole || bug.user_role || "candidate"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-200 truncate">{bug.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{bug.description}</p>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-cyan-300">
                            {bug.category}
                          </span>
                        </div>
                      </td>

                      {/* Photo / Screenshot */}
                      <td className="p-3.5">
                        {bug.photoUrl || bug.photo_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(bug.photoUrl || bug.photo_url)}
                            className="group relative flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-bold"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>View Photo</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">No Image</span>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${getSeverityBadge(bug.severity)}`}>
                          {bug.severity}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {isAdmin || user?.role?.toLowerCase().includes("admin") ? (
                          <select
                            value={bug.status}
                            onChange={(e) => handleStatusChange(bug.bugId || bug.bug_id, e.target.value)}
                            className={`p-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${getStatusBadge(bug.status)}`}
                          >
                            <option value="open" className="bg-[#0B151E] text-cyan-400">Open</option>
                            <option value="in_progress" className="bg-[#0B151E] text-amber-400">In Progress</option>
                            <option value="resolved" className="bg-[#0B151E] text-emerald-400">Resolved</option>
                            <option value="closed" className="bg-[#0B151E] text-slate-400">Closed</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${getStatusBadge(bug.status)}`}>
                            {bug.status?.replace("_", " ")}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBug(bug)}
                            title="Inspect Details"
                            className="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>

                          {(isAdmin || user?.role?.toLowerCase().includes("admin")) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBug(bug.bugId || bug.bug_id)}
                              title="Delete Bug Report"
                              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-bold transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL PHOTO PREVIEW ────────────────────────────────────────────── */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`p-4 rounded-3xl border shadow-2xl max-w-2xl w-full space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" /> Bug Screenshot Attachment
              </h4>
              <button onClick={() => setPreviewPhoto(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
              <img src={previewPhoto} alt="Bug Screenshot" className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-200 hover:text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL BUG DETAIL INSPECTION ───────────────────────────────────── */}
      {selectedBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className={`p-6 rounded-3xl border shadow-2xl max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto ${cardBg}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <Bug className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Bug Report Details</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedBug.bugId || selectedBug.bug_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBug(null)}
                className="p-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Badges & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-black/30 text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${getSeverityBadge(selectedBug.severity)}`}>
                  {selectedBug.severity} Severity
                </span>
                <span className="px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold">
                  {selectedBug.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Status:</span>
                {(isAdmin || user?.role?.toLowerCase().includes("admin")) ? (
                  <select
                    value={selectedBug.status}
                    onChange={(e) => {
                      handleStatusChange(selectedBug.bugId || selectedBug.bug_id, e.target.value);
                      setSelectedBug({ ...selectedBug, status: e.target.value });
                    }}
                    className={`p-1.5 rounded-xl text-xs font-extrabold border outline-none cursor-pointer ${getStatusBadge(selectedBug.status)}`}
                  >
                    <option value="open" className="bg-[#0B151E] text-cyan-400">Open</option>
                    <option value="in_progress" className="bg-[#0B151E] text-amber-400">In Progress</option>
                    <option value="resolved" className="bg-[#0B151E] text-emerald-400">Resolved</option>
                    <option value="closed" className="bg-[#0B151E] text-slate-400">Closed</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full border text-xs font-black uppercase ${getStatusBadge(selectedBug.status)}`}>
                    {selectedBug.status?.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Bug Title & Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-100">{selectedBug.title}</h4>
              <div className="p-4 rounded-2xl border border-white/10 bg-black/20 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedBug.description}
              </div>
            </div>

            {/* Reporter Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 rounded-2xl border border-white/10 bg-white/5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reporter Name</span>
                <span className="font-extrabold text-cyan-300">{selectedBug.userName || selectedBug.user_name || "Anonymous"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reporter Email</span>
                <span className="font-mono text-slate-200">{selectedBug.userEmail || selectedBug.user_email || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">User Role</span>
                <span className="capitalize font-bold text-purple-400">{selectedBug.userRole || selectedBug.user_role || "User"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported At</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedBug.createdAt || selectedBug.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Screenshot preview if present */}
            {(selectedBug.photoUrl || selectedBug.photo_url) && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-cyan-400" /> Attached Screenshot
                </span>
                <div className="max-h-60 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
                  <img
                    src={selectedBug.photoUrl || selectedBug.photo_url}
                    alt="Bug Screenshot"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {(isAdmin || user?.role?.toLowerCase().includes("admin")) ? (
                <button
                  onClick={() => handleDeleteBug(selectedBug.bugId || selectedBug.bug_id)}
                  className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="h-4 w-4" /> Delete Bug Report
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedBug(null)}
                className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-200 hover:text-white"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
