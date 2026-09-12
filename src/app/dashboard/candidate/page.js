"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  User, CheckCircle2, XCircle, AlertCircle, Loader2,
  Briefcase, MapPin, Clock, FileText, Code2, ArrowUpRight,
  Check, RefreshCw, ShieldCheck, ShieldAlert, ChevronRight,
  Sparkles, Terminal, Video, BookOpen, Lightbulb, Play,
  HelpCircle, Laptop, Mic, CheckCircle, ArrowRight, Lock,
  Home, Rocket, Star, Award, Zap, Compass, Layers, X, Settings, LayoutDashboard,
  Radio, CheckSquare, Square, ChevronLeft, History, RotateCcw, Trash2,
  Users, Calendar, Send, MessageSquare, Search, Filter, Menu, LogOut, FileCode, Bug,
  AlertTriangle, Building2, Bot, Trophy, BarChart2, Bookmark, Target
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import DashboardHeader from "../_components/DashboardHeader";
import ProblemSolvingTab from "@/components/ProblemSolvingTab/page";
import DsaProfileTab from "@/components/DsaProfileTab/page";
import ReportBugTab from "@/components/ReportBugTab/page";
import LoginSessionsTab from "@/components/LoginSessionsTab/page";
import CandidateJobsTab from "./_components/CandidateJobsTab";
import { api } from "@/api";

/**
 * Determine the exact live meeting status based on scheduled time slot and completion state
 */
export function getMeetingLinkStatus(req) {
  if (!req || req.status !== "accepted") {
    return { state: "INACTIVE", label: "Pending Acceptance", isJoinable: false };
  }

  if (req.status === "completed") {
    return { state: "COMPLETED", label: "Session Completed", isJoinable: false };
  }

  const now = new Date();
  let start = req.slotStartTime ? new Date(req.slotStartTime) : null;
  let end = req.slotEndTime ? new Date(req.slotEndTime) : null;

  // Fallback: parse from scheduledDate + scheduledTime if explicit datetime is missing
  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    const dStr = req.scheduledDate || now.toISOString().split("T")[0];
    const tStr = req.scheduledTime || "";
    if (!tStr || tStr.toLowerCase().includes("immediate") || tStr.toLowerCase().includes("now")) {
      return { state: "ACTIVE", label: "Live Meeting Active", isJoinable: true };
    }
    const parts = tStr.split(/-|to/i).map((s) => s.trim());
    const parseTimePart = (s) => {
      const isPM = /pm/i.test(s);
      const isAM = /am/i.test(s);
      const clean = s.replace(/[^\d:]/g, "");
      const [hRaw, mRaw] = clean.split(":");
      let h = parseInt(hRaw || "0", 10);
      let m = parseInt(mRaw || "0", 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return { h, m };
    };
    if (parts.length >= 1) {
      const p0 = parseTimePart(parts[0]);
      start = new Date(`${dStr}T${String(p0.h).padStart(2, "0")}:${String(p0.m).padStart(2, "0")}:00`);
      if (parts.length > 1) {
        const p1 = parseTimePart(parts[1]);
        end = new Date(`${dStr}T${String(p1.h).padStart(2, "0")}:${String(p1.m).padStart(2, "0")}:00`);
      } else {
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }
    }
  }

  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
    // 5-minute buffer before start
    const bufferStart = new Date(start.getTime() - 5 * 60 * 1000);

    if (now < bufferStart) {
      const timeRemainingMs = start.getTime() - now.getTime();
      const minsRemaining = Math.ceil(timeRemainingMs / (1000 * 60));
      return {
        state: "UPCOMING",
        label: `Unlocks at ${req.scheduledTime || start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${minsRemaining}m remaining)`,
        isJoinable: false,
        startTime: start,
      };
    }

    if (now >= bufferStart && now <= end) {
      return {
        state: "ACTIVE",
        label: "Live Meeting Active",
        isJoinable: true,
        endTime: end,
      };
    }

    if (now > end) {
      return {
        state: "EXPIRED_UNCOMPLETED",
        label: "Time slot completed • Session not marked complete",
        isJoinable: false,
        endTime: end,
      };
    }
  }

  return { state: "ACTIVE", label: "Live Meeting Active", isJoinable: true };
}

const CodeEditorWithRunner = dynamic(
  () => import("@/components/CodeEditorWithRunner/page"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Loading FlowCode Editor...</span>
      </div>
    ),
  }
);

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
  { id: "javascript", label: "JavaScript",        icon: "🟨", version: "ES2024 / Node 20" },
  { id: "typescript", label: "TypeScript",        icon: "🔷", version: "TS 5.4" },
  { id: "python",     label: "Python",            icon: "🐍", version: "Python 3.12" },
  { id: "java",       label: "Java",              icon: "☕", version: "OpenJDK 21" },
  { id: "cpp",        label: "C++",               icon: "⚡", version: "GCC 13 / C++23" },
  { id: "csharp",     label: "C# (.NET Core)",    icon: "💜", version: ".NET 8.0" },
  { id: "go",         label: "Go (Golang)",       icon: "🔵", version: "Go 1.22" },
  { id: "rust",       label: "Rust",              icon: "🦀", version: "Rust 1.77" },
  { id: "php",        label: "PHP",               icon: "🐘", version: "PHP 8.3" },
  { id: "ruby",       label: "Ruby",              icon: "💎", version: "Ruby 3.3" },
  { id: "swift",      label: "Swift (iOS)",       icon: "🍊", version: "Swift 5.10" },
  { id: "kotlin",     label: "Kotlin (Android)",  icon: "🎯", version: "Kotlin 1.9" },
  { id: "dart",       label: "Dart (Flutter)",    icon: "🎯", version: "Dart 3.3" },
  { id: "sql",        label: "SQL",               icon: "🗄️", version: "MySQL 8.0 / Postgres" },
  { id: "scala",      label: "Scala",             icon: "🔴", version: "Scala 3.4" },
  { id: "r",          label: "R Language",        icon: "📊", version: "R 4.3" },
  { id: "elixir",     label: "Elixir",            icon: "💧", version: "Elixir 1.16" },
  { id: "haskell",    label: "Haskell",           icon: "🔮", version: "GHC 9.6" },
  { id: "bash",       label: "Bash / Shell",      icon: "🐚", version: "GNU Bash 5.2" },
  { id: "perl",       label: "Perl",              icon: "🐪", version: "Perl 5.38" },
  { id: "lua",        label: "Lua",               icon: "🌙", version: "Lua 5.4" },
  { id: "asm",        label: "Assembly (x86_64)", icon: "⚙️", version: "NASM 2.16" },
  { id: "clojure",    label: "Clojure",           icon: "🌀", version: "Clojure 1.11" },
  { id: "erlang",     label: "Erlang",            icon: "🔴", version: "OTP 26" },
  { id: "julia",      label: "Julia",             icon: "🔬", version: "Julia 1.10" },
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
    id: "requests",
    title: "My Requests & Google Meet Sessions",
    subtitle: "Real-time Status & Live Meet Links",
    desc: "Track direct and broadcast requests. As soon as an interviewer accepts, your dedicated Google Meet call is active.",
    icon: Video,
    tag: "Google Meet",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    border: "border-emerald-500/40 hover:border-emerald-400",
    btnColor: "bg-emerald-500 hover:bg-emerald-400 text-black",
    btnText: "View My Requests & Meets",
  },
];

const QUICK_FEATURES = [
  {
    title: "Google Meet Video Sync",
    desc: "Instant HD Google Meet link allocation upon interviewer acceptance.",
    icon: Video,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Verified Interviewer Pool",
    desc: "Connect directly with senior engineering leaders from top tier tech companies.",
    icon: Users,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "AI ATS Resume Scoring",
    desc: "Check your uploaded PDF resume against tech company keywords & ATS filters.",
    icon: FileText,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Dual Request Modes",
    desc: "Send targeted direct requests or broadcast open invitations to all matching interviewers.",
    icon: Zap,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
];

const MENTORSHIP_TRACKS = [
  {
    id: "career-roadmap",
    title: "Career Roadmap & Tech Transition",
    icon: Rocket,
    tag: "Career Growth",
    color: "from-sky-500 to-blue-600",
    desc: "1-on-1 personalized engineering career guidance. Discuss switching stacks (e.g. SDE 1 -> SDE 2, Frontend -> Full Stack / AI), salary negotiation, and company targeting.",
    deliverables: ["Tailored 6-Month Learning Roadmap", "Skill Gap & Architecture Plan", "Company Targeting Strategy"],
    defaultTopic: "Career Transition & Growth Roadmap",
  },
  {
    id: "resume-review",
    title: "ATS Resume & Portfolio Deep-Dive",
    icon: FileText,
    tag: "High Impact",
    color: "from-purple-500 to-indigo-600",
    desc: "Line-by-line review of your resume and GitHub projects with Senior Engineers. Learn how to highlight technical impact and pass tier-1 ATS filters.",
    deliverables: ["Actionable Resume Edits", "Project Architecture Breakdown", "Bullet Point Optimization (X-Y-Z formula)"],
    defaultTopic: "Resume & Portfolio Project Review",
  },
  {
    id: "system-design",
    title: "System Design & Architecture Mastery",
    icon: Layers,
    tag: "Engineering Lead",
    color: "from-amber-500 to-orange-600",
    desc: "Interactive system design coaching. Walk through microservices, distributed caching, database sharding, and real-world architectures with Principal Leads.",
    deliverables: ["Live Whiteboard System Blueprint", "Scalability & Bottleneck Analysis", "Trade-off Evaluation Techniques"],
    defaultTopic: "High-Level System Design Mentorship",
  },
  {
    id: "dsa-patterns",
    title: "DSA & Problem Solving Strategy",
    icon: Code2,
    tag: "Coding Round",
    color: "from-emerald-500 to-teal-600",
    desc: "Master algorithm patterns (DP, Graphs, Trees, Sliding Window). Learn how to think out loud and structure optimal solutions under time pressure.",
    deliverables: ["Pattern Recognition Framework", "Time & Space Complexity Coaching", "Live Mock Problem Walkthrough"],
    defaultTopic: "DSA Algorithm & Problem Solving Strategy",
  },
  {
    id: "leadership-star",
    title: "Behavioral & Leadership STAR Coaching",
    icon: Lightbulb,
    tag: "FAANG / Tier 1",
    color: "from-pink-500 to-rose-600",
    desc: "Master behavioral rounds with the STAR method. Craft compelling stories around conflict resolution, cross-functional leadership, and technical failures.",
    deliverables: ["STAR Story Bank Review", "Executive Presence & Communication", "Red Flag Identification & Polish"],
    defaultTopic: "Behavioral & STAR Leadership Mentorship",
  },
];

const SIDEBAR_ITEMS = [
  { id: "home",         label: "Dashboard",             icon: LayoutDashboard, badge: null },
  { id: "ai-interview", label: "AI Interview",          icon: Bot,             badge: null },
  { id: "interviewers", label: "1:1 Mock Interview",    icon: Users,           badge: "matchCount" },
  { id: "flowcode",     label: "Coding Practice",       icon: Terminal,        badge: null },
  { id: "problems",     label: "Problems",              icon: CheckSquare,     badge: null },
  { id: "contests",     label: "Contests",              icon: Trophy,          badge: null },
  { id: "guidance",     label: "Interview Roadmap",     icon: MapPin,          badge: null },
  { id: "resume-review",label: "Resume Review",         icon: FileText,        badge: null },
  { id: "analytics",    label: "Analytics",             icon: BarChart2,       badge: null },
  { id: "bookmarks",    label: "Bookmarks",             icon: Bookmark,        badge: null },
  { id: "requests",     label: "History",               icon: History,         badge: "requestCount" },
  { id: "readiness",    label: "Settings",              icon: Settings,        badge: "pct" },
];

const TABS = SIDEBAR_ITEMS;

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM RICH ILLUSTRATIONS MATCHING REFERENCE SCREENSHOT
   ═══════════════════════════════════════════════════════════════════════ */

const RobotAvatarIllustration = () => (
  <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="52" r="34" fill="#0F1F38" stroke="#38BDF8" strokeWidth="2.5" />
    <path d="M50 14V22" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="12" r="4" fill="#6366F1" />
    <rect x="22" y="32" width="56" height="38" rx="16" fill="#1E293B" stroke="#60A5FA" strokeWidth="2.5" />
    <rect x="28" y="38" width="44" height="26" rx="10" fill="#0B132B" />
    <circle cx="39" cy="51" r="5" fill="#38BDF8" />
    <circle cx="61" cy="51" r="5" fill="#38BDF8" />
    <circle cx="41" cy="49" r="1.5" fill="#FFFFFF" />
    <circle cx="63" cy="49" r="1.5" fill="#FFFFFF" />
    <path d="M44 58C46 60 54 60 56 58" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    <rect x="15" y="44" width="7" height="14" rx="3.5" fill="#3B82F6" />
    <rect x="78" y="44" width="7" height="14" rx="3.5" fill="#3B82F6" />
    <path d="M30 76C30 76 38 84 50 84C62 84 70 76 70 76" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ExpertMockIllustration = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="36" y="10" width="36" height="30" rx="6" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
    <rect x="36" y="10" width="36" height="8" rx="6" fill="#6366F1" />
    <rect x="42" y="24" width="6" height="4" rx="1" fill="#CBD5E1" />
    <rect x="52" y="24" width="6" height="4" rx="1" fill="#CBD5E1" />
    <rect x="62" y="24" width="6" height="4" rx="1" fill="#6366F1" />
    <rect x="42" y="31" width="6" height="4" rx="1" fill="#CBD5E1" />
    <rect x="52" y="31" width="6" height="4" rx="1" fill="#22C55E" />
    {/* Interviewer & Candidate Avatars */}
    <circle cx="24" cy="38" r="10" fill="#FBBF24" />
    <path d="M12 60C12 52 18 48 24 48C30 48 36 52 36 60" fill="#3B82F6" />
    <circle cx="56" cy="48" r="9" fill="#F472B6" />
    <path d="M44 68C44 61 50 57 56 57C62 57 68 61 68 68" fill="#8B5CF6" />
  </svg>
);

const CodingPuzzleIllustration = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="12" width="46" height="34" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
    <circle cx="17" cy="18" r="2" fill="#EF4444" />
    <circle cx="23" cy="18" r="2" fill="#F59E0B" />
    <circle cx="29" cy="18" r="2" fill="#10B981" />
    <path d="M18 28L24 33L18 38" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 38H36" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
    {/* Puzzle Piece */}
    <rect x="36" y="34" width="34" height="34" rx="8" fill="#6366F1" stroke="#818CF8" strokeWidth="2" />
    <circle cx="53" cy="34" r="5" fill="#6366F1" />
    <circle cx="70" cy="51" r="5" fill="#818CF8" />
    <path d="M45 47L51 52L45 57M56 52H63" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SystemDesignDiagramIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="4" width="12" height="9" rx="2.5" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
    <path d="M24 13V22M12 22H36M12 22V28M36 22V28" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <rect x="6" y="28" width="12" height="9" rx="2.5" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
    <rect x="30" y="28" width="12" height="9" rx="2.5" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
  </svg>
);

const DynamicProgrammingIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="36" height="36" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <rect x="10" y="10" width="12" height="12" rx="3" fill="#3B82F6" />
    <text x="12" y="19" fill="white" fontSize="8" fontWeight="900" fontFamily="sans-serif">&lt;&gt;</text>
    <rect x="26" y="10" width="12" height="12" rx="3" fill="#6366F1" />
    <text x="28" y="19" fill="white" fontSize="8" fontWeight="900" fontFamily="sans-serif">JS</text>
    <rect x="10" y="26" width="12" height="12" rx="3" fill="#EC4899" />
    <text x="12" y="35" fill="white" fontSize="8" fontWeight="900" fontFamily="sans-serif">DP</text>
    <rect x="26" y="26" width="12" height="12" rx="3" fill="#10B981" />
    <text x="28" y="35" fill="white" fontSize="8" fontWeight="900" fontFamily="sans-serif">O(n)</text>
  </svg>
);

const BehavioralInterviewIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="18" r="6" fill="#3B82F6" />
    <path d="M6 36C6 30 10 27 14 27C18 27 22 30 22 36" fill="#60A5FA" />
    <circle cx="34" cy="18" r="6" fill="#8B5CF6" />
    <path d="M26 36C26 30 30 27 34 27C38 27 42 30 42 36" fill="#A78BFA" />
    <rect x="18" y="8" width="12" height="9" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
    <path d="M22 13H26" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function CandidateDashboard() {
  const router    = useRouter();
  const { isDark } = useTheme();

  const [user, setUser]                 = useState(null);
  const [token, setToken]               = useState(null);
  const [activeTab, setActiveTab]       = useState("home");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile]           = useState(null);
  const [readiness, setReadiness]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [dashboardSearch, setDashboardSearch] = useState("");

  // Smooth drag-to-resize sidebar handlers
  const handleMouseDownResize = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(460, Math.max(180, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

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
  const [requestStatusFilter, setRequestStatusFilter]   = useState("all");
  const [requestSearchQuery, setRequestSearchQuery]     = useState("");
  const [requestLoading, setRequestLoading]             = useState(false);
  const [bookingModalOpen, setBookingModalOpen]         = useState(false);
  const [reassignModal, setReassignModal]               = useState(null);
  const [actionLoading, setActionLoading]               = useState(null);
  const [selectedInterviewer, setSelectedInterviewer]   = useState(null);
  const [bookingMode, setBookingMode]                   = useState("direct"); // "direct" | "open"
  const [bookingForm, setBookingForm]                   = useState({
    roleRequirement: "Frontend Developer (React / Next.js)",
    language: "JavaScript",
    topicFocus: ["DSA", "System Design"],
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "Today 6:00 PM",
    candidateNotes: "",
  });

  // Link renewal modal states
  const [requestLinkModalOpen, setRequestLinkModalOpen] = useState(false);
  const [requestLinkTarget, setRequestLinkTarget]       = useState(null);
  const [requestLinkReason, setRequestLinkReason]       = useState("");
  const [requestLinkLoading, setRequestLinkLoading]     = useState(false);

  // Interview Feedback inspection state
  const [candidateFeedbackModal, setCandidateFeedbackModal] = useState(null);
  const [feedbackLoading, setFeedbackLoading]               = useState(false);

  const handleOpenFeedbackView = async (requestId) => {
    try {
      setFeedbackLoading(true);
      const res = await api.get(`/interview-requests/${requestId}/feedback`);
      if (res.data?.success && res.data?.data) {
        setCandidateFeedbackModal(res.data.data);
      } else {
        showToast("error", "Interview evaluation feedback is not available yet.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to load interview feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const openRequestLinkModal = (req) => {
    setRequestLinkTarget(req);
    setRequestLinkReason("");
    setRequestLinkModalOpen(true);
  };

  const handleRequestNewLink = async (e) => {
    if (e) e.preventDefault();
    if (!requestLinkTarget) return;

    try {
      setRequestLinkLoading(true);
      const res = await api.post(`/interview-requests/${requestLinkTarget.requestId}/request-new-link`, {
        reason: requestLinkReason || "Time slot window ended before completion. Requesting an updated meeting link.",
      });
      const data = res.data;
      if (data.success) {
        showToast("success", "🔔 Meeting link renewal request sent to interviewer! You will be notified once reviewed.");
        setRequestLinkModalOpen(false);
        fetchMyRequestsData();
      } else {
        showToast("error", data.message || "Failed to submit link request.");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || err.message || "Error requesting new link.");
    } finally {
      setRequestLinkLoading(false);
    }
  };

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
    fetchData(t, parsed.userId);

    const savedRecents = localStorage.getItem("interviewflow_recent_sessions");
    if (savedRecents) {
      try {
        setRecentSessions(JSON.parse(savedRecents));
      } catch {}
    }
  }, [router]);

  const fetchData = async (overrideToken, userIdParam) => {
    setLoading(true);
    try {
      const [profileRes, statusRes] = await Promise.all([
        api.get("/candidate/me").catch(() => ({ data: { success: false } })),
        api.get("/candidate/me/profile-status").catch(() => ({ data: { success: false } })),
      ]);

      const profileJson = profileRes.data;
      const statusJson  = statusRes.data;

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

      fetchInterviewersData(null, null, userIdParam);
      fetchMyRequestsData();

      api.get("/jobs/candidate/connections")
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setConnectionsCount(res.data.data.length);
          }
        })
        .catch(() => {});
    } catch {
      showToast("error", "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewersData = async (roleParam, searchParam, candidateId) => {
    try {
      const queryParams = new URLSearchParams();
      if (roleParam || filterRole) queryParams.append("role", roleParam || filterRole);
      if (filterLanguage) queryParams.append("language", filterLanguage);
      if (searchParam || interviewerSearch) queryParams.append("search", searchParam || interviewerSearch);
      
      const cId = candidateId || user?.userId;
      if (cId) queryParams.append("candidateUserId", cId);

      const res = await api.get(`/interview-requests/matching-interviewers?${queryParams.toString()}`);
      const json = res.data;
      if (json.success && Array.isArray(json.data)) {
        const approvedOnly = json.data.filter((inv) => inv.isVerified === true || inv.isVerified === 1 || inv.isVerified === "1");
        setMatchingInterviewers(approvedOnly);
      } else {
        setMatchingInterviewers([]);
      }
    } catch {
      setMatchingInterviewers([]);
    }
  };

  const fetchMyRequestsData = async () => {
    try {
      const res = await api.get("/interview-requests/my-requests");
      const json = res.data;
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

  // Open booking modal for a specific mentor / interviewer (Direct 1:1 Request)
  const openBookingModal = (inv, customTrack) => {
    if (!isReady) {
      showToast("error", "Please complete your profile (100%) before requesting 1:1 mentorship.");
      setActiveTab("readiness");
      return;
    }
    setSelectedInterviewer(inv || null);
    setBookingMode(inv ? "direct" : "open");
    setBookingForm({
      roleRequirement: profile?.currentRole || ROLE_OPTIONS[0].label,
      language: "JavaScript",
      topicFocus: customTrack ? [customTrack] : ["1:1 Mentorship", "Career Growth"],
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: inv?.availability?.[0] || "Today 6:00 PM",
      candidateNotes: customTrack ? `🎯 1:1 Mentorship Focus: ${customTrack}` : "",
    });
    setBookingModalOpen(true);
  };

  // Open broadcast modal for all matching mentors (Open Pool Request)
  const openBroadcastModal = (customTrack) => {
    if (!isReady) {
      showToast("error", "Please complete your profile (100%) before requesting 1:1 mentorship.");
      setActiveTab("readiness");
      return;
    }
    setSelectedInterviewer(null);
    setBookingMode("open");
    setBookingForm({
      roleRequirement: filterRole || profile?.currentRole || ROLE_OPTIONS[0].label,
      language: filterLanguage || "JavaScript",
      topicFocus: customTrack ? [customTrack] : ["1:1 Mentorship", "Career Growth"],
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "Flexible / Today 6:00 PM",
      candidateNotes: customTrack ? `🎯 1:1 Mentorship Focus: ${customTrack}` : "",
    });
    setBookingModalOpen(true);
  };

  // Submit interview request (Direct or Open Broadcast)
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    try {
      setRequestLoading(true);
      const generatedRoom = `INT-${Math.floor(1000 + Math.random() * 9000)}-FLOW`;

      const isDirect = bookingMode === "direct";
      const payload = {
        requestType: bookingMode,
        interviewerUserId: isDirect ? (selectedInterviewer?.user?.userId || selectedInterviewer?.userId) : null,
        roleRequirement: bookingForm.roleRequirement,
        language: bookingForm.language,
        topicFocus: bookingForm.topicFocus,
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        roomCode: generatedRoom,
        candidateNotes: bookingForm.candidateNotes,
      };

      const res = await api.post("/interview-requests", payload);
      const json = res.data;

      if (json.success) {
        const msg = isDirect
          ? `Direct interview request submitted! Room: ${generatedRoom}. Interviewer notified via email.`
          : `Open interview request broadcasted! It is now visible on matching interviewers' dashboards.`;
        showToast("success", msg);
        setBookingModalOpen(false);
        fetchMyRequestsData();
      } else {
        showToast("error", json.message || "Failed to submit interview request.");
      }
    } catch {
      showToast("error", "Network error submitting interview request.");
    } finally {
      setRequestLoading(false);
    }
  };

  // Re-route a dropped/declined request to Open Pool
  const handleRerouteToOpenPool = async (requestId) => {
    setActionLoading(requestId);
    try {
      const res = await api.put(`/interview-requests/${requestId}/reroute`);
      const data = res.data;
      if (data.success) {
        showToast("success", "⚡ Request re-routed to Open Matching Pool! Available interviewers notified.");
        fetchMyRequestsData();
      } else {
        showToast("error", data.message || "Failed to re-route request.");
      }
    } catch (err) {
      showToast("error", err.message || "Failed to re-route request.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reassign a dropped request to a new chosen interviewer
  const handleReassignInterviewer = async (requestId, newInterviewerUserId) => {
    setActionLoading(requestId);
    try {
      const res = await api.put(`/interview-requests/${requestId}/reassign`, { newInterviewerUserId });
      const data = res.data;
      if (data.success) {
        showToast("success", "🎯 Request successfully reassigned to chosen interviewer!");
        setReassignModal(null);
        fetchMyRequestsData(token);
      } else {
        showToast("error", data.message || "Failed to reassign request.");
      }
    } catch (err) {
      showToast("error", err.message || "Failed to reassign request.");
    } finally {
      setActionLoading(null);
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
    <ProtectedRoute allowedRoles={["candidate"]}>
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

        {/* ══════════════════ CANDIDATE SIDEBAR (RESIZABLE) ══════════════════ */}
        <aside
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : undefined }}
          className={`h-full flex-shrink-0 flex flex-col border-r relative group select-none ${
            isResizing ? "transition-none" : "transition-all duration-200"
          } ${sideBg} ${
            sidebarOpen ? "" : "w-18 sm:w-20"
          } hidden md:flex overflow-hidden`}
        >

          {/* Sidebar Top Header & Collapse Button */}
          <div className={`flex-shrink-0 flex items-center justify-between px-4 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-black text-xs text-white shadow-md shadow-indigo-500/25">
                  IF
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  Interview Flow
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
                      ? "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-extrabold shadow-lg shadow-indigo-500/25"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                  {sidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {sidebarOpen && item.id === "connections" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : "bg-purple-500/20 text-purple-300"
                    }`}>
                      {connectionsCount}
                    </span>
                  )}
                  {sidebarOpen && item.id === "readiness" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : isReady ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {pct}%
                    </span>
                  )}
                  {sidebarOpen && item.id === "interviewers" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {matchingInterviewers.length}
                    </span>
                  )}
                  {sidebarOpen && item.id === "requests" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {myRequests.length}
                    </span>
                  )}
                  {sidebarOpen && item.id === "problems" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : "bg-teal-500/20 text-teal-400"
                    }`}>
                      6
                    </span>
                  )}
                  {sidebarOpen && item.id === "sessions" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? "bg-[#0B151E]/20 text-[#0B151E]" : "bg-purple-500/20 text-purple-400"
                    }`}>
                      {recentSessions.length}
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

          {/* Interactive Drag-to-Resize Handle */}
          {sidebarOpen && (
            <div
              onMouseDown={handleMouseDownResize}
              onDoubleClick={() => setSidebarWidth(260)}
              title="Drag to resize sidebar width • Double click to reset"
              className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-cyan-400/80 active:bg-cyan-400 transition-colors z-30 group-hover:bg-cyan-400/20 flex items-center justify-center"
            >
              <div className="w-0.5 h-8 rounded-full bg-slate-500/40 group-hover:bg-cyan-400 transition-colors" />
            </div>
          )}
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

          {/* Top Bar Header matching reference UI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {activeTab === "home" ? "Dashboard" : TABS.find((t) => t.id === activeTab)?.label || "Workspace"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Pill Search Input */}
              <div className="relative min-w-[260px] sm:min-w-[320px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={dashboardSearch}
                  onChange={(e) => setDashboardSearch(e.target.value)}
                  placeholder="Search problems, topics, interviews..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm transition-all"
                />
              </div>

              {/* User profile avatar & name */}
              <div
                onClick={() => router.push("/profile")}
                className="flex flex-col items-center cursor-pointer group"
                title="View Profile"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                  <div className="h-full w-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center font-black text-sm text-white">
                    {profile?.profilePicture ? (
                      <img src={profile.profilePicture} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      (user.firstName || user.username || "V")[0].toUpperCase()
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-400 transition-colors mt-0.5">
                  {user.firstName || user.username || "Vikas"}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <>
              {/* ══════════════ TAB 1: CANDIDATE DASHBOARD (EXACT SCREENSHOT UI) ══════════════ */}
              {activeTab === "home" && (
                <div className="space-y-7">

                  {/* Welcome Greeting */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Welcome back, {user.firstName || user.username || "Vikas"} <span className="animate-bounce">👋</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Your journey to your dream job continues. Choose your next step.
                    </p>
                  </div>

                  {/* 3 Top Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Adaptive AI Interview (Dark Card) */}
                    <div className="rounded-3xl p-6 bg-[#0C1E3A] border border-blue-900/50 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/10 text-cyan-300 border border-white/10 backdrop-blur-sm">
                            AI POWERED
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div className="max-w-[180px] sm:max-w-[200px]">
                            <h3 className="text-lg font-black text-white leading-tight">
                              Adaptive AI Interview
                            </h3>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                              Practice with an adaptive AI Interviewer and receive real-time feedback.
                            </p>
                          </div>
                          <div className="shrink-0 -mt-2 -mr-1">
                            <RobotAvatarIllustration />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => openStepWizard()}
                          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                        >
                          <span>Start Interview</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card 2: 1:1 Expert Mock Interviews (White Card) */}
                    <div className="rounded-3xl p-6 bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden transition-all">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="max-w-[180px] sm:max-w-[200px]">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                              1:1 Expert Mock<br />Interviews
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                              Book an industry expert experienced consultations.
                            </p>
                          </div>
                          <div className="shrink-0 -mr-1">
                            <ExpertMockIllustration />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => setActiveTab("interviewers")}
                          className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-extrabold text-xs flex items-center gap-1.5 transition-all hover:scale-105"
                        >
                          <span>Book Now</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Coding & Problem Solving (White Card) */}
                    <div className="rounded-3xl p-6 bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden transition-all">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="max-w-[180px] sm:max-w-[200px]">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                              Coding &<br />Problem Solving
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                              Book an industry solving problems and track progress.
                            </p>
                          </div>
                          <div className="shrink-0 -mr-1">
                            <CodingPuzzleIllustration />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => setActiveTab("flowcode")}
                          className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-extrabold text-xs flex items-center gap-1.5 transition-all hover:scale-105"
                        >
                          <span>Start Coding</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Your Progress Section */}
                  <div className="space-y-3.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Your Progress
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Stat 1: Interviews Taken */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                          <BarChart2 className="h-4 w-4 text-indigo-500" />
                          <span>Interviews Taken</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          {recentSessions.length > 0 ? recentSessions.length : 24}
                        </div>
                        <p className="text-[11px] font-bold text-emerald-500">
                          +12% from last week
                        </p>
                      </div>

                      {/* Stat 2: Problems Solved */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                          <span>Problems Solved</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          128
                        </div>
                        <p className="text-[11px] font-bold text-emerald-500">
                          +18% from last week
                        </p>
                      </div>

                      {/* Stat 3: Accuracy */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span>Accuracy</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          78%
                        </div>
                        <p className="text-[11px] font-bold text-emerald-500">
                          +9% from last week
                        </p>
                      </div>

                      {/* Stat 4: Contests */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span>Contests</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          6
                        </div>
                        <p className="text-[11px] font-bold text-emerald-500">
                          +2 from last week
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended for You Section */}
                  <div className="space-y-3.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Recommended for You
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Topic 1: System Design */}
                      <div
                        onClick={() => {
                          setStepData(prev => ({ ...prev, topic: "system" }));
                          openStepWizard();
                        }}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5 group"
                      >
                        <div className="shrink-0 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                          <SystemDesignDiagramIcon />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                            System Design
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Build scalable systems.
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            12 Modules
                          </span>
                        </div>
                      </div>

                      {/* Topic 2: Dynamic Programming */}
                      <div
                        onClick={() => setActiveTab("problems")}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5 group"
                      >
                        <div className="shrink-0 p-2 rounded-xl bg-slate-900 dark:bg-slate-950">
                          <DynamicProgrammingIcon />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                            Dynamic Programming
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Optimize recursive solutions.
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            18 Problems
                          </span>
                        </div>
                      </div>

                      {/* Topic 3: Behavioral Interview */}
                      <div
                        onClick={() => {
                          setStepData(prev => ({ ...prev, topic: "hr" }));
                          openStepWizard();
                        }}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5 group"
                      >
                        <div className="shrink-0 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                          <BehavioralInterviewIcon />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                            Behavioral Interview
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Excel at personal stories.
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            10 Questions
                          </span>
                        </div>
                      </div>

                      {/* Topic 4: Explore All Topics */}
                      <div
                        onClick={() => setActiveTab("guidance")}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A2C] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-indigo-400/50 cursor-pointer transition-all flex items-center justify-center text-center group min-h-[76px]"
                      >
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                          Explore All Topics
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════ TAB 2: MATCHING INTERVIEWERS & REQUESTS ══════════════ */}
              {activeTab === "interviewers" && (
                <div className="space-y-6">

                  {/* ── TWO REQUEST OPTIONS BANNER ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Direct Request Card */}
                    <div className={`p-5 rounded-3xl border ${cardBg} border-cyan-500/30 flex flex-col justify-between space-y-3 relative overflow-hidden`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Option 1</span>
                          <h3 className="text-sm font-extrabold text-white">Direct Interviewer Request</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Pick any verified interviewer from the list below and book directly into their availability calendar.
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 pt-1">
                        <span>👇 Select an interviewer below to book direct slot</span>
                      </div>
                    </div>

                    {/* Option 2: Broadcast Open Request Card */}
                    <div className={`p-5 rounded-3xl border ${cardBg} border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-transparent flex flex-col justify-between space-y-3 relative overflow-hidden`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-300 border border-teal-500/20 shrink-0">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">Option 2</span>
                          <h3 className="text-sm font-extrabold text-white">Broadcast to Matching Interviewers</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Send an open request to all verified interviewers matching your target role. The first available expert to accept will conduct your interview.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openBroadcastModal}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 text-[#0B151E] font-black text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                      >
                        <Zap className="h-3.5 w-3.5 fill-current" /> Broadcast Open Request to Matching Pool
                      </button>
                    </div>
                  </div>

                  {/* Filter & Requirement Bar */}
                  <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <h2 className="text-base font-extrabold flex items-center gap-2 text-cyan-400">
                          <Users className="h-5 w-5" /> Matching Verified Interviewers
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Filter by target role, language, and skills to find the perfect technical interviewer</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {matchingInterviewers.length} Interviewers Available
                        </span>
                      </div>
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
                                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 flex items-center gap-1 shadow-sm">
                                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                  {inv.matchScore || 90}% Skill Match
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

                              {/* Matched Skills with Candidate */}
                              {Array.isArray(inv.matchedSkills) && inv.matchedSkills.length > 0 && (
                                <div className="space-y-1 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                  <span className="text-[10px] uppercase font-extrabold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Matches Your Skills ({inv.matchedSkills.length})
                                  </span>
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {inv.matchedSkills.map((ms, idx) => (
                                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                                        {ms}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

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
                  {/* Summary of submitted requests */}
                  {myRequests.length > 0 && (
                    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="text-sm font-extrabold flex items-center gap-2 text-cyan-400">
                          <MessageSquare className="h-4 w-4" /> My Submitted Interview Requests
                        </h3>
                        <button
                          onClick={() => setActiveTab("requests")}
                          className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1"
                        >
                          View Full Requests Tab ({myRequests.length}) <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {myRequests.slice(0, 3).map((req) => {
                          const isOpenPool = req.requestType === "open" || !req.interviewerUserId;
                          const assignedInterviewerName = req.interviewerUser?.firstName
                            ? `${req.interviewerUser.firstName} ${req.interviewerUser.lastName || ""}`.trim()
                            : req.interviewerUser?.username || "";

                          return (
                            <div
                              key={req.requestId}
                              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${innerBg}`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-extrabold text-xs text-slate-100">{req.roleRequirement}</h4>

                                  {/* Request Type Badge */}
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    isOpenPool
                                      ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                                      : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                  }`}>
                                    {isOpenPool ? "⚡ Broadcast to Matching Pool" : "🎯 Direct Request"}
                                  </span>

                                  {/* Status Badge */}
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
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
                                  {req.status === "accepted" ? (
                                    <span className="text-emerald-400 font-bold">
                                      ✓ Accepted by {assignedInterviewerName || "Interviewer"}
                                    </span>
                                  ) : isOpenPool ? (
                                    <span className="text-slate-300">
                                      Awaiting first matching interviewer to accept
                                    </span>
                                  ) : (
                                    <span>
                                      Interviewer: <strong className="text-slate-200">{assignedInterviewerName || "Interviewer"}</strong>
                                    </span>
                                  )}{" "}
                                  • Language: <span className="font-mono text-cyan-300">{req.language}</span> • Date: {req.scheduledDate} ({req.scheduledTime})
                                </p>

                                <p className="text-[10px] font-mono text-cyan-400 font-bold">Room Code: {req.roomCode}</p>
                              </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              {req.status === "accepted" && (() => {
                                const linkState = getMeetingLinkStatus(req);
                                if (linkState.state === "UPCOMING") {
                                  return (
                                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                                      <span>{linkState.label}</span>
                                    </div>
                                  );
                                }
                                if (linkState.state === "ACTIVE" && req.meetingLink) {
                                  return (
                                    <a
                                      href={req.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all animate-pulse"
                                    >
                                      <Video className="h-3.5 w-3.5 text-black fill-current" /> Join Google Meet Call
                                    </a>
                                  );
                                }
                                if (linkState.state === "EXPIRED_UNCOMPLETED") {
                                  if (req.newLinkRequested && req.newLinkStatus === "pending") {
                                    return (
                                      <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                                        <span>Renewal Requested</span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <button
                                      onClick={() => openRequestLinkModal(req)}
                                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black hover:brightness-110 flex items-center gap-1.5 shadow-sm"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" /> Request New Link
                                    </button>
                                  );
                                }
                                return null;
                              })()}

                              {req.status === "completed" && (
                                <button
                                  onClick={() => handleOpenFeedbackView(req.requestId)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-black font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all"
                                >
                                  <Star className="h-3.5 w-3.5 fill-current" /> View Evaluation & Ratings
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════ TAB: MY INTERVIEW REQUESTS (ACCEPTED, PENDING, REJECTED) ══════════════ */}
              {activeTab === "requests" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Header Card */}
                  <div className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${cardBg}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <Send className="h-3.5 w-3.5" /> Request Lifecycle & Active Meet Links
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-100">My Interview Requests</h2>
                        <p className="text-xs text-slate-400 max-w-xl">
                          Track your direct 1-to-1 interview requests and broadcast pool sessions. When accepted by an interviewer, your dedicated Google Meet link is immediately activated below.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={openBroadcastModal}
                          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 text-[#0B151E] font-black text-xs shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
                        >
                          <Zap className="h-4 w-4 fill-current" /> Broadcast New Request
                        </button>
                        <button
                          onClick={() => setActiveTab("interviewers")}
                          className="px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Users className="h-4 w-4 text-cyan-400" /> Browse Interviewers
                        </button>
                      </div>
                    </div>

                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/5 mt-6">
                      <div className={`p-3.5 rounded-2xl border ${innerBg}`}>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Total Requests</span>
                        <p className="text-xl font-black text-slate-100">{myRequests.length}</p>
                      </div>

                      <div className={`p-3.5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20`}>
                        <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Accepted (Active Meets)
                        </span>
                        <p className="text-xl font-black text-emerald-300">
                          {myRequests.filter((r) => r.status === "accepted").length}
                        </p>
                      </div>

                      <div className={`p-3.5 rounded-2xl border bg-purple-500/5 border-purple-500/20`}>
                        <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" /> Completed & Rated
                        </span>
                        <p className="text-xl font-black text-purple-300">
                          {myRequests.filter((r) => r.status === "completed").length}
                        </p>
                      </div>

                      <div className={`p-3.5 rounded-2xl border bg-amber-500/5 border-amber-500/20`}>
                        <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending Review
                        </span>
                        <p className="text-xl font-black text-amber-300">
                          {myRequests.filter((r) => r.status === "pending").length}
                        </p>
                      </div>

                      <div className={`p-3.5 rounded-2xl border bg-red-500/5 border-red-500/20`}>
                        <span className="text-[10px] font-bold uppercase text-red-400 block mb-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Declined / Rejected
                        </span>
                        <p className="text-xl font-black text-red-300">
                          {myRequests.filter((r) => r.status === "rejected").length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Filter Tabs & Search Bar */}
                  <div className={`p-4 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBg}`}>
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: "all", label: "All Requests", count: myRequests.length },
                        { id: "accepted", label: "Accepted (Active)", count: myRequests.filter((r) => r.status === "accepted").length },
                        { id: "completed", label: "Completed", count: myRequests.filter((r) => r.status === "completed").length },
                        { id: "pending", label: "Pending", count: myRequests.filter((r) => r.status === "pending").length },
                        { id: "rejected", label: "Rejected", count: myRequests.filter((r) => r.status === "rejected").length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setRequestStatusFilter(tab.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                            requestStatusFilter === tab.id
                              ? tab.id === "accepted"
                                ? "bg-emerald-500 text-black shadow-md"
                                : tab.id === "pending"
                                ? "bg-amber-500 text-black shadow-md"
                                : tab.id === "rejected"
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-cyan-500 text-black shadow-md"
                              : isDark
                              ? "text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                              : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">{tab.count}</span>
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search role, language, room code..."
                        value={requestSearchQuery}
                        onChange={(e) => setRequestSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-[#0B151E] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Requests Cards List */}
                  {(() => {
                    const filtered = myRequests.filter((req) => {
                      const byStatus = requestStatusFilter === "all" ? true : req.status === requestStatusFilter;
                      const q = requestSearchQuery.toLowerCase();
                      const interName = req.interviewerUser?.firstName
                        ? `${req.interviewerUser.firstName} ${req.interviewerUser.lastName || ""}`.toLowerCase()
                        : "";
                      const matchesSearch =
                        (req.roleRequirement && req.roleRequirement.toLowerCase().includes(q)) ||
                        (req.language && req.language.toLowerCase().includes(q)) ||
                        (req.roomCode && req.roomCode.toLowerCase().includes(q)) ||
                        interName.includes(q);
                      return byStatus && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className={`p-16 text-center rounded-3xl border ${cardBg} space-y-4`}>
                          <MessageSquare className="h-10 w-10 text-slate-500 mx-auto" />
                          <h4 className="text-base font-extrabold text-slate-200">No Requests Found</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {requestStatusFilter === "all"
                              ? "You haven't submitted any interview requests yet. Request a specific interviewer or broadcast to the matching pool."
                              : `No interview requests match the "${requestStatusFilter}" status filter.`}
                          </p>
                          <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                              onClick={openBroadcastModal}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-[#0B151E] text-xs font-black"
                            >
                              ⚡ Broadcast Open Request
                            </button>
                            <button
                              onClick={() => setActiveTab("interviewers")}
                              className="px-4 py-2 rounded-xl border border-white/10 text-slate-200 text-xs font-bold hover:bg-white/5"
                            >
                              Browse Matching Interviewers
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filtered.map((req) => {
                          const isOpenPool = req.requestType === "open" || !req.interviewerUserId;
                          const isAccepted = req.status === "accepted";
                          const isPending = req.status === "pending";
                          const isRejected = req.status === "rejected";
                          const isCompleted = req.status === "completed";

                          const assignedInterviewer = req.interviewerUser;
                          const assignedName = assignedInterviewer?.firstName
                            ? `${assignedInterviewer.firstName} ${assignedInterviewer.lastName || ""}`.trim()
                            : assignedInterviewer?.username || "";

                          const topics = Array.isArray(req.topicFocus) ? req.topicFocus : [req.topicFocus].filter(Boolean);

                          return (
                            <div
                              key={req.requestId}
                              className={`p-6 rounded-3xl border shadow-xl transition-all space-y-4 ${cardBg} ${
                                isAccepted
                                  ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent hover:border-emerald-400"
                                  : isPending
                                  ? "border-amber-500/40 hover:border-amber-400"
                                  : isRejected
                                  ? "border-red-500/30 opacity-90"
                                  : "border-white/10"
                              }`}
                            >
                              {/* Header: Role, Badges & Room Code */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-black text-base text-slate-100">{req.roleRequirement}</h3>

                                    {/* Request Mode Badge */}
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                      isOpenPool
                                        ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
                                        : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                                    }`}>
                                      {isOpenPool ? "⚡ Broadcast to Matching Pool" : "🎯 Direct Request"}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                      isAccepted
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                                        : isPending
                                        ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                                        : isCompleted
                                        ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                                        : "bg-red-500/20 text-red-300 border-red-400/40"
                                    }`}>
                                      {req.status}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-400">
                                    {isAccepted ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Accepted by {assignedName || "Assigned Interviewer"} ({assignedInterviewer?.email || "Confirmed"})
                                      </span>
                                    ) : isOpenPool ? (
                                      <span className="text-amber-300 font-bold flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Awaiting first matching interviewer to accept & claim
                                      </span>
                                    ) : (
                                      <span>
                                        Direct request to: <strong className="text-slate-200">{assignedName || "Interviewer"}</strong>
                                      </span>
                                    )}
                                  </p>
                                </div>

                                {/* Room Code Badge */}
                                <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 self-start sm:self-auto ${innerBg}`}>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Room Code:</span>
                                  <span className="font-mono font-bold text-xs text-cyan-400">{req.roomCode}</span>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Coding Language</span>
                                  <p className="font-mono font-bold text-cyan-400">{req.language || "JavaScript"}</p>
                                </div>

                                <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Date & Time</span>
                                  <p className="font-bold text-slate-200">📅 {req.scheduledDate} ({req.scheduledTime})</p>
                                </div>

                                <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Focus Topics</span>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {topics.length > 0 ? (
                                      topics.map((t, idx) => (
                                        <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                                          {t}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-500 italic">Full Stack & DSA</span>
                                    )}
                                  </div>
                                </div>

                                <div className={`p-3 rounded-xl border space-y-1 ${innerBg}`}>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Session Status</span>
                                  <p className="font-bold text-slate-200">
                                    {isAccepted ? "🟢 Confirmed & Live" : isPending ? "🟡 Waiting Review" : "🔴 Closed"}
                                  </p>
                                </div>
                              </div>

                               {/* Candidate Message/Notes if provided */}
                              {req.candidateNotes && (
                                <div className={`p-3.5 rounded-xl border text-xs ${innerBg}`}>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">My Notes to Interviewer:</span>
                                  <p className="text-slate-300 leading-relaxed italic">"{req.candidateNotes}"</p>
                                </div>
                              )}

                              {/* Dropped / Declined Alert & Re-route Actions */}
                              {isRejected && (
                                <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-3">
                                  <div className="flex items-start gap-2.5 text-xs text-red-300">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                                    <div>
                                      <p className="font-extrabold text-red-200">Request Declined / Dropped</p>
                                      <p className="text-red-300/80 text-[11px] leading-relaxed">
                                        The interviewer was unable to take this slot. You can instantly re-route this request to all available expert interviewers in the Open Pool, or pick another verified expert.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                    <button
                                      onClick={() => handleRerouteToOpenPool(req.requestId)}
                                      disabled={actionLoading === req.requestId}
                                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 text-[#0B151E] font-black text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                                    >
                                      {actionLoading === req.requestId ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Zap className="h-3.5 w-3.5 fill-current" />
                                      )}
                                      ⚡ Re-route to Open Matching Pool
                                    </button>

                                    <button
                                      onClick={() => setReassignModal(req)}
                                      disabled={actionLoading === req.requestId}
                                      className="px-4 py-2 rounded-xl border border-sky-400/40 bg-sky-400/15 text-sky-300 hover:bg-sky-400/25 font-extrabold text-xs transition-all flex items-center gap-1.5"
                                    >
                                      <Users className="h-3.5 w-3.5" /> 🎯 Choose Another Interviewer
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Bottom Action Strip */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                                <div className="text-xs text-slate-400">
                                  Submitted on: {new Date(req.createdAt).toLocaleDateString()}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                  {/* Google Meet Button with Time-Gating & Renewal Request logic */}
                                  {isAccepted && (() => {
                                    const linkState = getMeetingLinkStatus(req);
                                    if (linkState.state === "UPCOMING") {
                                      return (
                                        <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                          <Lock className="h-3.5 w-3.5 text-amber-400" />
                                          <span>{linkState.label}</span>
                                        </div>
                                      );
                                    }
                                    if (linkState.state === "ACTIVE" && req.meetingLink) {
                                      return (
                                        <a
                                          href={req.meetingLink}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2 animate-pulse"
                                        >
                                          <Video className="h-4 w-4 text-black fill-current" /> Join Google Meet Call
                                        </a>
                                      );
                                    }
                                    if (linkState.state === "EXPIRED_UNCOMPLETED") {
                                      if (req.newLinkRequested && req.newLinkStatus === "pending") {
                                        return (
                                          <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                                            <Clock className="h-4 w-4 animate-spin text-cyan-400" />
                                            <span>Link Renewal Requested • Waiting for Interviewer Approval</span>
                                          </div>
                                        );
                                      }
                                      if (req.newLinkStatus === "denied") {
                                        return (
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                                              <XCircle className="h-4 w-4" /> Request Denied: {req.newLinkDenialReason || "Interviewer unavailable"}
                                            </span>
                                            <button
                                              onClick={() => openRequestLinkModal(req)}
                                              className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-black flex items-center gap-1.5 transition-all"
                                            >
                                              <RotateCcw className="h-3.5 w-3.5" /> Request Again
                                            </button>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                          <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                                            <AlertTriangle className="h-4 w-4 text-amber-400" /> Slot Expired • Not Marked Complete
                                          </span>
                                          <button
                                            onClick={() => openRequestLinkModal(req)}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black hover:brightness-110 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                                          >
                                    <RotateCcw className="h-3.5 w-3.5" /> Request New Meeting Link
                                          </button>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}

                                  {isCompleted && (
                                    <button
                                      onClick={() => handleOpenFeedbackView(req.requestId)}
                                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-[#0B151E] font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all"
                                    >
                                      <Star className="h-3.5 w-3.5 fill-current" /> View Interview Evaluation & Ratings
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ══════════════ TAB: 1 : 1 GUIDANCE & MENTORSHIP ══════════════ */}
              {activeTab === "guidance" && (
                <div className="space-y-8">
                  {/* Hero Mentorship Banner */}
                  <div className={`p-8 rounded-3xl border bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-indigo-500/15 border-cyan-500/30 shadow-2xl relative overflow-hidden`}>
                    <div className="relative z-10 space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                        <Sparkles className="h-4 w-4" /> 1 : 1 Technical Guidance &amp; Career Mentorship
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        Personalized 1-on-1 Mentorship with Senior Tech Leaders
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Book private 60-minute Google Meet video sessions with verified engineering leads from top tech companies. Get tailored career roadmaps, system architecture deep-dives, and actionable resume feedback.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={() => openBroadcastModal("1:1 Career & Technical Mentorship")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#0B151E] font-black text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                        >
                          <Zap className="h-4 w-4 fill-current" /> ⚡ Broadcast Mentorship Request to Open Pool
                        </button>
                        <button
                          onClick={() => setActiveTab("interviewers")}
                          className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all flex items-center gap-2"
                        >
                          <Users className="h-4 w-4 text-cyan-400" /> Browse Verified Mentors Directory
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 1:1 Mentorship Specialized Tracks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black flex items-center gap-2">
                          <Layers className="h-5 w-5 text-cyan-400" /> Specialized 1 : 1 Mentorship Tracks
                        </h3>
                        <p className="text-xs text-slate-400">Choose a focused track to master specific technical domains or career milestones.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {MENTORSHIP_TRACKS.map((track) => {
                        const Icon = track.icon;
                        return (
                          <div
                            key={track.id}
                            className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01] ${cardBg} border-white/10 hover:border-cyan-500/40`}
                          >
                            <div className="space-y-4">
                              {/* Header Pill & Icon */}
                              <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${track.color} text-white shadow-md`}>
                                  <Icon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-white/5 border-white/10 text-slate-300">
                                  {track.tag}
                                </span>
                              </div>

                              {/* Title & Description */}
                              <div className="space-y-1.5">
                                <h4 className="text-base font-extrabold text-white">{track.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{track.desc}</p>
                              </div>

                              {/* Deliverables Checklist */}
                              <div className={`p-3.5 rounded-2xl border space-y-1.5 ${innerBg}`}>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Session Deliverables:</span>
                                {track.deliverables.map((deliv, dIdx) => (
                                  <div key={dIdx} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                    <span>{deliv}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-5 mt-4 border-t border-white/5">
                              <button
                                onClick={() => openBroadcastModal(track.title)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-black text-xs shadow hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                              >
                                Book 1 : 1 Session in this Track <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Featured Verified Mentors Quick Section */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Featured 1 : 1 Industry Mentors
                        </h3>
                        <p className="text-xs text-slate-400">Directly book a 1-on-1 technical session with a verified lead.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("interviewers")}
                        className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
                      >
                        View All {matchingInterviewers.length} Mentors →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchingInterviewers
                        .filter((inv) => inv.isMentor !== false)
                        .slice(0, 3)
                        .map((inv) => {
                        const invName = inv.user?.firstName
                          ? `${inv.user.firstName} ${inv.user.lastName || ""}`.trim()
                          : inv.user?.username || "Senior Mentor";
                        const slots = Array.isArray(inv.availability) ? inv.availability : [];

                        return (
                          <div
                            key={inv.userId}
                            className={`p-5 rounded-3xl border shadow-xl flex flex-col justify-between transition-all ${cardBg} border-white/10 hover:border-cyan-500/40`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-400 text-[#0B151E] font-black text-lg flex items-center justify-center shadow-md shrink-0">
                                  {invName[0]?.toUpperCase() || "M"}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                    {invName}
                                    {inv.isVerified && (
                                      <span className="text-[9px] px-2 py-0.2 rounded-full border bg-emerald-500/15 border-emerald-400/30 text-emerald-300 font-bold">
                                        ✓ Verified Lead
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-[11px] text-slate-400">
                                    {inv.title || "Senior Software Engineer"} {inv.company?.companyName ? `• ${inv.company.companyName}` : ""}
                                  </p>
                                </div>
                              </div>

                              {/* Specializations & Availability */}
                              <div className="flex flex-wrap gap-1">
                                {(inv.specialization || ["System Design", "Node.js", "React"]).slice(0, 3).map((s, sIdx) => (
                                  <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>

                              {slots.length > 0 && (
                                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Next Slot: {slots[0]}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => openBookingModal(inv, "1:1 Career & Technical Guidance")}
                              className="mt-4 w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0B151E] font-extrabold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                            >
                              Request 1 : 1 Mentorship <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
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

              {/* ══════════════ TAB 6: FLOWCODE PLAYGROUND ══════════════ */}
              {activeTab === "flowcode" && (
                <div className="space-y-6">
                  {/* Header Banner */}
                  <div className="p-6 rounded-3xl border bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border-emerald-500/30 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                          <Code2 className="h-4 w-4" /> FlowCode — Multi-Language Playground
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">
                          Write, Run &amp; Test Code Before Your Interview
                        </h2>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                          Practice coding in JavaScript, Python, Java, C++, Go, Rust and more — right inside InterviewFlow. Executes securely on FlowCode sandbox. Use <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10 font-mono text-[10px]">Ctrl+Enter</kbd> to run instantly.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 font-bold uppercase tracking-wider">
                          🟢 FlowCode Sandbox
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monaco Editor + Terminal Runner */}
                  <CodeEditorWithRunner
                    isPlayground={true}
                    initialLanguage="javascript"
                    roomCode={activeSession?.roomCode || null}
                  />
                </div>
              )}

              {/* Tab: Companies Connected With You */}
              {(activeTab === "connections" || activeTab === "jobs") && (
                <CandidateJobsTab
                  user={user}
                  profile={profile}
                  isDark={isDark}
                  onNavigateTab={setActiveTab}
                />
              )}

              {/* ══════════════ TAB: DSA & FLOWCODE WORKSPACE ══════════════ */}
              {(activeTab === "problems" || activeTab === "dsaprofile") && <ProblemSolvingTab user={user} />}

              {/* ══════════════ TAB 8: REPORT BUG / ISSUES ══════════════ */}
              {activeTab === "bugs" && <ReportBugTab user={user} isAdmin={false} />}

              {/* ══════════════ TAB 9: LOGIN SESSIONS & SECURITY ══════════════ */}
              {activeTab === "sessions" && <LoginSessionsTab user={user} isAdmin={false} />}
            </>
          )}
        </main>
      </div>

      {/* ══════════════ 1-TO-1 INTERVIEW REQUEST / BOOKING MODAL ══════════════ */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  bookingMode === "open"
                    ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                }`}>
                  {bookingMode === "open" ? <Zap className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    {bookingMode === "open" ? "Broadcast Open Interview Request" : "Request Direct 1-to-1 Technical Interview"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {bookingMode === "open"
                      ? "Send to all matching verified interviewers"
                      : `With ${selectedInterviewer?.user?.firstName || "Interviewer"} (${selectedInterviewer?.title || "Senior Architect"})`}
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

              <div>
                <label className="block mb-1 font-bold text-slate-300">Preferred Interview Date</label>
                <input
                  type="date"
                  value={bookingForm.scheduledDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* ── TIME SLOT SELECTOR ── */}
              <div className={`p-4 rounded-2xl border ${innerBg} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-cyan-400">
                    {bookingMode === "open"
                      ? "🕒 Preferred Time Window / Slot:"
                      : `🕒 Select from ${selectedInterviewer?.user?.firstName || "Interviewer"}'s Availability Slots:`}
                  </label>
                  {bookingMode === "direct" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {(selectedInterviewer?.availability || []).length} Available Slots
                    </span>
                  )}
                </div>

                {bookingMode === "direct" && Array.isArray(selectedInterviewer?.availability) && selectedInterviewer.availability.length > 0 ? (
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
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. 05:00 PM - 06:00 PM, 10:00 AM - 11:00 AM, Flexible"
                      value={bookingForm.scheduledTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                      className={inputCls}
                    />
                    <p className="text-slate-400 text-[11px] italic">
                      {bookingMode === "open"
                        ? "Enter your preferred time window so matching interviewers can confirm their availability."
                        : "Type your preferred interview time window above."}
                    </p>
                  </div>
                )}

                {/* Selected Slot Confirmation */}
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
                {bookingMode === "open" ? (
                  <p>
                    Your request will appear in the <strong>Matching Open Pool</strong> on all qualified interviewers&apos; dashboards. When an interviewer accepts, the session will be marked as accepted and locked for you.
                  </p>
                ) : (
                  <p>
                    An interview room is reserved and an email notification is dispatched to {selectedInterviewer?.user?.firstName || "the interviewer"}.
                  </p>
                )}
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
                  className={`flex-1 rounded-xl py-2.5 font-extrabold shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    bookingMode === "open"
                      ? "bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 text-[#0B151E] "
                      : "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E]"
                  }`}
                >
                  {requestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : bookingMode === "open" ? <Zap className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {requestLoading ? "Submitting..." : bookingMode === "open" ? "Broadcast to Matching Pool" : "Submit & Notify Interviewer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ REASSIGN DROPPED REQUEST MODAL ══════════════════ */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-white/10 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" /> Choose New Interviewer for Request
                </h3>
                <p className="text-xs text-slate-400">
                  Role: <strong className="text-slate-200">{reassignModal.roleRequirement}</strong> • Room: <span className="font-mono text-cyan-400">{reassignModal.roomCode}</span>
                </p>
              </div>

              <button
                onClick={() => setReassignModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-300">
                Select another verified technical interviewer from your matching pool below:
              </p>

              <div className="space-y-3">
                {matchingInterviewers
                  .filter((inv) => inv.userId !== reassignModal.interviewerUserId)
                  .map((inv) => {
                    const invName = inv.user?.firstName
                      ? `${inv.user.firstName} ${inv.user.lastName || ""}`.trim()
                      : inv.user?.username || "Interviewer";
                    const isBusy = actionLoading === reassignModal.requestId;

                    return (
                      <div
                        key={inv.userId}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isDark ? "border-white/10 bg-white/[0.02] hover:border-cyan-500/40" : "border-slate-200 bg-slate-50 hover:border-cyan-500/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-cyan-400 text-[#0B151E] flex items-center justify-center font-black text-sm shrink-0">
                            {invName[0]?.toUpperCase() || "I"}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                              {invName}
                              {inv.isVerified && (
                                <span className="text-[10px] px-2 py-0.2 rounded-full border bg-emerald-500/15 border-emerald-400/30 text-emerald-300 font-bold">
                                  ✓ Verified
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {inv.title || "Technical Interviewer"} {inv.company?.companyName ? `• ${inv.company.companyName}` : ""}
                            </p>
                          </div>
                        </div>

                        <button
                          disabled={isBusy}
                          onClick={() => handleReassignInterviewer(reassignModal.requestId, inv.userId)}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0B151E] font-black text-xs shadow-md transition-all whitespace-nowrap self-end sm:self-auto flex items-center gap-1.5"
                        >
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Assign &amp; Notify
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Or Option */}
              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  onClick={() => {
                    const reqId = reassignModal.requestId;
                    setReassignModal(null);
                    handleRerouteToOpenPool(reqId);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 font-bold text-xs transition-all inline-flex items-center gap-2"
                >
                  <Zap className="h-4 w-4 fill-current text-teal-400" />
                  Or Broadcast to Open Matching Pool Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ REQUEST NEW GOOGLE MEET LINK MODAL ══════════════════ */}
      {requestLinkModalOpen && requestLinkTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-amber-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-white/10 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold flex items-center gap-2 text-amber-400">
                  <RotateCcw className="h-5 w-5" /> Request New Google Meet Link
                </h3>
                <p className="text-xs text-slate-400">
                  Role: <strong className="text-slate-200">{requestLinkTarget.roleRequirement}</strong> • Slot: <span className="font-mono text-cyan-300">{requestLinkTarget.scheduledTime}</span>
                </p>
              </div>
              <button
                onClick={() => setRequestLinkModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestNewLink} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" /> Time Window Expired / Session Incomplete
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Your reserved time slot window has completed and the interviewer has not marked this session as completed yet. You can ask the interviewer for a new link or extension.
                </p>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-300">
                  Reason for New Link Request <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. The meeting was delayed / we could not join during the original slot, requesting a new active link to continue."
                  value={requestLinkReason}
                  onChange={(e) => setRequestLinkReason(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestLinkModalOpen(false)}
                  className={`flex-1 rounded-xl border py-2.5 font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLinkLoading}
                  className="flex-1 rounded-xl py-2.5 font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {requestLinkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {requestLinkLoading ? "Submitting..." : "Send Request to Interviewer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ CANDIDATE INTERVIEW FEEDBACK & RATINGS MODAL ══════════════════ */}
      {candidateFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? "border-cyan-500/30 bg-[#080E18] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            {/* Modal Header */}
            <div className={`flex items-start justify-between p-6 border-b shrink-0 ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Technical Evaluation Completed
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    candidateFeedbackModal.recommendation === "Strong Hire"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : candidateFeedbackModal.recommendation === "Hire"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : candidateFeedbackModal.recommendation === "Consider"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    Recommendation: {candidateFeedbackModal.recommendation || "Hire"}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-current" />
                  Interview Feedback &amp; Skill Markings
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluated by: <strong className="text-cyan-400">{
                    candidateFeedbackModal.interviewerUser?.firstName
                      ? `${candidateFeedbackModal.interviewerUser.firstName} ${candidateFeedbackModal.interviewerUser.lastName || ""}`.trim()
                      : candidateFeedbackModal.interviewerUser?.username || "Technical Interviewer"
                  }</strong>
                </p>
              </div>

              <button
                onClick={() => setCandidateFeedbackModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Overall Score Highlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Overall Interview Rating</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-emerald-400">
                      {candidateFeedbackModal.overallRating}
                    </span>
                    <span className="text-sm font-bold text-slate-500">/ 10</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < candidateFeedbackModal.overallRating
                          ? "text-amber-400 fill-current"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verified Skills Rating Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-cyan-400" /> Tested Skills &amp; Markings (Out of 10)
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Live Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Array.isArray(candidateFeedbackModal.skillRatings) && candidateFeedbackModal.skillRatings.length > 0 ? (
                    candidateFeedbackModal.skillRatings.map((sr, idx) => {
                      const rating = Number(sr.rating) || 0;
                      const pct = Math.round((rating / 10) * 100);
                      const barColor =
                        rating >= 8
                          ? "bg-emerald-400"
                          : rating >= 6
                          ? "bg-cyan-400"
                          : rating >= 4
                          ? "bg-amber-400"
                          : "bg-rose-400";

                      return (
                        <div key={idx} className={`p-3.5 rounded-2xl border ${innerBg} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-100">{sr.skill}</span>
                            <span className="font-black text-xs font-mono text-cyan-300">
                              {rating} / 10
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {sr.notes && (
                            <p className="text-[11px] text-slate-400 italic pt-0.5">
                              "{sr.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 italic">No specific skill breakdown recorded.</p>
                  )}
                </div>
              </div>

              {/* Strengths & Areas for Improvement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Key Strengths
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {candidateFeedbackModal.strengths || "Strong fundamentals and communication demonstrated during session."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Areas for Growth
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {candidateFeedbackModal.areasForImprovement || "Continue practicing edge case analysis and code modularity."}
                  </p>
                </div>
              </div>

              {/* General Feedback Notes */}
              {candidateFeedbackModal.generalNotes && (
                <div className={`p-4 rounded-2xl border ${innerBg} space-y-1`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Interviewer Remarks &amp; Mentorship Advice:
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {candidateFeedbackModal.generalNotes}
                  </p>
                </div>
              )}

              {/* How this helps candidate */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-cyan-200">
                <Sparkles className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Career Boost:</strong> These verified skill marks out of 10 are now automatically linked to your candidate profile and boost your match ranking when companies post jobs and search for matching talent!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex justify-end shrink-0 ${
              isDark ? "border-white/10 bg-white/2" : "border-slate-100 bg-slate-50"
            }`}>
              <button
                type="button"
                onClick={() => setCandidateFeedbackModal(null)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-black text-xs hover:brightness-110 shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
