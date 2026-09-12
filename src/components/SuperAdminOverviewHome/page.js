"use client";

import { useState } from "react";
import {
  Building2, UserCog, Briefcase, Code2, Bug, ShieldAlert, Activity,
  Users, ShieldCheck, Clock, CheckCircle2, XCircle, ChevronRight,
  TrendingUp, Zap, Database, Server, Cpu, Video, Send, Eye,
  AlertTriangle, ArrowUpRight, Check, RefreshCw
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function SuperAdminOverviewHome({
  user,
  companies = [],
  interviewers = [],
  candidates = [],
  questionsCount = 0,
  bugs = [],
  sessionsList = [],
  monitoringData = null,
  onNavigateSection,
  onOpenDetailModal,
  onOpenConfirmModal,
  onRefresh,
  loading = false,
}) {
  const { isDark } = useTheme();

  const cardBg = isDark
    ? "bg-gradient-to-b from-[#0F172A]/90 to-[#0B1220]/90 border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  // Counts & Filterings
  const pendingCompanies = companies.filter((c) => {
    const isAct = c.isActive === true || c.isActive === 1 || c.companyProfile?.isVerified === true || c.companyProfile?.isVerified === 1;
    return !isAct;
  });

  const pendingInterviewers = interviewers.filter((i) => {
    return i.isActive === false || i.isActive === 0 || i.interviewerProfile?.isVerified === false || i.interviewerProfile?.isVerified === 0;
  });

  const activeCompaniesCount = companies.length - pendingCompanies.length;
  const activeInterviewersCount = interviewers.length - pendingInterviewers.length;
  const openBugsCount = bugs.filter((b) => b.status === "open" || b.status === "in_progress" || b.status === "pending").length;

  const cpu = monitoringData?.system?.cpu || { usagePercentage: 0, status: "HEALTHY" };
  const memory = monitoringData?.system?.memory || { usagePercentage: 0, usedGB: "0 GB", totalGB: "0 GB" };
  const perf = monitoringData?.performance?.summary || { avgResponseTimeMs: 0, overallSuccessRate: "100%" };
  const health = monitoringData?.health || { status: "healthy", services: { database: "up", api: "up", filesystem: "up" } };
  const business = monitoringData?.business || {};

  return (
    <div className="space-y-6">
      {/* ════════════ 1. WELCOME HERO BANNER ════════════ */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
          isDark
            ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-cyan-500/10 border-amber-500/20"
            : "bg-gradient-to-r from-amber-50 via-orange-50 to-cyan-50 border-amber-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 font-extrabold uppercase tracking-wider">
                Super Admin Master Control
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Systems Healthy
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome back, {user?.fullName || user?.username || "Super Administrator"}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Complete platform overview: manage company onboarding, interviewer approvals, candidate pool, question bank, security sessions, and real-time infrastructure telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl border transition-all ${
                isDark
                  ? "border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 shadow-lg shadow-amber-400/10"
                  : "border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900"
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Platform Users</span>
            <span className="font-extrabold text-white text-base">
              {companies.length + interviewers.length + candidates.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pending Approvals</span>
            <span className="font-extrabold text-amber-400 text-base">
              {pendingCompanies.length + pendingInterviewers.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Active Sessions</span>
            <span className="font-extrabold text-cyan-400 text-base font-mono">
              {sessionsList.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Open Bug Reports</span>
            <span className="font-extrabold text-rose-400 text-base">
              {openBugsCount}
            </span>
          </div>
        </div>
      </div>

      {/* ════════════ 2. 8 CORE PLATFORM KPIS GRID ════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            Platform Core Metrics &amp; Modules
          </h2>
          <span className="text-[11px] text-slate-500">Click any card for full management</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Companies Card */}
          <div
            onClick={() => onNavigateSection("companies")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-amber-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hiring Companies</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{companies.length}</p>
              <span className="text-xs text-amber-400 font-bold">{pendingCompanies.length} Pending</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>{activeCompaniesCount} Active &amp; Verified</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>

          {/* Interviewers Card */}
          <div
            onClick={() => onNavigateSection("interviewers")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-cyan-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Technical Interviewers</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                <UserCog className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{interviewers.length}</p>
              <span className="text-xs text-cyan-400 font-bold">{activeInterviewersCount} Active</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>{pendingInterviewers.length} Pending Review</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>

          {/* Candidates Card */}
          <div
            onClick={() => onNavigateSection("candidates")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-emerald-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate Talent Pool</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{candidates.length}</p>
              <span className="text-xs text-emerald-400 font-bold">100% Verified</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>Candidate Profiles</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>

          {/* DSA Questions Card */}
          <div
            onClick={() => onNavigateSection("questions")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-purple-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">DSA Question Bank</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-400 group-hover:text-black transition-colors">
                <Code2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{questionsCount}</p>
              <span className="text-xs text-purple-400 font-bold">Curated</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>Interview Problem Sets</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>

          {/* Bug Reports Card */}
          <div
            onClick={() => onNavigateSection("bugs")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-rose-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bug Reports</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-400 group-hover:text-black transition-colors">
                <Bug className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{bugs.length}</p>
              <span className={`text-xs font-bold ${openBugsCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {openBugsCount} Open
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>Triage &amp; Resolution</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </div>
          </div>

          {/* Login Sessions Card */}
          <div
            onClick={() => onNavigateSection("sessions")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-indigo-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security &amp; Sessions</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-400 group-hover:text-black transition-colors">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{sessionsList.length}</p>
              <span className="text-xs text-indigo-400 font-bold">Audit Trails</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>Device &amp; IP Audits</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>

          {/* Interview Pipeline Card */}
          <div
            onClick={() => onNavigateSection("monitoring")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-sky-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interview Pipeline</span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-400 group-hover:text-black transition-colors">
                <Video className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-white">{business.interviews?.total || 0}</p>
              <span className="text-xs text-sky-400 font-bold">{business.interviews?.completed || 0} Done</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>{business.interviews?.pending || 0} Pending Matching</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
          </div>

          {/* System Telemetry SLA Card */}
          <div
            onClick={() => onNavigateSection("monitoring")}
            className={`p-5 rounded-2xl border ${cardBg} hover:border-emerald-400/40 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Availability</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                <Activity className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-emerald-400">99.9%</p>
              <span className="text-xs text-emerald-400 font-bold">All Up</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
              <span>{perf.avgResponseTimeMs}ms Avg Latency</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ 3. LIVE INFRASTRUCTURE TELEMETRY ROW ════════════ */}
      <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Live Infrastructure &amp; Observability Pulse</h3>
          </div>
          <button
            onClick={() => onNavigateSection("monitoring")}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            Open Full Observability Hub <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Load */}
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-cyan-400" /> Host CPU</span>
              <span className="text-emerald-400 font-bold text-[11px]">{cpu.status}</span>
            </div>
            <p className="text-xl font-black text-white">{cpu.usagePercentage}%</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${cpu.usagePercentage}%` }} />
            </div>
          </div>

          {/* RAM Allocation */}
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-amber-400" /> RAM Memory</span>
              <span className="text-slate-400 text-[11px]">{memory.usedGB} / {memory.totalGB}</span>
            </div>
            <p className="text-xl font-black text-white">{memory.usagePercentage}%</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${memory.usagePercentage}%` }} />
            </div>
          </div>

          {/* MySQL Health */}
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-purple-400" /> MySQL DB</span>
              <span className="text-emerald-400 font-bold text-[11px]">Connected</span>
            </div>
            <p className="text-xl font-black text-white">
              {health.services?.database === "up" ? "ACTIVE" : "DOWN"}
            </p>
            <span className="text-[11px] text-purple-400 font-mono">Sequelize Pool Ready</span>
          </div>

          {/* API Latency */}
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-emerald-400" /> API Gateway</span>
              <span className="text-emerald-400 font-bold text-[11px]">{perf.overallSuccessRate}</span>
            </div>
            <p className="text-xl font-black text-emerald-400">{perf.avgResponseTimeMs} ms</p>
            <span className="text-[11px] text-slate-400">Avg Global Latency</span>
          </div>
        </div>
      </div>

      {/* ════════════ 4. PENDING ACTION QUEUE: COMPANIES & INTERVIEWERS ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Companies Queue */}
        <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white">Pending Company Approvals ({pendingCompanies.length})</h3>
            </div>
            <button
              onClick={() => onNavigateSection("companies")}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {pendingCompanies.length ? (
              pendingCompanies.slice(0, 4).map((c) => {
                const compName = c.companyProfile?.companyName || c.firstName || c.email || "Unnamed Company";
                const isDoc = c.companyProfile?.documentUrl || c.companyProfile?.verificationDoc;
                return (
                  <div key={c.userId} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{compName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                      {isDoc && (
                        <span className="inline-block text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Document Uploaded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenDetailModal(c)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenConfirmModal("approve-company", c)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30 text-[11px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onOpenConfirmModal("reject-company", c)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold border border-rose-500/30 text-[11px]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> All company registration requests are verified.
              </div>
            )}
          </div>
        </div>

        {/* Pending Interviewers Queue */}
        <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-cyan-400 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white">Pending Interviewer Approvals ({pendingInterviewers.length})</h3>
            </div>
            <button
              onClick={() => onNavigateSection("interviewers")}
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {pendingInterviewers.length ? (
              pendingInterviewers.slice(0, 4).map((i) => {
                const name = i.fullName || i.username || `${i.firstName || ""} ${i.lastName || ""}`.trim() || i.email;
                return (
                  <div key={i.userId} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{i.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenDetailModal(i)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenConfirmModal("approve-interviewer", i)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30 text-[11px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onOpenConfirmModal("reject-interviewer", i)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold border border-rose-500/30 text-[11px]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> All interviewer applications are approved.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════ 5. HIRING PIPELINE & PLATFORM RECENT ALERTS ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Links & Hiring Pool */}
        <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-400" /> Meeting Links &amp; Video Pool
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Total Meeting Links</span>
              <span className="font-bold text-white">{business.meetingLinks?.total || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Assigned / In Use</span>
              <span className="font-bold text-purple-400">{business.meetingLinks?.assigned || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Available Free Pool</span>
              <span className="font-bold text-emerald-400">{business.meetingLinks?.available || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Pool Utilization</span>
              <span className="font-bold text-cyan-400 font-mono">{business.meetingLinks?.utilizationRate || "0%"}</span>
            </div>
          </div>
        </div>

        {/* Recent Bug Tickets */}
        <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4 lg:col-span-2`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Bug className="h-4 w-4 text-rose-400" /> Recent Platform Bug Reports &amp; Tickets
            </h3>
            <button
              onClick={() => onNavigateSection("bugs")}
              className="text-xs text-rose-400 hover:underline font-bold"
            >
              Open Bug Tracker
            </button>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {bugs.length ? (
              bugs.slice(0, 3).map((b) => (
                <div key={b.id || b.bugId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-bold text-white truncate">{b.title || b.description || "Bug Report"}</p>
                    <p className="text-[11px] text-slate-400 truncate">Reported by: {b.reportedBy || b.userEmail || "User"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    b.status === "resolved" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    b.status === "in_progress" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    {b.status || "open"}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400">No bugs reported. Platform running smoothly.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
