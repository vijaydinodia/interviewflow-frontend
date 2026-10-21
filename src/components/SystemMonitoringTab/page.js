"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Mail,
  Box,
  Gauge,
  Sliders,
  TrendingUp,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

/**
 * Lightweight, high-performance SVG Telemetry Area & Sparkline Chart
 */
function TelemetrySparkChart({
  data = [],
  dataKey = "value",
  color = "#38bdf8",
  gradientId = "cyanGrad",
  label = "Metric",
  unit = "%",
  height = 90,
  minY = null,
  maxY = null,
  isDark = true,
}) {
  const points = data.map((d) => (typeof d[dataKey] === "number" ? d[dataKey] : parseFloat(d[dataKey]) || 0));

  const count = points.length;
  const current = count > 0 ? points[count - 1] : 0;
  const computedMin = minY !== null ? minY : count > 0 ? Math.min(...points) : 0;
  const computedMax = maxY !== null ? maxY : count > 0 ? Math.max(...points) : 100;
  const range = computedMax - computedMin || 1;

  const width = 320;
  const chartHeight = height;
  const padding = 10;

  const svgPoints = useMemo(() => {
    if (count < 2) return "";
    return points
      .map((val, idx) => {
        const x = padding + (idx / (count - 1)) * (width - 2 * padding);
        const normY = (val - computedMin) / range;
        const y = chartHeight - padding - normY * (chartHeight - 2 * padding);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points, count, computedMin, range, chartHeight]);

  const areaPath = useMemo(() => {
    if (count < 2) return "";
    const firstX = padding;
    const lastX = width - padding;
    const bottomY = chartHeight - padding;
    return `M ${firstX},${bottomY} L ${svgPoints.replace(/ /g, " L ")} L ${lastX},${bottomY} Z`;
  }, [svgPoints, count, chartHeight]);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">
            Min: <b className="text-slate-300">{computedMin.toFixed(1)}</b> / Max: <b className="text-slate-300">{computedMax.toFixed(1)}</b>
          </span>
          <span className="font-mono font-extrabold text-white text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: `${color}20`, color: color }}>
            {current.toFixed(1)} {unit}
          </span>
        </div>
      </div>

      <div className="w-full relative overflow-hidden rounded-xl bg-black/20 border border-white/5 p-1">
        <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-auto overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={padding} y1={chartHeight / 2} x2={width - padding} y2={chartHeight / 2} stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={padding} y1={chartHeight - padding} x2={width - padding} y2={chartHeight - padding} stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Area Fill & Line */}
          {count >= 2 ? (
            <>
              <path d={areaPath} fill={`url(#${gradientId})`} />
              <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={svgPoints} />
              {/* Current Point Pulse */}
              {points.length > 0 && (
                <circle
                  cx={width - padding}
                  cy={chartHeight - padding - ((current - computedMin) / range) * (chartHeight - 2 * padding)}
                  r="3.5"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </>
          ) : (
            <text x={width / 2} y={chartHeight / 2 + 4} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Awaiting telemetry samples...
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}

export default function SystemMonitoringTab({ user = null }) {
  const { isDark } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview", "system", "performance", "logs", "alerts", "business"
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pollInterval, setPollInterval] = useState(2000); // 2s default for real-time monitoring

  // Master Dashboard Data State
  const [data, setData] = useState({
    application: null,
    host: null,
    system: null,
    process: null,
    disk: null,
    health: null,
    performance: null,
    alerts: null,
    business: null,
  });

  // Rolling Ring-buffer Time Series History for Charts (fixed at max 40 points)
  const [telemetryHistory, setTelemetryHistory] = useState([]);

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
        const payload = res.data;
        setData(payload);

        // Record time-series point
        const app = payload.application || payload.process || {};
        const appCpu = typeof app.cpu?.percent === "number" ? app.cpu.percent : parseFloat(app.cpu?.percent) || 0;
        const appRss = typeof app.memory?.rss === "number" ? app.memory.rss : parseFloat(app.memory?.rss) || 0;
        const heapUsed = typeof app.memory?.heapUsed === "number" ? app.memory.heapUsed : parseFloat(app.memory?.heapUsed) || 0;
        const heapTotal = typeof app.memory?.heapTotal === "number" ? app.memory.heapTotal : parseFloat(app.memory?.heapTotal) || 0;
        const eventLoopMean = typeof app.eventLoop?.mean === "number" ? app.eventLoop.mean : parseFloat(app.eventLoop?.mean) || 0;
        const eventLoopP95 = typeof app.eventLoop?.p95 === "number" ? app.eventLoop.p95 : parseFloat(app.eventLoop?.p95) || 0;
        const apiLatency = typeof payload.performance?.summary?.avgResponseTimeMs === "number" ? payload.performance.summary.avgResponseTimeMs : 0;

        const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        setTelemetryHistory((prev) => {
          const next = [
            ...prev,
            {
              time: timeLabel,
              cpu: appCpu,
              rss: appRss,
              heapUsed,
              heapTotal,
              eventLoopMean,
              eventLoopP95,
              apiLatency,
            },
          ];
          if (next.length > 40) return next.slice(next.length - 40);
          return next;
        });
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

  // --- Normalized Telemetry Extractor ---
  const appData = data.application || data.process || {};
  const hostData = data.host || data.system || {};

  // Application Metrics (Node.js Process Level)
  const appCpu = appData.cpu || { percent: 0, coresNormalizedPercent: 0, status: "healthy", cores: 1 };
  const appMem = appData.memory || { rss: 0, heapUsed: 0, heapTotal: 0, external: 0, arrayBuffers: 0, unit: "MB", rssFormatted: "0 MB", heapUsedFormatted: "0 MB", heapTotalFormatted: "0 MB", heapUsagePercentage: 0, status: "healthy" };
  const processInfo = appData.process || { pid: "-", nodeVersion: "-", uptimeFormatted: "-", platform: "-", architecture: "-", activeHandles: 0, activeRequests: 0 };
  const eventLoop = appData.eventLoop || { available: true, mean: 0, min: 0, max: 0, p95: 0, p99: 0, unit: "ms", status: "healthy" };

  // Host/Container Metrics (Render Container Environment)
  const hostCpu = hostData.cpu || { usagePercentage: 0, cores: 1, model: "Render Virtual CPU", status: "healthy" };
  const hostMem = hostData.memory || { totalGB: "0 GB", usedGB: "0 GB", freeGB: "0 GB", usagePercentage: 0, status: "healthy" };
  const hostLoad = Array.isArray(hostData.load) ? hostData.load : [0, 0, 0];
  const hostSystem = hostData.system || { platform: "-", architecture: "-", hostname: "-", uptimeFormatted: "-" };

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
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <Activity className="h-5 w-5 animate-pulse text-amber-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                Application &amp; System Observability
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {data.health?.status === "healthy" ? "Application Active" : "System Degraded"}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Node.js process CPU (<code className="text-cyan-400 font-mono">process.cpuUsage</code>), V8 Heap memory, event loop latency (<code className="text-amber-400 font-mono">monitorEventLoopDelay</code>), MySQL database diagnostics, and Winston logs.
            </p>
          </div>

          {/* Controls: Interval rate, pause toggle, manual refresh */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-1.5">Sync:</span>
              {[1000, 2000, 5000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => { setPollInterval(rate); setAutoRefresh(true); }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    pollInterval === rate && autoRefresh
                      ? "bg-amber-400 text-black font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {rate / 1000}s
                </button>
              ))}
            </div>

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
              {autoRefresh ? "Live Sync" : "PAUSED"}
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

        {/* Telemetry Status Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              Polled: {lastChecked.toLocaleTimeString()}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">
              App Uptime: {processInfo.uptimeFormatted || "-"}
            </span>
            <span>•</span>
            <span>Host Uptime: {hostSystem.uptimeFormatted || "-"}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-md border border-cyan-400/20">
              PID: {processInfo.pid} • Node {processInfo.nodeVersion} ({processInfo.platform || "linux"})
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              {processInfo.activeHandles || 0} Handles / {processInfo.activeRequests || 0} Req
            </span>
          </div>
        </div>
      </div>

      {/* ════════════ SUB-NAVIGATION TABS ════════════ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "system", label: "Process & System Breakdown", icon: Cpu },
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
          {/* Section Header: Application Process-Level Metrics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Application Resource Consumption (Node.js Process)
              </h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              process.cpuUsage() • process.memoryUsage() • perf_hooks
            </span>
          </div>

          {/* 4 Primary Application KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Node.js Application CPU */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Application CPU</span>
                  <span className="text-[10px] text-slate-500">Node Process Usage</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  String(appCpu.status).toLowerCase() === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  String(appCpu.status).toLowerCase() === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                }`}>
                  <Cpu className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-white font-mono">
                  {appCpu.percent !== undefined ? `${appCpu.percent}%` : "0%"}
                </p>
                <span className={`text-[11px] font-bold uppercase ${
                  String(appCpu.status).toLowerCase() === "critical" ? "text-rose-400" :
                  String(appCpu.status).toLowerCase() === "warning" ? "text-amber-400" : "text-emerald-400"
                }`}>{appCpu.status || "HEALTHY"}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(3, appCpu.coresNormalizedPercent || appCpu.percent || 3))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {appCpu.cores > 1 ? `Normalized: ${appCpu.coresNormalizedPercent}% across ${appCpu.cores} cores` : "1 Core Available"}
              </p>
            </div>

            {/* 2. Application Memory (RSS & Heap) */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Application RAM</span>
                  <span className="text-[10px] text-slate-500">Resident Set Size (RSS)</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  String(appMem.status).toLowerCase() === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  <Server className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-white font-mono">
                  {appMem.rss} <span className="text-sm font-bold text-slate-400">MB</span>
                </p>
                <span className="text-[11px] font-bold text-amber-400 font-mono">
                  Heap: {appMem.heapUsed} MB
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, appMem.heapUsagePercentage || 5))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Heap Total: {appMem.heapTotal} MB ({appMem.heapUsagePercentage}% used)
              </p>
            </div>

            {/* 3. Event Loop Delay (Lag) */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Event Loop Delay</span>
                  <span className="text-[10px] text-slate-500">I/O Loop Responsiveness</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Gauge className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-purple-400 font-mono">
                  {eventLoop.mean} <span className="text-sm font-bold text-slate-400">ms</span>
                </p>
                <span className="text-[11px] font-bold text-purple-300 font-mono">
                  P95: {eventLoop.p95} ms
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    eventLoop.p95 >= 100 ? "bg-rose-500" : eventLoop.p95 >= 35 ? "bg-amber-400" : "bg-purple-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, eventLoop.p95 * 5 || 5))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Min: {eventLoop.min} ms / Max: {eventLoop.max} ms
              </p>
            </div>

            {/* 4. API Latency & Health */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg API Latency</span>
                  <span className="text-[10px] text-slate-500">Express HTTP Traffic</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-emerald-400 font-mono">{perf.avgResponseTimeMs} ms</p>
                <span className="text-[11px] font-bold text-emerald-400">{perf.overallSuccessRate} Success</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-full" />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {perf.totalRequests || 0} Total Requests Logged
              </p>
            </div>
          </div>

          {/* ════════════ REAL-TIME TELEMETRY CHARTS (4-GRID) ════════════ */}
          <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Real-Time Application Telemetry Trends
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Rolling History: <b className="text-amber-400">{telemetryHistory.length}</b> / 40 samples ({pollInterval / 1000}s rate)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Chart 1: Application CPU */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <TelemetrySparkChart
                  data={telemetryHistory}
                  dataKey="cpu"
                  color="#38bdf8"
                  gradientId="cpuGrad"
                  label="Application CPU (%)"
                  unit="%"
                  height={80}
                  minY={0}
                  isDark={isDark}
                />
              </div>

              {/* Chart 2: Memory RSS (MB) */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <TelemetrySparkChart
                  data={telemetryHistory}
                  dataKey="rss"
                  color="#fbbf24"
                  gradientId="rssGrad"
                  label="Application RSS RAM (MB)"
                  unit="MB"
                  height={80}
                  isDark={isDark}
                />
              </div>

              {/* Chart 3: V8 Heap Used (MB) */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <TelemetrySparkChart
                  data={telemetryHistory}
                  dataKey="heapUsed"
                  color="#c084fc"
                  gradientId="heapGrad"
                  label="V8 JavaScript Heap (MB)"
                  unit="MB"
                  height={80}
                  isDark={isDark}
                />
              </div>

              {/* Chart 4: Event Loop Lag (ms) */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <TelemetrySparkChart
                  data={telemetryHistory}
                  dataKey="eventLoopMean"
                  color="#34d399"
                  gradientId="evLoopGrad"
                  label="Event Loop Delay Mean (ms)"
                  unit="ms"
                  height={80}
                  minY={0}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          {/* ════════════ HOST / CONTAINER METRICS (CLEARLY SEPARATED) ════════════ */}
          <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-400" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  Host / Container Environment Metrics
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Render Cloud Container Host (Separate from App Metrics)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Host CPU */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Host Server CPU</span>
                <p className="text-xl font-black text-white font-mono">{hostCpu.usagePercentage}%</p>
                <p className="text-[10px] text-slate-400 truncate">{hostCpu.model || "Virtual CPU"} ({hostCpu.cores} Cores)</p>
              </div>

              {/* Host RAM */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Host Container RAM</span>
                <p className="text-xl font-black text-white font-mono">{hostMem.usedGB} / {hostMem.totalGB}</p>
                <p className="text-[10px] text-slate-400 font-mono">Free: {hostMem.freeGB} ({hostMem.usagePercentage}% used)</p>
              </div>

              {/* Host Load Average */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Host Load Average</span>
                <p className="text-xl font-black text-cyan-400 font-mono">
                  {hostLoad.map((l) => (typeof l === "number" ? l.toFixed(2) : l)).join(" • ")}
                </p>
                <p className="text-[10px] text-slate-400">1m • 5m • 15m intervals</p>
              </div>

              {/* Host OS */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Container Host OS</span>
                <p className="text-sm font-extrabold text-white truncate">{hostSystem.platform} ({hostSystem.architecture})</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{hostSystem.hostname}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB 2: SYSTEM & PROCESS BREAKDOWN ════════════ */}
      {activeSubTab === "system" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Deep Node.js Application Process Telemetry */}
            <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-black text-sm text-white">Node.js Application Diagnostics</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                  PID {processInfo.pid}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Application CPU (process.cpuUsage)</span>
                  <span className="font-bold text-cyan-400 font-mono">{appCpu.percent}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">RSS Memory (Total Process in RAM)</span>
                  <span className="font-bold text-white font-mono">{appMem.rssFormatted} ({appMem.rss} MB)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">V8 Heap Used / Total</span>
                  <span className="font-bold text-amber-400 font-mono">{appMem.heapUsedFormatted} / {appMem.heapTotalFormatted} ({appMem.heapUsagePercentage}%)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">External Memory (C++ Buffers)</span>
                  <span className="font-bold text-slate-300 font-mono">{appMem.externalFormatted}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">ArrayBuffer Memory</span>
                  <span className="font-bold text-slate-300 font-mono">{appMem.arrayBuffersFormatted}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Node Engine &amp; Platform</span>
                  <span className="font-bold text-white font-mono">{processInfo.nodeVersion} on {processInfo.platform} ({processInfo.architecture})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Process Uptime</span>
                  <span className="font-bold text-emerald-400 font-mono">{processInfo.uptimeFormatted}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Active Handles &amp; Requests</span>
                  <span className="font-bold text-slate-300 font-mono">{processInfo.activeHandles || 0} Handles / {processInfo.activeRequests || 0} Requests</span>
                </div>
              </div>
            </div>

            {/* 2. Event Loop Performance & Percentiles */}
            <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-400" />
                  <h3 className="font-black text-sm text-white">Event Loop Delay Telemetry (perf_hooks)</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {eventLoop.status || "HEALTHY"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Mean Loop Lag</span>
                  <span className="font-bold text-purple-400 font-mono">{eventLoop.mean} ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Min Loop Lag</span>
                  <span className="font-bold text-slate-300 font-mono">{eventLoop.min} ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Max Loop Lag</span>
                  <span className="font-bold text-slate-300 font-mono">{eventLoop.max} ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">95th Percentile (P95)</span>
                  <span className={`font-bold font-mono ${eventLoop.p95 >= 100 ? "text-rose-400" : eventLoop.p95 >= 35 ? "text-amber-400" : "text-emerald-400"}`}>
                    {eventLoop.p95} ms
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">99th Percentile (P99)</span>
                  <span className="font-bold text-slate-200 font-mono">{eventLoop.p99} ms</span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-cyan-400" />
                    How Event Loop Lag Works:
                  </p>
                  <p>
                    <code className="text-cyan-300 font-mono">monitorEventLoopDelay</code> measures the delay in scheduling timers within the V8 event loop. Values under 20ms indicate excellent asynchronous responsiveness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Host / Container Hardware Specs */}
          <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} space-y-4`}>
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Cpu className="h-5 w-5 text-amber-400" />
              <h3 className="font-black text-sm text-white">Host Machine &amp; Container Specs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host Platform &amp; Arch</span>
                  <span className="font-bold text-white font-mono">{hostSystem.platform} ({hostSystem.architecture})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host Container Name</span>
                  <span className="font-bold text-white font-mono">{hostSystem.hostname}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host CPU Model</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{hostCpu.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host CPU Cores</span>
                  <span className="font-bold text-white">{hostCpu.cores} Virtual Cores</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host Total RAM</span>
                  <span className="font-bold text-white font-mono">{hostMem.totalGB}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host Free RAM</span>
                  <span className="font-bold text-emerald-400 font-mono">{hostMem.freeGB}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host Load Average (1m, 5m, 15m)</span>
                  <span className="font-bold text-cyan-400 font-mono">{hostLoad.join(", ")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Host OS Uptime</span>
                  <span className="font-bold text-amber-400 font-mono">{hostSystem.uptimeFormatted}</span>
                </div>
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
              <p className="text-2xl font-black text-white font-mono">{perf.totalRequests || 0}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Average Latency</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">{perf.avgResponseTimeMs || 0} ms</p>
            </div>
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Min / Max Latency</span>
              <p className="text-2xl font-black text-cyan-400 font-mono">{perf.minResponseTimeMs || 0} / {perf.maxResponseTimeMs || 0} ms</p>
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
                          <td className="py-3 px-5 text-white font-bold font-mono">{ep.requests}</td>
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
              <p className="text-2xl font-black text-rose-400 font-mono">{data.alerts?.summary?.critical || 0}</p>
            </div>
            <div className={`p-5 rounded-2xl border border-amber-500/30 ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-amber-400 uppercase">Warnings</span>
              <p className="text-2xl font-black text-amber-400 font-mono">{data.alerts?.summary?.warning || 0}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Logged Alerts</span>
              <p className="text-2xl font-black text-white font-mono">{data.alerts?.summary?.total || 0}</p>
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
              <p className="text-2xl font-black text-white font-mono">{business.interviews?.total || 0}</p>
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
              <p className="text-2xl font-black text-white font-mono">{business.meetingLinks?.total || 0}</p>
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
              <p className="text-2xl font-black text-white font-mono">{business.matchingAndHiring?.totalJobs || 0}</p>
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
              <p className="text-2xl font-black text-white font-mono">{business.companyOutreach?.totalInvitations || 0}</p>
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
