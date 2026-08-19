"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Laptop, CheckCircle2, XCircle, Clock, Video, Users,
  Check, X, RefreshCw, AlertCircle, Loader2, Send,
  Calendar, FileText, Code2, Sparkles, ChevronRight,
  ChevronLeft, Menu, Play, RotateCcw, ShieldCheck,
  Search, MessageSquare, ArrowUpRight, Award, Plus, Trash2
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import DashboardHeader from "../_components/DashboardHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SIDEBAR_ITEMS = [
  { id: "requests",     label: "Incoming Requests",     icon: MessageSquare, badge: "pendingCount" },
  { id: "room",         label: "1-to-1 Live Room",      icon: Video,          badge: null },
  { id: "availability", label: "Schedule & Slots",      icon: Calendar,       badge: null },
  { id: "profile",      label: "My Specializations",    icon: Code2,          badge: null },
];

export default function InterviewerDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [activeTab, setActiveTab]     = useState("requests");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [requests, setRequests]       = useState([]);
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter]   = useState("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [toast, setToast]             = useState(null);

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState("");

  const [customRoomCode, setCustomRoomCode] = useState("");
  const [activeLiveRoom, setActiveLiveRoom] = useState(null);

  const [newSlot, setNewSlot] = useState("");
  const [slotFrom, setSlotFrom] = useState("17:00");
  const [slotTo, setSlotTo] = useState("18:00");
  const [slotsList, setSlotsList] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const session = localStorage.getItem("interviewflow_session");
    if (!session) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(session);
    setUser(parsed);
    const t = localStorage.getItem("interviewflow_token") || parsed.token;
    setToken(t);
    fetchAllData(t);
  }, [router]);

  const fetchAllData = async (authToken) => {
    setLoading(true);
    try {
      const [reqRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/interview-requests/interviewer-requests`, {
          headers: { Authorization: `Bearer ${authToken || token}` },
        }),
        fetch(`${API_BASE}/interviewer/me`, {
          headers: { Authorization: `Bearer ${authToken || token}` },
        }),
      ]);

      const reqJson = await reqRes.json();
      const profJson = await profileRes.json();

      if (reqJson.success && Array.isArray(reqJson.data)) {
        setRequests(reqJson.data);
      }
      if (profJson.success && profJson.data) {
        setProfile(profJson.data);
        if (Array.isArray(profJson.data.availability)) {
          setSlotsList(profJson.data.availability);
        }
      }
    } catch {
      showToast("error", "Failed to load requests from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAction = async (requestId, status, note = "") => {
    try {
      setActionLoading(requestId);
      const res = await fetch(`${API_BASE}/interview-requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });
      const json = await res.json();

      if (json.success) {
        showToast("success", `Request marked as ${status}! Candidate notified via Brevo email.`);
        setRejectModal(null);
        setRejectNote("");
        fetchAllData(token);
      } else {
        showToast("error", json.message || "Failed to update status.");
      }
    } catch {
      showToast("error", "Network error updating request status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.trim()) return;
    const updated = [...slotsList, newSlot.trim()];
    setSlotsList(updated);
    setNewSlot("");
    await saveAvailability(updated);
  };

  const handleRemoveSlot = async (idx) => {
    const updated = slotsList.filter((_, i) => i !== idx);
    setSlotsList(updated);
    await saveAvailability(updated);
  };

  const saveAvailability = async (updatedSlots) => {
    try {
      setSavingProfile(true);
      const res = await fetch(`${API_BASE}/interviewer/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: updatedSlots }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Availability schedule updated!");
      }
    } catch {
      showToast("error", "Failed to update availability.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) return null;

  const totalCount     = requests.length;
  const pendingCount   = requests.filter((r) => r.status === "pending").length;
  const acceptedCount  = requests.filter((r) => r.status === "accepted").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  const filteredRequests = requests.filter((req) => {
    const byStatus = statusFilter === "all" ? true : req.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (req.candidateUser?.firstName && req.candidateUser.firstName.toLowerCase().includes(q)) ||
      (req.candidateUser?.email && req.candidateUser.email.toLowerCase().includes(q)) ||
      (req.roleRequirement && req.roleRequirement.toLowerCase().includes(q)) ||
      (req.roomCode && req.roomCode.toLowerCase().includes(q));
    return byStatus && matchesSearch;
  });

  const pageBg  = isDark ? "bg-[#0B151E] text-slate-100"  : "bg-slate-50 text-slate-900";
  const sideBg  = isDark ? "bg-[#060D16] border-white/10" : "bg-white border-slate-200";
  const cardBg  = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5"  : "bg-slate-50 border-slate-100";

  return (
    <div className={`h-screen flex flex-col ${pageBg} transition-colors overflow-hidden`}>
      <DashboardHeader title="Interviewer Portal" roleBadge="Interviewer" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold border ${
          toast.type === "success"
            ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
            : "bg-red-500/20 border-red-400/40 text-red-300"
        }`}>
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative min-h-0">

        {/* ══════════════════ INTERVIEWER SIDEBAR ══════════════════ */}
        <aside className={`h-full flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sideBg} ${
          sidebarOpen ? "w-64" : "w-18 sm:w-20"
        } hidden md:flex overflow-hidden`}>

          {/* Top Header */}
          <div className={`flex-shrink-0 flex items-center justify-between px-4 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-purple-400 to-indigo-400 flex items-center justify-center font-black text-xs text-white">
                  IP
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-purple-400">
                  Portal
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-xl border text-slate-400 hover:text-white transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
              } ${!sidebarOpen ? "mx-auto" : ""}`}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-lg shadow-purple-500/20"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-purple-400"}`} />
                  {sidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {sidebarOpen && item.id === "requests" && pendingCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      {pendingCount} new
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Actions */}
            {sidebarOpen && (
              <div className="pt-4 space-y-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider">Quick Actions</span>
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
                >
                  <Award className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="truncate">Edit Public Profile</span>
                </button>
              </div>
            )}
          </nav>

          {/* Bottom Card */}
          <div className={`flex-shrink-0 p-3.5 border-t ${isDark ? "border-white/10 bg-white/2" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-400 to-indigo-400 p-0.5 shrink-0">
                <div className={`h-full w-full rounded-[10px] ${isDark ? "bg-[#060D16]" : "bg-white"} flex items-center justify-center font-black text-xs text-purple-400`}>
                  {(user.firstName || user.username || "I")[0].toUpperCase()}
                </div>
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-xs truncate text-slate-100">{user.firstName || user.username}</p>
                  <p className="text-[10px] text-purple-400 font-bold truncate">{profile?.title || "Interviewer"}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ══════════════════ MAIN WORKSPACE ══════════════════ */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">

          {/* Mobile Drawer */}
          <div className="md:hidden flex items-center justify-between pb-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs font-bold"
            >
              <Menu className="h-4 w-4" /> Menu Navigation
            </button>
            <span className="text-xs font-bold text-slate-400">
              {SIDEBAR_ITEMS.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {mobileMenuOpen && (
            <div className={`md:hidden p-4 rounded-3xl border mb-4 space-y-2 ${cardBg}`}>
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold ${
                      active ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" : "text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold flex items-center gap-2">
                Interviewer Command Center
                {pendingCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-400/30 bg-amber-400/10 text-amber-400">
                    {pendingCount} Action Required
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{user.email} • Review candidate interview requests and manage live rooms</p>
            </div>

            <button
              onClick={() => fetchAllData(token)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors self-start sm:self-auto ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* ══════════════ TAB 1: INCOMING REQUESTS & ACTIONS ══════════════ */}
          {activeTab === "requests" && (
            <div className="space-y-6">

              {/* 4 Overview Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  { label: "Total Requests", value: totalCount, color: "text-slate-200", icon: FileText, border: "border-white/10" },
                  { label: "Pending Actions", value: pendingCount, color: "text-amber-400", icon: Clock, border: "border-amber-500/30" },
                  { label: "Accepted & Live", value: acceptedCount, color: "text-emerald-400", icon: CheckCircle2, border: "border-emerald-500/30" },
                  { label: "Completed Rounds", value: completedCount, color: "text-purple-400", icon: ShieldCheck, border: "border-purple-500/30" },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className={`p-4 sm:p-5 rounded-2xl border ${cardBg} ${stat.border} space-y-1 shadow-lg`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: "all", label: "All Requests", count: totalCount },
                      { id: "pending", label: "Pending", count: pendingCount },
                      { id: "accepted", label: "Accepted", count: acceptedCount },
                      { id: "completed", label: "Completed", count: completedCount },
                      { id: "rejected", label: "Rejected", count: requests.filter((r) => r.status === "rejected").length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                          statusFilter === tab.id
                            ? "bg-purple-500 text-white shadow-md"
                            : isDark
                            ? "text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                            : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search candidate, role, room..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Requests List */}
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className={`p-16 text-center rounded-3xl border ${cardBg} space-y-3`}>
                  <MessageSquare className="h-10 w-10 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-200">No Interview Requests Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {statusFilter === "all"
                      ? "You haven't received any candidate interview requests yet. Keep your availability updated."
                      : `No requests match the "${statusFilter}" status filter.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((req) => {
                    const cName = req.candidateUser?.firstName
                      ? `${req.candidateUser.firstName} ${req.candidateUser.lastName || ""}`.trim()
                      : req.candidateUser?.username || "Candidate";
                    const cEmail = req.candidateUser?.email || "";
                    const topics = Array.isArray(req.topicFocus) ? req.topicFocus : [req.topicFocus].filter(Boolean);
                    const isPending = req.status === "pending";
                    const isAccepted = req.status === "accepted";
                    const isCompleted = req.status === "completed";
                    const isRejected = req.status === "rejected";

                    return (
                      <div
                        key={req.requestId}
                        className={`p-6 rounded-3xl border shadow-xl transition-all space-y-4 ${cardBg} ${
                          isPending
                            ? "border-amber-500/40 hover:border-amber-400"
                            : isAccepted
                            ? "border-emerald-500/40 hover:border-emerald-400"
                            : "border-white/10"
                        }`}
                      >
                        {/* Header: Candidate Info & Status Pill */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
                              <div className={`h-full w-full rounded-[14px] ${isDark ? "bg-[#080E18]" : "bg-white"} flex items-center justify-center font-black text-base text-purple-400`}>
                                {cName[0]?.toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                                {cName}
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                  isPending
                                    ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                                    : isAccepted
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                                    : isCompleted
                                    ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                                    : "bg-red-500/20 text-red-300 border-red-400/40"
                                }`}>
                                  {req.status}
                                </span>
                              </h3>
                              <p className="text-xs text-slate-400">{cEmail} • Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Room Code Badge */}
                          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${innerBg}`}>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Room Code:</span>
                            <span className="font-mono font-bold text-xs text-cyan-400">{req.roomCode}</span>
                          </div>
                        </div>

                        {/* Request Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Target Role</span>
                            <p className="font-extrabold text-xs text-slate-200">{req.roleRequirement}</p>
                          </div>

                          <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Coding Language</span>
                            <p className="font-mono font-bold text-xs text-cyan-400">{req.language || "JavaScript"}</p>
                          </div>

                          <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Time</span>
                            <p className="font-bold text-xs text-slate-200">
                              📅 {req.scheduledDate} ({req.scheduledTime})
                            </p>
                          </div>

                          <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Focus Topics</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {topics.map((t, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Candidate Note if present */}
                        {req.candidateNotes && (
                          <div className={`p-3.5 rounded-xl border text-xs ${innerBg}`}>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Candidate Note:</span>
                            <p className="text-slate-300 leading-relaxed italic">"{req.candidateNotes}"</p>
                          </div>
                        )}

                        {/* Actions Toolbar */}
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => setRejectModal(req)}
                                disabled={actionLoading === req.requestId}
                                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <X className="h-3.5 w-3.5" /> Decline / Reject
                              </button>
                              <button
                                onClick={() => handleTakeAction(req.requestId, "accepted")}
                                disabled={actionLoading === req.requestId}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                              >
                                {actionLoading === req.requestId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                Accept & Confirm
                              </button>
                            </>
                          )}

                          {req.meetingLink && (
                            <a
                              href={req.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Video className="h-3.5 w-3.5 text-emerald-400" /> Google Meet
                            </a>
                          )}

                          {isAccepted && (
                            <>
                              <button
                                onClick={() => handleTakeAction(req.requestId, "completed")}
                                disabled={actionLoading === req.requestId}
                                className="px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-bold flex items-center gap-1.5"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Mark Completed
                              </button>
                              <button
                                onClick={() => {
                                  setActiveLiveRoom(req);
                                  setActiveTab("room");
                                }}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-extrabold text-xs shadow-lg hover:brightness-110 flex items-center gap-1.5"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" /> Launch 1-to-1 Live Room
                              </button>
                            </>
                          )}

                          {isCompleted && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Interview Completed
                            </span>
                          )}

                          {isRejected && (
                            <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                              <XCircle className="h-4 w-4" /> Request Declined
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB 2: LIVE ROOM CONNECTOR ══════════════ */}
          {activeTab === "room" && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border shadow-xl space-y-5 ${cardBg} border-purple-500/40`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                      <Video className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold">1-to-1 Live Technical Interview Room</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Real-time code synchronization, compiler test cases, and HD WebRTC video</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                    Live Room
                  </span>
                </div>

                {activeLiveRoom ? (
                  <div className={`p-5 rounded-2xl border space-y-3 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-cyan-500/10 border-purple-500/30`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-purple-300">
                          Connected Candidate: {activeLiveRoom.candidateUser?.firstName || "Candidate"}
                        </h4>
                        <p className="text-xs text-slate-400">Role: {activeLiveRoom.roleRequirement} • Room Code: <strong className="font-mono text-white">{activeLiveRoom.roomCode}</strong></p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        Session Ready ✓
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-300">Enter or Paste Candidate Room Code</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="e.g. INT-8924-FLOW"
                        value={customRoomCode}
                        onChange={(e) => setCustomRoomCode(e.target.value)}
                        className={`flex-1 rounded-2xl border px-4 py-3 text-xs outline-none font-mono ${
                          isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                      <button
                        onClick={() => {
                          if (!customRoomCode.trim()) {
                            showToast("error", "Please enter a valid room code.");
                            return;
                          }
                          showToast("success", `Connecting to 1-to-1 interview room: ${customRoomCode}`);
                        }}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4 fill-current" /> Join 1-to-1 Room
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════ TAB 3: SCHEDULE & SLOTS ══════════════ */}
          {activeTab === "availability" && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border shadow-xl space-y-5 ${cardBg}`}>
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-base font-extrabold flex items-center gap-2 text-purple-400">
                    <Calendar className="h-5 w-5" /> Manage Availability Slots
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Candidates see these exact time slots and choose from them when requesting 1-to-1 interviews with you</p>
                </div>

                {/* Custom Start Time & End Time Range Builder */}
                <div className={`p-5 rounded-2xl border space-y-4 ${innerBg}`}>
                  <div>
                    <h3 className="text-sm font-extrabold text-purple-300">Create Custom Availability Time Slot</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Select your start and end time (e.g. 5:00 - 6:00, 10:00 - 11:00) to add to your schedule:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Start Time</span>
                      <input
                        type="time"
                        value={slotFrom}
                        onChange={(e) => setSlotFrom(e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none ${
                          isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">End Time</span>
                      <input
                        type="time"
                        value={slotTo}
                        onChange={(e) => setSlotTo(e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none ${
                          isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!slotFrom || !slotTo) return;
                          const formatTime = (t) => {
                            const [h, m] = t.split(":");
                            let hour = parseInt(h, 10);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            hour = hour % 12 || 12;
                            return `${hour}:${m} ${ampm}`;
                          };
                          const range = `${formatTime(slotFrom)} - ${formatTime(slotTo)}`;
                          if (!slotsList.includes(range)) {
                            const updated = [...slotsList, range];
                            setSlotsList(updated);
                            saveAvailability(updated);
                            showToast("success", `Added slot: ${range}`);
                          } else {
                            showToast("error", "This slot is already added.");
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs shadow hover:bg-purple-400 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Add Slot
                      </button>
                    </div>
                  </div>

                  {/* Or Type Flexible Custom Slot */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Or Type Custom Slot Name (e.g. "05:00 PM - 06:00 PM", "10:00 AM - 11:00 AM")</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 05:00 PM - 06:00 PM or 10:00 AM - 11:00 AM..."
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSlot();
                          }
                        }}
                        className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs outline-none ${
                          isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      />
                      <button
                        onClick={handleAddSlot}
                        disabled={savingProfile}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 text-[#0B151E] font-extrabold text-xs shadow hover:brightness-110 flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current Active Slots ({slotsList.length})</span>
                  {slotsList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No availability slots added yet. Add slots above.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slotsList.map((slot, i) => (
                        <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${innerBg}`}>
                          <span className="text-xs font-mono font-bold text-cyan-400">🕒 {slot}</span>
                          <button
                            onClick={() => handleRemoveSlot(i)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 4: MY SPECIALIZATIONS ══════════════ */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-purple-400">My Specializations & Profile</h2>
                    <p className="text-xs text-slate-400">Technical domains candidates match with you on</p>
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Edit on Profile Page <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Title / Designation</span>
                    <p className="font-extrabold text-slate-100">{profile?.title || "Not configured"}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                    <p className="font-extrabold text-slate-100">{profile?.department || "Engineering"}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Verification Status</span>
                    <p className="font-extrabold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> {profile?.isVerified ? "Verified Expert" : "Active"}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${innerBg}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Specialization Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(profile?.specialization) && profile.specialization.length > 0 ? (
                      profile.specialization.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No specializations added. Update on profile page.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════ REJECT / DECLINE MODAL ══════════════ */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-red-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Decline Interview Request</h3>
                  <p className="text-xs text-slate-400">Candidate: {rejectModal.candidateUser?.firstName || "Candidate"}</p>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold text-slate-300">Reason / Note for Candidate (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Schedule conflict. Please feel free to pick another available slot."
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className={`w-full rounded-xl border p-2.5 text-xs outline-none ${
                    isDark ? "border-white/10 bg-[#0B151E] text-white placeholder-slate-500" : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRejectModal(null)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTakeAction(rejectModal.requestId, "rejected", rejectNote)}
                  disabled={actionLoading === rejectModal.requestId}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
                >
                  {actionLoading === rejectModal.requestId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
