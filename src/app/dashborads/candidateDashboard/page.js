"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, CheckCircle2, XCircle, AlertCircle, Loader2,
  Briefcase, MapPin, Clock, FileText, Code2, ArrowUpRight,
  Check, RefreshCw, ShieldCheck, ShieldAlert, ChevronRight,
  Sparkles, Terminal, Video, BookOpen, Lightbulb, Play,
  HelpCircle, Laptop, Mic, CheckCircle, ArrowRight, Lock,
  Home, Rocket, Star, Award, Zap, Compass, Layers, X, Settings, LayoutDashboard,
  Radio, CheckSquare, Square, ChevronLeft, History, RotateCcw, Trash2,
  Users, Calendar, Send, MessageSquare, Search, Filter, Menu, LogOut
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import DashboardHeader from "../_components/DashboardHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const REQUIRED_FIELDS_META = {
  currentRole:       { label: "Current Role / Job Title",  icon: Briefcase, hint: "Tell us your current or desired job title." },
  yearsExperience:   { label: "Years of Experience",       icon: Clock,     hint: "How many years have you worked in this field?" },
  preferredLocation: { label: "Preferred Location",        icon: MapPin,    hint: "Where would you like to work?" },
  skills:            { label: "At Least 1 Skill",          icon: Code2,     hint: "Add skills related to your field." },
  resumeUrl:         { label: "Resume URL",                icon: FileText,  hint: "Link to your resume (Google Drive, PDF, etc.)." },
};

const ROLE_OPTIONS = [
  { id: "frontend", label: "Frontend Developer (React / Next.js)", icon: "⚛️", desc: "UI, State Management, DOM & CSS" },
  { id: "backend",  label: "Backend Developer (Node.js / Express)", icon: "🟢", desc: "REST APIs, Auth, Databases" },
  { id: "fullstack", label: "Full Stack Engineer (MERN)", icon: "🚀", desc: "End-to-End System & Architecture" },
  { id: "java",     label: "Java Backend Engineer (Spring Boot)", icon: "☕", desc: "OOP, Microservices, JVM" },
  { id: "python",   label: "Python / AI & ML Engineer", icon: "🐍", desc: "Data processing, ML models, APIs" },
  { id: "devops",   label: "DevOps & Cloud Engineer", icon: "☁️", desc: "CI/CD, Docker, Kubernetes, AWS" },
];

const LANGUAGE_OPTIONS = [
  { id: "javascript", label: "JavaScript", icon: "🟨", version: "ES2024 / Node 20" },
  { id: "typescript", label: "TypeScript", icon: "🔷", version: "TS 5.4" },
  { id: "python",     label: "Python",     icon: "🐍", version: "Python 3.11" },
  { id: "java",       label: "Java",       icon: "☕", version: "OpenJDK 17" },
  { id: "cpp",        label: "C++",        icon: "⚡", version: "GCC 12 / C++20" },
  { id: "go",         label: "Go (Golang)", icon: "🔵", version: "Go 1.22" },
  { id: "sql",        label: "SQL",        icon: "🗄️", version: "MySQL 8.0" },
];

const TOPIC_OPTIONS = [
  { id: "dsa",       label: "Data Structures & Algorithms (DSA)", icon: "🧠", desc: "Arrays, Trees, Graphs, DP" },
  { id: "system",    label: "System Design & Architecture", icon: "🏗️", desc: "Scalability, Caching, Load Balancers" },
  { id: "react",     label: "React Component & Frontend Architecture", icon: "⚛️", desc: "Hooks, Performance, Virtual DOM" },
  { id: "database",  label: "Database & API Optimization", icon: "⚡", desc: "Indexing, Queries, Redis, Microservices" },
  { id: "debugging", label: "Live Code Debugging & Refactoring", icon: "🐛", desc: "Finding bugs & optimizing code" },
  { id: "hr",        label: "Behavioral & STAR Method", icon: "💬", desc: "Leadership, Teamwork, Situation handling" },
];

const EXPERIENCE_OPTIONS = [
  { id: "fresher", label: "0-1 Years", subtitle: "Fresher / Entry Level", desc: "Focus on Core Fundamentals & Problem Solving" },
  { id: "junior",  label: "1-3 Years", subtitle: "Junior Developer", desc: "Focus on Practical Coding & Framework Mastery" },
  { id: "mid",     label: "3-5 Years", subtitle: "Mid-Level Developer", desc: "Focus on System Design & Clean Architecture" },
  { id: "senior",  label: "5+ Years",  subtitle: "Senior / Lead Engineer", desc: "Focus on Scalability, Leadership & Distributed Systems" },
];

const FEATURED_CAPABILITIES = [
  {
    id: "interviewers",
    title: "Match with Verified Interviewers",
    subtitle: "Find Experts by Role & Skill",
    desc: "Browse top verified interviewers matching your exact technical requirements and send 1-to-1 interview requests.",
    icon: Users,
    tag: "Interviewer Matching",
    gradient: "from-sky-500/20 via-cyan-500/20 to-teal-500/20",
    border: "border-cyan-500/40 hover:border-cyan-400",
    btnColor: "bg-cyan-500 hover:bg-cyan-400 text-[#0B151E]",
    btnText: "Find Matching Interviewers",
  },
  {
    id: "interview",
    title: "1-to-1 Live Interview Room",
    subtitle: "Real-time HD Video & Code Sync",
    desc: "Join high-performance technical interviews with sub-50ms synchronized code editor, compiler, and live chat.",
    icon: Video,
    tag: "Live Room",
    gradient: "from-purple-500/20 via-indigo-500/20 to-sky-500/20",
    border: "border-purple-500/40 hover:border-purple-400",
    btnColor: "bg-purple-500 hover:bg-purple-400 text-white",
    btnText: "Enter 1-to-1 Room",
  },
];

const QUICK_FEATURES = [
  {
    title: "Multi-Language Compiler",
    desc: "Test code in JS, Python, Java, C++, and Go with test cases & console outputs.",
    icon: Terminal,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "AI ATS Resume Scoring",
    desc: "Check your uploaded PDF resume against tech company keywords & ATS filters.",
    icon: FileText,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Anti-Cheat & Proctoring",
    desc: "Clean, distraction-free environment with tab-switch detection & security.",
    icon: ShieldCheck,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Direct Placement Pipeline",
    desc: "Verified profiles get direct interview invitations from top hiring teams.",
    icon: Zap,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
];

const GUIDANCE_TOPICS = [
  {
    category: "Technical & Coding Rounds",
    icon: Code2,
    color: "from-sky-500 to-cyan-500",
    tips: [
      { title: "Think Out Loud & Explain Thought Process", desc: "Interviewers care more about how you break down problems than just writing code quickly." },
      { title: "Clarify Requirements First", desc: "Ask questions on edge cases, constraints (time/space complexity), and expected input formats before typing." },
      { title: "Write Modular, Clean Code", desc: "Use meaningful variable names and helper functions. Test your solution with sample test cases." },
    ],
  },
  {
    category: "System & Environment Setup",
    icon: Laptop,
    color: "from-purple-500 to-indigo-500",
    tips: [
      { title: "Camera & Audio Check", desc: "Ensure your webcam and microphone are tested and functioning clearly in a quiet, well-lit room." },
      { title: "Stable High-Speed Connection", desc: "A wired or strong Wi-Fi connection ensures sub-50ms code synchronization with your interviewer." },
      { title: "Zero Tab-Switch Policy", desc: "The platform detects tab switches and background windows to maintain anti-cheat integrity." },
    ],
  },
  {
    category: "Behavioral & STAR Method",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    tips: [
      { title: "Use the STAR Technique", desc: "Structure your answers: Situation, Task, Action you took, and Result achieved." },
      { title: "60-Second Elevating Introduction", desc: "Highlight your background, core stack, top project accomplishments, and passion." },
      { title: "Ask Insightful Questions", desc: "At the end, ask about the engineering culture, tech challenges, and team roadmap." },
    ],
  },
];

const SIDEBAR_ITEMS = [
  { id: "home",         label: "Overview & Features",     icon: LayoutDashboard, badge: null },
  { id: "interviewers", label: "Matching Interviewers",   icon: Users,           badge: "matchCount" },
  { id: "interview",    label: "1-to-1 Live Interview",   icon: Video,           badge: null },
  { id: "guidance",     label: "Interview Guidance",      icon: BookOpen,        badge: null },
  { id: "readiness",    label: "Profile & Readiness",     icon: ShieldCheck,     badge: "pct" },
];

const TABS = SIDEBAR_ITEMS;

export default function CandidateDashboard() {
  const router    = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]                 = useState(null);
  const [token, setToken]               = useState(null);
  const [activeTab, setActiveTab]       = useState("home");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile]           = useState(null);
  const [readiness, setReadiness]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [currentStep, setCurrentStep]     = useState(1);

  const [selectedRoles, setSelectedRoles]         = useState(["frontend"]);
  const [selectedLanguages, setSelectedLanguages] = useState(["javascript", "typescript"]);
  const [selectedTopics, setSelectedTopics]       = useState(["dsa", "react"]);
  const [selectedExperience, setSelectedExperience] = useState("junior");
  const [sessionRoomCode, setSessionRoomCode]     = useState("");
  const [cameraConsent, setCameraConsent]         = useState(true);
  const [rulesConsent, setRulesConsent]           = useState(true);

  const [activeSession, setActiveSession] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [matchingInterviewers, setMatchingInterviewers] = useState([]);
  const [interviewerSearch, setInterviewerSearch]       = useState("");
  const [filterRole, setFilterRole]                     = useState("");
  const [filterLanguage, setFilterLanguage]             = useState("");
  const [myRequests, setMyRequests]                     = useState([]);
  const [requestLoading, setRequestLoading]             = useState(false);
  const [bookingModalOpen, setBookingModalOpen]         = useState(false);
  const [selectedInterviewer, setSelectedInterviewer]   = useState(null);
  const [bookingForm, setBookingForm]                   = useState({
    roleRequirement: "Frontend Developer (React / Next.js)",
    language: "JavaScript",
    topicFocus: ["DSA", "System Design"],
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "Today 6:00 PM",
    candidateNotes: "",
  });

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
    fetchData(t);

    const savedRecents = localStorage.getItem("interviewflow_recent_sessions");
    if (savedRecents) {
      try {
        setRecentSessions(JSON.parse(savedRecents));
      } catch {}
    }
  }, [router]);

  const fetchData = async (authToken) => {
    setLoading(true);
    try {
      const [profileRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/candidate/me`, { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch(`${API_BASE}/candidate/me/profile-status`, { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);

      const profileJson = await profileRes.json();
      const statusJson  = await statusRes.json();

      if (profileJson.success && profileJson.data) {
        setProfile(profileJson.data);
        if (profileJson.data.currentRole) {
          setFilterRole(profileJson.data.currentRole);
          setBookingForm((prev) => ({ ...prev, roleRequirement: profileJson.data.currentRole }));
        }
      }
      if (statusJson.success && statusJson.data) {
        setReadiness(statusJson.data);
      }

      fetchInterviewersData(authToken);
      fetchMyRequestsData(authToken);
    } catch {
      showToast("error", "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewersData = async (authToken, roleParam, searchParam) => {
    try {
      const queryParams = new URLSearchParams();
      if (roleParam || filterRole) queryParams.append("role", roleParam || filterRole);
      if (filterLanguage) queryParams.append("language", filterLanguage);
      if (searchParam || interviewerSearch) queryParams.append("search", searchParam || interviewerSearch);

      const res = await fetch(`${API_BASE}/interview-requests/matching-interviewers?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${authToken || token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMatchingInterviewers(json.data);
      } else {
        setMatchingInterviewers([]);
      }
    } catch {
      setMatchingInterviewers([]);
    }
  };

  const fetchMyRequestsData = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/interview-requests/my-requests`, {
        headers: { Authorization: `Bearer ${authToken || token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMyRequests(json.data);
      }
    } catch {}
  };

  // Open the Multi-Step Pre-Interview Wizard
  const openStepWizard = (code = "") => {
    if (!isReady) {
      showToast("error", "Please complete your profile (100%) before entering 1-to-1 interviews.");
      setActiveTab("readiness");
      return;
    }
    if (code) setSessionRoomCode(code);
    setCurrentStep(1);
    setStepModalOpen(true);
  };

  // Quick-Load the Last / Most Recent Session Setup
  const handleQuickLoadLastSetup = () => {
    if (recentSessions.length === 0) {
      showToast("error", "No previous session found. Please complete the setup steps.");
      return;
    }
    const last = recentSessions[0];
    if (last.rawRoles) setSelectedRoles(last.rawRoles);
    if (last.rawLanguages) setSelectedLanguages(last.rawLanguages);
    if (last.rawTopics) setSelectedTopics(last.rawTopics);
    if (last.rawExperience) setSelectedExperience(last.rawExperience);
    setSessionRoomCode(`INT-${Math.floor(1000 + Math.random() * 9000)}-FLOW`);
    setCurrentStep(5);
    showToast("success", "Loaded last session setup! Review and launch.");
  };

  // Re-launch a specific session from history
  const handleRelaunchSession = (sess) => {
    if (!isReady) {
      showToast("error", "Please complete your profile (100%) before entering 1-to-1 interviews.");
      setActiveTab("readiness");
      return;
    }
    if (sess.rawRoles) setSelectedRoles(sess.rawRoles);
    if (sess.rawLanguages) setSelectedLanguages(sess.rawLanguages);
    if (sess.rawTopics) setSelectedTopics(sess.rawTopics);
    if (sess.rawExperience) setSelectedExperience(sess.rawExperience);
    setSessionRoomCode(`INT-${Math.floor(1000 + Math.random() * 9000)}-FLOW`);
    setCurrentStep(5);
    setStepModalOpen(true);
  };

  // Clear session history
  const handleClearHistory = () => {
    setRecentSessions([]);
    localStorage.removeItem("interviewflow_recent_sessions");
    showToast("success", "Recent session history cleared.");
  };

  // Open booking modal for a specific interviewer
  const openBookingModal = (inv) => {
    if (!isReady) {
      showToast("error", "Please complete your profile (100%) before requesting interviews.");
      setActiveTab("readiness");
      return;
    }
    setSelectedInterviewer(inv);
    setBookingForm({
      roleRequirement: profile?.currentRole || ROLE_OPTIONS[0].label,
      language: "JavaScript",
      topicFocus: ["DSA", "System Design"],
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: inv.availability?.[0] || "Today 6:00 PM",
      candidateNotes: "",
    });
    setBookingModalOpen(true);
  };

  // Submit interview request for an interviewer
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedInterviewer) return;

    try {
      setRequestLoading(true);
      const generatedRoom = `INT-${Math.floor(1000 + Math.random() * 9000)}-FLOW`;

      const payload = {
        interviewerUserId: selectedInterviewer.user?.userId || selectedInterviewer.userId,
        roleRequirement: bookingForm.roleRequirement,
        language: bookingForm.language,
        topicFocus: bookingForm.topicFocus,
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        roomCode: generatedRoom,
        candidateNotes: bookingForm.candidateNotes,
      };

      const res = await fetch(`${API_BASE}/interview-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        showToast("success", `Interview request submitted! Room: ${generatedRoom}. Interviewer notified via Brevo email.`);
        setBookingModalOpen(false);
        fetchMyRequestsData(token);
      } else {
        showToast("error", json.message || "Failed to submit interview request.");
      }
    } catch {
      showToast("error", "Network error submitting interview request.");
    } finally {
      setRequestLoading(false);
    }
  };

  // Toggle multi-select helper
  const toggleSelection = (list, setList, item) => {
    if (list.includes(item)) {
      if (list.length === 1) {
        showToast("error", "Please keep at least 1 option selected.");
        return;
      }
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Step validation
  const handleNextStep = () => {
    if (currentStep === 1 && selectedRoles.length === 0) {
      showToast("error", "Please select at least 1 target role.");
      return;
    }
    if (currentStep === 2 && selectedLanguages.length === 0) {
      showToast("error", "Please select at least 1 coding language.");
      return;
    }
    if (currentStep === 3 && selectedTopics.length === 0) {
      showToast("error", "Please select at least 1 topic focus area.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  // Launch the interview session
  const handleLaunchSession = () => {
    if (!cameraConsent || !rulesConsent) {
      showToast("error", "Please accept camera/mic and anti-cheat guidelines to proceed.");
      return;
    }

    const finalRoomCode = sessionRoomCode.trim() || `INT-${Math.floor(1000 + Math.random() * 9000)}-FLOW`;

    const sessionObj = {
      id: Date.now(),
      roles: selectedRoles.map((id) => ROLE_OPTIONS.find((r) => r.id === id)?.label || id),
      languages: selectedLanguages.map((id) => LANGUAGE_OPTIONS.find((l) => l.id === id)?.label || id),
      topics: selectedTopics.map((id) => TOPIC_OPTIONS.find((t) => t.id === id)?.label || id),
      experience: EXPERIENCE_OPTIONS.find((e) => e.id === selectedExperience)?.subtitle || selectedExperience,
      rawRoles: selectedRoles,
      rawLanguages: selectedLanguages,
      rawTopics: selectedTopics,
      rawExperience: selectedExperience,
      roomCode: finalRoomCode,
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      startTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setActiveSession(sessionObj);

    const updatedHistory = [sessionObj, ...recentSessions.filter((s) => s.roomCode !== finalRoomCode)].slice(0, 6);
    setRecentSessions(updatedHistory);
    localStorage.setItem("interviewflow_recent_sessions", JSON.stringify(updatedHistory));

    setStepModalOpen(false);
    setActiveTab("interview");
    showToast("success", `1-to-1 Interview Connected! Room: ${finalRoomCode}`);
  };

  if (!user) return null;

  // ── Styles ─────────────────────────────────────────────────────────────
  const pageBg  = isDark ? "bg-[#0B151E] text-slate-100"  : "bg-slate-50 text-slate-900";
  const sideBg  = isDark ? "bg-[#060D16] border-white/10" : "bg-white border-slate-200";
  const cardBg  = isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5"  : "bg-slate-50 border-slate-100";
  const inputCls = `w-full rounded-xl border p-2.5 text-xs outline-none transition-colors focus:border-cyan-400 ${
    isDark ? "border-white/10 bg-[#0B151E] text-white placeholder-slate-500" : "border-slate-200 bg-slate-50 text-slate-900"
  }`;

  const isReady   = readiness?.isReady === true;
  const pct       = readiness?.percentage ?? 0;
  const checklist = readiness?.checklist ?? [];

  return (
    <div className={`h-screen flex flex-col ${pageBg} transition-colors overflow-hidden`}>
      <DashboardHeader title="Candidate Dashboard" roleBadge="Candidate" />

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

      <div className="flex flex-1 overflow-hidden relative min-h-0">

        {/* ══════════════════ CANDIDATE SIDEBAR (FIXED) ══════════════════ */}
        <aside className={`h-full flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sideBg} ${
          sidebarOpen ? "w-64" : "w-18 sm:w-20"
        } hidden md:flex overflow-hidden`}>

          {/* Sidebar Top Header & Collapse Button */}
          <div className={`flex-shrink-0 flex items-center justify-between px-4 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-sky-400 to-cyan-400 flex items-center justify-center font-black text-xs text-[#0B151E]">
                  IF
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-cyan-400">
                  Workspace
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className={`p-1.5 rounded-xl border text-slate-400 hover:text-white transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
              } ${!sidebarOpen ? "mx-auto" : ""}`}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-[#0B151E] font-black shadow-lg"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-[#0B151E]" : "text-cyan-400"}`} />
                  {sidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {sidebarOpen && item.id === "readiness" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : isReady ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {pct}%
                    </span>
                  )}
                  {sidebarOpen && item.id === "interviewers" && matchingInterviewers.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {matchingInterviewers.length}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Actions in Sidebar */}
            {sidebarOpen && (
              <div className="pt-4 space-y-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider">Quick Actions</span>

                {recentSessions.length > 0 && (
                  <button
                    onClick={handleQuickLoadLastSetup}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-400/10 transition-all`}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    <span className="truncate">Quick-Load Last Setup</span>
                  </button>
                )}

                <button
                  onClick={() => router.push("/profile")}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition-all`}
                >
                  <User className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="truncate">Edit Profile Page</span>
                </button>
              </div>
            )}
          </nav>

          {/* Bottom Candidate Status Card */}
          <div className={`flex-shrink-0 p-3.5 border-t ${isDark ? "border-white/10 bg-white/2" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-400 to-cyan-400 p-0.5 shrink-0">
                <div className={`h-full w-full rounded-[10px] ${isDark ? "bg-[#060D16]" : "bg-white"} flex items-center justify-center font-black text-xs text-cyan-400`}>
                  {(user.firstName || user.username || "C")[0].toUpperCase()}
                </div>
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-xs truncate text-slate-100">{user.firstName || user.username}</p>
                  <span className={`text-[10px] font-bold ${isReady ? "text-emerald-400" : "text-amber-400"}`}>
                    {isReady ? "100% Ready ✓" : `${pct}% Complete`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ══════════════════ MAIN CONTENT WORKSPACE ══════════════════ */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">

          {/* Mobile Sidebar Hamburger Toggle */}
          <div className="md:hidden flex items-center justify-between pb-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs font-bold"
            >
              <Menu className="h-4 w-4" /> Menu Navigation
            </button>
            <span className="text-xs font-bold text-slate-400">
              {TABS.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden p-4 rounded-3xl border mb-4 space-y-2 ${cardBg}`}>
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold ${
                      active ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-[#0B151E]" : "text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Header Bar inside workspace */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
                <div className={`h-full w-full rounded-[14px] ${isDark ? "bg-[#080E18]" : "bg-white"} flex items-center justify-center font-extrabold text-lg text-cyan-400`}>
                  {(user.firstName || user.username || "C")[0].toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold flex items-center gap-2">
                  Welcome, {user.firstName || user.username}!
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-black border ${
                    isReady ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-amber-400/30 bg-amber-400/10 text-amber-400"
                  }`}>
                    {isReady ? "Interview Ready ✓" : `${pct}% Profile Complete`}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{user.email} • Candidate Workspace</p>
              </div>
            </div>

            <button
              onClick={() => fetchData(token)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors self-start sm:self-auto ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            </div>
          ) : (
            <>
              {/* ══════════════ TAB 1: CANDIDATE HOME PAGE & FEATURES ══════════════ */}
              {activeTab === "home" && (
                <div className="space-y-6">

                  {/* Hero Feature Welcome Banner */}
                  <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-teal-500/10 border-cyan-500/30 shadow-2xl`}>
                    <div className="max-w-2xl space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                        <Sparkles className="h-3.5 w-3.5" /> Candidate Platform Features
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
                        Master Your Technical Interviews with Confidence
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Access your 1-to-1 live coding interview room, match with verified engineering interviewers, explore interview guidance, and track readiness.
                      </p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => setActiveTab("interviewers")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 text-[#0B151E] font-extrabold text-xs shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
                        >
                          <Users className="h-4 w-4" /> View Matching Interviewers
                        </button>

                        <button
                          onClick={() => openStepWizard()}
                          className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/20 font-extrabold text-xs flex items-center gap-2 transition-all"
                        >
                          <Video className="h-4 w-4" /> Start 1-to-1 Room
                        </button>

                        <button
                          onClick={() => setActiveTab("guidance")}
                          className={`px-5 py-2.5 rounded-xl border font-extrabold text-xs flex items-center gap-2 transition-all ${
                            isDark ? "border-white/15 hover:bg-white/5 text-slate-200" : "border-slate-300 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <BookOpen className="h-4 w-4" /> View Preparation Guidance
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary 2 Core Feature Cards */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-cyan-400" /> Featured Options
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FEATURED_CAPABILITIES.map((feat) => {
                        const Icon = feat.icon;
                        return (
                          <div
                            key={feat.id}
                            className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 bg-gradient-to-br ${feat.gradient} ${cardBg} ${feat.border} transition-all`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-cyan-300 w-fit">
                                  <Icon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-white/10 bg-black/20 text-slate-300">
                                  {feat.tag}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-100">{feat.title}</h4>
                                <p className="text-xs font-bold text-cyan-400 mt-0.5">{feat.subtitle}</p>
                                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{feat.desc}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => setActiveTab(feat.id)}
                              className={`w-full py-3 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${feat.btnColor}`}
                            >
                              <span>{feat.btnText}</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Platform Toolkit */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" /> Platform Toolkit
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {QUICK_FEATURES.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${innerBg}`}>
                            <div className={`p-2.5 rounded-xl border w-fit ${item.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <h5 className="font-extrabold text-xs text-slate-100">{item.title}</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════ TAB 2: MATCHING INTERVIEWERS & REQUESTS ══════════════ */}
              {activeTab === "interviewers" && (
                <div className="space-y-6">

                  {/* Filter & Requirement Bar */}
                  <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <h2 className="text-base font-extrabold flex items-center gap-2 text-cyan-400">
                          <Users className="h-5 w-5" /> Matching Verified Interviewers
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Filter by target role, language, and skills to find the perfect technical interviewer</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 self-start sm:self-auto">
                        {matchingInterviewers.length} Interviewers Available
                      </span>
                    </div>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by name, title, skill..."
                          value={interviewerSearch}
                          onChange={(e) => {
                            setInterviewerSearch(e.target.value);
                            fetchInterviewersData(token, filterRole, e.target.value);
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none ${
                            isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>

                      <select
                        value={filterRole}
                        onChange={(e) => {
                          setFilterRole(e.target.value);
                          fetchInterviewersData(token, e.target.value, interviewerSearch);
                        }}
                        className={inputCls}
                      >
                        <option value="">All Engineering Roles</option>
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.id} value={r.label}>{r.label}</option>
                        ))}
                      </select>

                      <select
                        value={filterLanguage}
                        onChange={(e) => {
                          setFilterLanguage(e.target.value);
                          fetchInterviewersData(token, filterRole, interviewerSearch);
                        }}
                        className={inputCls}
                      >
                        <option value="">All Coding Languages</option>
                        {LANGUAGE_OPTIONS.map((l) => (
                          <option key={l.id} value={l.label}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Interviewer Cards Grid or Empty State */}
                  {matchingInterviewers.length === 0 ? (
                    <div className={`p-12 text-center rounded-3xl border ${cardBg} space-y-3`}>
                      <Users className="h-10 w-10 text-slate-500 mx-auto" />
                      <h4 className="text-sm font-extrabold text-slate-200">No Interviewers Found</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        No registered interviewers match your current filter requirement. Try resetting your role or coding language filters.
                      </p>
                      <button
                        onClick={() => {
                          setFilterRole("");
                          setFilterLanguage("");
                          setInterviewerSearch("");
                          fetchInterviewersData(token, "", "");
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-400/20 transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchingInterviewers.map((inv) => {
                        const fullName = inv.user?.firstName
                          ? `${inv.user.firstName} ${inv.user.lastName || ""}`.trim()
                          : inv.user?.username || "Interviewer";
                        const initial = fullName[0]?.toUpperCase() || "I";
                        const specs = Array.isArray(inv.specialization) ? inv.specialization : [];
                        const slots = Array.isArray(inv.availability) ? inv.availability : [];

                        return (
                          <div
                            key={inv.interviewerId}
                            className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 transition-all hover:border-cyan-500/40 ${cardBg}`}
                          >
                            <div className="space-y-3.5">
                              {/* Header with Avatar & Match Score */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
                                    <div className={`h-full w-full rounded-[14px] ${isDark ? "bg-[#0B151E]" : "bg-white"} flex items-center justify-center font-black text-base text-cyan-400`}>
                                      {initial}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                                      {fullName}
                                      {inv.isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                    </h4>
                                    <p className="text-xs text-cyan-400 font-bold">{inv.title || "Technical Interviewer"}</p>
                                    <p className="text-[11px] text-slate-400">{inv.department || "Engineering"} {inv.company?.companyName ? `• ${inv.company.companyName}` : ""}</p>
                                  </div>
                                </div>

                                {/* Match Score Badge */}
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                                  {inv.matchScore || 95}% Match
                                </span>
                              </div>

                              {/* Specializations Badges */}
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Specializations</span>
                                <div className="flex flex-wrap gap-1">
                                  {specs.length > 0 ? (
                                    specs.map((s, i) => (
                                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-slate-500 italic">Full Stack, System Design, DSA</span>
                                  )}
                                </div>
                              </div>

                              {/* Availability */}
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Next Available Slots</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {slots.length > 0 ? (
                                    slots.slice(0, 3).map((slot, i) => (
                                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono">
                                        🕒 {slot}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono">
                                      🕒 Available upon request
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() => openBookingModal(inv)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-extrabold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Send className="h-3.5 w-3.5" /> Request 1-to-1 Interview
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Submitted Interview Requests Section */}
                  {myRequests.length > 0 && (
                    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                          <MessageSquare className="h-4 w-4" /> My Submitted Interview Requests
                        </h3>
                        <span className="text-xs text-slate-400">{myRequests.length} Requests</span>
                      </div>

                      <div className="space-y-3">
                        {myRequests.map((req) => (
                          <div
                            key={req.requestId}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${innerBg}`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-xs text-slate-100">{req.roleRequirement}</h4>
                                <span className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                                  req.status === "accepted"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : req.status === "rejected"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Interviewer: <strong className="text-slate-200">{req.interviewerUser?.firstName || "Interviewer"}</strong> • Language: {req.language} • Date: {req.scheduledDate} ({req.scheduledTime})
                              </p>
                              <p className="text-[10px] font-mono text-cyan-400 font-bold">Room Code: {req.roomCode}</p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              {req.meetingLink && (
                                <a
                                  href={req.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                  <Video className="h-3.5 w-3.5 text-emerald-400" /> Google Meet
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setSessionRoomCode(req.roomCode);
                                  setActiveTab("interview");
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold flex items-center gap-1.5"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" /> Join Room
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════ TAB 3: 1-TO-1 LIVE INTERVIEW ══════════════ */}
              {activeTab === "interview" && (
                <div className="space-y-6">

                  {/* Active Session Card if joined */}
                  {activeSession ? (
                    <div className={`p-6 rounded-3xl border shadow-2xl space-y-5 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-teal-500/10 border-emerald-500/40 animate-in fade-in`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                          <div>
                            <h2 className="text-base font-extrabold text-emerald-300">Active 1-to-1 Live Interview Session</h2>
                            <p className="text-xs text-slate-400">Room Code: <strong className="text-white font-mono">{activeSession.roomCode}</strong> • Connected at {activeSession.startTime}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSession(null)}
                          className="px-3 py-1.5 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/10"
                        >
                          End Session
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className={`p-3.5 rounded-2xl border ${innerBg}`}>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Target Roles</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activeSession.roles.map((r, i) => (
                              <span key={i} className="text-[11px] font-bold text-slate-200">{r}</span>
                            ))}
                          </div>
                        </div>

                        <div className={`p-3.5 rounded-2xl border ${innerBg}`}>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Live Coding Languages</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {activeSession.languages.map((l, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold">{l}</span>
                            ))}
                          </div>
                        </div>

                        <div className={`p-3.5 rounded-2xl border ${innerBg}`}>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Experience Level</span>
                          <p className="font-extrabold text-xs text-slate-100 mt-1">{activeSession.experience}</p>
                        </div>

                        <div className={`p-3.5 rounded-2xl border ${innerBg}`}>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Focus Topics</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activeSession.topics.map((t, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#080E18] border border-cyan-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Terminal className="h-5 w-5 text-cyan-400" />
                          <span className="text-xs font-bold text-slate-200">Synchronized Multi-Language Workspace Connected</span>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          WebRTC Active ✓
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Live 1-on-1 Room Connector Card */}
                  <div className={`p-6 rounded-3xl border shadow-xl space-y-5 ${cardBg} border-cyan-500/30`}>
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-cyan-500 text-[#0B151E] shadow-lg shadow-cyan-500/20">
                          <Video className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold">1-to-1 Live Interview Room</h2>
                          <p className="text-xs text-slate-400 mt-0.5">Real-time HD video call, synchronized code editor, and multi-language compiler</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                        Sub-50ms Sync
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Enter room code or leave blank to start step-by-step setup (e.g. INT-8924-FLOW)"
                          value={sessionRoomCode}
                          onChange={(e) => setSessionRoomCode(e.target.value)}
                          className={`flex-1 rounded-2xl border px-4 py-3 text-xs outline-none font-medium transition-colors focus:border-cyan-400 ${
                            isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => openStepWizard(sessionRoomCode)}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Settings className="h-4 w-4" /> Start Step-by-Step Setup
                        </button>
                      </div>

                      {/* Quick-Load Last Setup Shortcut Bar */}
                      {recentSessions.length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-xs">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-cyan-400 shrink-0" />
                            <span className="text-slate-300">
                              Last session setup: <strong className="text-cyan-300">{recentSessions[0].roles.slice(0, 2).join(", ")}</strong> ({recentSessions[0].languages.join(", ")})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleQuickLoadLastSetup}
                            className="text-xs font-black text-cyan-400 underline hover:text-cyan-300"
                          >
                            Quick-Load Last Setup
                          </button>
                        </div>
                      )}

                      {!isReady && (
                        <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 font-semibold">
                            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                            <span>Profile is {pct}% complete. Fill missing required fields to take live company interviews.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("readiness")}
                            className="text-xs font-bold text-amber-300 underline whitespace-nowrap"
                          >
                            Complete Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent 1-to-1 Sessions History */}
                  {recentSessions.length > 0 && (
                    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-cyan-400" />
                          <h3 className="text-sm font-extrabold">Recent 1-to-1 Interview History</h3>
                        </div>
                        <button
                          onClick={handleClearHistory}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> Clear History
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recentSessions.map((sess) => (
                          <div
                            key={sess.id}
                            className={`p-4 rounded-2xl border space-y-2.5 transition-all hover:border-cyan-400/40 ${innerBg}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-cyan-400">{sess.roomCode}</span>
                              <span className="text-[10px] text-slate-400">{sess.date}</span>
                            </div>

                            <div>
                              <p className="text-xs font-extrabold text-slate-200 truncate">
                                {sess.roles.join(", ")}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{sess.experience}</p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {sess.languages.map((l, i) => (
                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-slate-300">
                                  {l}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => handleRelaunchSession(sess)}
                              className="w-full py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <RotateCcw className="h-3 w-3" /> Re-Launch Setup
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════ TAB 4: INTERVIEW GUIDANCE ══════════════ */}
              {activeTab === "guidance" && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-3xl border bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                        <BookOpen className="h-4 w-4" /> Comprehensive Preparation Guide
                      </div>
                      <h2 className="text-lg font-black">How to Ace Your 1-to-1 Technical Interview</h2>
                      <p className="text-xs text-slate-300 max-w-xl">Master technical problem solving, communication frameworks, and code execution best practices.</p>
                    </div>
                    <button
                      onClick={() => openStepWizard()}
                      className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs shadow transition-all whitespace-nowrap flex items-center gap-1.5"
                    >
                      Setup 1-to-1 Room <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Guidance topic cards */}
                  <div className="space-y-5">
                    {GUIDANCE_TOPICS.map((topic, idx) => {
                      const Icon = topic.icon;
                      return (
                        <div key={idx} className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                            <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${topic.color} text-white shadow-md`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-extrabold">{topic.category}</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            {topic.tips.map((tip, tIdx) => (
                              <div key={tIdx} className={`p-4 rounded-2xl border space-y-1.5 ${innerBg}`}>
                                <p className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                  {tip.title}
                                </p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{tip.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════ TAB 5: PROFILE & READINESS ══════════════ */}
              {activeTab === "readiness" && (
                <div className="space-y-6">
                  <div className={`rounded-3xl border shadow-xl overflow-hidden ${cardBg}`}>
                    <div className={`px-6 py-5 flex items-center justify-between border-b ${isDark ? "border-white/10" : "border-slate-200"} ${
                      isReady ? "bg-emerald-500/10" : pct >= 60 ? "bg-amber-500/10" : "bg-red-500/10"
                    }`}>
                      <div className="flex items-center gap-3.5">
                        {isReady
                          ? <ShieldCheck className="h-7 w-7 text-emerald-400" />
                          : <ShieldAlert className="h-7 w-7 text-red-400" />
                        }
                        <div>
                          <h2 className="text-base font-extrabold">Interview Eligibility Status</h2>
                          <p className={`text-xs font-bold mt-0.5 ${isReady ? "text-emerald-400" : "text-red-400"}`}>
                            {isReady
                              ? "✅ You are 100% eligible to take technical interviews!"
                              : `❌ Profile incomplete — ${readiness?.missing?.length || 0} required field(s) missing`}
                          </p>
                        </div>
                      </div>

                      <span className={`text-xl font-black px-4 py-2 rounded-2xl border ${
                        isReady ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400" : pct >= 60 ? "bg-amber-500/20 border-amber-400/40 text-amber-400" : "bg-red-500/20 border-red-400/40 text-red-400"
                      }`}>
                        {pct}%
                      </span>
                    </div>

                    <div className={`px-6 pt-5 pb-3 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-400">Profile Completion</span>
                        <span className={isReady ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400"}>
                          {readiness?.filledCount ?? 0} / {readiness?.totalCount ?? 5} required fields completed
                        </span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-slate-700/30 overflow-hidden p-0.5 border border-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isReady ? "bg-gradient-to-r from-emerald-400 to-teal-400" : pct >= 60 ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-red-400 to-rose-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        5 Required Fields for 1-to-1 Live Interviews
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {checklist.map((item) => {
                          const meta  = REQUIRED_FIELDS_META[item.key] || {};
                          const Icon  = meta.icon || CheckCircle2;
                          return (
                            <div
                              key={item.key}
                              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
                                item.filled
                                  ? isDark ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"
                                  : isDark ? "border-red-500/30 bg-red-500/10" : "border-red-200 bg-red-50"
                              }`}
                            >
                              <div className={`mt-0.5 flex-shrink-0 ${item.filled ? "text-emerald-400" : "text-red-400"}`}>
                                {item.filled ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-extrabold ${item.filled ? "text-emerald-300" : "text-red-300"}`}>
                                  {item.label}
                                </p>
                                {!item.filled && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">{meta.hint}</p>
                                )}
                                {item.filled && (
                                  <p className="text-[11px] text-emerald-400/80 mt-0.5">Completed ✓</p>
                                )}
                              </div>
                              <Icon className={`h-5 w-5 flex-shrink-0 ${item.filled ? "text-emerald-400/50" : "text-red-400/50"}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <button
                        onClick={() => router.push("/profile")}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg transition-all"
                      >
                        {isReady ? "Edit / Update Profile on Profile Page" : "Complete Missing Profile Fields & Upload Resume"}
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-sm font-extrabold flex items-center gap-2 text-sky-400">
                        <User className="h-4 w-4" /> Profile & Verified Resume
                      </h3>
                      <button
                        onClick={() => router.push("/profile")}
                        className="text-xs text-sky-400 font-bold hover:underline"
                      >
                        Edit Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {[
                        { icon: Briefcase, label: "Current Role", value: profile?.currentRole },
                        { icon: Clock, label: "Experience", value: profile?.yearsExperience },
                        { icon: MapPin, label: "Preferred Location", value: profile?.preferredLocation },
                        { icon: CheckCircle2, label: "Status", value: profile?.applicationStatus },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className={`p-3.5 rounded-2xl border space-y-1 ${innerBg}`}>
                          <div className="flex items-center gap-2 text-slate-400 font-bold">
                            <Icon className="h-3.5 w-3.5 text-sky-400" /> {label}
                          </div>
                          <p className="font-extrabold text-xs capitalize truncate">
                            {value || <span className="text-slate-500 font-normal italic">Not set</span>}
                          </p>
                        </div>
                      ))}
                    </div>

                    {profile?.resumeUrl && (
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${innerBg}`}>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <FileText className="h-4 w-4 text-cyan-400" />
                          <span>Candidate_Resume.pdf</span>
                        </div>
                        <a
                          href={profile.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-400 font-bold underline flex items-center gap-1"
                        >
                          View PDF <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ══════════════ 1-TO-1 INTERVIEW REQUEST / BOOKING MODAL ══════════════ */}
      {bookingModalOpen && selectedInterviewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Request 1-to-1 Technical Interview</h3>
                  <p className="text-xs text-slate-400">
                    With <strong>{selectedInterviewer.user?.firstName || "Interviewer"}</strong> ({selectedInterviewer.title || "Senior Architect"})
                  </p>
                </div>
              </div>
              <button onClick={() => setBookingModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 space-y-4 text-xs font-semibold overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block mb-1 font-bold text-slate-300">Target Role</label>
                <select
                  value={bookingForm.roleRequirement}
                  onChange={(e) => setBookingForm({ ...bookingForm, roleRequirement: e.target.value })}
                  className={inputCls}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.label}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Live Coding Language</label>
                <select
                  value={bookingForm.language}
                  onChange={(e) => setBookingForm({ ...bookingForm, language: e.target.value })}
                  className={inputCls}
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.id} value={l.label}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* ── INTERVIEWER'S AVAILABILITY SLOTS SELECTOR ── */}
              <div className={`p-4 rounded-2xl border ${innerBg} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-cyan-400">
                    🕒 Select from {selectedInterviewer.user?.firstName || "Interviewer"}&apos;s Availability Slots:
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {(selectedInterviewer.availability || []).length} Available Slots
                  </span>
                </div>

                {Array.isArray(selectedInterviewer.availability) && selectedInterviewer.availability.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedInterviewer.availability.map((slot, idx) => {
                      const isSelected = bookingForm.scheduledTime === slot;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setBookingForm({ ...bookingForm, scheduledTime: slot })}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10 font-bold"
                              : isDark
                              ? "bg-[#080E18] border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Clock className={`h-4 w-4 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                            <span className="truncate font-mono text-xs">{slot}</span>
                          </div>
                          {isSelected ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-[#0B151E] font-black shrink-0">
                              Selected ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 shrink-0">Select</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <p className="text-slate-400 text-xs italic">
                      This interviewer has not listed specific fixed slots yet. Type your preferred interview time window below:
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. 05:00 PM - 06:00 PM, 10:00 AM - 11:00 AM"
                      value={bookingForm.scheduledTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Selected Slot Confirmation / Custom Time */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Selected Request Time:</span>
                  <span className="font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                    🕒 {bookingForm.scheduledTime || "Not Selected"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Message / Focus Topics for Interviewer (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please focus on React performance optimization, custom hooks, and DSA tree traversal problems."
                  value={bookingForm.candidateNotes}
                  onChange={(e) => setBookingForm({ ...bookingForm, candidateNotes: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className={`p-3.5 rounded-2xl border text-[11px] text-slate-300 space-y-1 ${innerBg}`}>
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Sparkles className="h-3.5 w-3.5" /> What happens next:
                </div>
                <p>An interview room is reserved and a Brevo email notification is dispatched to the interviewer with your details.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className={`flex-1 rounded-xl border py-2.5 font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] py-2.5 font-extrabold shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {requestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {requestLoading ? "Sending..." : "Submit & Notify Interviewer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ STEP-BY-STEP MULTI-SELECT PRE-INTERVIEW WIZARD ══════════════ */}
      {stepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className={`px-6 py-4 border-b ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">1-to-1 Interview Setup Wizard</h3>
                    <p className="text-xs text-slate-400">Step {currentStep} of 5 • Configure your session preferences</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {recentSessions.length > 0 && currentStep === 1 && (
                    <button
                      type="button"
                      onClick={handleQuickLoadLastSetup}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/20 text-xs font-bold transition-all"
                    >
                      <RotateCcw className="h-3 w-3" /> Quick-Load Last
                    </button>
                  )}
                  <button onClick={() => setStepModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      stepNum === currentStep
                        ? "bg-gradient-to-r from-sky-400 to-cyan-400 shadow-sm"
                        : stepNum < currentStep
                        ? "bg-emerald-400"
                        : isDark
                        ? "bg-white/10"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Step 1 of 5</span>
                      <h4 className="text-lg font-black mt-0.5">Select Target Engineering Role(s)</h4>
                      <p className="text-xs text-slate-400">Choose one or multiple roles you are interviewing or practicing for:</p>
                    </div>
                    {recentSessions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleQuickLoadLastSetup}
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Use Previous Setup
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {ROLE_OPTIONS.map((role) => {
                      const isSelected = selectedRoles.includes(role.id);
                      return (
                        <div
                          key={role.id}
                          onClick={() => toggleSelection(selectedRoles, setSelectedRoles, role.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/10"
                              : isDark
                              ? "border-white/10 bg-[#0B151E] hover:border-white/20"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{role.icon}</span>
                            <div>
                              <p className={`text-xs font-extrabold ${isSelected ? "text-cyan-300" : "text-slate-200"}`}>
                                {role.label}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{role.desc}</p>
                            </div>
                          </div>
                          <div className={`mt-0.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`}>
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Step 2 of 5</span>
                    <h4 className="text-lg font-black mt-0.5">Select Live Coding Language(s)</h4>
                    <p className="text-xs text-slate-400">Choose all languages you want loaded in your live synchronized compiler:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang.id);
                      return (
                        <div
                          key={lang.id}
                          onClick={() => toggleSelection(selectedLanguages, setSelectedLanguages, lang.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/10"
                              : isDark
                              ? "border-white/10 bg-[#0B151E] hover:border-white/20"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{lang.icon}</span>
                            <div>
                              <p className={`text-xs font-extrabold ${isSelected ? "text-cyan-300" : "text-slate-200"}`}>
                                {lang.label}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400">{lang.version}</p>
                            </div>
                          </div>
                          <div className={`mt-0.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`}>
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Step 3 of 5</span>
                    <h4 className="text-lg font-black mt-0.5">Select Technical Topic Focus Area(s)</h4>
                    <p className="text-xs text-slate-400">Choose all domains you wish the 1-to-1 interview session to cover:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {TOPIC_OPTIONS.map((topic) => {
                      const isSelected = selectedTopics.includes(topic.id);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleSelection(selectedTopics, setSelectedTopics, topic.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? "border-purple-400 bg-purple-500/10 shadow-md shadow-purple-500/10"
                              : isDark
                              ? "border-white/10 bg-[#0B151E] hover:border-white/20"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{topic.icon}</span>
                            <div>
                              <p className={`text-xs font-extrabold ${isSelected ? "text-purple-300" : "text-slate-200"}`}>
                                {topic.label}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{topic.desc}</p>
                            </div>
                          </div>
                          <div className={`mt-0.5 ${isSelected ? "text-purple-400" : "text-slate-500"}`}>
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Step 4 of 5</span>
                    <h4 className="text-lg font-black mt-0.5">Select Experience Level & Room ID</h4>
                    <p className="text-xs text-slate-400">Calibrates interview problem complexity and session settings:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERIENCE_OPTIONS.map((exp) => {
                      const isSelected = selectedExperience === exp.id;
                      return (
                        <div
                          key={exp.id}
                          onClick={() => setSelectedExperience(exp.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? "border-sky-400 bg-sky-500/10 shadow-md"
                              : isDark
                              ? "border-white/10 bg-[#0B151E] hover:border-white/20"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 font-mono font-bold text-sky-400">{exp.label}</span>
                            <p className="text-xs font-extrabold text-slate-100 mt-1">{exp.subtitle}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{exp.desc}</p>
                          </div>
                          <div className={`mt-0.5 ${isSelected ? "text-sky-400" : "text-slate-500"}`}>
                            {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${innerBg}`}>
                    <label className="block text-xs font-bold text-slate-300">
                      Room Code / Session ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INT-8924-FLOW (leave empty to auto-generate a fresh room)"
                      value={sessionRoomCode}
                      onChange={(e) => setSessionRoomCode(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none font-medium transition-colors focus:border-cyan-400 ${
                        isDark ? "bg-[#080E18] border-white/10 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Step 5 of 5 • Final Review</span>
                    <h4 className="text-lg font-black mt-0.5">Confirm 1-to-1 Interview Configuration</h4>
                    <p className="text-xs text-slate-400">Review your selected session details and confirm guidelines:</p>
                  </div>

                  <div className={`p-5 rounded-2xl border space-y-3.5 ${innerBg}`}>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Selected Roles ({selectedRoles.length})</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedRoles.map((id) => {
                          const r = ROLE_OPTIONS.find((x) => x.id === id);
                          return (
                            <span key={id} className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1">
                              <span>{r?.icon}</span> {r?.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Coding Languages ({selectedLanguages.length})</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedLanguages.map((id) => {
                          const l = LANGUAGE_OPTIONS.find((x) => x.id === id);
                          return (
                            <span key={id} className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1 font-mono">
                              <span>{l?.icon}</span> {l?.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Topic Focus Areas ({selectedTopics.length})</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedTopics.map((id) => {
                          const t = TOPIC_OPTIONS.find((x) => x.id === id);
                          return (
                            <span key={id} className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1">
                              <span>{t?.icon}</span> {t?.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                      <span className="text-slate-400 font-bold">Experience Level:</span>
                      <span className="font-extrabold text-slate-200">
                        {EXPERIENCE_OPTIONS.find((e) => e.id === selectedExperience)?.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2.5 ${innerBg}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cameraConsent}
                        onChange={(e) => setCameraConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-300 font-medium text-xs leading-tight">
                        I confirm my camera, microphone, and internet connection are active and tested.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rulesConsent}
                        onChange={(e) => setRulesConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-300 font-medium text-xs leading-tight">
                        I agree to the live anti-cheat code monitoring and tab-switch policy.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchSession}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-lg hover:brightness-110 flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Launch 1-to-1 Interview Room
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
