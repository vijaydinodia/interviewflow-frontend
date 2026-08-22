"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Code2, Laptop, Video, Building2, Briefcase,
  Lock, Mail, Eye, EyeOff, AlertCircle, Phone, Globe,
  Check, Plus, X, Sparkles, Layers, Clock, ArrowRight,
  ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck
} from "lucide-react";
import AuthLayout from "../_components/AuthLayout";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

const ROLES = [
  {
    id: "candidate",
    title: "Candidate",
    btnText: "Create Candidate Account",
    bullets: ["Practice coding interviews", "Attend interviews", "Track applications"],
    icon: (
      <div className="flex items-center justify-center gap-0.5 text-xs">
        <User className="h-4 w-4" />+<Code2 className="h-4 w-4" />
      </div>
    ),
  },
  {
    id: "interviewer",
    title: "Interviewer",
    btnText: "Continue to Full-Page Setup →",
    bullets: ["Conduct Google Meet rounds", "Auto-generated UUID password", "Flexible slots"],
    icon: (
      <div className="flex items-center justify-center gap-0.5 text-xs">
        <Laptop className="h-4 w-4" />+<Video className="h-4 w-4" />
      </div>
    ),
  },
  {
    id: "company",
    title: "Company",
    btnText: "Create Company Account",
    bullets: ["Schedule interviews", "Auto-generated UUID password", "Manage hiring"],
    icon: (
      <div className="flex items-center justify-center gap-0.5 text-xs">
        <Building2 className="h-4 w-4" />+<Briefcase className="h-4 w-4" />
      </div>
    ),
  },
];

const SPECIALIZATION_PRESETS = [
  "System Design",
  "DSA & Algorithms",
  "React & Next.js",
  "Node.js & Express",
  "Python & Django",
  "Java & Spring Boot",
  "Go / Golang",
  "Microservices",
  "AWS & Cloud",
  "Kubernetes & Docker",
  "SQL & Database Tuning",
  "Machine Learning & AI",
];

const AVAILABILITY_PRESETS = [
  "Mon-Fri 06:00 PM - 07:00 PM",
  "Mon-Fri 07:00 PM - 08:00 PM",
  "Sat-Sun 10:00 AM - 11:30 AM",
  "Sat-Sun 04:00 PM - 05:30 PM",
];

const initialData = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  // Interviewer & Company specific
  title: "Senior Software Engineer",
  company: "",
  experience: "5+ Years",
  department: "Full Stack",
  specialization: ["System Design", "DSA & Algorithms", "React & Next.js"],
  availability: ["Mon-Fri 06:00 PM - 07:00 PM", "Sat-Sun 10:00 AM - 11:30 AM"],
  linkedinUrl: "",
  bio: "",
  agreeTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [selectedRole, setSelectedRole] = useState("candidate");
  const [interviewerStep, setInterviewerStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem("interviewflow_session");
      if (session) {
        const parsed = JSON.parse(session);
        const url = getDashboardUrl(parsed?.role);
        router.replace(url);
      }
    } catch (e) {}
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    const updatedErrors = { ...errors };
    delete updatedErrors[name];
    delete updatedErrors.form;
    setErrors(updatedErrors);

    setFormData({
      ...formData,
      [name]: fieldValue,
    });
  };

  const toggleSpecialization = (skill) => {
    setFormData((prev) => {
      const current = prev.specialization || [];
      const updated = current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill];
      return { ...prev, specialization: updated };
    });
  };

  const toggleAvailabilitySlot = (slot) => {
    setFormData((prev) => {
      const current = prev.availability || [];
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, availability: updated };
    });
  };

  const handleRoleSelect = (roleId) => {
    setErrors({});
    setSelectedRole(roleId);
    setInterviewerStep(1);
  };

  const getDashboardUrl = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") return "/dashborads/superAdminDashborad";
    if (r === "admin" || r === "company") return "/dashborads/adminDashboard";
    if (r === "interviewer") return "/dashborads/interviewerDashboard";
    return "/dashborads/candidateDashboard";
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = "Full name is required.";
      if (!formData.email.trim()) errs.email = "Email address is required.";
      if ((selectedRole === "candidate" || selectedRole === "interviewer") && formData.password.length < 8) {
        errs.password = "Password must be at least 8 characters.";
      }
      if (selectedRole === "company" && !formData.company.trim()) {
        errs.company = "Company name is required.";
      }
      if (selectedRole === "candidate" && !formData.agreeTerms) {
        errs.agreeTerms = "You must agree to the Terms of Service.";
      }
    } else if (step === 2) {
      if (!formData.company.trim()) errs.company = "Company name is required.";
      if (!formData.title.trim()) errs.title = "Current job title is required.";
    } else if (step === 3) {
      if (!formData.specialization || formData.specialization.length === 0) {
        errs.specialization = "Select at least 1 technical specialization.";
      }
    } else if (step === 4) {
      if (!formData.availability || formData.availability.length === 0) {
        errs.availability = "Select at least 1 availability time slot.";
      }
      if (!formData.agreeTerms) {
        errs.agreeTerms = "You must agree to the Terms of Service.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = (e) => {
    e?.preventDefault?.();
    if (validateStep(interviewerStep)) {
      setInterviewerStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setInterviewerStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (selectedRole === "interviewer") {
      if (interviewerStep < 4) {
        handleNextStep(e);
        return;
      }
      if (!validateStep(4)) return;
    } else {
      if (!validateStep(1)) return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: selectedRole,
        phone: formData.phone || null,
      };

      // Candidate and Interviewer provide their own password
      if (selectedRole === "candidate" || selectedRole === "interviewer") {
        payload.password = formData.password;
      }

      if (selectedRole === "interviewer") {
        payload.title = formData.title;
        payload.company = formData.company;
        payload.experience = formData.experience;
        payload.department = formData.department;
        payload.specialization = formData.specialization;
        payload.availability = formData.availability;
        payload.linkedinUrl = formData.linkedinUrl;
        payload.bio = formData.bio;
      } else if (selectedRole === "company") {
        payload.companyName = formData.company;
      }

      const response = await api.post("/user/create-user", payload);
      const data = response.data;

      if (data && data.success) {
        const createdUser = data.data || {};
        const userPassword = createdUser.plainPassword || formData.password;

        // Auto-login to obtain session and JWT token
        try {
          const loginRes = await api.post("/user/login", {
            email: formData.email,
            password: userPassword,
          });

          if (loginRes.data && loginRes.data.success) {
            if (loginRes.data.token) {
              localStorage.setItem("interviewflow_token", loginRes.data.token);
            }
            const userRole = loginRes.data.user?.role || (selectedRole === "company" ? "admin" : selectedRole);
            const sessionUser = {
              fullName: formData.fullName,
              email: formData.email,
              role: userRole,
            };
            localStorage.setItem("interviewflow_session", JSON.stringify(sessionUser));

            const dashboardUrl = getDashboardUrl(userRole);
            router.push(dashboardUrl);
            return;
          }
        } catch (loginErr) {
          router.push("/login");
          return;
        }
      }
    } catch (err) {
      setIsLoading(false);

      if (err.response && err.response.status === 409) {
        setErrors({ form: err.response.data?.message || "An account with this email already exists." });
        return;
      }

      // Local storage fallback for demonstration
      try {
        const existingRaw = localStorage.getItem("interviewflow_users");
        let usersList = existingRaw ? JSON.parse(existingRaw) : [];
        
        const duplicate = usersList.find((u) => u.email.toLowerCase() === formData.email.toLowerCase());
        if (duplicate) {
          setErrors({ form: "An account with this email already exists. Please log in." });
          return;
        }

        const newUser = {
          fullName: formData.fullName,
          email: formData.email,
          role: selectedRole,
          ...(selectedRole === "interviewer" && {
            title: formData.title,
            company: formData.company,
            experience: formData.experience,
            specialization: formData.specialization,
            availability: formData.availability,
          }),
        };
        usersList.push(newUser);
        localStorage.setItem("interviewflow_users", JSON.stringify(usersList));

        const sessionUser = {
          fullName: formData.fullName,
          email: formData.email,
          role: selectedRole,
        };
        localStorage.setItem("interviewflow_session", JSON.stringify(sessionUser));
        router.push("/login");
        return;
      } catch (fallbackErr) {
        setErrors({ form: "Failed to create account. Please try again." });
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // FULL-PAGE ONBOARDING VIEW (FOR INTERVIEWER STEPS 2, 3, 4)
  // ══════════════════════════════════════════════════════════════════════
  if (selectedRole === "interviewer" && interviewerStep >= 2) {
    return (
      <div className="min-h-screen w-full bg-[#060B11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
        {/* Top Navbar */}
        <header className="w-full border-b border-white/10 bg-[#0B151E]/90 backdrop-blur-md px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 font-black text-sm text-[#0B151E] shadow-md shadow-cyan-500/30">
              iF
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white">
                Interview<span className="text-cyan-400">Flow</span>
              </span>
              <span className="hidden sm:inline-block ml-3 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Interviewer Setup Wizard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 hidden sm:inline">Signing up as: <strong className="text-white">{formData.email}</strong></span>
            <button
              onClick={() => {
                setInterviewerStep(1);
                setSelectedRole("candidate");
              }}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all"
            >
              Cancel &amp; Restart
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center space-y-8 animate-in fade-in duration-300">
          
          {/* Progress Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">Step {interviewerStep} of 4</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {interviewerStep === 2 && "Professional Background & Experience"}
                  {interviewerStep === 3 && "Interview Specializations & Skills"}
                  {interviewerStep === 4 && "Weekly Availability & Final Launch"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {interviewerStep === 2 && "Help candidates recognize your engineering leadership and domain background."}
                  {interviewerStep === 3 && "Select all technical topics you are qualified to evaluate candidates on."}
                  {interviewerStep === 4 && "Set your default weekly time slots for Google Meet interview bookings."}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" /> Verified Profile
              </div>
            </div>

            {/* 4-Step Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { step: 1, label: "1. Account Credentials" },
                { step: 2, label: "2. Experience" },
                { step: 3, label: "3. Specializations" },
                { step: 4, label: "4. Schedule & Launch" },
              ].map((item) => (
                <div key={item.step} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      item.step === interviewerStep
                        ? "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 shadow-md shadow-cyan-500/50"
                        : item.step < interviewerStep
                        ? "bg-emerald-400"
                        : "bg-white/10"
                    }`}
                  />
                  <p className={`text-[11px] font-bold truncate ${item.step === interviewerStep ? "text-cyan-300" : item.step < interviewerStep ? "text-emerald-400" : "text-slate-500"}`}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0B151E] shadow-2xl space-y-6">
            
            {/* ── FULL-PAGE STEP 2: PROFESSIONAL BACKGROUND ── */}
            {interviewerStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Current / Past Tech Company <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Google, Microsoft, Amazon, Meta, Uber, Startup"
                        className={`w-full rounded-2xl border pl-10 pr-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 bg-[#080E18] text-white transition-all ${
                          errors.company ? "border-red-400 ring-red-400/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                        }`}
                      />
                    </div>
                    {errors.company && <p className="text-xs text-red-400 mt-1 font-bold">{errors.company}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Job Title / Seniority Designation <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Software Engineer, Staff Architect, Tech Lead"
                        className={`w-full rounded-2xl border pl-10 pr-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 bg-[#080E18] text-white transition-all ${
                          errors.title ? "border-red-400 ring-red-400/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                        }`}
                      />
                    </div>
                    {errors.title && <p className="text-xs text-red-400 mt-1 font-bold">{errors.title}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Total Years of Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#080E18] text-white px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="1-3 Years">1-3 Years (Early Career)</option>
                      <option value="3-5 Years">3-5 Years (Mid-Level Engineer)</option>
                      <option value="5-8 Years">5-8 Years (Senior Engineer)</option>
                      <option value="8-12 Years">8-12 Years (Staff / Tech Lead)</option>
                      <option value="12+ Years">12+ Years (Principal / Director)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary Engineering Domain</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#080E18] text-white px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Full Stack">Full Stack Systems</option>
                      <option value="Backend Architecture">Backend Architecture &amp; Microservices</option>
                      <option value="Frontend Engineering">Frontend Engineering (React/Next)</option>
                      <option value="Cloud & DevOps">Cloud, DevOps &amp; Kubernetes</option>
                      <option value="System Design">System Design &amp; Scalability</option>
                      <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── FULL-PAGE STEP 3: TECHNICAL SPECIALIZATIONS ── */}
            {interviewerStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-slate-300">Click to select topics you are comfortable evaluating:</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
                    {formData.specialization.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SPECIALIZATION_PRESETS.map((skill) => {
                    const isSelected = formData.specialization.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSpecialization(skill)}
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all flex items-center justify-between border ${
                          isSelected
                            ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20"
                            : "bg-[#080E18] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{skill}</span>
                        {isSelected ? <Check className="h-4 w-4 text-purple-300 stroke-[3] shrink-0" /> : <Plus className="h-4 w-4 text-slate-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {errors.specialization && (
                  <p className="text-xs text-red-400 mt-2 font-bold">{errors.specialization}</p>
                )}
              </div>
            )}

            {/* ── FULL-PAGE STEP 4: AVAILABILITY & FINAL LAUNCH ── */}
            {interviewerStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Weekly Availability Slots (for Google Meet Booking) <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs text-emerald-400 font-extrabold">
                      {formData.availability.length} Active Slots
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABILITY_PRESETS.map((slot) => {
                      const isSelected = formData.availability.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleAvailabilitySlot(slot)}
                          className={`p-3.5 rounded-2xl text-xs font-mono font-bold text-left transition-all flex items-center justify-between border ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20"
                              : "bg-[#080E18] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span>🕒 {slot}</span>
                          {isSelected ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-black font-black">
                              Active ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">+ Add</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.availability && <p className="text-xs text-red-400 mt-2 font-bold">{errors.availability}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">LinkedIn Profile URL (Optional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-2xl border border-white/10 bg-[#080E18] text-white pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Evaluation Philosophy (Optional)</label>
                    <input
                      type="text"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="e.g. Focus on clean code, system architecture & communication"
                      className="w-full rounded-2xl border border-white/10 bg-[#080E18] text-white px-4 py-3 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Password Auto-Gen Reminder Card */}
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-cyan-300">Auto-Generated UUID Password Activated</p>
                    <p className="text-slate-300 mt-0.5">
                      Your 8-character secure password will be generated and dispatched to <strong>{formData.email}</strong> via Brevo SMTP.
                    </p>
                  </div>
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 pt-2">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded h-4 w-4 border-white/20 bg-[#080E18] text-cyan-400 accent-cyan-400"
                  />
                  <span>
                    I agree to the InterviewFlow <span className="text-cyan-400 font-bold underline">Terms of Service</span> and <span className="text-cyan-400 font-bold underline">Privacy Policy</span>.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-400 font-bold">{errors.agreeTerms}</p>}
              </div>
            )}

            {/* Navigation Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Step
              </button>

              {interviewerStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 flex items-center gap-2 transition-all"
                >
                  Continue to Step {interviewerStep + 1} <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 hover:brightness-110 disabled:opacity-60 flex items-center gap-2 transition-all"
                >
                  {isLoading ? "Setting Up Interviewer Profile…" : "Complete & Launch Account ✓"}
                </button>
              )}
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // STANDARD AUTH CARD (CANDIDATE, COMPANY, AND INTERVIEWER STEP 1)
  // ══════════════════════════════════════════════════════════════════════
  return (
    <AuthLayout>
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-extrabold text-sm shadow ${
          isDark ? "bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E]" : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
        }`}>
          iF
        </div>
        <span className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
          Interview<span className={isDark ? "text-cyan-400" : "text-indigo-600"}>Flow</span>
        </span>
      </div>

      <h2 className={`text-xl sm:text-2xl font-extrabold mb-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
        Create Your Account
      </h2>
      <p className={`text-xs sm:text-sm mb-3 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
        {selectedRole === "interviewer" ? "Step 1 of 4 • Account Credentials" : "Join thousands of developers & companies"}
      </p>

      {errors.form && (
        <div className={`mb-3 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium border ${
          isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <AlertCircle className={`h-4 w-4 shrink-0 ${isDark ? "text-red-400" : "text-red-500"}`} />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-3">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role.id)}
              className={`flex flex-col items-center text-center rounded-2xl p-2 sm:p-2.5 border-2 transition-all duration-200 ${
                isSelected
                  ? isDark
                    ? "border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/20"
                    : "border-indigo-500 bg-indigo-50/70 text-indigo-700 shadow-sm"
                  : isDark
                    ? "border-white/10 bg-[#080E18] text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/5"
                    : "border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <div className={`mb-1 ${isSelected ? (isDark ? "text-cyan-400" : "text-indigo-600") : (isDark ? "text-slate-400" : "text-slate-600")}`}>
                {role.icon}
              </div>
              <div className="text-xs font-bold mb-1">
                {role.title}
              </div>
              <ul className="space-y-0.5">
                {role.bullets.map((bulletText) => (
                  <li key={bulletText} className={`text-[9.5px] leading-tight ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {bulletText}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name */}
        <div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={selectedRole === "company" ? "Company Representative Name" : "Full Name"}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
              errors.fullName
                ? isDark
                  ? "border-red-500/50 bg-red-500/10 text-white focus:border-red-400"
                  : "border-red-300 bg-red-50/50 text-slate-900 focus:border-red-400"
                : isDark
                  ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                  : "border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
            }`}
          />
          {errors.fullName && (
            <p className={`text-[11px] mt-1 font-medium pl-1 ${isDark ? "text-red-400" : "text-red-500"}`}>{errors.fullName}</p>
          )}
        </div>

        {/* Company Name (For Company Role) */}
        {selectedRole === "company" && (
          <div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company / Organization Name"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.company
                    ? "border-red-400 bg-red-500/10 text-white"
                    : isDark
                    ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400"
                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-400"
                }`}
              />
            </div>
            {errors.company && (
              <p className={`text-[11px] mt-1 font-medium pl-1 ${isDark ? "text-red-400" : "text-red-500"}`}>{errors.company}</p>
            )}
          </div>
        )}

        {/* Email & Password / Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Work / Login Email"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? isDark
                      ? "border-red-500/50 bg-red-500/10 text-white focus:border-red-400"
                      : "border-red-300 bg-red-50/50 text-slate-900 focus:border-red-400"
                    : isDark
                      ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
                }`}
              />
            </div>
            {errors.email && (
              <p className={`text-[11px] mt-1 font-medium pl-1 ${isDark ? "text-red-400" : "text-red-500"}`}>{errors.email}</p>
            )}
          </div>

          {/* Password for Candidate & Interviewer */}
          {selectedRole !== "company" ? (
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password (8+)"
                  className={`w-full rounded-xl border pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? isDark
                        ? "border-red-500/50 bg-red-500/10 text-white focus:border-red-400"
                        : "border-red-300 bg-red-50/50 text-slate-900 focus:border-red-400"
                      : isDark
                        ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                        : "border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 ${isDark ? "hover:text-slate-200" : "hover:text-slate-600"}`}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className={`text-[11px] mt-1 font-medium pl-1 ${isDark ? "text-red-400" : "text-red-500"}`}>{errors.password}</p>
              )}
            </div>
          ) : (
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (Optional)"
                  className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:outline-none ${
                    isDark ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400" : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Password Strength Meter (Candidate & Interviewer) */}
        {selectedRole !== "company" && formData.password.length > 0 && (
          <div className="flex gap-1.5 pt-0.5">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-0.5 flex-1 rounded-full transition-all ${
                  formData.password.length >= (index + 1) * 3
                    ? formData.password.length < 8
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                    : isDark ? "bg-slate-700" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Phone Number for Interviewer */}
        {selectedRole === "interviewer" && (
          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm focus:outline-none ${
                  isDark ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400" : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              />
            </div>
          </div>
        )}

        {/* Passwordless Auto-Gen Banner for Company */}
        {selectedRole === "company" && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-xs">
            <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300">No Password Required Now:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                An 8-character secure password will be generated using UUID and delivered directly to your company email address.
              </p>
            </div>
          </div>
        )}

        {/* Terms checkbox for Candidate & Company */}
        {selectedRole !== "interviewer" && (
          <div>
            <label className={`flex items-start gap-2 cursor-pointer text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className={`mt-0.5 rounded h-3.5 w-3.5 shrink-0 ${
                  isDark ? "border-white/20 bg-[#080E18] text-cyan-400 accent-cyan-400" : "border-slate-300 text-indigo-600"
                }`}
              />
              <span>
                I agree to the{" "}
                <Link href="#" className={`font-semibold hover:underline ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-600"}`}>
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="#" className={`font-semibold hover:underline ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-600"}`}>
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className={`text-[11px] mt-1 font-medium pl-1 ${isDark ? "text-red-400" : "text-red-500"}`}>{errors.agreeTerms}</p>
            )}
          </div>
        )}

        {/* Submit / Advance Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl py-3 text-sm font-extrabold shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isDark
              ? "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] shadow-cyan-500/25"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:opacity-95"
          }`}
        >
          {isLoading ? (
            "Creating Account…"
          ) : selectedRole === "interviewer" ? (
            <>
              Continue to Full-Page Setup <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            ROLES.find((r) => r.id === selectedRole)?.btnText || "Create Account"
          )}
        </button>
      </form>

      <p className={`text-center text-xs mt-4 mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        Already have an account?{" "}
        <Link href="/login" className={`font-bold hover:underline ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-600"}`}>
          Sign In
        </Link>
      </p>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <Lock className="h-3 w-3" />
        Your data is protected with enterprise-grade encryption.
      </div>
    </AuthLayout>
  );
}