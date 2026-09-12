"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, AlertCircle, Loader2, X, RefreshCw, Send,
  Sparkles, Building2, ShieldCheck, Mail, MessageSquare,
  Users, Check, XCircle, MapPin, Briefcase
} from "lucide-react";
import { api } from "@/api";

// Rupee icon for currency representation
const RupeeIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="m6 13 8.5 8" />
    <path d="M6 13h3a4 4 0 0 0 0-8" />
  </svg>
);

export default function CandidateJobsTab({ user, profile, isDark, onNavigateTab }) {
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Connection response modal state
  const [respondModal, setRespondModal] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("accepted");
  const [sendingResponse, setSendingResponse] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch companies that directly reached out to this candidate
  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    try {
      const res = await api.get("/jobs/candidate/connections");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setConnections(res.data.data);
      } else {
        setConnections([]);
      }
    } catch (err) {
      console.warn("Error fetching company connections:", err.message);
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Open modal to accept or decline an employer invitation
  const handleOpenRespond = (conn) => {
    setRespondModal(conn);
    setReplyStatus(conn.status === "declined" ? "declined" : "accepted");
    setReplyMessage(
      conn.candidateReply ||
        `Thank you for connecting! I am very interested in discussing the ${conn.job?.title || "role"} position at ${conn.company?.name || "your company"}. I look forward to next steps.`
    );
  };

  // Submit candidate response back to company
  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!respondModal) return;

    setSendingResponse(true);
    try {
      const res = await api.post(`/jobs/candidate/connections/${respondModal.connectionId}/respond`, {
        replyMessage: replyMessage.trim(),
        status: replyStatus,
      });

      if (res.data?.success) {
        showToast("success", "Response recorded and sent to employer!");
        setRespondModal(null);
        fetchConnections();
      } else {
        showToast("error", res.data?.message || "Failed to record response.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Error submitting response.");
    } finally {
      setSendingResponse(false);
    }
  };

  // Theme styling tokens
  const cardBg = isDark
    ? "bg-[#0c131d]/90 border-cyan-500/20 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const innerBg = isDark
    ? "bg-[#070b12]/80 border-cyan-500/10"
    : "bg-slate-50 border-slate-200";
  const inputCls = isDark
    ? "bg-[#070b12] border-cyan-500/20 text-white placeholder-slate-500 focus:border-cyan-400"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-3 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          {toast.message}
        </div>
      )}

      {/* Top Header Card */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Direct Qualified Matching
            </span>
            <span className="text-xs text-purple-300 font-semibold">
              • {connections.length} Company Connection{connections.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            Companies Connected With You
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Companies directly discover and connect with qualified candidates whose verified mock interview ratings meet their skill thresholds (70%+ match).
          </p>
        </div>

        <button
          onClick={fetchConnections}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-center ${
            isDark
              ? "bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              : "bg-slate-100 border border-slate-300 text-slate-700"
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingConnections ? "animate-spin text-purple-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* How It Works Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/30 flex items-start gap-3 text-xs">
        <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-purple-200">
            Direct Recruiter Discovery (70%+ Verified Skill Match)
          </p>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            On InterviewFlow, candidates do not need to submit manual job applications. Verified employers automatically discover candidates whose mock interview ratings meet their criteria and reach out directly with interview invitations.
          </p>
        </div>
      </div>

      {/* Connections List or Empty State */}
      {loadingConnections ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-xs text-slate-400">Loading company connections...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className={`p-14 text-center rounded-3xl border ${cardBg} space-y-4`}>
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-white">No Company Connections Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Companies connect directly with candidates who score <strong>70% or higher</strong> in their technical mock interviews. Schedule a mock interview with a verified expert to earn skill ratings and get noticed by hiring partners!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigateTab?.("interviewers")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs shadow-md hover:brightness-110 transition-all inline-flex items-center gap-2"
            >
              <Users className="h-3.5 w-3.5" /> Book a Mock Interview to Get Discovered
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((conn) => {
            const company = conn.company || {};
            const job = conn.job || {};
            const isAccepted = conn.status === "accepted";
            const isDeclined = conn.status === "declined";

            return (
              <div
                key={conn.connectionId}
                className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-all ${cardBg} hover:border-purple-400/50`}
              >
                {/* Company Header & Skill Match Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
                      {company.name ? company.name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-white">{company.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verified Partner
                        </span>
                      </div>
                      <p className="text-xs text-purple-300 font-bold">{job.title || "Software Engineering Role"}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-cyan-400" />
                          {job.location || company.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-amber-400" />
                          {job.jobType || "Full-time"}
                        </span>
                        {job.salaryRange && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <RupeeIcon className="h-3 w-3" />
                            {job.salaryRange.replace(/\$/g, "₹")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Percentage and Outreach Status */}
                  <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/50 text-purple-200 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      {conn.matchScore || 85}% Skill Match
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isAccepted
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                          : isDeclined
                          ? "bg-rose-500/20 text-rose-300 border-rose-400/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse"
                      }`}
                    >
                      {isAccepted ? "✓ Connected / In Discussion" : isDeclined ? "Declined" : "⚡ Direct Company Outreach"}
                    </span>
                  </div>
                </div>

                {/* Recruiter Message Box */}
                <div className={`p-4 rounded-2xl border space-y-2 ${innerBg}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-purple-400" />
                      {conn.subject}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Received {new Date(conn.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                    "{conn.message}"
                  </p>
                </div>

                {/* Candidate Response Display */}
                {conn.candidateReply && (
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Your Response to Employer:
                    </span>
                    <p className="text-slate-200 leading-relaxed">
                      "{conn.candidateReply}"
                    </p>
                  </div>
                )}

                {/* Required Skills & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Required Skills:</span>
                    {Array.isArray(job.skills) && job.skills.slice(0, 5).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 font-medium"
                      >
                        {typeof sk === "object" ? `${sk.skill} (${sk.marking ?? 7}/10)` : sk}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {company.email && (
                      <a
                        href={`mailto:${company.email}?subject=Re: ${encodeURIComponent(conn.subject || "Interview Invitation")}`}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Mail className="h-3.5 w-3.5 text-cyan-400" /> Reply via Email
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenRespond(conn)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {conn.candidateReply ? "Update Response" : "Respond to Connection"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      {respondModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
              isDark ? "border-purple-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div
              className={`p-6 border-b flex items-start justify-between ${
                isDark ? "border-white/10 bg-white/2" : "border-slate-100 bg-slate-50"
              }`}
            >
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                  Direct Employer Invitation
                </span>
                <h3 className="text-base font-extrabold mt-1">
                  Respond to {respondModal.company?.name || "Company"}
                </h3>
                <p className="text-xs text-slate-400">
                  Role: <strong className="text-cyan-300">{respondModal.job?.title || "Engineering Role"}</strong>
                </p>
              </div>
              <button
                onClick={() => setRespondModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendResponse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">My Response Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyStatus("accepted")}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      replyStatus === "accepted"
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Interested &amp; Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyStatus("declined")}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      replyStatus === "declined"
                        ? "bg-rose-500/20 border-rose-400 text-rose-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Politely Decline
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Reply Message to Recruiter</label>
                <textarea
                  rows={4}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message to the recruiter..."
                  className={`w-full p-3 rounded-xl border focus:outline-none ${inputCls}`}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingResponse}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {sendingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sendingResponse ? "Submitting..." : "Send Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
