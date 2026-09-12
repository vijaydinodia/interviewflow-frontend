"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Laptop, CheckCircle2, XCircle, Clock, Video, Users,
  Check, X, RefreshCw, AlertCircle, Loader2, Send,
  Calendar, FileText, Code2, Sparkles, ChevronRight,
  ChevronLeft, Menu, Play, RotateCcw, ShieldCheck,
  Search, MessageSquare, ArrowUpRight, Award, Plus, Trash2, Zap, Bug,
  AlertTriangle, Lock, Star
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import DashboardHeader from "../_components/DashboardHeader";
import ReportBugTab from "@/components/ReportBugTab/page";
import LoginSessionsTab from "@/components/LoginSessionsTab/page";
import { getMeetingLinkStatus } from "../candidate/page";
import { api } from "@/api";

const SIDEBAR_ITEMS = [
  { id: "requests",     label: "Incoming Requests",     icon: MessageSquare, badge: "pendingCount" },
  { id: "availability", label: "Schedule & Slots",      icon: Calendar,       badge: null },
  { id: "profile",      label: "My Specializations",    icon: Code2,          badge: null },
  { id: "bugs",         label: "Report Bug / Issues",   icon: Bug,            badge: null },
  { id: "sessions",     label: "Login Sessions & Security", icon: Laptop,     badge: null },
];

export default function InterviewerDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]               = useState(null);
  const [activeTab, setActiveTab]     = useState("requests");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [requests, setRequests]       = useState([]);
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter]   = useState("all");
  const [poolFilter, setPoolFilter]       = useState("all"); // "all" | "direct" | "open"
  const [searchQuery, setSearchQuery]     = useState("");
  const [toast, setToast]             = useState(null);

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState("");

  const [denyModal, setDenyModal]     = useState(null);
  const [denyReason, setDenyReason]   = useState("");

  const [slotsList, setSlotsList] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const [slotFrom, setSlotFrom] = useState("17:00");
  const [slotTo, setSlotTo] = useState("18:00");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Feedback Modal State ──
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackOverallRating, setFeedbackOverallRating] = useState(8);
  const [feedbackSkillRatings, setFeedbackSkillRatings] = useState([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillRating, setNewSkillRating] = useState(8);
  const [feedbackRecommendation, setFeedbackRecommendation] = useState("hire");
  const [feedbackStrengths, setFeedbackStrengths] = useState("");
  const [feedbackAreas, setFeedbackAreas] = useState("");
  const [feedbackGeneralNotes, setFeedbackGeneralNotes] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // ── View Feedback Modal State ──
  const [viewFeedbackModal, setViewFeedbackModal] = useState(null);
  const [loadingFeedbackView, setLoadingFeedbackView] = useState(false);

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
    fetchAllData();
  }, [router]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [reqRes, profileRes] = await Promise.all([
        api.get("/interview-requests/interviewer-requests").catch(() => ({ data: { success: false, data: [] } })),
        api.get("/interviewer/me").catch(() => ({ data: { success: false } })),
      ]);

      const reqJson = reqRes.data;
      const profJson = profileRes.data;

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
      const res = await api.put(`/interview-requests/${requestId}/status`, { status, note });
      const json = res.data;

      if (json.success) {
        showToast("success", `Request marked as ${status}! Candidate notified via email.`);
        setRejectModal(null);
        setRejectNote("");
        fetchAllData();
      } else {
        showToast("error", json.message || "Failed to update status.");
      }
    } catch {
      showToast("error", "Network error updating request status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespondToNewLink = async (requestId, action, denialReason = "") => {
    try {
      setActionLoading(requestId);
      const res = await api.post(`/interview-requests/${requestId}/respond-new-link`, {
        action,
        denialReason,
        durationMinutes: 60,
      });
      const json = res.data;
      if (json.success) {
        showToast(
          "success",
          action === "accept"
            ? "🎉 New Google Meet link granted and activated for candidate (60 min)!"
            : "Meeting link renewal request denied."
        );
        setDenyModal(null);
        setDenyReason("");
        fetchAllData();
      } else {
        showToast("error", json.message || "Failed to respond to link request.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || err.message || "Error processing link response.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Open Feedback Modal for completing an interview ──
  const handleOpenFeedbackModal = (request) => {
    setFeedbackModal(request);
    setFeedbackOverallRating(8);
    setFeedbackRecommendation("hire");
    setFeedbackStrengths("");
    setFeedbackAreas("");
    setFeedbackGeneralNotes("");
    setNewSkillName("");
    setNewSkillRating(8);

    // Auto-seed initial skills from the interview request
    const seeded = [];
    if (request.language && request.language.trim()) {
      seeded.push({ skill: request.language.trim(), rating: 8, notes: "" });
    }
    const topics = Array.isArray(request.topicFocus)
      ? request.topicFocus
      : typeof request.topicFocus === "string"
      ? request.topicFocus.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    topics.forEach((top) => {
      if (!seeded.some((s) => s.skill.toLowerCase() === top.toLowerCase())) {
        seeded.push({ skill: top, rating: 8, notes: "" });
      }
    });
    if (seeded.length === 0 && request.roleRequirement) {
      seeded.push({ skill: request.roleRequirement.trim(), rating: 8, notes: "" });
    }
    setFeedbackSkillRatings(seeded);
  };

  // Add extra skill to feedback form
  const handleAddFeedbackSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (feedbackSkillRatings.some((s) => s.skill.toLowerCase() === trimmed.toLowerCase())) {
      showToast("error", `Skill "${trimmed}" is already added.`);
      return;
    }
    setFeedbackSkillRatings((prev) => [
      ...prev,
      { skill: trimmed, rating: Number(newSkillRating) || 8, notes: "" },
    ]);
    setNewSkillName("");
    setNewSkillRating(8);
  };

  // Remove a skill from feedback form
  const handleRemoveFeedbackSkill = (index) => {
    setFeedbackSkillRatings((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update a skill's rating out of 10
  const handleUpdateSkillRating = (index, rating) => {
    setFeedbackSkillRatings((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, rating: Number(rating) } : item))
    );
  };

  // Submit interview feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackModal) return;
    if (feedbackSkillRatings.length === 0) {
      showToast("error", "Please rate at least one skill tested during the interview.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/interview-requests/${feedbackModal.requestId}/feedback`, {
        overallRating: Number(feedbackOverallRating) || 8,
        skillRatings: feedbackSkillRatings,
        recommendation: feedbackRecommendation,
        strengths: feedbackStrengths,
        areasForImprovement: feedbackAreas,
        generalNotes: feedbackGeneralNotes,
      });

      if (res.data?.success) {
        showToast("success", "🎉 Feedback & skill ratings submitted! Candidate notified.");
        setFeedbackModal(null);
        fetchAllData();
      } else {
        showToast("error", res.data?.message || "Failed to submit feedback.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Error submitting feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Open modal to view existing feedback
  const handleViewFeedback = async (requestId) => {
    setLoadingFeedbackView(true);
    try {
      const res = await api.get(`/interview-requests/${requestId}/feedback`);
      if (res.data?.success && res.data.data) {
        setViewFeedbackModal(res.data.data);
      } else {
        showToast("error", "No feedback record found for this interview.");
      }
    } catch (err) {
      showToast("error", "Could not load feedback details.");
    } finally {
      setLoadingFeedbackView(false);
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
      const res = await api.put("/interviewer/me", { availability: updatedSlots });
      const json = res.data;
      if (json.success) {
        showToast("success", "Availability schedule updated!");
      }
    } catch {
      showToast("error", "Failed to update availability.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleMentor = async () => {
    const nextVal = profile?.isMentor === false ? true : false;
    setProfile((prev) => ({ ...prev, isMentor: nextVal }));
    try {
      const res = await api.put("/interviewer/me", { isMentor: nextVal });
      const json = res.data;
      if (json.success) {
        showToast("success", nextVal ? "🌟 1:1 Mentorship enabled! Candidates can book mentorship with you." : "1:1 Mentorship paused.");
      } else {
        showToast("error", json.message || "Failed to update mentor status.");
      }
    } catch {
      showToast("error", "Network error updating mentor setting.");
    }
  };

  if (!user) return null;

  const totalCount     = requests.length;
  const pendingCount   = requests.filter((r) => r.status === "pending").length;
  const acceptedCount  = requests.filter((r) => r.status === "accepted").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;
  const openPoolCount  = requests.filter((r) => r.requestType === "open" || !r.interviewerUserId).length;
  const directCount    = requests.filter((r) => r.requestType === "direct" && r.interviewerUserId).length;

  const filteredRequests = requests.filter((req) => {
    const byStatus = statusFilter === "all" ? true : req.status === statusFilter;
    const isOpen = req.requestType === "open" || !req.interviewerUserId;
    const byPool =
      poolFilter === "all"
        ? true
        : poolFilter === "open"
        ? isOpen
        : !isOpen;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (req.candidateUser?.firstName && req.candidateUser.firstName.toLowerCase().includes(q)) ||
      (req.candidateUser?.email && req.candidateUser.email.toLowerCase().includes(q)) ||
      (req.roleRequirement && req.roleRequirement.toLowerCase().includes(q)) ||
      (req.roomCode && req.roomCode.toLowerCase().includes(q));
    return byStatus && byPool && matchesSearch;
  });

  const pageBg  = isDark ? "bg-[#0B151E] text-slate-100"  : "bg-slate-50 text-slate-900";
  const sideBg  = isDark ? "bg-[#060D16] border-white/10" : "bg-white border-slate-200";
  const cardBg  = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5"  : "bg-slate-50 border-slate-100";

  return (
    <ProtectedRoute allowedRoles={["interviewer"]}>
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

        {/* Sidebar */}
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
                  {sidebarOpen && item.id === "requests" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      pendingCount > 0
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                        : active ? "bg-white/20 text-white" : "bg-purple-500/20 text-purple-300"
                    }`}>
                      {pendingCount > 0 ? `${pendingCount} new` : requests.length}
                    </span>
                  )}
                  {sidebarOpen && item.id === "availability" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-white/20 text-white" : "bg-cyan-500/20 text-cyan-300"
                    }`}>
                      {slotsList.length}
                    </span>
                  )}
                  {sidebarOpen && item.id === "profile" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {profile?.specialization?.length || 0}
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

        {/* Main workspace */}
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
              <p className="text-xs text-slate-400 mt-0.5">{user.email} • Review candidate interview requests and conduct Google Meet sessions</p>
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

          {/* Verification status banner */}
          {!profile?.isVerified ? (
            <div className="p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-amber-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Clock className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black uppercase tracking-wider">
                      ⏳ Pending Super Admin Approval
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Your Interviewer Profile is Currently Under Review
                  </h3>
                  <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
                    The Super Admin is reviewing your technical credentials and background. Once approved, your account status will automatically transition to <strong className="text-white font-black">Active &amp; Verified</strong>, unlocking full candidate matching and session management.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300">
                  Status: Pending Approval
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    Account Verified by Super Admin <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-400 text-black uppercase">Active</span>
                  </span>
                  <p className="text-[11px] text-emerald-300/80">You are an active interviewer. You can accept technical mock requests and launch Google Meet calls.</p>
                </div>
              </div>
            </div>
          )}

          {/* Incoming requests */}
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Status & Pool Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: "all", label: "All Status", count: totalCount },
                        { id: "pending", label: "Pending", count: pendingCount },
                        { id: "accepted", label: "Accepted", count: acceptedCount },
                        { id: "completed", label: "Completed", count: completedCount },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setStatusFilter(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
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

                    <div className="hidden sm:block h-5 w-px bg-white/10 mx-1" />

                    {/* Source / Pool Pills */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPoolFilter("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                          poolFilter === "all"
                            ? "bg-white/20 text-white border border-white/30"
                            : "text-slate-400 hover:text-white border border-transparent"
                        }`}
                      >
                        All Sources ({totalCount})
                      </button>
                      <button
                        onClick={() => setPoolFilter("direct")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 ${
                          poolFilter === "direct"
                            ? "bg-sky-500 text-white shadow-md"
                            : "text-sky-400 hover:bg-sky-500/10 border border-sky-500/20"
                        }`}
                      >
                        🎯 Direct ({directCount})
                      </button>
                      <button
                        onClick={() => setPoolFilter("open")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 ${
                          poolFilter === "open"
                            ? "bg-teal-500 text-black font-black shadow-md"
                            : "text-teal-300 hover:bg-teal-500/10 border border-teal-500/20"
                        }`}
                      >
                        ⚡ Matching Pool ({openPoolCount})
                      </button>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full lg:w-64">
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
                    {statusFilter === "all" && poolFilter === "all"
                      ? "You haven't received any candidate interview requests yet. Keep your availability updated."
                      : `No requests match the selected filters.`}
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
                    const isOpenPool = req.requestType === "open" || !req.interviewerUserId;
                    const isPending = req.status === "pending";
                    const isAccepted = req.status === "accepted";
                    const isCompleted = req.status === "completed";
                    const isRejected = req.status === "rejected";

                    return (
                      <div
                        key={req.requestId}
                        className={`p-6 rounded-3xl border shadow-xl transition-all space-y-4 ${cardBg} ${
                          isOpenPool && isPending
                            ? "border-teal-500/50 bg-gradient-to-r from-teal-500/5 via-transparent to-transparent hover:border-teal-400"
                            : isPending
                            ? "border-amber-500/40 hover:border-amber-400"
                            : isAccepted
                            ? "border-emerald-500/40 hover:border-emerald-400"
                            : "border-white/10"
                        }`}
                      >
                        {/* Header: Candidate Info & Status Pill */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-12 w-12 rounded-2xl p-0.5 shadow-md flex items-center justify-center shrink-0 ${
                              isOpenPool
                                ? "bg-gradient-to-tr from-teal-400 to-cyan-400"
                                : "bg-gradient-to-tr from-purple-400 to-indigo-400"
                            }`}>
                              <div className={`h-full w-full rounded-[14px] ${isDark ? "bg-[#080E18]" : "bg-white"} flex items-center justify-center font-black text-base ${
                                isOpenPool ? "text-teal-400" : "text-purple-400"
                              }`}>
                                {cName[0]?.toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm text-slate-100 flex flex-wrap items-center gap-2">
                                {cName}

                                {/* Request Type Pill */}
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                  isOpenPool
                                    ? "bg-teal-500/20 text-teal-300 border-teal-400/40"
                                    : "bg-sky-500/20 text-sky-300 border-sky-400/40"
                                }`}>
                                  {isOpenPool ? "⚡ Matching Open Pool" : "🎯 Direct Request"}
                                </span>

                                {/* Status Pill */}
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

                        {/* Candidate Link Renewal Request Banner */}
                        {(req.newLinkRequested || req.newLinkStatus === "pending") && (
                          <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-300 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 font-black text-xs text-amber-300">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                <span>Candidate Requested New Google Meet Link / Extension</span>
                              </div>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-black border border-amber-400/30">
                                Action Needed
                              </span>
                            </div>
                            {req.newLinkReason && (
                              <p className="text-xs text-amber-100/90 italic bg-black/30 p-3 rounded-xl border border-amber-500/20">
                                "{req.newLinkReason}"
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                onClick={() => handleRespondToNewLink(req.requestId, "accept")}
                                disabled={actionLoading === req.requestId}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all"
                              >
                                {actionLoading === req.requestId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                Accept &amp; Grant New Link (60 Min)
                              </button>
                              <button
                                onClick={() => { setDenyModal(req); setDenyReason(""); }}
                                disabled={actionLoading === req.requestId}
                                className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <X className="h-3.5 w-3.5" /> Deny Request
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions Toolbar */}
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                          {isPending && (
                            <>
                              {!isOpenPool && (
                                <button
                                  onClick={() => setRejectModal(req)}
                                  disabled={actionLoading === req.requestId}
                                  className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                  <X className="h-3.5 w-3.5" /> Decline / Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleTakeAction(req.requestId, "accepted")}
                                disabled={actionLoading === req.requestId}
                                className={`px-5 py-2 rounded-xl font-extrabold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 ${
                                  isOpenPool
                                    ? "bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 text-[#0B151E]"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-black"
                                }`}
                              >
                                {actionLoading === req.requestId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : isOpenPool ? (
                                  <Zap className="h-3.5 w-3.5 fill-current" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                {isOpenPool ? "⚡ Accept & Claim Interview" : "Accept & Confirm"}
                              </button>
                            </>
                          )}

                          {isAccepted && (() => {
                            const linkState = getMeetingLinkStatus(req);
                            if (linkState.state === "UPCOMING") {
                              return (
                                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                                  <span>{linkState.label}</span>
                                </div>
                              );
                            }
                            if (linkState.state === "ACTIVE" && req.meetingLink) {
                              return (
                                <a
                                  href={req.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 animate-pulse"
                                >
                                  <Video className="h-3.5 w-3.5 text-black fill-current" /> Join Google Meet Call
                                </a>
                              );
                            }
                            if (linkState.state === "EXPIRED_UNCOMPLETED") {
                              return (
                                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Slot Expired • Please Mark Complete
                                </span>
                              );
                            }
                            return null;
                          })()}

                          {isAccepted && (
                            <button
                              onClick={() => handleOpenFeedbackModal(req)}
                              disabled={actionLoading === req.requestId}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all"
                            >
                              <Award className="h-3.5 w-3.5" /> Complete &amp; Submit Feedback
                            </button>
                          )}

                          {isCompleted && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Completed
                              </span>
                              <button
                                onClick={() => handleViewFeedback(req.requestId)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                              >
                                <FileText className="h-3 w-3" /> View Feedback
                              </button>
                            </div>
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

          {/* Schedule and slots */}
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

          {/* Specializations and profile */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Job Title / Seniority</span>
                    <p className="font-extrabold text-slate-100">{profile?.title || "Senior Software Engineer"}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Tech Company</span>
                    <p className="font-extrabold text-cyan-300">{profile?.company || profile?.companyProfile?.companyName || "Tech Industry Leader"}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Domain / Experience</span>
                    <p className="font-extrabold text-slate-100">{profile?.department || "Engineering"} • {profile?.experience || "5+ Years"}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Verification Status</span>
                    {profile?.isVerified ? (
                      <p className="font-extrabold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified Expert (Active)
                      </p>
                    ) : (
                      <p className="font-extrabold text-amber-400 flex items-center gap-1">
                        <Clock className="h-4 w-4 animate-pulse" /> Pending Review
                      </p>
                    )}
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

                {/* 1:1 Guidance & Mentorship Toggle Card */}
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  profile?.isMentor !== false ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/10 bg-white/[0.02]"
                }`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl ${profile?.isMentor !== false ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30" : "bg-white/5 text-slate-400"}`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-white">Work as 1 : 1 Career &amp; Technical Mentor</h3>
                        {profile?.isMentor !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-cyan-500/20 border-cyan-400/40 text-cyan-300 font-bold">
                            🌟 Active 1:1 Mentor (Default: ON)
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-500/20 border-slate-400/40 text-slate-400 font-bold">
                            Mentorship Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                        Allow candidates to discover your profile in the 1:1 Guidance &amp; Mentorship directory and book 1-on-1 career roadmap, system design, and mock interview video sessions on Google Meet.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto shrink-0">
                    <input
                      type="checkbox"
                      checked={profile?.isMentor !== false}
                      onChange={handleToggleMentor}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-teal-400"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Report bug */}
          {activeTab === "bugs" && <ReportBugTab user={user} isAdmin={false} />}

          {/* Login sessions */}
          {activeTab === "sessions" && <LoginSessionsTab user={user} isAdmin={false} />}
        </main>
      </div>

      {/* Decline modal */}
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

      {/* Deny link request modal */}
      {denyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-amber-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Deny Link Renewal Request</h3>
                  <p className="text-xs text-slate-400">Candidate: {denyModal.candidateUser?.firstName || "Candidate"}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Reason for Denying (Sent to candidate)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Current schedule is full. Please book a fresh slot tomorrow."
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? "border-white/10 bg-[#0B151E] text-white placeholder-slate-500" : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDenyModal(null)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespondToNewLink(denyModal.requestId, "deny", denyReason)}
                  disabled={actionLoading === denyModal.requestId}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow flex items-center justify-center gap-1.5"
                >
                  {actionLoading === denyModal.requestId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  Confirm Denial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit feedback and skill ratings modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
              isDark ? "border-purple-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase flex items-center gap-1 w-fit">
                  <Award className="h-3 w-3" /> Interview Evaluation &amp; Skill Ratings
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Evaluate {feedbackModal.candidateUser?.firstName || "Candidate"}
                </h3>
                <p className="text-xs text-slate-400">
                  Target Role: <strong className="text-cyan-300">{feedbackModal.roleRequirement}</strong> • Room: <strong className="text-slate-300 font-mono">{feedbackModal.roomCode}</strong>
                </p>
              </div>
              <button
                onClick={() => setFeedbackModal(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Overall Score & Recommendation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
                  <label className="font-bold text-slate-200 flex items-center justify-between">
                    <span>Overall Performance Rating</span>
                    <span className="text-purple-300 font-black text-sm">{feedbackOverallRating} / 10 ⭐</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={feedbackOverallRating}
                    onChange={(e) => setFeedbackOverallRating(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1 (Poor)</span>
                    <span>5 (Average)</span>
                    <span>10 (Outstanding)</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl border border-white/10 bg-black/20">
                  <label className="font-bold text-slate-200 block">Hiring Recommendation</label>
                  <select
                    value={feedbackRecommendation}
                    onChange={(e) => setFeedbackRecommendation(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-bold text-xs outline-none ${
                      isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="strong_hire">Strong Hire (Top Tier)</option>
                    <option value="hire">Hire (Meets Requirements)</option>
                    <option value="potential">Potential (Needs More Experience)</option>
                    <option value="needs_work">Needs Work / Not Ready</option>
                  </select>
                  <p className="text-[10px] text-slate-400">Your hiring recommendation for candidate profile matching.</p>
                </div>
              </div>

              {/* ── Skill-by-Skill Evaluation Form (Out of 10) ── */}
              <div className="space-y-3 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      Skills Tested &amp; Rating Out of 10 (Used for Company Matching)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Rate the student on each skill tested during the interview. Companies search and match candidates based on these ratings!
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {feedbackSkillRatings.length} Skills
                  </span>
                </div>

                {/* Add Extra Skill Row */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeedbackSkill();
                      }
                    }}
                    placeholder="Add extra skill tested (e.g. System Design, SQL, Docker)..."
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                  <select
                    value={newSkillRating}
                    onChange={(e) => setNewSkillRating(Number(e.target.value))}
                    className={`w-28 px-2 py-2 rounded-xl border text-xs font-bold outline-none ${
                      isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddFeedbackSkill}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>

                {/* Skill Ratings List */}
                <div className="space-y-2 pt-2">
                  {feedbackSkillRatings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-xs text-slate-100">{item.skill}</span>
                        <input
                          type="text"
                          placeholder="Optional notes (e.g. Good problem decomposition)..."
                          value={item.notes}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFeedbackSkillRatings((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, notes: val } : s))
                            );
                          }}
                          className="w-full text-[10px] text-slate-400 bg-transparent border-none outline-none focus:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <select
                            value={item.rating}
                            onChange={(e) => handleUpdateSkillRating(idx, e.target.value)}
                            className="bg-transparent text-amber-300 font-extrabold text-xs outline-none cursor-pointer"
                          >
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                              <option key={r} value={r} className="bg-[#0B151E] text-white">
                                {r} / 10
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeedbackSkill(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Candidate Key Strengths</label>
                <textarea
                  rows={3}
                  value={feedbackStrengths}
                  onChange={(e) => setFeedbackStrengths(e.target.value)}
                  placeholder="e.g. Clear communication, good understanding of async patterns, wrote clean edge-case tests..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {/* Areas for Improvement Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Areas for Growth / What to Practice</label>
                <textarea
                  rows={3}
                  value={feedbackAreas}
                  onChange={(e) => setFeedbackAreas(e.target.value)}
                  placeholder="e.g. Deepen knowledge of database indexing, practice optimizing time complexity for graph algorithms..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md"
                >
                  {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  {submittingFeedback ? "Submitting..." : "Submit Feedback & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View submitted feedback modal */}
      {viewFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
              isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 uppercase">
                  Verified Interview Evaluation
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Evaluation for {viewFeedbackModal.candidateUser?.firstName || "Candidate"}
                </h3>
                <p className="text-xs text-slate-400">
                  Role: <strong className="text-cyan-300">{viewFeedbackModal.interviewRequest?.roleRequirement}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewFeedbackModal(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Overall Score Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Overall Score</span>
                  <p className="text-2xl font-black text-cyan-300">{viewFeedbackModal.overallRating} / 10 ⭐</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  {viewFeedbackModal.recommendation?.replace("_", " ")}
                </span>
              </div>

              {/* Skills Evaluated */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Skills Evaluated (Out of 10):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.isArray(viewFeedbackModal.skillRatings) && viewFeedbackModal.skillRatings.map((sr, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                      <span className="font-bold text-slate-200">{sr.skill}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-300" /> {sr.rating}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {viewFeedbackModal.strengths && (
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Candidate Strengths:</span>
                  <p className="text-slate-300 leading-relaxed">{viewFeedbackModal.strengths}</p>
                </div>
              )}

              {/* Areas for Improvement */}
              {viewFeedbackModal.areasForImprovement && (
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Areas for Growth:</span>
                  <p className="text-slate-300 leading-relaxed">{viewFeedbackModal.areasForImprovement}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end bg-black/20">
              <button
                onClick={() => setViewFeedbackModal(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
