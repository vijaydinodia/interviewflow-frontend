"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, MapPin, Phone, Mail, Briefcase, Globe, Edit2,
  CheckCircle2, AlertCircle, Sparkles, Loader2, X, Clock,
  FileText, Code2, Check, ShieldCheck, RefreshCw, Upload, Image as ImageIcon,
  ExternalLink, Bug, Copy, ArrowUpRight, TrendingUp, Users, Award,
  ChevronRight, ChevronLeft, Shield, Layers, HelpCircle, Eye, EyeOff, Share2,
  Menu, PlusCircle, UserCheck, Settings
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import DashboardHeader from "../_components/DashboardHeader";
import ReportBugTab from "@/components/ReportBugTab/page";
import LoginSessionsTab from "@/components/LoginSessionsTab/page";
import CompanyQuestionBankTab from "./_components/CompanyQuestionBankTab";
import CompanyCandidateSubmissionsTab from "./_components/CompanyCandidateSubmissionsTab";
import CompanyJobsTab from "./_components/CompanyJobsTab";
import { api } from "@/api";

const EMPTY = {
  companyName:     "",
  tagline:         "",
  website:         "",
  industry:        "",
  companySize:     "",
  location:        "",
  contactPhone:    "",
  contactEmail:    "",
  logoUrl:         "",
  verificationDoc: "",
};

export default function AdminDashboard() {
  const router    = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]             = useState(null);
  const [token, setToken]           = useState(null);
  const [profile, setProfile]       = useState(EMPTY);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [modalTab, setModalTab]     = useState("general"); // "general" | "contact" | "verification"
  const [editForm, setEditForm]     = useState(EMPTY);
  const [activeTab, setActiveTab]   = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast]           = useState(null);
  const [copiedKey, setCopiedKey]   = useState(null);

  // Quick stats state
  const [stats, setStats] = useState({
    jobsCount: 0,
    submissionsCount: 0,
    questionsCount: 0,
  });

  const pdfInputRef = useRef(null);
  const imgInputRef = useRef(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("success", `Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const [jobsRes, subRes, qRes] = await Promise.allSettled([
        api.get("/company/jobs"),
        api.get("/code/company/submissions?limit=50"),
        api.get("/questions/company/my-questions"),
      ]);

      const jobsCount = jobsRes.status === "fulfilled" && jobsRes.value.data?.success && Array.isArray(jobsRes.value.data?.data)
        ? jobsRes.value.data.data.length : 0;
      
      const submissionsCount = subRes.status === "fulfilled" && subRes.value.data?.success && Array.isArray(subRes.value.data?.data)
        ? subRes.value.data.data.length : 0;

      const questionsCount = qRes.status === "fulfilled" && qRes.value.data?.success && Array.isArray(qRes.value.data?.data)
        ? qRes.value.data.data.length : 0;

      setStats({ jobsCount, submissionsCount, questionsCount });
    } catch {
      // ignore stats errors
    }
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      setLoading(true);
      const res = await api.get("/company/me").catch(() => ({ data: { success: false } }));
      const json = res.data;
      if (json.success && json.data) {
        setProfile({ ...EMPTY, ...json.data });
      }
      fetchStats();
    } catch {
      showToast("error", "Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("interviewflow_session");
    if (!session) { router.push("/login"); return; }
    const parsed = JSON.parse(session);
    setUser(parsed);
    const t = localStorage.getItem("interviewflow_token") || parsed.token;
    setToken(t);
    if (t) fetchProfile(t);
    else setLoading(false);
  }, [router]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    const isPdf = type === "pdf";

    if (isPdf) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        showToast("error", "Please upload a valid PDF file.");
        return;
      }
      formData.append("pdf", file);
    } else {
      if (!file.type.startsWith("image/")) {
        showToast("error", "Please upload a valid image file (JPG, PNG, WEBP).");
        return;
      }
      formData.append("image", file);
    }

    try {
      setUploading(true);
      const endpoint = isPdf ? "/upload/pdf" : "/upload/image";
      const res = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const json = res.data;

      if (json.success && json.data?.url) {
        const uploadedUrl = json.data.url;
        showToast("success", `${isPdf ? "Verification PDF" : "Company logo"} uploaded successfully!`);

        if (isPdf) {
          setEditForm((prev) => ({ ...prev, verificationDoc: uploadedUrl }));
        } else {
          setEditForm((prev) => ({ ...prev, logoUrl: uploadedUrl }));
        }
      } else {
        showToast("error", json.message || "Upload failed. Please try again.");
      }
    } catch {
      showToast("error", "Network error during file upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const res = await api.put("/company/me", editForm);
      const json = res.data;
      if (json.success) {
        setProfile({ ...EMPTY, ...json.data });
        setEditOpen(false);
        showToast("success", "Company profile updated successfully!");
      } else {
        showToast("error", json.message || "Failed to update profile.");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Network error. Please try again.";
      showToast("error", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (tabName = "general") => {
    setEditForm({ ...profile });
    setModalTab(tabName);
    setEditOpen(true);
  };

  const calcCompletion = () => {
    const fields = [
      { name: "Company Name",         value: profile.companyName, tab: "general" },
      { name: "Tagline",              value: profile.tagline, tab: "general" },
      { name: "Website",              value: profile.website, tab: "contact" },
      { name: "Industry",             value: profile.industry, tab: "general" },
      { name: "Company Size",         value: profile.companySize, tab: "general" },
      { name: "Location",             value: profile.location, tab: "contact" },
      { name: "Contact Phone",        value: profile.contactPhone, tab: "contact" },
      { name: "Contact Email",        value: profile.contactEmail || user?.email, tab: "contact" },
      { name: "Company Logo",         value: profile.logoUrl, tab: "general" },
      { name: "Verification Document",value: profile.verificationDoc, tab: "verification" },
    ];
    const filled  = fields.filter((f) => f.value && f.value.toString().trim() !== "");
    const missing = fields.filter((f) => !f.value || f.value.toString().trim() === "");
    const pct     = Math.round((filled.length / fields.length) * 100);
    return { pct, filled: filled.length, total: fields.length, missing };
  };

  if (!user) return null;

  const { pct, filled, total, missing } = calcCompletion();
  const displayName  = profile.companyName || user.fullName || user.username || "Your Company";
  const initial      = displayName[0]?.toUpperCase() || "C";
  const isVerified   = profile.isVerified !== false && user?.isActive !== false;

  const cardBg  = isDark ? "bg-[#080E18]/80 backdrop-blur-xl border-white/10" : "bg-white border-slate-200/80 shadow-sm";
  const innerBg = isDark ? "bg-[#0B151E]/90 border-white/5" : "bg-slate-50 border-slate-100";
  const inputCls = `w-full rounded-xl border p-3 text-xs outline-none transition-all focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 ${
    isDark ? "border-white/10 bg-[#080E18] text-white placeholder-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
  }`;

  const sidebarNavItems = [
    {
      group: "Workspace",
      items: [
        { id: "profile", label: "Company Profile", icon: Building2, count: null, description: "Brand & legal identity" },
        { id: "jobs", label: "Job Postings", icon: Briefcase, count: stats.jobsCount, description: "Manage roles & applicants" },
        { id: "questions", label: "Question Bank", icon: Code2, count: stats.questionsCount, description: "Custom coding tests" },
        { id: "assessments", label: "Assessments", icon: FileText, count: stats.submissionsCount, description: "Candidate submissions" },
      ]
    },
    {
      group: "System & Support",
      items: [
        { id: "bugs", label: "Report Bug", icon: Bug, count: null, description: "Submit feedback & issues" },
        { id: "sessions", label: "Login Sessions", icon: ShieldCheck, count: null, description: "Security & devices" },
      ]
    }
  ];

  const activeTabMeta = sidebarNavItems
    .flatMap((g) => g.items)
    .find((i) => i.id === activeTab) || sidebarNavItems[0].items[0];

  return (
    <ProtectedRoute allowedRoles={["admin", "company"]}>
      <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0B151E] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        <DashboardHeader title="Company Workspace" roleBadge="Company Admin" />

        {/* Toast Alert */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold border backdrop-blur-md animate-in slide-in-from-top-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
              : "bg-red-500/20 border-red-400/40 text-red-300"
          }`}>
            {toast.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MAIN WRAPPER: SIDEBAR + CONTENT
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex min-h-[calc(100vh-4.5rem)] relative">

          {/* Mobile Overlay Backdrop */}
          {mobileSidebarOpen && (
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
            />
          )}

          {/* ─────────────────────────────────────────────────────────
              SIDEBAR NAVIGATION
             ───────────────────────────────────────────────────────── */}
          <aside className={`fixed lg:sticky top-0 lg:top-[4.5rem] z-50 lg:z-10 h-screen lg:h-[calc(100vh-4.5rem)] flex flex-col justify-between transition-all duration-300 border-r shrink-0 ${
            isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200"
          } ${
            sidebarOpen ? "w-64" : "w-20"
          } ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}>

            {/* Sidebar Top / Brand Card */}
            <div className="p-4 space-y-4">
              
              {/* Header row inside sidebar */}
              <div className="flex items-center justify-between">
                {sidebarOpen ? (
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-9 w-9 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 to-teal-400 shrink-0 flex items-center justify-center">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt={displayName} className="h-full w-full rounded-[10px] object-cover" />
                      ) : (
                        <div className="h-full w-full rounded-[10px] bg-[#0B151E] flex items-center justify-center font-black text-sm text-cyan-400">
                          {initial}
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <h2 className="text-xs font-black truncate">{displayName}</h2>
                      <span className={`text-[10px] font-bold ${isVerified ? "text-emerald-400" : "text-amber-400"}`}>
                        {isVerified ? "✓ Verified Partner" : "⏳ Review Pending"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-9 w-9 mx-auto rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 to-teal-400 flex items-center justify-center">
                    {profile.logoUrl ? (
                      <img src={profile.logoUrl} alt={displayName} className="h-full w-full rounded-[10px] object-cover" />
                    ) : (
                      <div className="h-full w-full rounded-[10px] bg-[#0B151E] flex items-center justify-center font-black text-sm text-cyan-400">
                        {initial}
                      </div>
                    )}
                  </div>
                )}

                {/* Desktop Collapse / Mobile Close */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Sidebar Profile Progress Ring */}
              {sidebarOpen && (
                <div
                  onClick={() => { setActiveTab("profile"); setMobileSidebarOpen(false); }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all hover:border-cyan-400/40 ${innerBg}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Profile Strength</span>
                    <span className="text-cyan-400 font-extrabold">{pct}%</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100 ? "bg-emerald-400" : pct >= 50 ? "bg-cyan-400" : "bg-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-4 pt-1">
                {sidebarNavItems.map((group) => (
                  <div key={group.group} className="space-y-1">
                    {sidebarOpen && (
                      <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {group.group}
                      </p>
                    )}
                    {group.items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileSidebarOpen(false);
                          }}
                          title={!sidebarOpen ? tab.label : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                            isActive
                              ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-md font-extrabold"
                              : isDark
                              ? "text-slate-300 hover:text-white hover:bg-white/5"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          } ${!sidebarOpen ? "justify-center" : ""}`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-black" : "text-cyan-400"}`} />
                          
                          {sidebarOpen && (
                            <>
                              <span className="truncate flex-1 text-left">{tab.label}</span>
                              {tab.count !== null && tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  isActive
                                    ? "bg-black/20 text-black"
                                    : isDark
                                    ? "bg-white/10 text-slate-300"
                                    : "bg-slate-200 text-slate-700"
                                }`}>
                                  {tab.count}
                                </span>
                              )}
                            </>
                          )}

                          {!sidebarOpen && tab.count !== null && tab.count > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#080E18]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

            </div>

            {/* Sidebar Bottom CTA */}
            <div className="p-3 border-t border-white/10 space-y-2">
              {sidebarOpen ? (
                <button
                  onClick={() => { setActiveTab("jobs"); setMobileSidebarOpen(false); }}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Briefcase className="h-3.5 w-3.5" /> Post Job Opening
                </button>
              ) : (
                <button
                  onClick={() => { setActiveTab("jobs"); setMobileSidebarOpen(false); }}
                  title="Post Job Opening"
                  className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 flex items-center justify-center"
                >
                  <Briefcase className="h-4 w-4" />
                </button>
              )}
            </div>

          </aside>

          {/* ─────────────────────────────────────────────────────────
              MAIN CONTENT PANE
             ───────────────────────────────────────────────────────── */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">

            {/* Top Bar for Mobile Toggle & Breadcrumb */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10 lg:border-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <span>Company Workspace</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-cyan-400">{activeTabMeta.label}</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {activeTabMeta.label}
                  </h1>
                </div>
              </div>

              {/* Quick Actions in content header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit("general")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 space-y-3">
                <Loader2 className="h-9 w-9 animate-spin text-cyan-400" />
                <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading workspace profile...</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                  <div className="space-y-6 animate-in fade-in duration-200">

                    {/* Executive Hero Banner */}
                    <div className={`relative rounded-3xl border overflow-hidden shadow-2xl transition-all ${
                      isDark
                        ? "bg-gradient-to-br from-[#0e1d2c] via-[#080E18] to-[#0b151e] border-white/10"
                        : "bg-gradient-to-br from-cyan-500/10 via-sky-50 to-white border-slate-200"
                    }`}>
                      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                      <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        <div className="flex items-start sm:items-center gap-5">
                          <div className="relative group shrink-0">
                            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 via-sky-400 to-teal-400 shadow-xl overflow-hidden flex items-center justify-center">
                              {profile.logoUrl ? (
                                <img
                                  src={profile.logoUrl}
                                  alt={displayName}
                                  className="h-full w-full rounded-xl object-cover bg-black/40"
                                />
                              ) : (
                                <div className={`h-full w-full rounded-xl flex items-center justify-center font-black text-3xl ${
                                  isDark ? "bg-[#0B151E] text-cyan-400" : "bg-white text-cyan-600"
                                }`}>
                                  {initial}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => openEdit("general")}
                              title="Change Logo"
                              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 shadow-md transition-transform active:scale-95"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                <span className={isDark ? "text-white" : "text-slate-900"}>{displayName}</span>
                              </h2>

                              {isVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Partner
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Clock className="h-3.5 w-3.5" /> Pending Review
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-cyan-400/90 max-w-xl">
                              {profile.tagline || "Add an inspiring company tagline to attract top engineering talent"}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-400">
                              {profile.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {profile.location}
                                </span>
                              )}
                              {profile.industry && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5 text-cyan-400" /> {profile.industry}
                                </span>
                              )}
                              {profile.website && (
                                <a
                                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-cyan-400 hover:underline"
                                >
                                  <Globe className="h-3.5 w-3.5" /> {profile.website.replace(/^https?:\/\//, "")}
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
                          <button
                            onClick={() => openEdit("general")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs transition-all shadow-sm active:scale-95"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                          </button>
                          <button
                            onClick={() => setActiveTab("jobs")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                          >
                            <Briefcase className="h-3.5 w-3.5" /> Post New Job
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* KPI Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div
                        onClick={() => setActiveTab("profile")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] group ${cardBg} ${
                          activeTab === "profile" ? "ring-2 ring-cyan-400/40" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profile Strength</span>
                          <div className={`p-2 rounded-xl border ${
                            pct === 100 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                          }`}>
                            <Sparkles className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-2xl font-black tracking-tight">{pct}%</span>
                          <span className="text-[11px] text-slate-400">({filled}/{total} details)</span>
                        </div>
                        <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct === 100 ? "bg-emerald-400" : pct >= 50 ? "bg-cyan-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveTab("jobs")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] group ${cardBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
                          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:rotate-12 transition-transform">
                            <Briefcase className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-2xl font-black tracking-tight">{stats.jobsCount}</span>
                          <span className="text-[11px] text-slate-400">Postings</span>
                        </div>
                        <p className="mt-1 text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                          Manage roles & applicants <ChevronRight className="h-3 w-3" />
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveTab("assessments")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] group ${cardBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assessments</span>
                          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:rotate-12 transition-transform">
                            <Users className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-2xl font-black tracking-tight">{stats.submissionsCount}</span>
                          <span className="text-[11px] text-slate-400">Evaluated</span>
                        </div>
                        <p className="mt-1 text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                          View candidate code <ChevronRight className="h-3 w-3" />
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveTab("questions")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] group ${cardBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Question Bank</span>
                          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:rotate-12 transition-transform">
                            <Code2 className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-2xl font-black tracking-tight">{stats.questionsCount}</span>
                          <span className="text-[11px] text-slate-400">Challenges</span>
                        </div>
                        <p className="mt-1 text-[10px] text-teal-400 font-bold flex items-center gap-1">
                          Custom test library <ChevronRight className="h-3 w-3" />
                        </p>
                      </div>
                    </div>

                    {/* Verification Status Banner */}
                    {!isVerified ? (
                      <div className="p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-amber-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                            <Clock className="h-6 w-6 animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black uppercase tracking-wider">
                                ⏳ Super Admin Review in Progress
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              Company Account Verification Pending
                            </h3>
                            <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
                              Your company account details are being verified by our platform team. You can still customize your company profile and build technical question banks.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          <button
                            onClick={() => openEdit("verification")}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 hover:bg-amber-400/30 text-xs font-bold transition-all"
                          >
                            Update Verification Doc
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-white flex items-center gap-2">
                              Super Admin Verified Partner
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-black uppercase">
                                Active Status
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-300/80">
                              Your organization is verified to host hiring assessments, publish jobs, and contact candidates directly.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile Strength & Missing Checklist */}
                    <div className={`p-6 rounded-3xl border shadow-xl ${cardBg}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2">
                              Profile Completion Status
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black border ${
                                pct === 100
                                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                                  : pct >= 50
                                  ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-400"
                                  : "bg-amber-500/20 border-amber-400/40 text-amber-400"
                              }`}>
                                {pct}% Complete
                              </span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {filled} of {total} profile parameters configured
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => openEdit("general")}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 text-xs font-bold transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit Profile Details
                        </button>
                      </div>

                      {missing.length > 0 ? (
                        <div className="mt-4 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs space-y-2.5">
                          <div className="flex items-center gap-2 font-bold text-amber-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Recommended fields to complete your profile:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {missing.map((item, i) => (
                              <button
                                key={i}
                                onClick={() => openEdit(item.tab)}
                                className="px-3 py-1.5 rounded-xl bg-black/30 border border-amber-500/30 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/20 hover:text-white transition-all flex items-center gap-1.5"
                              >
                                <span>+ Add {item.name}</span>
                                <ChevronRight className="h-3 w-3 opacity-60" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Awesome! Your company profile is fully completed and optimized.
                        </div>
                      )}
                    </div>

                    {/* Company Details Showcase */}
                    <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${cardBg}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div>
                          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-cyan-400" /> Organization Overview
                          </h2>
                          <p className="text-xs text-slate-400">Public metadata and official recruiter credentials</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(typeof window !== "undefined" ? window.location.href : "", "page-url")}
                            className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                            {copiedKey === "page-url" ? "Link Copied!" : "Share Link"}
                          </button>
                          <button
                            onClick={() => openEdit("general")}
                            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Modify Details
                          </button>
                        </div>
                      </div>

                      {/* Rich Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        {[
                          { icon: Building2, label: "Company Legal Name", value: profile.companyName, key: "companyName" },
                          { icon: MapPin,    label: "Headquarters / Location", value: profile.location, key: "location" },
                          { icon: Briefcase, label: "Industry Domain", value: profile.industry, key: "industry" },
                          { icon: Users,     label: "Company Size", value: profile.companySize, key: "companySize" },
                          {
                            icon: Phone,
                            label: "Contact Phone",
                            value: profile.contactPhone,
                            key: "phone",
                            isCopyable: true,
                            link: profile.contactPhone ? `tel:${profile.contactPhone}` : null
                          },
                          {
                            icon: Mail,
                            label: "Contact Email",
                            value: profile.contactEmail || user?.email,
                            key: "email",
                            isCopyable: true,
                            link: (profile.contactEmail || user?.email) ? `mailto:${profile.contactEmail || user?.email}` : null
                          },
                          {
                            icon: Globe,
                            label: "Official Website",
                            value: profile.website,
                            key: "website",
                            isLink: true,
                            linkUrl: profile.website ? (profile.website.startsWith("http") ? profile.website : `https://${profile.website}`) : null
                          },
                          {
                            icon: Shield,
                            label: "Platform Admin",
                            value: `${user.fullName || user.username || "Admin"} (${user.email})`,
                            key: "admin"
                          }
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className={`p-4 rounded-2xl border space-y-1.5 transition-all hover:border-cyan-400/30 ${innerBg}`}>
                              <div className="flex items-center justify-between text-slate-400 font-bold">
                                <span className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                                  {item.label}
                                </span>

                                {item.isCopyable && item.value && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.value, item.key)}
                                    className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
                                    title="Copy to clipboard"
                                  >
                                    {copiedKey === item.key ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                              </div>

                              {item.isLink && item.value ? (
                                <a
                                  href={item.linkUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-extrabold text-sm text-cyan-400 hover:underline flex items-center gap-1 truncate block"
                                >
                                  {item.value} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                </a>
                              ) : item.link && item.value ? (
                                <a href={item.link} className="font-extrabold text-sm text-slate-100 hover:text-cyan-400 truncate block">
                                  {item.value}
                                </a>
                              ) : (
                                <p className="font-extrabold text-sm text-slate-100 truncate">
                                  {item.value || <span className="text-slate-500 font-normal italic">Not specified</span>}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Verification Document Showcase Card */}
                      <div className={`p-5 rounded-2xl border space-y-3 ${innerBg}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-black uppercase text-cyan-400 flex items-center gap-2">
                                Legal Verification Document (PDF)
                              </h3>
                              <p className="text-[11px] text-slate-400">Certificate of Incorporation, Tax ID, or Business License</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {profile.verificationDoc ? (
                              <>
                                <a
                                  href={profile.verificationDoc}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                  <Eye className="h-3.5 w-3.5" /> View PDF
                                </a>
                                <button
                                  onClick={() => openEdit("verification")}
                                  className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                  <Upload className="h-3.5 w-3.5 text-cyan-400" /> Replace
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openEdit("verification")}
                                className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-400/40 text-red-300 hover:bg-red-400/20 text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <Upload className="h-3.5 w-3.5" /> Upload Document
                              </button>
                            )}
                          </div>
                        </div>

                        {profile.verificationDoc ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pt-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="font-mono text-[11px] text-slate-400 truncate max-w-lg">
                              {profile.verificationDoc}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-300/80 italic">
                            No verification document uploaded. Uploading a valid certificate expedites super admin approval.
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* ── JOBS TAB ── */}
                {activeTab === "jobs" && (
                  <div className="animate-in fade-in duration-200">
                    <CompanyJobsTab user={user} isDark={isDark} />
                  </div>
                )}

                {/* ── QUESTION BANK TAB ── */}
                {activeTab === "questions" && (
                  <div className="animate-in fade-in duration-200">
                    <CompanyQuestionBankTab user={user} isDark={isDark} />
                  </div>
                )}

                {/* ── CANDIDATE ASSESSMENTS TAB ── */}
                {activeTab === "assessments" && (
                  <div className="animate-in fade-in duration-200">
                    <CompanyCandidateSubmissionsTab user={user} isDark={isDark} />
                  </div>
                )}

                {/* ── BUGS TAB ── */}
                {activeTab === "bugs" && (
                  <div className="animate-in fade-in duration-200">
                    <ReportBugTab user={user} isAdmin={false} />
                  </div>
                )}

                {/* ── SESSIONS TAB ── */}
                {activeTab === "sessions" && (
                  <div className="animate-in fade-in duration-200">
                    <LoginSessionsTab user={user} isAdmin={false} />
                  </div>
                )}

              </div>
            )}

          </main>
        </div>

        {/* Hidden file inputs for uploaders */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileUpload(e, "pdf")}
        />
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, "image")}
        />

        {/* ═══════════════════════════════════════════════════════════
            STRUCTURED 3-SECTION EDIT COMPANY MODAL
           ═══════════════════════════════════════════════════════════ */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}>
              
              {/* Modal Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">Edit Company Profile</h3>
                    <p className="text-[11px] text-slate-400">Update company identity, contact channels, and verification assets</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Sub-Tabs (General / Contact / Verification) */}
              <div className={`px-6 pt-3 pb-1 border-b flex gap-2 ${isDark ? "border-white/10 bg-[#080E18]" : "border-slate-100 bg-slate-50"}`}>
                {[
                  { id: "general", label: "Brand & Identity", icon: Building2 },
                  { id: "contact", label: "Contact & Location", icon: MapPin },
                  { id: "verification", label: "Verification Doc", icon: ShieldCheck },
                ].map((t) => {
                  const Icon = t.icon;
                  const isCurrent = modalTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setModalTab(t.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-cyan-500 text-black shadow font-extrabold"
                          : isDark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs font-semibold">
                
                {/* 1. BRAND & IDENTITY TAB */}
                {modalTab === "general" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    
                    {/* Logo Dropzone / Upload Box */}
                    <div className={`p-4 rounded-2xl border ${innerBg} flex flex-col sm:flex-row items-center gap-4`}>
                      <div className="h-16 w-16 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 to-teal-400 shrink-0 overflow-hidden flex items-center justify-center">
                        {editForm.logoUrl ? (
                          <img src={editForm.logoUrl} alt="Preview" className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8 text-[#0B151E]" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5 text-center sm:text-left">
                        <label className="block font-bold text-slate-200">Company Logo</label>
                        <p className="text-[11px] text-slate-400">Upload a crisp square logo (JPG, PNG, WEBP)</p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => imgInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                            {uploading ? "Uploading..." : "Upload New Image"}
                          </button>
                          {editForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setEditForm((prev) => ({ ...prev, logoUrl: "" }))}
                              className="px-2.5 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-slate-300">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.companyName || ""}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. Acme Tech Solutions Inc."
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-slate-300">Company Tagline</label>
                      <input
                        type="text"
                        value={editForm.tagline || ""}
                        onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. Accelerating global engineering excellence"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 font-bold text-slate-300">Industry / Domain</label>
                        <input
                          type="text"
                          value={editForm.industry || ""}
                          onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                          className={inputCls}
                          placeholder="e.g. FinTech / AI / SaaS"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-bold text-slate-300">Company Size</label>
                        <input
                          type="text"
                          value={editForm.companySize || ""}
                          onChange={(e) => setEditForm({ ...editForm, companySize: e.target.value })}
                          className={inputCls}
                          placeholder="e.g. 50 - 200 Employees"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONTACT & LOCATION TAB */}
                {modalTab === "contact" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block mb-1 font-bold text-slate-300">Headquarters / Location</label>
                      <input
                        type="text"
                        value={editForm.location || ""}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. Bengaluru, India (or Remote)"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 font-bold text-slate-300">Contact Phone</label>
                        <input
                          type="text"
                          value={editForm.contactPhone || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                          className={inputCls}
                          placeholder="e.g. +91 9876543210"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-bold text-slate-300">Contact Email</label>
                        <input
                          type="email"
                          value={editForm.contactEmail || ""}
                          onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                          className={inputCls}
                          placeholder="recruiting@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-slate-300">Official Website URL</label>
                      <input
                        type="text"
                        value={editForm.website || ""}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className={inputCls}
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>
                )}

                {/* 3. VERIFICATION DOCUMENT TAB */}
                {modalTab === "verification" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className={`p-5 rounded-2xl border ${innerBg} space-y-3`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-200">Legal Verification Certificate (PDF)</label>
                          <p className="text-[11px] text-slate-400">Upload Certificate of Incorporation or GST/Tax Registration</p>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => pdfInputRef.current?.click()}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/40 text-red-300 hover:bg-red-400/20 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploading ? "Uploading Document..." : "Select & Upload PDF"}
                        </button>

                        {editForm.verificationDoc && (
                          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold truncate">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span className="truncate max-w-xs">{editForm.verificationDoc}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-300 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-cyan-400" /> Super Admin Verification Guarantee
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Uploaded verification documents are strictly confidential and only accessed by the platform Super Admin to approve your company hiring account.
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className={`flex items-center justify-between gap-3 pt-4 border-t ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className={`px-5 py-2.5 rounded-xl border font-bold ${
                      isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    {modalTab !== "verification" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (modalTab === "general") setModalTab("contact");
                          else if (modalTab === "contact") setModalTab("verification");
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors"
                      >
                        Next Step →
                      </button>
                    ) : null}

                    <button
                      type="submit"
                      disabled={saving || uploading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-black font-extrabold shadow-lg shadow-cyan-500/20 hover:brightness-110 flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {saving ? "Saving Changes..." : "Save Profile"}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
