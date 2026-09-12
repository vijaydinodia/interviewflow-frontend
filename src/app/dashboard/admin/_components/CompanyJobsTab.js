"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Plus, Search, Filter, Trash2, Edit2, CheckCircle2,
  AlertCircle, Loader2, X, RefreshCw, Users, MapPin,
  Clock, FileText, Globe, ExternalLink, ChevronRight,
  Sparkles, Check, ToggleLeft, ToggleRight, XCircle,
  Mail, Star, Send
} from "lucide-react";
import { api } from "@/api";

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

const GithubIcon = ({ className = "h-3 w-3" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const POPULAR_SKILLS = [
  "React", "Node.js", "JavaScript", "TypeScript", "Python",
  "Tailwind CSS", "Next.js", "SQL", "PostgreSQL", "MongoDB",
  "Docker", "AWS", "Git", "REST API", "GraphQL"
];

const EMPTY_JOB = {
  title: "",
  jobType: "Full-time",
  location: "Remote",
  experienceLevel: "1-3 Years",
  salaryRange: "₹8,00,000 - ₹15,00,000",
  skills: [
    { skill: "React", marking: 8 },
    { skill: "JavaScript", marking: 8 },
    { skill: "Tailwind CSS", marking: 7 },
  ],
  minMatchPercentage: 70,
  description: "",
  requirements: "",
};

export default function CompanyJobsTab({ user, isDark }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_JOB);

  // Skill input helper state inside modal
  const [skillInputName, setSkillInputName] = useState("");
  const [skillInputMarking, setSkillInputMarking] = useState(8);

  // View Applicants modal state
  const [applicantsJob, setApplicantsJob] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Matching Candidates (70%+) modal state
  const [matchingJob, setMatchingJob] = useState(null);
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [loadingMatching, setLoadingMatching] = useState(false);

  // Direct Contact modal state
  const [contactCandidateModal, setContactCandidateModal] = useState(null);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sendingContact, setSendingContact] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch company's jobs
  const fetchMyJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs/company/my-jobs");
      if (res.data?.success) {
        setJobs(res.data.data || []);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.warn("Could not fetch company jobs:", err.message);
      showToast("error", "Failed to load your company jobs.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  // Helper to parse job skills cleanly
  const parseJobSkills = (rawSkills) => {
    if (!rawSkills) return [];
    if (Array.isArray(rawSkills)) {
      return rawSkills.map((item) => {
        if (typeof item === "object" && item !== null && item.skill) {
          return { skill: String(item.skill).trim(), marking: Number(item.marking) || 7 };
        }
        return { skill: String(item).trim(), marking: 7 };
      });
    }
    if (typeof rawSkills === "string") {
      return rawSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ skill: s, marking: 7 }));
    }
    return [];
  };

  // Open modal for new job
  const handleOpenCreate = () => {
    setEditingJobId(null);
    setFormData({
      ...EMPTY_JOB,
      skills: [
        { skill: "React", marking: 8 },
        { skill: "JavaScript", marking: 8 },
      ],
      minMatchPercentage: 70,
    });
    setSkillInputName("");
    setSkillInputMarking(8);
    setModalOpen(true);
  };

  // Open modal for editing existing job
  const handleOpenEdit = (job) => {
    setEditingJobId(job.jobId);
    setFormData({
      title: job.title || "",
      jobType: job.jobType || "Full-time",
      location: job.location || "Remote",
      experienceLevel: job.experienceLevel || "1-3 Years",
      salaryRange: job.salaryRange || "",
      skills: parseJobSkills(job.skills),
      minMatchPercentage: Number(job.minMatchPercentage) || 70,
      description: job.description || "",
      requirements: job.requirements || "",
    });
    setSkillInputName("");
    setSkillInputMarking(8);
    setModalOpen(true);
  };

  // Update marking / rating for a specific skill
  const handleUpdateSkillMarking = (index, newMarking) => {
    const val = Math.max(1, Math.min(10, Number(newMarking) || 7));
    setFormData((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], marking: val };
      return { ...prev, skills: updated };
    });
  };

  // Add a skill to the current form
  const handleAddSkill = () => {
    const trimmed = skillInputName.trim();
    if (!trimmed) {
      showToast("error", "Please enter a skill name.");
      return;
    }

    // Check if skill already added
    const exists = formData.skills.some(
      (s) => s.skill.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      showToast("error", `Skill "${trimmed}" is already added.`);
      return;
    }

    const markingNum = Math.min(10, Math.max(1, Number(skillInputMarking) || 7));
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { skill: trimmed, marking: markingNum }],
    }));
    setSkillInputName("");
    setSkillInputMarking(8);
  };

  // Remove a skill from the current form
  const handleRemoveSkill = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Quick-add skill chip click
  const handleQuickAddSkill = (skillName) => {
    const exists = formData.skills.some(
      (s) => s.skill.toLowerCase() === skillName.toLowerCase()
    );
    if (exists) {
      showToast("error", `Skill "${skillName}" is already in the list.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { skill: skillName, marking: 8 }],
    }));
  };

  // Save new or edited job
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showToast("error", "Job title and description are required.");
      return;
    }

    if (!formData.skills || formData.skills.length === 0) {
      showToast("error", "Please add at least one required skill with a marking out of 10.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        jobType: formData.jobType,
        location: formData.location,
        experienceLevel: formData.experienceLevel,
        salaryRange: formData.salaryRange,
        skills: formData.skills,
        description: formData.description,
        requirements: formData.requirements,
        minMatchPercentage: Number(formData.minMatchPercentage) || 70,
      };

      if (editingJobId) {
        const res = await api.put(`/jobs/${editingJobId}`, payload);
        if (res.data?.success) {
          showToast("success", "Job updated successfully!");
          setModalOpen(false);
          fetchMyJobs();
        } else {
          showToast("error", res.data?.message || "Failed to update job.");
        }
      } else {
        const res = await api.post("/jobs", payload);
        if (res.data?.success) {
          showToast("success", "New job posted successfully!");
          setModalOpen(false);
          fetchMyJobs();
        } else {
          showToast("error", res.data?.message || "Failed to post job.");
        }
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || err.message || "Error saving job.");
    } finally {
      setSaving(false);
    }
  };

  // Open matching candidates (70%+) modal and fetch candidates
  const handleOpenMatching = async (job) => {
    setMatchingJob(job);
    setLoadingMatching(true);
    setMatchingCandidates([]);
    try {
      const res = await api.get(`/jobs/${job.jobId}/matching-candidates`);
      if (res.data?.success) {
        setMatchingCandidates(res.data.data || []);
      } else {
        setMatchingCandidates([]);
      }
    } catch (err) {
      console.error("Error loading matching candidates:", err);
      showToast("error", "Failed to load matching candidates.");
    } finally {
      setLoadingMatching(false);
    }
  };

  // Open direct contact email composer for a matched candidate
  const handleOpenContactCandidate = (candidate) => {
    setContactCandidateModal(candidate);
    const companyName = user?.name || "Our Engineering Team";
    setContactSubject(`Interview Invitation: ${matchingJob?.title || "Technical Role"} at ${companyName}`);
    setContactMessage(
      `Hi ${candidate.candidateName},\n\nWe came across your profile on InterviewFlow and noticed your strong match (${candidate.matchScore}% skill match) for our open position: ${matchingJob?.title || "Technical Role"}.\n\nWe would love to connect with you directly to discuss the role, answer any questions, and arrange an interview.\n\nPlease reply to this email with your preferred schedule or updated resume.\n\nBest regards,\n${companyName}`
    );
  };

  // Send direct email to matching candidate
  const handleSendDirectContact = async (e) => {
    e.preventDefault();
    if (!contactCandidateModal || !matchingJob) return;

    if (!contactSubject.trim() || !contactMessage.trim()) {
      showToast("error", "Subject and message cannot be empty.");
      return;
    }

    setSendingContact(true);
    try {
      const res = await api.post(`/jobs/${matchingJob.jobId}/contact-candidate`, {
        candidateId: contactCandidateModal.candidateId,
        candidateUserId: contactCandidateModal.candidateUserId || contactCandidateModal.userId,
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
        matchScore: contactCandidateModal.matchScore || 75,
      });

      if (res.data?.success) {
        showToast("success", `Invitation email sent to ${contactCandidateModal.candidateName}!`);
        setContactCandidateModal(null);
      } else {
        showToast("error", res.data?.message || "Failed to send invitation email.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to send contact email.");
    } finally {
      setSendingContact(false);
    }
  };

  // Toggle job status (open <-> closed)
  const handleToggleStatus = async (job) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    try {
      const res = await api.put(`/jobs/${job.jobId}`, { status: newStatus });
      if (res.data?.success) {
        showToast("success", `Job marked as ${newStatus}!`);
        fetchMyJobs();
      }
    } catch (err) {
      showToast("error", "Failed to update job status.");
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? All applications will be removed.")) {
      return;
    }
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data?.success) {
        showToast("success", "Job deleted successfully.");
        fetchMyJobs();
      }
    } catch (err) {
      showToast("error", "Failed to delete job.");
    }
  };

  // Open applicants modal and fetch candidate applications for this job
  const handleOpenApplicants = async (job) => {
    setApplicantsJob(job);
    setLoadingApplicants(true);
    setApplicantsList([]);
    try {
      const res = await api.get(`/jobs/${job.jobId}/applications`);
      if (res.data?.success) {
        setApplicantsList(res.data.data || []);
      }
    } catch (err) {
      showToast("error", "Failed to load applicants.");
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Update applicant review status (pending, reviewed, shortlisted, rejected)
  const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
    setUpdatingStatusId(applicationId);
    try {
      const res = await api.patch(`/jobs/applications/${applicationId}/status`, { status: newStatus });
      if (res.data?.success) {
        showToast("success", `Candidate status updated to '${newStatus}'!`);
        setApplicantsList((prev) =>
          prev.map((app) => (app.applicationId === applicationId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      showToast("error", "Failed to update applicant status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filter jobs by search and status
  const filteredJobs = jobs.filter((j) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (j.title || "").toLowerCase().includes(query) ||
      (j.description || "").toLowerCase().includes(query) ||
      (j.location || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high level metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "open").length;
  const totalApplicants = jobs.reduce((acc, curr) => acc + (curr.applications?.length || 0), 0);

  // Visual Theme Tokens
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

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Job Postings</span>
            <p className="text-2xl font-black text-cyan-400">{totalJobs}</p>
            <span className="text-[10px] text-slate-400">Created by your company</span>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Openings</span>
            <p className="text-2xl font-black text-emerald-400">{activeJobs}</p>
            <span className="text-[10px] text-emerald-400/80 font-medium">Currently visible to candidates</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <p className="text-2xl font-black text-indigo-400">{totalApplicants}</p>
            <span className="text-[10px] text-slate-400">Candidates applied across all jobs</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Search, Filters, and Actions Header ── */}
      <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title, description, or location..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${inputCls}`}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${inputCls}`}
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / Open</option>
              <option value="closed">Closed / Inactive</option>
            </select>

            <button
              onClick={fetchMyJobs}
              disabled={loading}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                  : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
              title="Refresh jobs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition-all shadow-md shrink-0"
            >
              <Plus className="h-4 w-4" /> Post New Job
            </button>
          </div>
        </div>

        {/* ── Job Cards List ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">Loading your company jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Briefcase className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Job Postings Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Post your first hiring requirement to start attracting candidates!"}
            </p>
            {!search && statusFilter === "all" && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Post a Job Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredJobs.map((job) => {
              const applicantCount = job.applications?.length || 0;
              const isOpen = job.status === "open";

              return (
                <div
                  key={job.jobId}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${innerBg} hover:border-cyan-500/30`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-extrabold text-sm sm:text-base text-white">{job.title}</h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                            isOpen
                              ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                              : "bg-slate-700/30 border-slate-600/40 text-slate-400"
                          }`}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                          {job.jobType}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                          🎯 &ge; {job.minMatchPercentage || 70}% Match
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {job.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-400" /> {job.experienceLevel || "1-3 Years"}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <RupeeIcon className="h-3.5 w-3.5" /> {job.salaryRange.replace(/\$/g, "₹")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => handleOpenMatching(job)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        title={`View and directly contact candidates matching ${job.minMatchPercentage || 70}%+ of required skills`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        <span>Matching Candidates ({job.minMatchPercentage || 70}%+)</span>
                      </button>

                      <button
                        onClick={() => handleOpenApplicants(job)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Applicants ({applicantCount})
                      </button>

                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                          isOpen
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                        }`}
                        title={isOpen ? "Close job posting" : "Reopen job posting"}
                      >
                        {isOpen ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(job)}
                        className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                        title="Edit job"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteJob(job.jobId)}
                        className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                        title="Delete job"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Skills tags with markings */}
                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Required Skills:</span>
                      {job.skills.map((skillItem, idx) => {
                        const skillName = typeof skillItem === "object" && skillItem !== null ? skillItem.skill : skillItem;
                        const marking = typeof skillItem === "object" && skillItem !== null ? skillItem.marking : null;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-200"
                          >
                            <span>{skillName}</span>
                            {marking !== null && marking !== undefined && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans font-bold flex items-center gap-0.5 border border-amber-500/30">
                                <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                                {marking}/10
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Description preview */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Post / Edit Job Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 ${cardBg}`}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-black uppercase">
                  {editingJobId ? "Edit Job" : "New Opening"}
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {editingJobId ? "Update Job Posting" : "Post a New Technical Job"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Job Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer (React / Next.js)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                />
              </div>

              {/* Grid: Type & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Remote, Bangalore, New York"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                  />
                </div>
              </div>

              {/* Grid: Experience & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                  >
                    <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g. ₹12 - ₹18 LPA or ₹80,000/month"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                  />
                </div>
              </div>

              {/* Required Skills & Marking (1-10) Builder */}
              <div className="space-y-2.5 p-4 rounded-2xl border border-cyan-500/20 bg-black/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Required Skills & Required Rating (Out of 10) *
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Specify the skills and minimum required score (1–10). Candidates with a 70%+ match will be surfaced on your dashboard.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 self-start sm:self-auto">
                    {formData.skills.length} Skill{formData.skills.length === 1 ? "" : "s"} Added
                  </span>
                </div>

                {/* Input Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={skillInputName}
                      onChange={(e) => setSkillInputName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Enter skill name (e.g. React, Node.js, Python)..."
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${inputCls}`}
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <select
                      value={skillInputMarking}
                      onChange={(e) => setSkillInputMarking(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none ${inputCls}`}
                    >
                      <option value={10}>10 / 10 (Expert)</option>
                      <option value={9}>9 / 10 (Mastery)</option>
                      <option value={8}>8 / 10 (Advanced)</option>
                      <option value={7}>7 / 10 (Proficient)</option>
                      <option value={6}>6 / 10 (Competent)</option>
                      <option value={5}>5 / 10 (Intermediate)</option>
                      <option value={4}>4 / 10 (Working)</option>
                      <option value={3}>3 / 10 (Foundational)</option>
                      <option value={2}>2 / 10 (Novice)</option>
                      <option value={1}>1 / 10 (Basic)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 transition-all flex items-center justify-center gap-1 shrink-0 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Skill
                  </button>
                </div>

                {/* Popular Skill Quick Add Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Quick add popular skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map((skill) => {
                      const isAdded = formData.skills.some(
                        (s) => s.skill.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <button
                          key={skill}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleQuickAddSkill(skill)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                            isAdded
                              ? "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed line-through"
                              : "bg-white/5 border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/10"
                          }`}
                        >
                          + {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configured Skills List with Custom Rating Controls */}
                <div className="pt-2 border-t border-white/10">
                  {formData.skills.length === 0 ? (
                    <p className="text-[11px] text-amber-300/80 italic py-1">
                      ⚠️ No skills configured yet. Please add at least one required skill with a score out of 10.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Custom rate each skill (1 to 10):</span>
                        <span className="text-[10px] font-mono text-cyan-300">
                          Total Points: <strong>{formData.skills.reduce((acc, s) => acc + (Number(s.marking) || 7), 0)} pts</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.skills.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between gap-2 shadow-sm"
                          >
                            <span className="text-xs font-bold text-cyan-200 truncate">{s.skill}</span>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Decrement rating */}
                              <button
                                type="button"
                                onClick={() => handleUpdateSkillMarking(idx, (Number(s.marking) || 7) - 1)}
                                disabled={(Number(s.marking) || 7) <= 1}
                                className="w-5 h-5 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center text-xs font-black disabled:opacity-30"
                              >
                                -
                              </button>

                              {/* Custom rating dropdown */}
                              <select
                                value={s.marking || 7}
                                onChange={(e) => handleUpdateSkillMarking(idx, Number(e.target.value))}
                                className="bg-black/60 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer"
                              >
                                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                                  <option key={n} value={n}>
                                    {n}/10
                                  </option>
                                ))}
                              </select>

                              {/* Increment rating */}
                              <button
                                type="button"
                                onClick={() => handleUpdateSkillMarking(idx, (Number(s.marking) || 7) + 1)}
                                disabled={(Number(s.marking) || 7) >= 10}
                                className="w-5 h-5 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center text-xs font-black disabled:opacity-30"
                              >
                                +
                              </button>

                              {/* Remove skill */}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(idx)}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors ml-1"
                                title={`Remove ${s.skill}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decide Matching Percentage Threshold Based on Required Skills */}
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Decide Candidate Match Percentage Threshold (%) *
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Candidates whose verified interview score meets or exceeds this percentage will be surfaced on your dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-base font-black text-purple-300">
                      {formData.minMatchPercentage || 70}%
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                      Match Target
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2 pt-1">
                  <input
                    type="range"
                    min={40}
                    max={95}
                    step={5}
                    value={formData.minMatchPercentage || 70}
                    onChange={(e) => setFormData({ ...formData, minMatchPercentage: Number(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  />

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 mr-1">Select Preset:</span>
                    {[50, 60, 70, 75, 80, 85, 90].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setFormData({ ...formData, minMatchPercentage: pct })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          (formData.minMatchPercentage || 70) === pct
                            ? "bg-purple-500 text-white border-purple-400 shadow-md font-black"
                            : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Point Calculation Breakdown */}
                {formData.skills.length > 0 && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Total Required Points ({formData.skills.length} skills):</span>
                      <span className="font-extrabold text-cyan-300">
                        {formData.skills.reduce((acc, s) => acc + (Number(s.marking) || 7), 0)} Points
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Passing Points Needed ({formData.minMatchPercentage || 70}% threshold):</span>
                      <span className="font-extrabold text-emerald-300">
                        &ge; {Math.ceil((formData.skills.reduce((acc, s) => acc + (Number(s.marking) || 7), 0) * (formData.minMatchPercentage || 70)) / 100)} Points
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 pt-0.5 leading-relaxed">
                      Candidates must score at least <strong className="text-purple-300">{Math.ceil((formData.skills.reduce((acc, s) => acc + (Number(s.marking) || 7), 0) * (formData.minMatchPercentage || 70)) / 100)} / {formData.skills.reduce((acc, s) => acc + (Number(s.marking) || 7), 0)} points</strong> ({formData.minMatchPercentage || 70}%) based on their verified mock interview evaluation to qualify.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, day-to-day responsibilities, and team..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                />
              </div>

              {/* Requirements */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Key Requirements / Qualifications</label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="e.g. Strong problem-solving skills, experience with modern frameworks..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-extrabold hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-md"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingJobId ? "Save Changes" : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Applicants Drawer / Modal ── */}
      {applicantsJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 ${cardBg}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-black uppercase">
                  Candidate Applications
                </span>
                <h3 className="text-lg font-extrabold text-white">{applicantsJob.title}</h3>
                <p className="text-xs text-slate-400">
                  {applicantsList.length} candidate{applicantsList.length === 1 ? "" : "s"} applied for this role
                </p>
              </div>
              <button
                onClick={() => setApplicantsJob(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {loadingApplicants ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
                  <p className="text-slate-400">Loading applicants...</p>
                </div>
              ) : applicantsList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-300">No Applications Yet</p>
                  <p className="text-slate-500">Candidates will appear here as soon as they apply to this job.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {applicantsList.map((app) => (
                    <div
                      key={app.applicationId}
                      className={`p-5 rounded-2xl border space-y-3 ${innerBg} hover:border-cyan-500/20 transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {app.candidateName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-100">{app.candidateName}</p>
                            <p className="text-[11px] text-slate-400">{app.candidateEmail}</p>
                            {app.candidatePhone && (
                              <p className="text-[10px] text-slate-500">📞 {app.candidatePhone}</p>
                            )}
                          </div>
                        </div>

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                          <select
                            disabled={updatingStatusId === app.applicationId}
                            value={app.status || "pending"}
                            onChange={(e) => handleUpdateApplicantStatus(app.applicationId, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] focus:outline-none ${
                              app.status === "shortlisted"
                                ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                                : app.status === "rejected"
                                ? "bg-rose-500/15 border-rose-400/40 text-rose-300"
                                : app.status === "reviewed"
                                ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                                : "bg-amber-500/15 border-amber-400/40 text-amber-300"
                            }`}
                          >
                            <option value="pending" className="bg-[#0c131d] text-amber-300">Pending Review</option>
                            <option value="reviewed" className="bg-[#0c131d] text-cyan-300">Under Review</option>
                            <option value="shortlisted" className="bg-[#0c131d] text-emerald-300">Shortlisted</option>
                            <option value="rejected" className="bg-[#0c131d] text-rose-300">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Experience and Links */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-300">
                        {app.experience && (
                          <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px]">
                            Experience: <strong className="text-cyan-300">{app.experience}</strong>
                          </span>
                        )}

                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                          >
                            <FileText className="h-3 w-3" /> View Resume PDF <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        {app.githubUrl && (
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-slate-300 hover:text-white text-[11px] flex items-center gap-1"
                          >
                            <GithubIcon className="h-3 w-3" /> GitHub
                          </a>
                        )}

                        {app.portfolioUrl && (
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-slate-300 hover:text-white text-[11px] flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" /> Portfolio
                          </a>
                        )}
                      </div>

                      {/* Cover note */}
                      {app.coverNote && (
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Candidate Note:</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">{app.coverNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 flex justify-end bg-black/20">
              <button
                onClick={() => setApplicantsJob(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Matching Candidates Modal (70%+ Match Score) ── */}
      {matchingJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 ${cardBg}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black uppercase flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {matchingJob.minMatchPercentage || 70}%+ Skill Match Engine
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {matchingJob.jobType}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Matching Candidates: {matchingJob.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Showing candidates in the database matching {matchingJob.minMatchPercentage || 70}% or more of your required skills and custom ratings.
                </p>
              </div>
              <button
                onClick={() => setMatchingJob(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Criteria Banner */}
            <div className="px-6 pt-4 pb-2">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">
                    Smart Candidate Matching Active (Threshold: &ge; {matchingJob.minMatchPercentage || 70}%)
                  </p>
                  <p className="text-[11px] text-amber-200/70 leading-relaxed">
                    Matches are calculated based on your custom ratings out of 10. Candidates scoring &ge; {matchingJob.minMatchPercentage || 70}% qualify for direct interview outreach!
                  </p>
                </div>
              </div>
            </div>

            {/* Candidates Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {loadingMatching ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                  <p className="text-slate-400">Scanning and matching candidates against job skills...</p>
                </div>
              ) : matchingCandidates.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Users className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-200 text-sm">No 70%+ Matching Candidates Found</p>
                  <p className="text-slate-400 max-w-md mx-auto text-xs">
                    None of the candidates currently have verified skills meeting at least 70% of this job's requirements and markings.
                    As new candidates join and update their skills, matching candidates will automatically appear here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingCandidates.map((candidate) => {
                    const isHighMatch = candidate.matchScore >= 85;

                    return (
                      <div
                        key={candidate.candidateId}
                        className={`p-5 rounded-2xl border space-y-3.5 transition-all ${innerBg} hover:border-amber-400/40`}
                      >
                        {/* Top candidate row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
                              {candidate.candidateName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-slate-100">{candidate.candidateName}</p>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 shadow-sm ${
                                    isHighMatch
                                      ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                                      : "bg-amber-500/20 border-amber-400/50 text-amber-300"
                                  }`}
                                >
                                  <Sparkles className="h-3 w-3" />
                                  {candidate.matchScore}% Match
                                </span>

                                {candidate.hasInterviewerFeedback && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 border border-purple-400/50 text-purple-300 flex items-center gap-1 shadow-sm">
                                    <Star className="h-3 w-3 fill-current text-purple-300" />
                                    {candidate.interviewsCompleted} Interview{candidate.interviewsCompleted > 1 ? "s" : ""} Evaluated
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{candidate.candidateEmail}</p>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                                {candidate.candidatePhone && <span>📞 {candidate.candidatePhone}</span>}
                                {candidate.location && <span>📍 {candidate.location}</span>}
                                {candidate.experience && (
                                  <span className="text-cyan-400 font-semibold">
                                    💼 {candidate.experience}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Direct Contact Button */}
                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                            <button
                              onClick={() => handleOpenContactCandidate(candidate)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 hover:from-amber-300 hover:to-orange-300 transition-all shadow-md"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Direct Contact
                            </button>
                          </div>
                        </div>

                        {/* Matched Skills Breakdown */}
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-300 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Matched Required Skills:
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {candidate.matchedSkills?.length || 0} of {candidate.totalRequiredSkills || 0} required skills matched
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {candidate.matchedSkills?.map((ms, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-medium ${
                                  ms.verifiedByInterviewer
                                    ? "bg-purple-500/15 border border-purple-400/40 text-purple-200"
                                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                                }`}
                              >
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>{ms.skill}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-sans font-bold">
                                  Required: {ms.marking}/10
                                </span>
                                {ms.verifiedByInterviewer && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/40 font-sans font-extrabold flex items-center gap-0.5" title="Verified by technical interviewer rating form">
                                    ★ {ms.interviewerRating}/10 Verified
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Candidate's Full Skills */}
                        {candidate.allCandidateSkills?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">All Candidate Skills:</span>
                            {candidate.allCandidateSkills.slice(0, 10).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.allCandidateSkills.length > 10 && (
                              <span className="text-[10px] text-slate-500">
                                +{candidate.allCandidateSkills.length - 10} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bio / Title & Links */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-slate-400 text-xs">
                          <p className="line-clamp-1 text-[11px] text-slate-400 max-w-md">
                            {candidate.title || candidate.bio || "Active candidate on InterviewFlow"}
                          </p>

                          <div className="flex items-center gap-3">
                            {candidate.resumeUrl && (
                              <a
                                href={candidate.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-300 hover:text-cyan-200 font-bold text-[11px] flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" /> Resume <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                            {candidate.githubUrl && (
                              <a
                                href={candidate.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-300 hover:text-white text-[11px] flex items-center gap-1"
                              >
                                <GithubIcon className="h-3 w-3" /> GitHub
                              </a>
                            )}
                            {candidate.portfolioUrl && (
                              <a
                                href={candidate.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-300 hover:text-white text-[11px] flex items-center gap-1"
                              >
                                <Globe className="h-3 w-3" /> Portfolio
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 flex justify-end bg-black/20">
              <button
                onClick={() => setMatchingJob(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
              >
                Close Matches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Direct Contact Email Modal ── */}
      {contactCandidateModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 ${cardBg}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black uppercase flex items-center gap-1 w-fit">
                  <Mail className="h-3 w-3" /> Direct Candidate Outreach
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Contact {contactCandidateModal.candidateName}
                </h3>
                <p className="text-xs text-slate-400">
                  Send an interview invitation email directly to this matched candidate.
                </p>
              </div>
              <button
                onClick={() => setContactCandidateModal(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendDirectContact} className="p-6 space-y-4 text-xs">
              {/* Recipient summary chip */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">{contactCandidateModal.candidateName}</p>
                  <p className="text-[11px] text-slate-400">{contactCandidateModal.candidateEmail}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-xs">
                  {contactCandidateModal.matchScore}% Match
                </span>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Email Subject *</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${inputCls}`}
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Message / Invitation Note *</label>
                <textarea
                  required
                  rows={6}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none leading-relaxed ${inputCls}`}
                />
                <p className="text-[10px] text-slate-400">
                  💡 This message will be sent to the candidate via email from InterviewFlow with your company details.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setContactCandidateModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingContact}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-black font-extrabold hover:from-amber-300 hover:to-orange-300 transition-all flex items-center gap-1.5 shadow-md"
                >
                  {sendingContact ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendingContact ? "Sending Email..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
