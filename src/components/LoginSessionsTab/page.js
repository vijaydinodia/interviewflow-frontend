"use client";

import { useState, useEffect } from "react";
import { Shield, Laptop, Monitor, RefreshCw, Trash2, CheckCircle, AlertCircle, Search, Server, Cpu, Globe, Clock, UserCheck } from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

export default function LoginSessionsTab({ user = null, isAdmin = false }) {
  const { isDark } = useTheme();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [msg, setMsg] = useState(null);

  const isSuperOrAdmin = isAdmin || user?.role?.toLowerCase().includes("admin");

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const url = isSuperOrAdmin
        ? "/sessions/all"
        : user?.userId || user?.email
        ? `/sessions/my-sessions?userId=${user?.userId || ""}&userEmail=${user?.email || ""}`
        : "/sessions/all";

      const res = await api.get(url);
      const data = res.data;
      console.log("[LoginSessionsTab] fetchSessions response:", data);
      if (data.success && Array.isArray(data.data)) {
        setSessions(data.data);
      } else if (Array.isArray(data)) {
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to terminate this login session?")) return;
    try {
      const res = await api.delete(`/sessions/${sessionId}`);
      const data = res.data;
      if (data.success) {
        setMsg({ type: "success", text: "Session terminated successfully!" });
        fetchSessions();
      } else {
        setMsg({ type: "error", text: data.message || "Failed to terminate session." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error terminating session." });
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      search === "" ||
      s.userName?.toLowerCase().includes(search.toLowerCase()) ||
      s.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      s.ipAddress?.includes(search) ||
      s.userAgent?.toLowerCase().includes(search.toLowerCase()) ||
      s.serverHostname?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = sessions.filter((s) => s.status === "active").length;
  const terminatedCount = sessions.filter((s) => s.status === "terminated").length;

  const cardBg = isDark
    ? "bg-[#0B151E]/90 border-white/10 text-white shadow-xl backdrop-blur-md"
    : "bg-white border-slate-200 text-slate-900 shadow-md";

  const headerBadge = isDark
    ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
    : "bg-indigo-50 text-indigo-700 border-indigo-200";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${headerBadge}`}>
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">
                {isSuperOrAdmin ? "All Platform User Login Sessions & Device Audit" : "My Active Login Sessions & Security"}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${headerBadge}`}>
                {isSuperOrAdmin ? "SUPER ADMIN ACCESS" : "USER SECURITY"}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isSuperOrAdmin
                ? "Deep node.js OS & Path audit of all active user login sessions across the entire InterviewFlow platform."
                : "Manage and inspect your active login sessions across devices and browsers."}
            </p>
          </div>
        </div>

        <button
          onClick={fetchSessions}
          className={`px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
            isDark
              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Sessions</span>
        </button>
      </div>

      {/* Alert Notification */}
      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-slide-down ${
            msg.type === "success"
              ? isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              : isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white font-bold text-sm">×</button>
        </div>
      )}

      {/* ── STAT CARDS ────────────────────────────────----------------──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total Tracked Sessions
            </p>
            <h3 className="text-2xl font-black mt-1 text-cyan-400">{sessions.length}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Monitor className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Active Sessions
            </p>
            <h3 className="text-2xl font-black mt-1 text-emerald-400">{activeCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Terminated Sessions
            </p>
            <h3 className="text-2xl font-black mt-1 text-slate-400">{terminatedCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-400">
            <Trash2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── CONTROLS: SEARCH & FILTER ────────────────────────────────────── */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${cardBg}`}>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, IP, browser, OS..."
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-2xl border outline-none transition-all ${
              isDark
                ? "bg-black/30 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400"
                : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
              isDark ? "bg-[#080E18] border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="all">All Sessions</option>
            <option value="active">Active Only</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* ── SESSIONS TABLE ────────────────────────────────────────────────── */}
      <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-extrabold ${isDark ? "border-white/10 bg-black/40 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">IP &amp; Device Agent</th>
                <th className="p-3.5">Server Host Metadata (Node OS)</th>
                <th className="p-3.5">Login Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    Loading login sessions...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No login sessions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.sessionId} className={isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}>
                    {/* User Details */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-slate-100 flex items-center gap-1.5">
                          <Laptop className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span>{session.userName || "User"}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{session.userEmail}</div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                          {session.userRole}
                        </span>
                      </div>
                    </td>

                    {/* IP & User Agent */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-cyan-300 font-mono font-bold text-[11px]">
                          <Globe className="h-3 w-3 text-cyan-400" />
                          <span>{session.ipAddress}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 max-w-xs font-mono">
                          {session.userAgent}
                        </div>
                      </div>
                    </td>

                    {/* Server OS & Host */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-200 text-[11px] font-extrabold">
                          <Server className="h-3 w-3 text-amber-400 shrink-0" />
                          <span>{session.serverHostname || "localhost"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Cpu className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{session.serverOs || "Node.js OS Environment"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Login Time */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(session.loginTime).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {session.status === "active" ? (
                        <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active Session
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full border border-slate-500/30 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase">
                          Terminated
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center">
                      {session.status === "active" ? (
                        <button
                          onClick={() => handleTerminateSession(session.sessionId)}
                          title="Terminate Session"
                          className="px-2.5 py-1 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-bold transition-all flex items-center gap-1 mx-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Terminate</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
