"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Globe,
  Database,
  Radio,
  BarChart3,
  Layers,
  Terminal,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  AlertCircle,
  FileText,
  Users,
  Briefcase,
  Video,
  Send,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

export default function SystemMonitoringTab({ user = null }) {
  const { isDark } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview", "system", "performance", "logs", "alerts", "business"
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pollInterval, setPollInterval] = useState(6000); // 6 seconds

  // Master Dashboard Data State
  const [data, setData] = useState({
    system: null,
    process: null,
    disk: null,
    health: null,
    performance: null,
    alerts: null,
    business: null,
  });

  // Logs Explorer State
  const [logsList, setLogsList] = useState([]);
  const [logType, setLogType] = useState("all");
  const [logLevel, setLogLevel] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotalCount, setLogTotalCount] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Fetch Dashboard Telemetry
  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.get("/monitoring/dashboard");
      if (res.data && res.data.success) {
        setData(res.data);
      }
      setLastChecked(new Date());
    } catch (err) {
      console.error("Error fetching monitoring dashboard data:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Fetch Logs from Server
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({
        type: logType,
        level: logLevel,
        search: logSearch,
        page: logPage.toString(),
        limit: "25",
      });
      const res = await api.get(`/monitoring/logs?${params.toString()}`);
      if (res.data && res.data.success) {
        setLogsList(res.data.data || []);
        setLogTotalPages(res.data.totalPages || 1);
        setLogTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, [logType, logLevel, logSearch, logPage]);

  // Initial Load & Auto-polling
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (activeSubTab === "logs") {
      fetchLogs();
    }
  }, [activeSubTab, fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboardData(true);
      if (activeSubTab === "logs" && logPage === 1) {
        fetchLogs();
      }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, pollInterval, fetchDashboardData, activeSubTab, logPage, fetchLogs]);

  const handleAcknowledgeAlert = async (id) => {
    try {
      await api.put(`/monitoring/alerts/${id}/ack`);
      fetchDashboardData(true);
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const handleDownloadLog = (filename) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("interviewflow_token") : "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    window.open(`${apiUrl}/api/monitoring/logs/download/${filename}?token=${token}`, "_blank");
  };

  const cardBg = isDark
    ? "bg-gradient-to-b from-[#0F172A]/90 to-[#0B1220]/90 border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  const cpu = data.system?.cpu || { usagePercentage: 0, status: "healthy", cores: 1, model: "Virtual CPU" };
  const memory = data.system?.memory || { usagePercentage: 0, status: "healthy", usedGB: "0 GB", totalGB: "0 GB" };
  const processInfo = data.process?.process || { pid: "-", nodeVersion: "-", uptimeFormatted: "-" };
  const processMem = data.process?.memory || { heapUsed: "0 MB", heapTotal: "0 MB", rss: "0 MB" };
  const perf = data.performance?.summary || { totalRequests: 0, avgResponseTimeMs: 0, overallSuccessRate: "100%" };
  const alertsList = data.alerts?.alerts || [];
  const business = data.business || {};

  return (
    <div className="space-y-6">
      {/* ════════════ TOP HEADER & LIVE TELEMETRY BANNER ════════════ */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
          isDark
            ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-cyan-500/10 border-amber-500/20"
            : "bg-gradient-to-r from-amber-50 via-orange-50 to-cyan-50 border-amber-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <Activity className="h-5 w-5 animate-pulse text-amber-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                System Observability &amp; Platform Monitoring
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {data.health?.status === "healthy" ? "All Systems Operational" : "System Degraded"}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time telemetry, Node.js process health, Winston structured logging, MySQL connection diagnostics, and InterviewFlow business metrics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                autoRefresh
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm"
                  : isDark
                  ? "bg-white/5 text-slate-400 border-white/10"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${autoRefresh ? "animate-pulse text-emerald-400" : ""}`} />
              Auto-sync: {autoRefresh ? "6s" : "PAUSED"}
            </button>

            <button
              onClick={() => fetchDashboardData(false)}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                isDark
                  ? "border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 shadow-lg shadow-amber-400/10"
                  : "border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              Last Polled: {lastChecked.toLocaleTimeString()}
            </span>
            <span>•</span>
            <span>OS Uptime: {data.system?.system?.uptimeFormatted || "-"}</span>
            <span>•</span>
            <span>Process Uptime: {processInfo.uptimeFormatted || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
              Node {processInfo.nodeVersion} (PID: {processInfo.pid})
            </span>
          </div>
        </div>
      </div>

      {/* ════════════ SUB-NAVIGATION TABS ════════════ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "system", label: "System & Process", icon: Cpu },
          { id: "performance", label: "API Performance", icon: Zap },
          { id: "logs", label: "Log Explorer", icon: FileText, count: logTotalCount || data.disk?.filesystem?.totalFiles },
          { id: "alerts", label: "Alert Center", icon: AlertTriangle, count: alertsList.length, countColor: alertsList.length > 0 ? "bg-rose-500/20 text-rose-400" : "" },
          { id: "business", label: "InterviewFlow KPIs", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-black"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                  : "text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-black" : "text-amber-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count !== null && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  active ? "bg-black/20 text-black" : tab.countColor || "bg-white/10 text-slate-300"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ════════════ TAB 1: OVERVIEW ════════════ */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU Metric */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CPU Utilization</span>
                <div className={`p-2 rounded-xl border ${
                  String(cpu.status).toLowerCase() === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  String(cpu.status).toLowerCase() === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  String(cpu.status).toLowerCase() === "unavailable" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                }`}>
                  <Cpu className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-white">
                  {String(cpu.status).toLowerCase() === "unavailable" ? "Unavailable" : `${cpu.usagePercentage}%`}
                </p>
                <span className={`text-[11px] font-bold uppercase ${
                  String(cpu.status).toLowerCase() === "critical" ? "text-rose-400" :
                  String(cpu.status).toLowerCase() === "warning" ? "text-amber-400" :
                  String(cpu.status).toLowerCase() === "unavailable" ? "text-slate-400" : "text-emerald-400"
                }`}>{cpu.status}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    String(cpu.status).toLowerCase() === "critical" ? "bg-rose-500" :
                    String(cpu.status).toLowerCase() === "warning" ? "bg-amber-400" :
                    String(cpu.status).toLowerCase() === "unavailable" ? "bg-slate-600" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, cpu.usagePercentage || 5))}%` }}
                />
              </div>
            </div>

            {/* RAM Metric */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RAM Allocation</span>
                <div className={`p-2 rounded-xl border ${
                  String(memory.status).toLowerCase() === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  String(memory.status).toLowerCase() === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  <Server className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-white">
                  {String(memory.status).toLowerCase() === "unavailable" ? "Unavailable" : `${memory.usagePercentage}%`}
                </p>
                <span className="text-[11px] font-bold text-slate-400">
                  {String(memory.status).toLowerCase() === "unavailable" ? "N/A" : `${memory.usedGB} / ${memory.totalGB}`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, memory.usagePercentage || 5))}%` }}
                />
              </div>
            </div>

            {/* API Health & Latency */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg API Latency</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-emerald-400">{perf.avgResponseTimeMs} ms</p>
                <span className="text-[11px] font-bold text-emerald-400">{perf.overallSuccessRate} Success</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-full" />
              </div>
            </div>

            {/* MySQL Status */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MySQL Health</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Database className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-white">
                  {data.health?.services?.database === "up" ? "Connected" : "Disconnected"}
                </p>
                <span className="text-[11px] font-bold text-purple-400">
                  {data.health?.details?.database?.responseTimeMs || 0}ms Ping
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Quick Subsystems Status Matrix */}
          <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">Core Observability Subsystems</h3>
              </div>
              <span className="text-xs text-emerald-400 font-bold">Winston &amp; Morgan Integrated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" /> API Gateway
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    HTTP UP
                  </span>
                </div>
                <p className="text-xs text-slate-400">Total Requests: {perf.totalRequests || 0}</p>
                <p className="text-xs text-slate-400">Avg Response: {perf.avgResponseTimeMs || 0}ms</p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-400" /> MySQL Sequelize
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    data.health?.services?.database === "up"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {data.health?.services?.database === "up" ? "ACTIVE" : "DOWN"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Dialect: {data.health?.details?.database?.dialect || "MySQL"}</p>
                <p className="text-xs text-slate-400">Response: {data.health?.details?.database?.responseTimeMs || 0}ms</p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-amber-400" /> Log Filesystem
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    R/W OK
                  </span>
                </div>
                <p className="text-xs text-slate-400">Total Files: {data.disk?.filesystem?.totalFiles || 0}</p>
                <p className="text-xs text-slate-400">Log Storage: {data.disk?.filesystem?.totalStorageFormatted || "0 B"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB 2: SYSTEM & PROCESS ════════════ */}
      {activeSubTab === "system" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OS Metrics Card */}
          <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Cpu className="h-5 w-5 text-amber-400" />
              <h3 className="font-black text-sm text-white">Host Operating System</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Platform &amp; Arch</span>
                <span className="font-bold text-white font-mono">{data.system?.system?.platform} ({data.system?.system?.architecture})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Hostname</span>
                <span className="font-bold text-white font-mono">{data.system?.system?.hostname}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">CPU Model</span>
                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">{cpu.model}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">CPU Cores &amp; Speed</span>
                <span className="font-bold text-white">{cpu.cores} Cores @ {cpu.speed}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">OS Host Uptime</span>
                <span className="font-bold text-amber-400 font-mono">{data.system?.system?.uptimeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Node Process Metrics Card */}
          <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Terminal className="h-5 w-5 text-cyan-400" />
              <h3 className="font-black text-sm text-white">Node.js Process Telemetry</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Process PID</span>
                <span className="font-bold text-cyan-400 font-mono">{processInfo.pid}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Node Engine Version</span>
                <span className="font-bold text-white font-mono">{processInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Node Process Uptime</span>
                <span className="font-bold text-emerald-400 font-mono">{processInfo.uptimeFormatted}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">V8 Heap Allocation</span>
                <span className="font-bold text-white font-mono">{processMem.heapUsed} / {processMem.heapTotal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Resident Set Size (RSS)</span>
                <span className="font-bold text-white font-mono">{processMem.rss}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB 3: API PERFORMANCE ════════════ */}
      {activeSubTab === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Requests Recorded</span>
              <p className="text-2xl font-black text-white">{perf.totalRequests || 0}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Average Latency</span>
              <p className="text-2xl font-black text-emerald-400">{perf.avgResponseTimeMs || 0} ms</p>
            </div>
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Min / Max Latency</span>
              <p className="text-2xl font-black text-cyan-400">{perf.minResponseTimeMs || 0} / {perf.maxResponseTimeMs || 0} ms</p>
            </div>
          </div>

          {/* Endpoint Latency Table */}
          <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h3 className="font-extrabold text-sm text-white">Endpoints Latency &amp; Error Rate Analysis</h3>
              <span className="text-xs text-slate-400">Morgan Centralized Tracker</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isDark ? "border-white/10 bg-white/2 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Method &amp; Endpoint</th>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Total Hits</th>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Avg Latency</th>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Min/Max</th>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Errors</th>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Success Rate</th>
                    <th className="py-3 px-5 font-bold uppercase text-[10px]">Requested By (Who Hit This)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {data.performance?.endpoints?.length ? (
                    data.performance.endpoints.map((ep, idx) => {
                      const avgMs = ep.avgResponseTimeMs !== undefined ? ep.avgResponseTimeMs : (ep.avgResponseTime || 0);
                      const callerRole = (ep.lastHitBy?.role || "Guest").toLowerCase();
                      return (
                        <tr key={idx} className={isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                          <td className="py-3 px-5 font-mono font-bold text-white">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-2 ${
                              ep.method === "GET" ? "bg-cyan-500/20 text-cyan-400" :
                              ep.method === "POST" ? "bg-emerald-500/20 text-emerald-400" :
                              ep.method === "PUT" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                            }`}>{ep.method}</span>
                            {ep.endpoint}
                          </td>
                          <td className="py-3 px-5 text-white font-bold">{ep.requests}</td>
                          <td className={`py-3 px-5 font-mono font-bold ${
                            avgMs >= 1000 ? "text-rose-400" :
                            avgMs >= 500 ? "text-amber-400" : "text-emerald-400"
                          }`}>{avgMs} ms</td>
                          <td className="py-3 px-5 text-slate-400 font-mono">{ep.minResponseTime} / {ep.maxResponseTime} ms</td>
                          <td className={`py-3 px-5 font-bold ${ep.errors > 0 ? "text-rose-400" : "text-slate-400"}`}>{ep.errors}</td>
                          <td className="py-3 px-5 text-emerald-400 font-bold">{ep.successRate}%</td>
                          <td className="py-3 px-5">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                  callerRole.includes("super")
                                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                                    : callerRole.includes("admin") || callerRole.includes("company")
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    : callerRole.includes("interviewer")
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : callerRole.includes("candidate")
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                                }`}>
                                  {ep.lastHitBy?.role || "Guest"}
                                </span>
                                <span className="font-extrabold text-white text-xs font-mono flex items-center gap-1 truncate max-w-[200px]" title={ep.lastHitBy?.email || ep.lastHitBy?.name}>
                                  <Mail className="h-3 w-3 text-amber-400 shrink-0" />
                                  {ep.lastHitBy?.email || ep.lastHitBy?.name || "anonymous@interviewflow.com"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <span>IP: {ep.lastHitBy?.ip || "127.0.0.1"}</span>
                                {ep.lastHitBy?.name && ep.lastHitBy?.name !== ep.lastHitBy?.email && (
                                  <span className="truncate max-w-[120px]">({ep.lastHitBy.name})</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">No requests recorded yet. Make API calls to populate metrics.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB 4: LOG EXPLORER ════════════ */}
      {activeSubTab === "logs" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className={`p-5 rounded-3xl border ${cardBg} space-y-4`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-amber-400" /> Log Type:
                </span>
                {["all", "combined", "error", "http"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setLogType(t); setLogPage(1); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      logType === t
                        ? "bg-amber-400 text-black font-black shadow-md shadow-amber-400/20"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}

                <span className="text-xs text-slate-400 font-bold ml-2">Level:</span>
                {["all", "info", "warn", "error"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => { setLogLevel(lvl); setLogPage(1); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      logLevel === lvl
                        ? "bg-cyan-500 text-black font-black"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search log messages..."
                  value={logSearch}
                  onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${
                    isDark ? "bg-white/5 border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-black"
                  }`}
                />
              </div>
            </div>

            {/* Log files download bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-400">Available Log Files in <code className="text-amber-400 font-mono">logs/</code>:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {data.disk?.filesystem?.files?.slice(0, 4).map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleDownloadLog(f.name)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono border border-white/10"
                  >
                    <Download className="h-3 w-3 text-amber-400" />
                    {f.name} ({f.sizeFormatted})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logs List Container */}
          <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="font-extrabold text-xs text-white">Structured Log Entries ({logTotalCount})</h3>
              </div>
              {logsLoading && <span className="text-xs text-amber-400 flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Fetching...</span>}
            </div>

            <div className="divide-y divide-white/5 font-mono text-xs">
              {logsList.length ? (
                logsList.map((entry, idx) => {
                  const isExpanded = expandedLogId === idx;
                  const isErr = entry.level === "error" || entry.status >= 500;
                  const isWarn = entry.level === "warn" || entry.status >= 400;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 transition-colors cursor-pointer ${
                        isExpanded ? (isDark ? "bg-white/5" : "bg-slate-100") : (isDark ? "hover:bg-white/2" : "hover:bg-slate-50")
                      }`}
                      onClick={() => setExpandedLogId(isExpanded ? null : idx)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 overflow-hidden">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            isErr ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                            isWarn ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          }`}>
                            {entry.level || "info"}
                          </span>
                          <span className="text-slate-400 text-[11px] shrink-0">{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "-"}</span>
                          <span className="text-slate-200 font-sans text-xs truncate">{entry.message || JSON.stringify(entry)}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{isExpanded ? "Collapse" : "Expand"}</span>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 p-3 rounded-xl bg-black/50 text-[11px] text-slate-300 overflow-x-auto border border-white/10 space-y-1">
                          <pre>{JSON.stringify(entry, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">No logs found matching current filter criteria.</div>
              )}
            </div>

            {/* Pagination */}
            {logTotalPages > 1 && (
              <div className="p-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Page {logPage} of {logTotalPages}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={logPage <= 1}
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg bg-white/5 disabled:opacity-30 hover:bg-white/10"
                  >
                    Previous
                  </button>
                  <button
                    disabled={logPage >= logTotalPages}
                    onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
                    className="px-3 py-1 rounded-lg bg-white/5 disabled:opacity-30 hover:bg-white/10"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ TAB 5: ALERT CENTER ════════════ */}
      {activeSubTab === "alerts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border border-rose-500/30 ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-rose-400 uppercase">Critical Incidents</span>
              <p className="text-2xl font-black text-rose-400">{data.alerts?.summary?.critical || 0}</p>
            </div>
            <div className={`p-5 rounded-2xl border border-amber-500/30 ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-amber-400 uppercase">Warnings</span>
              <p className="text-2xl font-black text-amber-400">{data.alerts?.summary?.warning || 0}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Logged Alerts</span>
              <p className="text-2xl font-black text-white">{data.alerts?.summary?.total || 0}</p>
            </div>
          </div>

          <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h3 className="font-extrabold text-sm text-white">System Alert Stream</h3>
              <span className="text-xs text-slate-400">Automated Throttling Active</span>
            </div>

            <div className="divide-y divide-white/5 text-xs">
              {alertsList.length ? (
                alertsList.map((alt) => (
                  <div key={alt.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alt.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                          alt.severity === "WARNING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        }`}>{alt.severity}</span>
                        <span className="font-bold text-white">{alt.type}</span>
                        <span className="text-slate-500 text-[11px]">• {new Date(alt.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300">{alt.message}</p>
                    </div>

                    {!alt.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alt.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-emerald-400 font-bold">
                  ✓ No system alerts or anomalies detected.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB 6: INTERVIEWFLOW KPIS ════════════ */}
      {activeSubTab === "business" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Interviews */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Interview Pipeline</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white">{business.interviews?.total || 0}</p>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Pending: {business.interviews?.pending || 0}</span>
                <span className="text-emerald-400">Completed: {business.interviews?.completed || 0}</span>
              </div>
            </div>

            {/* Meeting Links */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Google Meet Links</span>
                <Video className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{business.meetingLinks?.total || 0}</p>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Available: {business.meetingLinks?.available || 0}</span>
                <span className="text-purple-400">Assigned: {business.meetingLinks?.assigned || 0}</span>
              </div>
            </div>

            {/* Jobs & Matches */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Active Jobs</span>
                <Briefcase className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{business.matchingAndHiring?.totalJobs || 0}</p>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Candidates: {business.matchingAndHiring?.totalCandidates || 0}</span>
                <span className="text-amber-400">Applications: {business.matchingAndHiring?.totalApplications || 0}</span>
              </div>
            </div>

            {/* Outreach */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Company Outreach</span>
                <Send className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{business.companyOutreach?.totalInvitations || 0}</p>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Acceptance Rate:</span>
                <span className="text-emerald-400 font-bold">{business.companyOutreach?.acceptanceRate || "0%"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
