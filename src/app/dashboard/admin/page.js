"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, MapPin, Phone, Mail, Briefcase, Globe, Edit2,
  CheckCircle2, AlertCircle, Sparkles, Loader2, X, Clock,
  FileText, Code2, Check, ShieldCheck, RefreshCw, Upload, Image as ImageIcon,
  ExternalLink, Bug
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import DashboardHeader from "../_components/DashboardHeader";
import ReportBugTab from "@/components/ReportBugTab/page";
import LoginSessionsTab from "@/components/LoginSessionsTab/page";
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
  const [editForm, setEditForm]     = useState(EMPTY);
  const [activeTab, setActiveTab]   = useState("profile");
  const [toast, setToast]           = useState(null);

  const pdfInputRef = useRef(null);
  const imgInputRef = useRef(null);

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
    if (t) fetchProfile(t);
    else setLoading(false);
  }, [router]);

  const fetchProfile = async (authToken) => {
    try {
      setLoading(true);
      const res = await api.get("/company/me").catch(() => ({ data: { success: false } }));
      const json = res.data;
      if (json.success && json.data) {
        setProfile({ ...EMPTY, ...json.data });
      }
    } catch {
      showToast("error", "Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  };

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
        showToast("success", `${isPdf ? "PDF" : "Logo image"} uploaded successfully!`);

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
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => { setEditForm({ ...profile }); setEditOpen(true); };

  const calcCompletion = () => {
    const fields = [
      { name: "Company Name",         value: profile.companyName },
      { name: "Tagline",              value: profile.tagline },
      { name: "Website",              value: profile.website },
      { name: "Industry",             value: profile.industry },
      { name: "Company Size",         value: profile.companySize },
      { name: "Location",             value: profile.location },
      { name: "Contact Phone",        value: profile.contactPhone },
      { name: "Contact Email",        value: profile.contactEmail || user?.email },
      { name: "Company Logo",         value: profile.logoUrl },
      { name: "Verification Document",value: profile.verificationDoc },
    ];
    const filled  = fields.filter((f) => f.value && f.value.toString().trim() !== "");
    const missing = fields.filter((f) => !f.value || f.value.toString().trim() === "").map((f) => f.name);
    const pct     = Math.round((filled.length / fields.length) * 100);
    return { pct, filled: filled.length, total: fields.length, missing };
  };

  if (!user) return null;

  const { pct, filled, total, missing } = calcCompletion();
  const displayName  = profile.companyName || user.fullName || user.username || "Your Company";
  const initial      = displayName[0]?.toUpperCase() || "C";

  const cardBg  = isDark ? "bg-[#080E18] border-white/10"  : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5"   : "bg-slate-50 border-slate-100";
  const inputCls = `w-full rounded-xl border p-2.5 text-xs outline-none transition-colors focus:border-cyan-400 ${
    isDark ? "border-white/10 bg-[#080E18] text-white placeholder-slate-500" : "border-slate-200 bg-slate-50 text-slate-900"
  }`;

  return (
    <ProtectedRoute allowedRoles={["admin", "company"]}>
      <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0B151E] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <DashboardHeader title="Company Dashboard" roleBadge="Company Admin" />

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

      <main className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Page heading */}
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <Building2 className="h-7 w-7 text-cyan-400" />
            <div>
              <h1 className="text-xl font-extrabold">Company Dashboard</h1>
              <p className="text-xs text-slate-400">Manage your company profile and hiring settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-cyan-500 text-black border-cyan-500 shadow-md"
                  : isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> Company Profile
            </button>
            <button
              onClick={() => setActiveTab("bugs")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activeTab === "bugs"
                  ? "bg-red-500 text-white border-red-500 shadow-md"
                  : isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              <Bug className="h-3.5 w-3.5" /> Report Bug / Issues
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activeTab === "sessions"
                  ? "bg-purple-500 text-white border-purple-500 shadow-md"
                  : isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Login Sessions
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <>
            {profile.isVerified === false || user?.isActive === false ? (
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
                      Company Account Under Super Admin Review
                    </h3>
                    <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
                      Your company registration is currently pending review by the platform Super Admin. Complete your company profile details below while your verification is processed.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300">
                    Status: Under Review
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
                      Company Verified by Super Admin <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-400 text-black uppercase">Active</span>
                    </span>
                    <p className="text-[11px] text-emerald-300/80">Your company account is verified. You can post requirements and manage technical hiring rounds.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Profile Completion Card ── */}
            <div className={`p-6 rounded-3xl border shadow-xl ${cardBg}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold flex items-center gap-2">
                      Profile Completion
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
                    <p className="text-xs text-slate-400 mt-0.5">{filled} of {total} fields filled</p>
                  </div>
                </div>
                <button
                  onClick={openEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 text-xs font-bold transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Company Details
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Completion</span>
                  <span className="text-cyan-400 font-extrabold">{pct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-700/30 overflow-hidden p-0.5 border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct === 100
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                        : pct >= 50
                        ? "bg-gradient-to-r from-sky-400 to-cyan-400"
                        : "bg-gradient-to-r from-amber-400 to-orange-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Missing fields */}
              {missing.length > 0 ? (
                <div className="mt-4 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs font-semibold space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Pending fields to reach 100%:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missing.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-black/20 border border-amber-500/30 text-[11px] text-amber-200">
                        + Add {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Your company profile is 100% complete!
                </div>
              )}
            </div>

            {/* ── Company Profile Card ── */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-5 ${cardBg}`}>

              {/* Header row */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 pb-5 border-b border-white/10">
                {/* Logo / Initial */}
                <div className="h-20 w-20 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 to-teal-400 shadow-md shrink-0">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt={displayName} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-[#0B151E] flex items-center justify-center font-black text-2xl text-cyan-400">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    {displayName}
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </h2>
                  <p className="text-xs font-bold text-cyan-400">{profile.tagline || "Add a company tagline"}</p>
                  <p className="text-xs text-slate-400">
                    Admin: <span className="text-slate-200 font-semibold">{user.fullName || user.username}</span> ({user.email})
                  </p>
                </div>

                <button
                  onClick={openEdit}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Details
                </button>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {[
                  { icon: Building2, label: "Company Name",    value: profile.companyName },
                  { icon: MapPin,    label: "Location",         value: profile.location },
                  { icon: Phone,     label: "Contact Phone",    value: profile.contactPhone },
                  { icon: Mail,      label: "Contact Email",    value: profile.contactEmail || user?.email },
                  { icon: Briefcase, label: "Industry",         value: profile.industry },
                  { icon: Code2,     label: "Company Size",     value: profile.companySize },
                  { icon: Globe,     label: "Website",          value: profile.website },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                      <Icon className="h-4 w-4 text-cyan-400" /> {label}
                    </div>
                    <p className="font-extrabold text-sm text-slate-100 truncate">
                      {value || <span className="text-slate-500 font-normal italic">Not specified</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Verification doc */}
              <div className={`p-4 rounded-2xl border space-y-2 ${innerBg}`}>
                <h3 className="text-xs font-black uppercase text-cyan-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Verification Document (PDF)
                </h3>
                {profile.verificationDoc ? (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-200">📄 Company_Verification.pdf</p>
                    <a
                      href={profile.verificationDoc}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 font-bold underline flex items-center gap-1"
                    >
                      View PDF <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No verification document uploaded yet.</p>
                )}
              </div>
            </div>
            </>
            )}

            {/* ── BUGS TAB ── */}
            {activeTab === "bugs" && (
              <ReportBugTab user={user} isAdmin={false} />
            )}

            {/* ── SESSIONS TAB ── */}
            {activeTab === "sessions" && (
              <LoginSessionsTab user={user} isAdmin={false} />
            )}
          </div>
        )}
      </main>

      {/* Hidden file inputs */}
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

      {/* ── Edit Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" /> Edit Company Details
              </h3>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto max-h-[70vh] px-6 py-4 space-y-4 text-xs font-semibold">

              {/* LOGO UPLOAD (IMAGE) */}
              <div className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                <label className="block font-bold text-slate-300">Company Logo (Image)</label>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => imgInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  {uploading ? "Uploading Logo…" : "Choose & Upload Logo (JPG, PNG)"}
                </button>
                {editForm.logoUrl && (
                  <p className="text-[11px] text-emerald-400 truncate mt-1">
                    ✓ Logo attached: <span className="font-mono text-[10px] text-slate-400">{editForm.logoUrl}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-bold">Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName || ""}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Tech Startup Inc."
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Tagline</label>
                <input
                  type="text"
                  value={editForm.tagline || ""}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Building the future of hiring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Industry</label>
                  <input
                    type="text"
                    value={editForm.industry || ""}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Software, Finance"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Company Size</label>
                  <input
                    type="text"
                    value={editForm.companySize || ""}
                    onChange={(e) => setEditForm({ ...editForm, companySize: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 50-100 Employees"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Location</label>
                  <input
                    type="text"
                    value={editForm.location || ""}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Jaipur, India"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.contactPhone || ""}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Contact Email</label>
                  <input
                    type="email"
                    value={editForm.contactEmail || ""}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className={inputCls}
                    placeholder="company@example.com"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Website</label>
                  <input
                    type="text"
                    value={editForm.website || ""}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className={inputCls}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              {/* VERIFICATION PDF UPLOAD */}
              <div className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                <label className="block font-bold text-slate-300">Verification Document (PDF Upload)</label>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/40 text-red-400 hover:bg-red-400/20 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {uploading ? "Uploading Document…" : "Choose & Upload Verification PDF"}
                </button>
                {editForm.verificationDoc && (
                  <p className="text-[11px] text-emerald-400 truncate mt-1">
                    ✓ PDF attached: <span className="font-mono text-[10px] text-slate-400">{editForm.verificationDoc}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className={`flex-1 rounded-xl border py-2.5 font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] py-2.5 font-extrabold shadow hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
