"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Building2, CheckCircle2, XCircle, Trash2,
  AlertCircle, Check, Loader2, RefreshCw, UserCheck, ShieldAlert,
  Search, Users, RotateCcw, UserCog, Briefcase, Menu, X, Eye,
  ExternalLink, Globe, MapPin, Mail, Phone, Calendar, Code2,
  Award, Clock, FileText, CheckCircle, Tag, Sparkles, Layers, User,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, Bug, Activity, LayoutDashboard
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import DashboardHeader from "../_components/DashboardHeader";
import SuperAdminOverviewHome from "@/components/SuperAdminOverviewHome/page";
import ReportBugTab from "@/components/ReportBugTab/page";
import LoginSessionsTab from "@/components/LoginSessionsTab/page";
import QuestionManagerTab from "@/components/QuestionManagerTab/page";
import SystemMonitoringTab from "@/components/SystemMonitoringTab/page";
import { api } from "@/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SIDEBAR_TABS = [
  { id: "overview",     label: "Overview Home",  icon: LayoutDashboard },
  { id: "companies",    label: "Companies",      icon: Building2 },
  { id: "interviewers", label: "Interviewers",   icon: UserCog },
  { id: "candidates",   label: "Candidates",     icon: Briefcase },
  { id: "questions",    label: "Questions",      icon: Code2 },
  { id: "bugs",         label: "Bug Reports",    icon: Bug },
  { id: "sessions",     label: "Login Sessions", icon: ShieldAlert },
  { id: "monitoring",   label: "System Monitoring", icon: Activity },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [allUsers, setAllUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [monitoringData, setMonitoringData] = useState(null);

  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const [filterTab, setFilterTab]       = useState("all");
  const [searchTerm, setSearchTerm]     = useState("");
  const [sortBy, setSortBy]             = useState("createdAt");
  const [sortOrder, setSortOrder]       = useState("DESC");

  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [detailModal, setDetailModal]   = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
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
    fetchAllData(false);

    // Continuous Real-Time Live Sync (every 5 seconds)
    const liveTimer = setInterval(() => {
      fetchAllData(true);
    }, 5000);

    return () => clearInterval(liveTimer);
  }, [router]);

  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resUsers, resCompanies, bugRes, sessionRes, questionRes, monRes] = await Promise.all([
        api.get("/super-admin/users").catch((err) => ({ data: { success: false, data: [] } })),
        api.get("/super-admin/companies").catch((err) => ({ data: { success: false, data: [] } })),
        api.get("/bugs/all").catch((err) => ({ data: { success: false, data: [] } })),
        api.get("/sessions/all").catch(() => ({ data: {} })),
        api.get("/questions/count").catch(() => api.get("/api/questions/count")).catch(() => ({ data: {} })),
        api.get("/monitoring/dashboard").catch(() => ({ data: {} })),
      ]);

      const jsonUsers = resUsers.data;
      const jsonCompanies = resCompanies.data;
      const bugJson = bugRes.data;
      const sessionJson = sessionRes.data;
      const questionJson = questionRes.data;
      const monJson = monRes.data;

      if (monJson && monJson.success) {
        setMonitoringData(monJson);
      }

      if (questionJson && questionJson.count !== undefined) {
        setQuestionsCount(questionJson.count);
      }

      let companyList = [];

      if (jsonUsers.success && Array.isArray(jsonUsers.data)) {
        splitUsers(jsonUsers.data);
        companyList = jsonUsers.data.filter((u) => {
          const r = (u.role || "").toLowerCase();
          return r === "admin" || r === "company" || r.includes("company") || !!u.companyProfile;
        });
      }

      if (jsonCompanies.success && Array.isArray(jsonCompanies.data)) {
        const rawCompanies = jsonCompanies.data.map((c) => {
          if (c.userId && !c.user) {
            return {
              ...c,
              isActive: c.isActive !== false && c.isActive !== 0,
            };
          }
          if (c.user) {
            return {
              ...c.user,
              companyProfile: c,
              isActive: c.user.isActive !== false && c.user.isActive !== 0,
            };
          }
          return {
            userId: c.companyId,
            role: "admin",
            email: c.contactEmail || "company@interviewflow.com",
            firstName: c.companyName,
            companyProfile: c,
            isActive: c.isVerified === true || c.isVerified === 1,
            createdAt: c.createdAt,
          };
        });

        const existingIds = new Set(companyList.map((x) => x.userId));
        rawCompanies.forEach((rc) => {
          if (rc.userId && !existingIds.has(rc.userId)) {
            companyList.push(rc);
            existingIds.add(rc.userId);
          } else if (rc.userId && existingIds.has(rc.userId)) {
            const idx = companyList.findIndex((x) => x.userId === rc.userId);
            if (idx !== -1 && rc.companyProfile) {
              companyList[idx].companyProfile = {
                ...(companyList[idx].companyProfile || {}),
                ...rc.companyProfile,
              };
            }
          }
        });
      }

      setCompanies(companyList);

      if (bugJson.success && Array.isArray(bugJson.data)) {
        setBugs(bugJson.data);
      }

      if (sessionJson.success && Array.isArray(sessionJson.data)) {
        setSessionsList(sessionJson.data);
      } else if (Array.isArray(sessionJson)) {
        setSessionsList(sessionJson);
      }
    } catch (err) {
      console.error("Error fetching super admin dashboard data:", err);
      if (!silent) showToast("error", "Failed to fetch dashboard data.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const splitUsers = (users) => {
    setAllUsers(users);
    setCompanies(users.filter((u) => {
      const r = (u.role || "").toLowerCase();
      return r === "admin" || r === "company" || r.includes("company") || !!u.companyProfile;
    }));
    setInterviewers(users.filter((u) => (u.role || "").toLowerCase() === "interviewer"));
    setCandidates(users.filter((u) => (u.role || "").toLowerCase() === "candidate"));
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

  const doFetch = async (url, method, data) => {
    try {
      const path = url.replace(API_BASE, "");
      const res = await api({ method, url: path, data });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Request failed";
      return { success: false, message: msg };
    }
  };

  const handleRestore = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/users/${item.userId}/restore`, "PUT");
    setActionLoading(null);
    if (json.success) {
      patchAll(item.userId, { isActive: true });
      showToast("success", `"${item.email}" restored!`);
    } else {
      showToast("error", json.message || "Failed to restore.");
    }
  };

  const handleSoftDelete = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/users/${item.userId}/soft`, "DELETE");
    setActionLoading(null);
    setConfirmModal(null);
    if (json.success) {
      patchAll(item.userId, { isActive: false });
      showToast("success", `"${item.email}" deactivated.`);
    } else {
      showToast("error", json.message || "Failed to deactivate.");
    }
  };

  const handleHardDelete = async (item) => {
    setActionLoading(item.userId);
    const json = await doFetch(`${API_BASE}/super-admin/users/${item.userId}/hard`, "DELETE");
    setActionLoading(null);
    setConfirmModal(null);
    if (json.success) {
      removeAll(item.userId);
      showToast("success", `"${item.email}" permanently deleted.`);
    } else {
      showToast("error", json.message || "Failed to delete.");
    }
  };

  const handleApprove = async (item) => {
    const targetId = item.userId || item.companyProfile?.userId || item.companyId || item.companyProfile?.companyId;
    setActionLoading(item.userId || targetId);
    const json = await doFetch(`${API_BASE}/super-admin/companies/${targetId}/approve`, "PUT");
    setActionLoading(null);
    if (json.success) {
      patchAll(item.userId, { 
        isActive: true, 
        companyProfile: { ...(item.companyProfile || {}), isVerified: true } 
      });
      showToast("success", `Company "${item.companyProfile?.companyName || item.email}" approved & credentials emailed!`);
    } else {
      showToast("error", json.message || "Failed to approve company in database.");
    }
  };

  const handleReject = async (item) => {
    const targetId = item.userId || item.companyProfile?.userId || item.companyId || item.companyProfile?.companyId;
    setActionLoading(item.userId || targetId);
    const json = await doFetch(`${API_BASE}/super-admin/companies/${targetId}/reject`, "PUT");
    setActionLoading(null);
    if (json.success) {
      patchAll(item.userId, { 
        isActive: false, 
        companyProfile: { ...(item.companyProfile || {}), isVerified: false } 
      });
      showToast("success", "Company marked inactive / pending.");
    } else {
      showToast("error", json.message || "Failed to update company status.");
    }
  };

  const handleApproveInterviewer = async (item) => {
    const targetId = item.userId || item.interviewerProfile?.userId || item.interviewerId || item.interviewerProfile?.interviewerId;
    setActionLoading(item.userId || targetId);
    const json = await doFetch(`${API_BASE}/super-admin/interviewers/${targetId}/approve`, "PUT");
    setActionLoading(null);
    if (json.success) {
      patchAll(item.userId, { 
        isActive: true, 
        interviewerProfile: { ...(item.interviewerProfile || {}), isVerified: true } 
      });
      showToast("success", `Interviewer "${item.email}" verified & active!`);
    } else {
      showToast("error", json.message || "Failed to verify interviewer.");
    }
  };

  const handleRejectInterviewer = async (item) => {
    const targetId = item.userId || item.interviewerProfile?.userId || item.interviewerId || item.interviewerProfile?.interviewerId;
    setActionLoading(item.userId || targetId);
    const json = await doFetch(`${API_BASE}/super-admin/interviewers/${targetId}/reject`, "PUT");
    setActionLoading(null);
    if (json.success) {
      patchAll(item.userId, { 
        isActive: false, 
        interviewerProfile: { ...(item.interviewerProfile || {}), isVerified: false } 
      });
      showToast("success", `Interviewer "${item.email}" marked pending / unverified.`);
    } else {
      showToast("error", json.message || "Failed to update interviewer status.");
    }
  };

  const handleResendEmail = async (item) => {
    const targetId = item.userId || item.companyProfile?.userId || item.companyId || item.companyProfile?.companyId;
    setActionLoading(item.userId || targetId);
    const isCompany = item.role === "admin" || item.role === "company" || !!item.companyProfile;
    const url = isCompany
      ? `${API_BASE}/super-admin/companies/${targetId}/resend-email`
      : `${API_BASE}/super-admin/users/${targetId}/resend-email`;

    const json = await doFetch(url, "POST");
    setActionLoading(null);

    if (json.success) {
      if (json.data?.plainPassword) {
        showToast("success", `Credentials re-sent to ${item.email}! Fresh Password: ${json.data.plainPassword}`);
      } else {
        showToast("success", json.message || `Email re-sent successfully to ${item.email}!`);
      }
    } else {
      showToast("error", json.message || "Failed to re-send email.");
    }
  };

  if (!user) return null;

  const rawList =
    activeSection === "companies"    ? companies :
    activeSection === "interviewers" ? interviewers :
    activeSection === "candidates"   ? candidates : allUsers;

  const isVerifiedAccount = (x) => {
    if (x.role === "interviewer") {
      return x.interviewerProfile?.isVerified === true && x.isActive !== false && x.isActive !== 0;
    }
    if (x.role === "admin" || x.role === "company") {
      const compVerified = x.companyProfile ? (x.companyProfile.isVerified === true || x.companyProfile.isVerified === 1) : true;
      return x.isActive !== false && x.isActive !== 0 && compVerified;
    }
    return x.isActive !== false && x.isActive !== 0;
  };

  const totalCount    = rawList.length;
  const activeCount   = rawList.filter((x) => isVerifiedAccount(x)).length;
  const pendingCount  = rawList.filter((x) => !isVerifiedAccount(x)).length;
  const inactiveCount = rawList.filter((x) => x.isActive === false).length;

  const filtered = rawList.filter((item) => {
    const isApproved = isVerifiedAccount(item);
    const byTab =
      filterTab === "active"   ? isApproved :
      filterTab === "pending"  ? !isApproved :
      filterTab === "inactive" ? item.isActive === false : true;
    const s = searchTerm.toLowerCase();
    const cName = item.companyProfile?.companyName || item.profile?.company || "";
    const name = `${item.firstName || ""} ${item.lastName || ""} ${item.username || ""}`.toLowerCase();
    const email = (item.email || "").toLowerCase();
    return byTab && (name.includes(s) || email.includes(s) || cName.toLowerCase().includes(s));
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortBy === "name") {
      valA = (a.companyProfile?.companyName || (a.firstName ? `${a.firstName} ${a.lastName || ""}` : null) || a.fullName || a.username || a.email || "").toLowerCase();
      valB = (b.companyProfile?.companyName || (b.firstName ? `${b.firstName} ${b.lastName || ""}` : null) || b.fullName || b.username || b.email || "").toLowerCase();
    } else if (sortBy === "email") {
      valA = (a.email || "").toLowerCase();
      valB = (b.email || "").toLowerCase();
    } else if (sortBy === "role") {
      valA = (a.role || "").toLowerCase();
      valB = (b.role || "").toLowerCase();
    } else if (sortBy === "status") {
      valA = isVerifiedAccount(a) ? 1 : 0;
      valB = isVerifiedAccount(b) ? 1 : 0;
    } else {
      // createdAt
      valA = new Date(a.createdAt || 0).getTime();
      valB = new Date(b.createdAt || 0).getTime();
    }

    if (valA < valB) return sortOrder === "ASC" ? -1 : 1;
    if (valA > valB) return sortOrder === "ASC" ? 1 : -1;
    return 0;
  });

  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedItems = sorted.slice(startIndex, endIndex);

  const isCompanySection = activeSection === "companies";
  const isInterviewerSection = activeSection === "interviewers";

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
    <ProtectedRoute allowedRoles={["superadmin"]}>
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
                tab.id === "overview"     ? "All" :
                tab.id === "companies"    ? companies.length :
                tab.id === "interviewers" ? interviewers.length :
                tab.id === "candidates"   ? candidates.length :
                tab.id === "questions"    ? questionsCount :
                tab.id === "bugs"         ? bugs.length :
                tab.id === "sessions"     ? sessionsList.length :
                tab.id === "monitoring"   ? "Live" : allUsers.length;
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

          {activeSection === "overview" ? (
            <SuperAdminOverviewHome
              user={user}
              companies={companies}
              interviewers={interviewers}
              candidates={candidates}
              questionsCount={questionsCount}
              bugs={bugs}
              sessionsList={sessionsList}
              monitoringData={monitoringData}
              onNavigateSection={(sec) => {
                setActiveSection(sec);
                setFilterTab("all");
                setSearchTerm("");
              }}
              onOpenDetailModal={(item) => setDetailModal(item)}
              onOpenConfirmModal={(action, item) => setConfirmModal({ action, item })}
              onRefresh={() => fetchAllData(token)}
              loading={loading}
            />
          ) : activeSection === "bugs" ? (
            <ReportBugTab user={user} isAdmin={true} />
          ) : activeSection === "sessions" ? (
            <LoginSessionsTab user={user} isAdmin={true} isSuperAdmin={true} />
          ) : activeSection === "questions" ? (
            <QuestionManagerTab user={user} />
          ) : activeSection === "monitoring" ? (
            <SystemMonitoringTab user={user} />
          ) : (
            <div className="space-y-6">

              {/* 3 Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 shadow-xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total {activeSection}</span>
                    <div className="p-2 rounded-xl bg-white/5 text-slate-300 border border-white/10">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white">{totalCount}</p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full w-full" />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border border-emerald-500/30 ${cardBg} space-y-2 shadow-xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Active &amp; Verified</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-emerald-400">{activeCount}</p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${totalCount ? (activeCount / totalCount) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border border-amber-500/30 ${cardBg} space-y-2 shadow-xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Review</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="h-4 w-4 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-amber-400">{pendingCount}</p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${totalCount ? (pendingCount / totalCount) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Table Container Card */}
              <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>

            {/* Filter Bar */}
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all",      label: "All Records",     count: totalCount },
                  { id: "pending",  label: "Pending Review",  count: pendingCount },
                  { id: "active",   label: "Active",          count: activeCount },
                  { id: "inactive", label: "Inactive",        count: inactiveCount },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTab(t.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                      filterTab === t.id
                        ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                        : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                        : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === t.id ? "bg-black/20 text-black" : "bg-white/10 text-slate-300"}`}>
                      {t.count}
                    </span>
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
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none focus:ring-1 focus:ring-amber-400/50 ${
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
                    <tr className={`text-[11px] font-black uppercase tracking-wider border-b ${isDark ? "border-white/10 text-slate-400 bg-white/[0.01]" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
                      {/* Name */}
                      <th
                        onClick={() => toggleSort("name")}
                        className="py-3.5 px-5 cursor-pointer select-none group hover:text-white transition-colors"
                        title="Click to sort by Name"
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-amber-400" />
                          <span>Name</span>
                          {sortBy === "name" ? (
                            sortOrder === "ASC" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>

                      {/* Email */}
                      <th
                        onClick={() => toggleSort("email")}
                        className="py-3.5 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                        title="Click to sort by Email"
                      >
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Email</span>
                          {sortBy === "email" ? (
                            sortOrder === "ASC" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-cyan-400" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>

                      {/* Role */}
                      <th
                        onClick={() => toggleSort("role")}
                        className="py-3.5 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                        title="Click to sort by Role"
                      >
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-purple-400" />
                          <span>Role</span>
                          {sortBy === "role" ? (
                            sortOrder === "ASC" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-purple-400" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-purple-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>

                      {/* Registered */}
                      <th
                        onClick={() => toggleSort("createdAt")}
                        className="py-3.5 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                        title="Click to sort by Registration Date"
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Registered</span>
                          {sortBy === "createdAt" ? (
                            sortOrder === "ASC" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>

                      {/* Status */}
                      <th
                        onClick={() => toggleSort("status")}
                        className="py-3.5 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                        title="Click to sort by Status"
                      >
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Status</span>
                          {sortBy === "status" ? (
                            sortOrder === "ASC" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-emerald-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                    {paginatedItems.map((item) => {
                      const isActive    = item.isActive !== false && item.isActive !== 0;
                      const isVerified  = isVerifiedAccount(item);
                      const isBusy      = actionLoading === item.userId;
                      const role        = item.role || "candidate";
                      const displayName =
                        item.companyProfile?.companyName ||
                        (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : null) ||
                        item.fullName || item.username || item.email?.split("@")[0] || "Account";
                      const initial = displayName[0]?.toUpperCase() || "U";

                      return (
                        <tr key={item.userId} className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>

                          {/* 1. Name + Avatar */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm ${avatarColor(role)}`}>
                                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : initial}
                              </div>
                              <div>
                                <p className="font-extrabold text-sm leading-tight text-slate-100">{displayName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{item.userId?.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Email */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">{item.email}</td>

                          {/* 3. Role Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${roleBadge(role)}`}>
                              {role === "admin" ? "Company" : role}
                            </span>
                          </td>

                          {/* 4. Registered Date */}
                          <td className="py-3.5 px-4 text-slate-400 font-medium text-[11px]">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </td>

                          {/* 5. Status Badge */}
                          <td className="py-3.5 px-4">
                            {isVerified && isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold bg-emerald-500/15 border-emerald-400/30 text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active &amp; Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold bg-amber-500/15 border-amber-400/30 text-amber-300 animate-pulse">
                                <Clock className="h-3.5 w-3.5 text-amber-400" /> Pending Review
                              </span>
                            )}
                          </td>

                          {/* 6. Streamlined Action Buttons */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">

                              {/* 👁️ View Full Detailed Profile */}
                              <button
                                onClick={() => setDetailModal(item)}
                                title="View Details"
                                className="px-3 py-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <Eye className="h-3.5 w-3.5" /> Details
                              </button>

                              {/* Primary Approval Button: Approve / Revoke / Resend */}
                              {isCompanySection && (
                                (!isVerified || !isActive) ? (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleApprove(item)}
                                      title="Approve Company & Send Credentials"
                                      className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Approve
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleResendEmail(item)}
                                      title="Re-send Pending Review Email"
                                      className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                                    >
                                      <Mail className="h-3.5 w-3.5 text-amber-400" /> Re-send
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleResendEmail(item)}
                                      title="Re-send Credentials Email with Fresh Password"
                                      className="px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                    >
                                      <Mail className="h-3.5 w-3.5 text-cyan-400" /> Re-send Mail
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleReject(item)}
                                      title="Revoke / Deactivate Company"
                                      className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                                    >
                                      <XCircle className="h-3.5 w-3.5 text-amber-400" /> Revoke
                                    </button>
                                  </>
                                )
                              )}

                              {isInterviewerSection && (
                                (!item.interviewerProfile?.isVerified || !isActive) ? (
                                  <button
                                    disabled={isBusy}
                                    onClick={() => handleApproveInterviewer(item)}
                                    title="Approve & Verify Interviewer"
                                    className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Approve
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleResendEmail(item)}
                                      title="Re-send Welcome / Credentials Email"
                                      className="px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                    >
                                      <Mail className="h-3.5 w-3.5 text-cyan-400" /> Re-send
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleRejectInterviewer(item)}
                                      title="Revoke Verification"
                                      className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                                    >
                                      <XCircle className="h-3.5 w-3.5 text-amber-400" /> Revoke
                                    </button>
                                  </>
                                )
                              )}

                              {/* Re-send Mail button for candidates or other users */}
                              {!isCompanySection && !isInterviewerSection && (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleResendEmail(item)}
                                  title="Re-send Credentials / Welcome Email"
                                  className="px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <Mail className="h-3.5 w-3.5 text-cyan-400" /> Re-send
                                </button>
                              )}

                              {/* Restore or Deactivate Account Icon Action */}
                              {!isActive ? (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleRestore(item)}
                                  title="Restore / Reactivate Account"
                                  className="p-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-all"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  disabled={isBusy}
                                  onClick={() => setConfirmModal({ type: "soft", item })}
                                  title="Deactivate Account"
                                  className="p-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all"
                                >
                                  <AlertCircle className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Hard Delete Icon Button */}
                              <button
                                disabled={isBusy}
                                onClick={() => setConfirmModal({ type: "hard", item })}
                                title="Permanently Delete Account"
                                className="p-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

            {/* Pagination Toolbar */}
            {!loading && totalFiltered > 0 && (
              <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? "border-white/10 bg-white/[0.01]" : "border-slate-200 bg-slate-50"}`}>
                
                {/* Record count info */}
                <div className="text-xs text-slate-400 font-medium">
                  Showing <span className="font-bold text-white">{startIndex + 1}</span> to <span className="font-bold text-white">{endIndex}</span> of <span className="font-bold text-white">{totalFiltered}</span> entries
                </div>

                {/* Rows per page selector */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className={`px-2.5 py-1 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                      isDark ? "bg-[#0B151E] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1.5">
                  {/* First Page */}
                  <button
                    disabled={validPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="First Page"
                    className={`p-1.5 rounded-xl border transition-all ${
                      validPage === 1
                        ? "opacity-30 cursor-not-allowed border-white/5 text-slate-500"
                        : isDark
                        ? "border-white/10 hover:bg-white/10 text-slate-300"
                        : "border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Prev Page */}
                  <button
                    disabled={validPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Previous Page"
                    className={`p-1.5 rounded-xl border transition-all ${
                      validPage === 1
                        ? "opacity-30 cursor-not-allowed border-white/5 text-slate-500"
                        : isDark
                        ? "border-white/10 hover:bg-white/10 text-slate-300"
                        : "border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        return Math.abs(page - validPage) <= 1 || page === 1 || page === totalPages;
                      })
                      .map((page, idx, arr) => {
                        const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-1 text-slate-500 text-xs">…</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`h-7 w-7 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                                validPage === page
                                  ? "bg-amber-400 text-black shadow-md"
                                  : isDark
                                  ? "border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                                  : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {/* Next Page */}
                  <button
                    disabled={validPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Next Page"
                    className={`p-1.5 rounded-xl border transition-all ${
                      validPage === totalPages
                        ? "opacity-30 cursor-not-allowed border-white/5 text-slate-500"
                        : isDark
                        ? "border-white/10 hover:bg-white/10 text-slate-300"
                        : "border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    disabled={validPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Last Page"
                    className={`p-1.5 rounded-xl border transition-all ${
                      validPage === totalPages
                        ? "opacity-30 cursor-not-allowed border-white/5 text-slate-500"
                        : isDark
                        ? "border-white/10 hover:bg-white/10 text-slate-300"
                        : "border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}

            </div>

            </div>

          )}
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
                <button
                  disabled={actionLoading === (detailModal.userId || detailModal.companyId || detailModal.companyProfile?.userId)}
                  onClick={() => handleResendEmail(detailModal)}
                  className="px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 font-extrabold text-xs shadow hover:bg-cyan-500/25 flex items-center gap-1.5 transition-all"
                  title="Re-send Credentials or Notification Email"
                >
                  {actionLoading === (detailModal.userId || detailModal.companyId || detailModal.companyProfile?.userId) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5 text-cyan-400" />
                  )}
                  Re-send Mail
                </button>

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
    </ProtectedRoute>
  );
}
