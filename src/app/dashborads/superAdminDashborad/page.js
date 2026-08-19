"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Building2, CheckCircle2, XCircle, Trash2,
  AlertCircle, Check, Loader2, RefreshCw, UserCheck, ShieldAlert,
  Search, Users, RotateCcw, UserCog, Briefcase, Menu, X, Eye,
  ExternalLink, Globe, MapPin, Mail, Phone, Calendar, Code2,
  Award, Clock, FileText, CheckCircle, Tag, Sparkles, Layers
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import DashboardHeader from "../_components/DashboardHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SIDEBAR_TABS = [
  { id: "companies",    label: "Companies",    icon: Building2 },
  { id: "interviewers", label: "Interviewers", icon: UserCog },
  { id: "candidates",   label: "Candidates",   icon: Briefcase },
  { id: "all_users",    label: "All Users",    icon: Users },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]                 = useState(null);
  const [token, setToken]               = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [activeSection, setActiveSection] = useState("companies");

  const [allUsers, setAllUsers]         = useState([]);
  const [companies, setCompanies]       = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates]     = useState([]);

  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterTab, setFilterTab]       = useState("all");
  const [searchTerm, setSearchTerm]     = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [detailModal, setDetailModal]   = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const session = localStorage.getItem("interviewflow_session");
    if (!session) { router.push("/login"); return; }
    const parsed = JSON.parse(session);
    setUser(parsed);
    const t = localStorage.getItem("interviewflow_token") || parsed.token;
    setToken(t);
    fetchAllData(t);
  }, [router]);

  const fetchAllData = async (authToken) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/super-admin/users`, {
        headers: { Authorization: `Bearer ${authToken || token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        splitUsers(json.data);
      }
    } catch {
      showToast("error", "Failed to fetch users from backend.");
    } finally {
      setLoading(false);
    }
  };

  const splitUsers = (users) => {
    setAllUsers(users);
    setCompanies(users.filter((u) => u.role === "admin" || u.role === "company"));
    setInterviewers(users.filter((u) => u.role === "interviewer"));
    setCandidates(users.filter((u) => u.role === "candidate"));
  };

  const patchAll = (userId, patch) => {
    const upd = (prev) => prev.map((x) => x.userId === userId ? { ...x, ...patch } : x);
    setAllUsers(upd); setCompanies(upd); setInterviewers(upd); setCandidates(upd);
    if (detailModal && detailModal.userId === userId) {
      setDetailModal((prev) => ({ ...prev, ...patch }));
    }
  };

  const removeAll = (userId) => {
    const rm = (prev) => prev.filter((x) => x.userId !== userId);
    setAllUsers(rm); setCompanies(rm); setInterviewers(rm); setCandidates(rm);
    if (detailModal && detailModal.userId === userId) {
      setDetailModal(null);
    }
  };

  const doFetch = async (url, method, authToken) => {
    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${authToken || token}` } });
      return await res.json();
    } catch {
      return { success: false };
    }
  };

  const handleRestore = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/users/${item.userId}/restore`, "PUT", token);
    setActionLoading(null);
    patchAll(item.userId, { isActive: true });
    showToast(json.success ? "success" : "error",
      json.success ? `"${item.email}" restored!` : json.message || "Failed to restore.");
  };

  const handleSoftDelete = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/users/${item.userId}/soft`, "DELETE", token);
    setActionLoading(null);
    setConfirmModal(null);
    patchAll(item.userId, { isActive: false });
    showToast(json.success ? "success" : "error",
      json.success ? `"${item.email}" deactivated.` : json.message || "Failed.");
  };

  const handleHardDelete = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/users/${item.userId}/hard`, "DELETE", token);
    setActionLoading(null);
    setConfirmModal(null);
    removeAll(item.userId);
    showToast(json.success ? "success" : "error",
      json.success ? `"${item.email}" permanently deleted.` : json.message || "Failed.");
  };

  const handleApprove = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/companies/${item.userId}/approve`, "PUT", token);
    setActionLoading(null);
    patchAll(item.userId, { isActive: true });
    showToast(json.success ? "success" : "error",
      json.success ? "Company approved!" : json.message || "Failed.");
  };

  const handleReject = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/companies/${item.userId}/reject`, "PUT", token);
    setActionLoading(null);
    patchAll(item.userId, { isActive: false });
    showToast(json.success ? "success" : "error",
      json.success ? "Company rejected." : json.message || "Failed.");
  };

  if (!user) return null;

  const rawList =
    activeSection === "companies"    ? companies :
    activeSection === "interviewers" ? interviewers :
    activeSection === "candidates"   ? candidates : allUsers;

  const totalCount    = rawList.length;
  const activeCount   = rawList.filter((x) => x.isActive !== false).length;
  const inactiveCount = rawList.filter((x) => x.isActive === false).length;

  const filtered = rawList.filter((item) => {
    const byTab =
      filterTab === "active"   ? item.isActive !== false :
      filterTab === "inactive" ? item.isActive === false : true;
    const s = searchTerm.toLowerCase();
    const cName = item.companyProfile?.companyName || item.profile?.company || "";
    const name = `${item.firstName || ""} ${item.lastName || ""} ${item.username || ""}`.toLowerCase();
    const email = (item.email || "").toLowerCase();
    return byTab && (name.includes(s) || email.includes(s) || cName.toLowerCase().includes(s));
  });

  const isCompanySection = activeSection === "companies";

  const roleBadge = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") return "bg-amber-500/20 border-amber-400/40 text-amber-300";
    if (r === "admin" || r === "company") return "bg-cyan-500/20 border-cyan-400/40 text-cyan-300";
    if (r === "interviewer") return "bg-purple-500/20 border-purple-400/40 text-purple-300";
    return "bg-emerald-500/20 border-emerald-400/40 text-emerald-300";
  };

  const avatarColor = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") return "bg-amber-400 text-black";
    if (r === "admin" || r === "company") return "bg-cyan-400 text-[#0B151E]";
    if (r === "interviewer") return "bg-purple-400 text-white";
    return "bg-emerald-400 text-black";
  };

  const cardBg  = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const pageBg  = isDark ? "bg-[#0B151E] text-slate-100"  : "bg-slate-50 text-slate-900";
  const sideBg  = isDark ? "bg-[#060D16] border-white/10" : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5"  : "bg-slate-50 border-slate-100";

  return (
    <div className={`h-screen flex flex-col ${pageBg} transition-colors overflow-hidden`}>
      <DashboardHeader title="Super Admin Dashboard" roleBadge="Super Admin" />

      {/* ── Toast ── */}
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

        {/* ══════════════════ SIDEBAR ══════════════════ */}
        <aside className={`h-full flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sideBg} ${sidebarOpen ? "w-64" : "w-18 sm:w-20"} hidden md:flex overflow-hidden`}>

          {/* Sidebar Top */}
          <div className={`flex-shrink-0 flex items-center justify-between px-4 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center font-black text-xs text-black">
                  SA
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-400">
                  Governance
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-xl border text-slate-400 hover:text-white transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
              } ${!sidebarOpen ? "mx-auto" : ""}`}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav Tabs */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0">
            {SIDEBAR_TABS.map((tab) => {
              const Icon  = tab.icon;
              const count =
                tab.id === "companies"    ? companies.length :
                tab.id === "interviewers" ? interviewers.length :
                tab.id === "candidates"   ? candidates.length : allUsers.length;
              const active = activeSection === tab.id;

              return (
                <button
                  key={tab.id}
                  title={tab.label}
                  onClick={() => {
                    setActiveSection(tab.id);
                    setFilterTab("all");
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 text-black font-black shadow-lg shadow-amber-400/20"
                      : isDark
                      ? "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                      : "text-slate-600 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-black" : "text-amber-400"}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left truncate">{tab.label}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        active ? "bg-black/20 text-black" : "bg-white/10 text-slate-300"
                      }`}>
                        {count}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className={`flex-shrink-0 p-3.5 border-t ${isDark ? "border-white/10 bg-white/2" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 p-0.5 shrink-0">
                <div className={`h-full w-full rounded-[10px] ${isDark ? "bg-[#060D16]" : "bg-white"} flex items-center justify-center font-black text-xs text-amber-400`}>
                  SA
                </div>
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-xs truncate text-slate-100">
                    {user.fullName || user.username || "Super Admin"}
                  </p>
                  <p className="text-[10px] text-amber-400 font-bold">System Super Admin</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ══════════════════ MAIN WORKSPACE ══════════════════ */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">

          {/* Page Heading & Refresh Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold flex items-center gap-2">
                Super Admin Master Control
                <span className="text-xs px-2.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400">
                  Global Access
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Deep inspection and full audit controls for Candidates, Interviewers, Companies, and Accounts
              </p>
            </div>

            <button
              onClick={() => fetchAllData(token)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* 3 Summary Stats Cards */}
          <div className="grid grid-cols-3 gap-3.5">
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1 shadow-lg`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total {activeSection}</span>
              <p className="text-2xl font-black text-slate-200">{totalCount}</p>
            </div>
            <div className={`p-4 rounded-2xl border border-emerald-500/30 ${cardBg} space-y-1 shadow-lg`}>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Active & Verified</span>
              <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
            </div>
            <div className={`p-4 rounded-2xl border border-red-500/30 ${cardBg} space-y-1 shadow-lg`}>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Inactive / Pending</span>
              <p className="text-2xl font-black text-red-400">{inactiveCount}</p>
            </div>
          </div>

          {/* Table Container Card */}
          <div className={`rounded-3xl border shadow-xl overflow-hidden ${cardBg}`}>

            {/* Filter Bar */}
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              {/* Filter tabs */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: "all",      label: "All Records", count: totalCount },
                  { id: "active",   label: "Active",      count: activeCount },
                  { id: "inactive", label: "Inactive",    count: inactiveCount },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      filterTab === t.id
                        ? "bg-amber-400 text-black shadow-md"
                        : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                        : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{t.count}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
                    isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 space-y-2">
                <Users className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-slate-400">No records found.</p>
                <p className="text-xs text-slate-500">Accounts will appear here once registered.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`text-[11px] font-black uppercase tracking-wider border-b ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                      <th className="py-3.5 px-5">Name / Account</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Specialization / Domain</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Registered</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                    {filtered.map((item) => {
                      const isActive    = item.isActive !== false;
                      const isBusy      = actionLoading === item.userId;
                      const role        = item.role || "candidate";
                      const displayName =
                        item.companyProfile?.companyName ||
                        (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : null) ||
                        item.fullName || item.username || item.email?.split("@")[0] || "Account";
                      const initial = displayName[0]?.toUpperCase() || "U";

                      // Specialized subtitle text
                      let domainTag = "—";
                      if (role === "admin" || role === "company") {
                        domainTag = item.companyProfile?.industry || item.profile?.industry || "Tech Enterprise";
                      } else if (role === "interviewer") {
                        domainTag = item.interviewerProfile?.title || "Technical Interviewer";
                      } else if (role === "candidate") {
                        domainTag = item.candidateProfile?.currentRole || "Software Engineer";
                      }

                      return (
                        <tr key={item.userId} className={`transition-colors ${isDark ? "hover:bg-white/[0.025]" : "hover:bg-slate-50"}`}>

                          {/* Name + Avatar */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${avatarColor(role)}`}>
                                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : initial}
                              </div>
                              <div>
                                <p className="font-extrabold text-sm leading-tight text-slate-100">{displayName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{item.userId?.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">{item.email}</td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${roleBadge(role)}`}>
                              {role === "admin" ? "Company" : role}
                            </span>
                          </td>

                          {/* Domain / Specialization Tag */}
                          <td className="py-3.5 px-4 text-slate-300 font-semibold">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px]">
                              {domainTag}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black ${
                              isActive
                                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                                : "bg-red-500/20 border-red-400/40 text-red-400"
                            }`}>
                              {isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Registered Date */}
                          <td className="py-3.5 px-4 text-slate-400">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center flex-wrap gap-1.5">

                              {/* 👁️ View Full Detailed Profile */}
                              <button
                                onClick={() => setDetailModal(item)}
                                title="View Comprehensive Details"
                                className="px-2.5 py-1 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-[10px] font-black flex items-center gap-1 transition-colors"
                              >
                                <Eye className="h-3 w-3" /> Details
                              </button>

                              {/* Approve / Reject for Companies */}
                              {isCompanySection && (
                                <>
                                  <button
                                    disabled={isBusy || isActive}
                                    onClick={() => handleApprove(item)}
                                    title="Approve"
                                    className={`px-2 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 transition-colors ${
                                      isActive ? "opacity-40 cursor-not-allowed border-white/5 text-slate-500"
                                               : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    }`}
                                  >
                                    <CheckCircle2 className="h-3 w-3" /> Approve
                                  </button>
                                  <button
                                    disabled={isBusy || !isActive}
                                    onClick={() => handleReject(item)}
                                    title="Reject"
                                    className={`px-2 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 transition-colors ${
                                      !isActive ? "opacity-40 cursor-not-allowed border-white/5 text-slate-500"
                                               : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                    }`}
                                  >
                                    <XCircle className="h-3 w-3" /> Reject
                                  </button>
                                </>
                              )}

                              {/* Restore */}
                              <button
                                disabled={isBusy || isActive}
                                onClick={() => handleRestore(item)}
                                title="Restore account"
                                className={`px-2 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 transition-colors ${
                                  isActive ? "opacity-40 cursor-not-allowed border-white/5 text-slate-500"
                                           : "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                                }`}
                              >
                                <RotateCcw className="h-3 w-3" /> Restore
                              </button>

                              {/* Soft Delete */}
                              <button
                                disabled={isBusy || !isActive}
                                onClick={() => setConfirmModal({ type: "soft", item })}
                                title="Soft delete (deactivate)"
                                className={`px-2 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 transition-colors ${
                                  !isActive ? "opacity-40 cursor-not-allowed border-white/5 text-slate-500"
                                            : "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                                }`}
                              >
                                <XCircle className="h-3 w-3" /> Deactivate
                              </button>

                              {/* Hard Delete */}
                              <button
                                disabled={isBusy}
                                onClick={() => setConfirmModal({ type: "hard", item })}
                                title="Permanently delete from database"
                                className="px-2 py-1 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-black flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════════ COMPREHENSIVE DETAIL INSPECTION MODAL ══════════════════ */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-amber-400/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>

            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-white/10 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${avatarColor(detailModal.role)}`}>
                  {(detailModal.firstName || detailModal.companyProfile?.companyName || detailModal.username || detailModal.email)[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    {detailModal.companyProfile?.companyName ||
                      (detailModal.firstName ? `${detailModal.firstName} ${detailModal.lastName || ""}`.trim() : null) ||
                      detailModal.fullName || detailModal.username}
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-black ${roleBadge(detailModal.role)}`}>
                      {detailModal.role}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{detailModal.email} • UUID: {detailModal.userId}</p>
                </div>
              </div>

              <button
                onClick={() => setDetailModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">

              {/* 1. Account Core Info */}
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-2">Account Overview</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                    <p className={`font-extrabold flex items-center gap-1 ${detailModal.isActive !== false ? "text-emerald-400" : "text-red-400"}`}>
                      {detailModal.isActive !== false ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {detailModal.isActive !== false ? "Active & Verified" : "Inactive / Suspended"}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Username</span>
                    <p className="font-extrabold text-slate-100 font-mono">{detailModal.username || "—"}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Created Date</span>
                    <p className="font-bold text-slate-300">
                      {detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Candidate Detailed Profile */}
              {(detailModal.role === "candidate" || detailModal.candidateProfile) && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-2">Candidate Profile & Readiness</span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Target Role</span>
                        <p className="font-extrabold text-slate-100">{detailModal.candidateProfile?.currentRole || "Not specified"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                        <p className="font-extrabold text-emerald-400">{detailModal.candidateProfile?.yearsExperience ? `${detailModal.candidateProfile.yearsExperience} Years` : "—"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                        <p className="font-extrabold text-slate-100">{detailModal.candidateProfile?.preferredLocation || "Remote"}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className={`p-3.5 rounded-2xl border space-y-2 ${innerBg}`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(detailModal.candidateProfile?.skills) && detailModal.candidateProfile.skills.length > 0 ? (
                          detailModal.candidateProfile.skills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">No skills listed</span>
                        )}
                      </div>
                    </div>

                    {/* Portfolio & Resume Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {detailModal.candidateProfile?.githubUrl && (
                        <a href={detailModal.candidateProfile.githubUrl} target="_blank" rel="noreferrer" className={`p-3 rounded-2xl border flex items-center justify-between hover:border-emerald-400 transition-colors ${innerBg}`}>
                          <span className="font-bold text-slate-200">GitHub</span>
                          <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                        </a>
                      )}
                      {detailModal.candidateProfile?.linkedinUrl && (
                        <a href={detailModal.candidateProfile.linkedinUrl} target="_blank" rel="noreferrer" className={`p-3 rounded-2xl border flex items-center justify-between hover:border-emerald-400 transition-colors ${innerBg}`}>
                          <span className="font-bold text-slate-200">LinkedIn</span>
                          <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                        </a>
                      )}
                      {detailModal.candidateProfile?.resumeUrl && (
                        <a href={detailModal.candidateProfile.resumeUrl} target="_blank" rel="noreferrer" className={`p-3 rounded-2xl border flex items-center justify-between border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors`}>
                          <span className="font-bold">Resume PDF</span>
                          <FileText className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Interviewer Detailed Profile */}
              {(detailModal.role === "interviewer" || detailModal.interviewerProfile) && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-2">Interviewer Profile & Specializations</span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Designation / Title</span>
                        <p className="font-extrabold text-slate-100">{detailModal.interviewerProfile?.title || "Interviewer"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                        <p className="font-extrabold text-purple-400">{detailModal.interviewerProfile?.department || "Engineering"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Associated Company</span>
                        <p className="font-extrabold text-slate-100">
                          {detailModal.interviewerProfile?.company?.companyName || "Independent"}
                        </p>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className={`p-3.5 rounded-2xl border space-y-2 ${innerBg}`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Specialization Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(detailModal.interviewerProfile?.specialization) && detailModal.interviewerProfile.specialization.length > 0 ? (
                          detailModal.interviewerProfile.specialization.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">No specializations specified</span>
                        )}
                      </div>
                    </div>

                    {/* Availability Slots */}
                    {Array.isArray(detailModal.interviewerProfile?.availability) && detailModal.interviewerProfile.availability.length > 0 && (
                      <div className={`p-3.5 rounded-2xl border space-y-2 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Availability Slots</span>
                        <div className="flex flex-wrap gap-2">
                          {detailModal.interviewerProfile.availability.map((slot, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold">
                              🕒 {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Company Detailed Profile */}
              {(detailModal.role === "admin" || detailModal.role === "company" || detailModal.companyProfile) && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-2">Company Information & Verification</span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Company Name</span>
                        <p className="font-extrabold text-slate-100">{detailModal.companyProfile?.companyName || "—"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Industry</span>
                        <p className="font-extrabold text-cyan-400">{detailModal.companyProfile?.industry || "Tech"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Size</span>
                        <p className="font-extrabold text-slate-100">{detailModal.companyProfile?.companySize || "1-50"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Website</span>
                        <p className="font-bold text-cyan-400 truncate">{detailModal.companyProfile?.website || "—"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                        <p className="font-bold text-slate-300">{detailModal.companyProfile?.location || "India"}</p>
                      </div>
                      <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                        <p className="font-bold text-slate-300 font-mono">{detailModal.companyProfile?.contactPhone || "—"}</p>
                      </div>
                    </div>

                    {/* Verification Document */}
                    {detailModal.companyProfile?.verificationDocUrl && (
                      <a
                        href={detailModal.companyProfile.verificationDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-3.5 rounded-2xl border flex items-center justify-between border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-extrabold">View Company Registration Document</span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between p-4 border-t ${isDark ? "border-white/10 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
              <button
                onClick={() => setDetailModal(null)}
                className={`px-5 py-2 rounded-xl border text-xs font-bold ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                Close Inspector
              </button>

              <div className="flex items-center gap-2">
                {detailModal.isActive === false ? (
                  <button
                    onClick={() => handleRestore(detailModal)}
                    className="px-4 py-2 rounded-xl bg-sky-500 text-white font-extrabold text-xs shadow hover:bg-sky-400 flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore Account
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setConfirmModal({ type: "soft", item: detailModal });
                      setDetailModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold text-xs shadow hover:bg-orange-400 flex items-center gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Deactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
            confirmModal.type === "hard"
              ? isDark ? "border-red-500/40 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
              : isDark ? "border-orange-500/40 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${
                confirmModal.type === "hard" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
              }`}>
                {confirmModal.type === "hard" ? <Trash2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-base font-extrabold">
                  {confirmModal.type === "hard" ? "Permanent Delete" : "Deactivate Account"}
                </h3>
                <p className="text-xs text-slate-400">{confirmModal.item?.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.type === "hard"
                ? "This will permanently remove the user and all associated records from MySQL database. This action CANNOT be undone."
                : "This will deactivate the account. The user will be unable to log in, but can be restored at any time by Super Admin."}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModal.type === "hard" ? handleHardDelete(confirmModal.item) : handleSoftDelete(confirmModal.item)}
                className={`flex-1 py-2.5 rounded-xl text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 ${
                  confirmModal.type === "hard" ? "bg-red-500 hover:bg-red-400" : "bg-orange-500 hover:bg-orange-400"
                }`}
              >
                Confirm {confirmModal.type === "hard" ? "Delete" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
