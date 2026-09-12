"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import {
  MapPin, Briefcase, Phone, Mail, Edit2, FileText,
  Building2, GraduationCap, Code2, Loader2, AlertCircle,
  X, Check, Globe, UserCog, Plus, Trash2, ShieldCheck,
  Clock, Users, CheckCircle2, Sparkles, Upload, Image as ImageIcon,
  ExternalLink, User
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import DsaProfileTab from "@/components/DsaProfileTab/page";
import { api } from "@/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getApiEndpoint(role) {
  if (role === "admin" || role === "company") return "/company/me";
  if (role === "interviewer") return "/interviewer/me";
  return "/candidate/me";
}

const EMPTY_CANDIDATE = {
  fullName:        "",
  currentRole:     "",
  experience:      "",
  skills:          [],
  preferredRole:   "",
  expectedSalary:  "",
  targetCompanies: [],
  location:        "",
  resumeUrl:       "",
  bio:             "",
  avatarUrl:       "",
};

const EMPTY_INTERVIEWER = {
  title:          "",
  company:        "",
  experience:     "",
  department:     "",
  specialization: [],
  availability:   [],
  linkedinUrl:    "",
  bio:            "",
  avatarUrl:      "",
};

const EMPTY_COMPANY = {
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

export default function ProfilePage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]             = useState(null);
  const [token, setToken]           = useState(null);
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [editForm, setEditForm]     = useState({});
  const [toast, setToast]           = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("general"); // "general" | "dsa"

  const [newSkill, setNewSkill]     = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newSlot, setNewSlot]       = useState("");

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
    fetchProfile(parsed);
  }, []);

  const fetchProfile = async (parsedUser) => {
    try {
      setLoading(true);
      const endpoint = getApiEndpoint(parsedUser.role);
      const res = await api.get(endpoint);
      const json = res.data;
      if (json.success && json.data) {
        setProfile(json.data);
      } else {
        setProfile(getEmptyProfile(parsedUser.role));
      }
    } catch {
      setProfile(getEmptyProfile(user?.role));
      showToast("error", "Failed to load profile. Showing empty form.");
    } finally {
      setLoading(false);
    }
  };

  const getEmptyProfile = (role) => {
    if (role === "admin" || role === "company") return EMPTY_COMPANY;
    if (role === "interviewer") return EMPTY_INTERVIEWER;
    return EMPTY_CANDIDATE;
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
        showToast("error", "Please upload a valid Image file (JPG, PNG, WEBP).");
        return;
      }
      formData.append("image", file);
    }

    try {
      setUploading(true);
      const endpoint = isPdf ? "/upload/pdf" : "/upload/image";
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const json = res.data;

      if (json.success && json.data?.url) {
        const uploadedUrl = json.data.url;
        showToast("success", `${isPdf ? "PDF" : "Image"} uploaded successfully!`);

        if (isPdf) {
          if (user?.role === "admin" || user?.role === "company") {
            setEditForm((prev) => ({ ...prev, verificationDoc: uploadedUrl }));
          } else {
            setEditForm((prev) => ({ ...prev, resumeUrl: uploadedUrl }));
          }
        } else {
          if (user?.role === "admin" || user?.role === "company") {
            setEditForm((prev) => ({ ...prev, logoUrl: uploadedUrl }));
          } else {
            setEditForm((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
          }
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
    if (!user) return;
    try {
      setSaving(true);
      const endpoint = getApiEndpoint(user.role);
      const res = await api.put(endpoint, editForm);
      const json = res.data;
      if (json.success) {
        setProfile({ ...profile, ...json.data });
        setEditOpen(false);
        showToast("success", "Profile updated successfully!");
      } else {
        showToast("error", json.message || "Failed to update.");
      }
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => { setEditForm({ ...profile }); setEditOpen(true); };

  if (!user) return null;

  const pageBg  = isDark ? "bg-[#0B151E] text-slate-100"  : "bg-slate-50 text-slate-900";
  const cardBg  = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5"  : "bg-slate-50 border-slate-100";
  const inputCls = `w-full rounded-xl border p-2.5 text-xs outline-none transition-colors focus:border-cyan-400 ${
    isDark ? "border-white/10 bg-[#080E18] text-white placeholder-slate-500"
           : "border-slate-200 bg-slate-50 text-slate-900"
  }`;

  const role        = user.role;
  const isCompany   = role === "admin" || role === "company";
  const isInterview = role === "interviewer";
  const isCandidate = role === "candidate";

  const roleLabel =
    isCompany   ? "Company Admin" :
    isInterview ? "Interviewer"   : "Candidate";

  const roleColor =
    isCompany   ? "text-cyan-400 border-cyan-400/40 bg-cyan-400/10" :
    isInterview ? "text-purple-400 border-purple-400/40 bg-purple-400/10" :
                  "text-emerald-400 border-emerald-400/40 bg-emerald-400/10";

  const displayName =
    isCompany   ? (profile?.companyName   || user.fullName || user.username) :
    isInterview ? (profile?.title         || user.fullName || user.username) :
                  (profile?.currentRole   || user.fullName || user.username);

  const initial = (user.firstName || user.username || "U")[0].toUpperCase();

  return (
    <ProtectedRoute allowedRoles={["candidate", "interviewer", "admin", "company", "superadmin"]}>
      <div className={`min-h-screen flex flex-col ${pageBg}`}>
      <Header />

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

      <main className="flex-1 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">

        {/* Navigation Tabs (General Profile vs LeetCode & DSA Profile) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 w-fit">
          <button
            onClick={() => setActiveProfileTab("general")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeProfileTab === "general"
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-md shadow-cyan-500/20 font-black"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User className="h-3.5 w-3.5" /> General Profile
          </button>
          <button
            onClick={() => setActiveProfileTab("dsa")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeProfileTab === "dsa"
                ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-md shadow-emerald-400/20 font-black"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" /> FlowCode Profile
          </button>
        </div>

        {activeProfileTab === "dsa" ? (
          <DsaProfileTab user={user} />
        ) : loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <>
            {/* ── Profile Header Card ── */}
            <div className={`p-6 rounded-3xl border shadow-xl ${cardBg}`}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">

                {/* Avatar / Logo */}
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-400 p-1 shadow-md shrink-0">
                  {((isCompany && profile?.logoUrl) || (!isCompany && profile?.avatarUrl)) ? (
                    <img
                      src={isCompany ? profile.logoUrl : profile.avatarUrl}
                      alt={displayName}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className={`h-full w-full rounded-xl ${isDark ? "bg-[#0B151E]" : "bg-white"} flex items-center justify-center font-black text-2xl text-cyan-400`}>
                      {initial}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-extrabold">{user.firstName || user.username}</h1>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black uppercase ${roleColor}`}>
                      {roleLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  {displayName && displayName !== user.username && (
                    <p className="text-xs text-cyan-400 font-bold">{displayName}</p>
                  )}
                </div>

                <button
                  onClick={openEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 text-xs font-bold transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                </button>
              </div>
            </div>

            {/* ══════════════ CANDIDATE SECTION ══════════════ */}
            {isCandidate && (
              <div className="space-y-5">
                {/* Info Grid */}
                <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                  <h2 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                    <Briefcase className="h-4 w-4" /> Career Info
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    {[
                      { icon: Briefcase, label: "Current Role",        value: profile?.currentRole },
                      { icon: Clock,     label: "Years of Experience",  value: profile?.yearsExperience },
                      { icon: MapPin,    label: "Preferred Location",   value: profile?.preferredLocation },
                      { icon: CheckCircle2, label: "Application Status", value: profile?.applicationStatus },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                          <Icon className="h-3.5 w-3.5 text-cyan-400" /> {label}
                        </div>
                        <p className="font-extrabold text-sm capitalize">
                          {value || <span className="text-slate-500 font-normal italic">Not specified</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${cardBg}`}>
                  <h2 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                    <Code2 className="h-4 w-4" /> Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((s, i) => (
                        <span key={i} className={`px-3 py-1 rounded-xl border text-xs font-bold ${innerBg}`}>{s}</span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No skills added yet. Click Edit Profile to add.</p>
                    )}
                  </div>
                </div>

                {/* Resume (PDF) */}
                <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                      <FileText className="h-4 w-4" /> Resume / CV (PDF)
                    </h2>
                    <button
                      onClick={openEdit}
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload New PDF
                    </button>
                  </div>
                  {profile?.resumeUrl ? (
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${innerBg}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-200">Candidate_Resume.pdf</p>
                          <p className="text-[10px] text-emerald-400 font-bold">Uploaded & Ready for Interviews ✓</p>
                        </div>
                      </div>
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold flex items-center gap-1.5"
                      >
                        View PDF <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No resume PDF uploaded yet. Click Edit Profile or upload above.</p>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ INTERVIEWER SECTION ══════════════ */}
            {isInterview && (
              <div className="space-y-5">
                <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                  <h2 className="text-sm font-extrabold flex items-center gap-2 text-purple-400">
                    <UserCog className="h-4 w-4" /> Interviewer Info
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {[
                      { icon: Briefcase, label: "Job Title",   value: profile?.title },
                      { icon: Building2, label: "Department",  value: profile?.department },
                      { icon: ShieldCheck, label: "Verified",  value: profile?.isVerified ? "Yes ✓" : "Pending" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                          <Icon className="h-3.5 w-3.5 text-purple-400" /> {label}
                        </div>
                        <p className="font-extrabold text-sm">
                          {value || <span className="text-slate-500 font-normal italic">Not specified</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${cardBg}`}>
                  <h2 className="text-sm font-extrabold flex items-center gap-2 text-purple-400">
                    <Code2 className="h-4 w-4" /> Specializations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile?.specialization && profile.specialization.length > 0 ? (
                      profile.specialization.map((s, i) => (
                        <span key={i} className={`px-3 py-1 rounded-xl border text-xs font-bold ${innerBg}`}>{s}</span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No specializations added yet.</p>
                    )}
                  </div>
                </div>

                {/* Interviewer Availability Slots */}
                <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                      <Clock className="h-4 w-4" /> Configured Availability Slots
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Candidates select from these slots
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile?.availability && profile.availability.length > 0 ? (
                      profile.availability.map((slot, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5">
                          🕒 {slot}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No availability slots configured yet. Click Edit Profile to set your available interview times.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ COMPANY SECTION ══════════════ */}
            {isCompany && (
              <div className="space-y-5">
                <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                  <h2 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                    <Building2 className="h-4 w-4" /> Company Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    {[
                      { icon: Building2, label: "Company Name",   value: profile?.companyName },
                      { icon: Sparkles,  label: "Tagline",         value: profile?.tagline },
                      { icon: Briefcase, label: "Industry",        value: profile?.industry },
                      { icon: Users,     label: "Company Size",    value: profile?.companySize },
                      { icon: MapPin,    label: "Location",        value: profile?.location },
                      { icon: Phone,     label: "Contact Phone",   value: profile?.contactPhone },
                      { icon: Mail,      label: "Contact Email",   value: profile?.contactEmail || user.email },
                      { icon: Globe,     label: "Website",         value: profile?.website },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className={`p-4 rounded-2xl border space-y-1 ${innerBg}`}>
                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                          <Icon className="h-3.5 w-3.5 text-cyan-400" /> {label}
                        </div>
                        <p className="font-extrabold text-sm truncate">
                          {value || <span className="text-slate-500 font-normal italic">Not specified</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Document (PDF) */}
                <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                      <FileText className="h-4 w-4" /> Verification Document (PDF)
                    </h2>
                    <button
                      onClick={openEdit}
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Document
                    </button>
                  </div>
                  {profile?.verificationDoc ? (
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${innerBg}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-200">Company_Verification.pdf</p>
                          <p className="text-[10px] text-emerald-400 font-bold">Document Uploaded ✓</p>
                        </div>
                      </div>
                      <a
                        href={profile.verificationDoc}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold flex items-center gap-1.5"
                      >
                        View PDF <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No verification document added yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Hidden File Inputs for Upload */}
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

      {/* ══════════════ EDIT MODAL (with instant PDF/Image upload) ══════════════ */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-cyan-400" />
                Edit {roleLabel} Profile
              </h3>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto max-h-[70vh] px-6 py-4 space-y-4 text-xs font-semibold">

              {/* ── PHOTO / LOGO UPLOAD SECTION (IMAGE) ── */}
              <div className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                <label className="block font-bold text-slate-300">
                  {isCompany ? "Company Logo (Image)" : "Profile Avatar (Image)"}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => imgInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    {uploading ? "Uploading Image…" : "Choose & Upload Image (JPG, PNG)"}
                  </button>
                </div>
                {((isCompany && editForm.logoUrl) || (!isCompany && editForm.avatarUrl)) && (
                  <p className="text-[11px] text-emerald-400 truncate mt-1">
                    ✓ Image attached: <span className="font-mono text-[10px] text-slate-400">{isCompany ? editForm.logoUrl : editForm.avatarUrl}</span>
                  </p>
                )}
              </div>

              {/* ── CANDIDATE FIELDS ── */}
              {isCandidate && (
                <>
                  <div>
                    <label className="block mb-1 font-bold">Current Role / Job Title</label>
                    <input type="text" value={editForm.currentRole || ""} onChange={(e) => setEditForm({ ...editForm, currentRole: e.target.value })} className={inputCls} placeholder="e.g. Frontend Developer" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold">Years of Experience</label>
                      <input type="text" value={editForm.yearsExperience || ""} onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })} className={inputCls} placeholder="e.g. 3 years" />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold">Preferred Location</label>
                      <input type="text" value={editForm.preferredLocation || ""} onChange={(e) => setEditForm({ ...editForm, preferredLocation: e.target.value })} className={inputCls} placeholder="e.g. Pune, India" />
                    </div>
                  </div>

                  {/* PDF RESUME UPLOAD */}
                  <div className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                    <label className="block font-bold text-slate-300">Resume / CV (PDF Upload)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => pdfInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/40 text-red-400 hover:bg-red-400/20 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        {uploading ? "Uploading PDF…" : "Choose & Upload Resume PDF"}
                      </button>
                    </div>
                    {editForm.resumeUrl && (
                      <p className="text-[11px] text-emerald-400 truncate mt-1">
                        ✓ Resume PDF attached: <span className="font-mono text-[10px] text-slate-400">{editForm.resumeUrl}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-bold">Application Status</label>
                    <select value={editForm.applicationStatus || "active"} onChange={(e) => setEditForm({ ...editForm, applicationStatus: e.target.value })} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block mb-1 font-bold">Skills</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(editForm.skills || []).map((s, i) => (
                        <span key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${innerBg}`}>
                          {s}
                          <button type="button" onClick={() => setEditForm({ ...editForm, skills: editForm.skills.filter((_, idx) => idx !== i) })}>
                            <X className="h-3 w-3 text-slate-400 hover:text-red-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newSkill.trim()) { setEditForm({ ...editForm, skills: [...(editForm.skills || []), newSkill.trim()] }); setNewSkill(""); } } }} className={inputCls} placeholder="Type skill and press Enter" />
                      <button type="button" onClick={() => { if (newSkill.trim()) { setEditForm({ ...editForm, skills: [...(editForm.skills || []), newSkill.trim()] }); setNewSkill(""); } }}
                        className="px-3 py-2 rounded-xl bg-cyan-500 text-[#0B151E] font-black text-xs">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── INTERVIEWER FIELDS ── */}
              {isInterview && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold">Job Title</label>
                      <input type="text" value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} placeholder="e.g. Senior Developer" />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold">Department</label>
                      <input type="text" value={editForm.department || ""} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className={inputCls} placeholder="e.g. Engineering" />
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block mb-1 font-bold">Specializations</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(editForm.specialization || []).map((s, i) => (
                        <span key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold border-purple-400/30 bg-purple-400/10 text-purple-300`}>
                          {s}
                          <button type="button" onClick={() => setEditForm({ ...editForm, specialization: editForm.specialization.filter((_, idx) => idx !== i) })}>
                            <X className="h-3 w-3 hover:text-red-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newSkill.trim()) { setEditForm({ ...editForm, specialization: [...(editForm.specialization || []), newSkill.trim()] }); setNewSkill(""); } } }} className={inputCls} placeholder="Type specialization and press Enter" />
                      <button type="button" onClick={() => { if (newSkill.trim()) { setEditForm({ ...editForm, specialization: [...(editForm.specialization || []), newSkill.trim()] }); setNewSkill(""); } }}
                        className="px-3 py-2 rounded-xl bg-purple-500 text-white font-black text-xs">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Availability Slots Custom Time Range Builder */}
                  <div className={`p-4 rounded-2xl border ${innerBg} space-y-3`}>
                    <div>
                      <label className="block font-bold text-cyan-400">Custom Availability Slots</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select a time range (e.g. 10:00 - 11:00, 5:00 - 6:00) for candidate interviews:</p>
                    </div>

                    {/* From / To Time Range Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="sm:col-span-5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Start Time</span>
                        <input
                          type="time"
                          value={slotFrom}
                          onChange={(e) => setSlotFrom(e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      <div className="sm:col-span-5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">End Time</span>
                        <input
                          type="time"
                          value={slotTo}
                          onChange={(e) => setSlotTo(e.target.value)}
                          className={inputCls}
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
                            const current = editForm.availability || [];
                            if (!current.includes(range)) {
                              setEditForm({ ...editForm, availability: [...current, range] });
                            }
                          }}
                          className="w-full py-2.5 rounded-xl bg-cyan-500 text-[#0B151E] font-black text-xs shadow hover:brightness-110 flex items-center justify-center gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add Slot
                        </button>
                      </div>
                    </div>

                    {/* Or Type Flexible Slot */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Or Type Custom Slot Name (e.g. "5:00 PM - 6:00 PM", "10:00 AM - 11:00 AM")</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSlot}
                          onChange={(e) => setNewSlot(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newSlot.trim()) {
                                setEditForm({ ...editForm, availability: [...(editForm.availability || []), newSlot.trim()] });
                                setNewSlot("");
                              }
                            }
                          }}
                          className={inputCls}
                          placeholder="e.g. 05:00 PM - 06:00 PM or 10:00 AM - 11:00 AM"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSlot.trim()) {
                              setEditForm({ ...editForm, availability: [...(editForm.availability || []), newSlot.trim()] });
                              setNewSlot("");
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-purple-500 text-white font-black text-xs whitespace-nowrap flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Active Selected Slots List */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Configured Availability Slots ({(editForm.availability || []).length}):</span>
                      {(editForm.availability || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(editForm.availability || []).map((slot, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold bg-cyan-500/10 border-cyan-400/30 text-cyan-300">
                              🕒 {slot}
                              <button type="button" onClick={() => setEditForm({ ...editForm, availability: (editForm.availability || []).filter((_, idx) => idx !== i) })}>
                                <X className="h-3.5 w-3.5 text-cyan-400 hover:text-red-400" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">No availability slots added yet. Select a time range above to add slots.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ── COMPANY FIELDS ── */}
              {isCompany && (
                <>
                  <div>
                    <label className="block mb-1 font-bold">Company Name</label>
                    <input type="text" value={editForm.companyName || ""} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} className={inputCls} placeholder="e.g. Tech Startup Inc." />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold">Tagline</label>
                    <input type="text" value={editForm.tagline || ""} onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })} className={inputCls} placeholder="e.g. Building the future of hiring" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold">Industry</label>
                      <input type="text" value={editForm.industry || ""} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} className={inputCls} placeholder="e.g. Software" />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold">Company Size</label>
                      <input type="text" value={editForm.companySize || ""} onChange={(e) => setEditForm({ ...editForm, companySize: e.target.value })} className={inputCls} placeholder="e.g. 50-100 Employees" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold">Location</label>
                      <input type="text" value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} placeholder="e.g. Jaipur, India" />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold">Contact Phone</label>
                      <input type="text" value={editForm.contactPhone || ""} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} className={inputCls} placeholder="+91 9876543210" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold">Contact Email</label>
                      <input type="email" value={editForm.contactEmail || ""} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} className={inputCls} placeholder="company@example.com" />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold">Website</label>
                      <input type="text" value={editForm.website || ""} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className={inputCls} placeholder="https://yourcompany.com" />
                    </div>
                  </div>

                  {/* Verification Document (PDF) Upload */}
                  <div className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                    <label className="block font-bold text-slate-300">Verification Document (PDF Upload)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => pdfInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/40 text-red-400 hover:bg-red-400/20 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        {uploading ? "Uploading PDF…" : "Choose & Upload Verification PDF"}
                      </button>
                    </div>
                    {editForm.verificationDoc && (
                      <p className="text-[11px] text-emerald-400 truncate mt-1">
                        ✓ PDF attached: <span className="font-mono text-[10px] text-slate-400">{editForm.verificationDoc}</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOpen(false)} className={`flex-1 rounded-xl border py-2.5 font-bold ${isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}>
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading} className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] py-2.5 font-extrabold shadow hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-70">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save Profile"}
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
