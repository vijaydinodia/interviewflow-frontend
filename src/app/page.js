"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Mic, Video as VideoIcon,
  ShieldCheck, Code2, Play, Users, CheckCircle2, Zap,
  Globe, Cpu, Terminal, Command, Award, Clock, Activity, Check,
  Laptop, FileCode, Sliders, Lock, Layers, BookOpen, Compass,
  Building2, Briefcase, Rocket, Star, Quote, MessageSquare, MapPin
} from "lucide-react";

const INDIAN_COMPANIES = [
  { name: "TCS", tag: "IT Services" },
  { name: "Infosys", tag: "Global Tech" },
  { name: "Wipro", tag: "Digital Solutions" },
  { name: "Swiggy", tag: "FoodTech India" },
  { name: "Zomato", tag: "Food Delivery" },
  { name: "Flipkart", tag: "E-Commerce" },
  { name: "Paytm", tag: "FinTech India" },
  { name: "Razorpay", tag: "Payment Gateway" },
  { name: "Zerodha", tag: "Broking Tech" },
  { name: "Ola", tag: "Mobility India" },
];

const WHY_INTERVIEWFLOW = [
  {
    icon: Zap,
    badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    title: "Sub-50ms Code Sync",
    desc: "No screen-sharing lag or delayed typing. Candidate and interviewer edit code in lockstep real-time.",
  },
  {
    icon: Users,
    badgeBg: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    title: "Human-to-Human Focus",
    desc: "Evaluate real engineering thought processes and design choices instead of sterile automated bots.",
  },
  {
    icon: Code2,
    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    title: "All-in-One Workspace",
    desc: "Replaces Zoom, CoderPad, and Docs. HD video call, code execution, and feedback live under 1 URL.",
  },
  {
    icon: ShieldCheck,
    badgeBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    title: "Enterprise Anti-Cheat",
    desc: "SOC-2 compliant with built-in tab-switch detection, code plagiarism checks, and encrypted rooms.",
  },
  {
    icon: Terminal,
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    title: "30+ Language Compilers",
    desc: "Instant execution for JS, Python, Java, Go, C++, Rust, SQL, and React with full terminal output.",
  },
  {
    icon: Play,
    badgeBg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    title: "HD Session Playback",
    desc: "Review step-by-step keystrokes and audio recordings to audit hiring decisions with your team.",
  },
  {
    icon: Award,
    badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    title: "AI-Assisted Scorecards",
    desc: "Generate structured candidate rubric summaries, code quality metrics, and performance benchmarks.",
  },
  {
    icon: Laptop,
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    title: "Interactive System Whiteboard",
    desc: "Draw architecture diagrams, database schemas, and flowchart nodes right alongside live code.",
  },
  {
    icon: FileCode,
    badgeBg: "bg-[#00C6FF]/10 border-[#00C6FF]/20 text-cyan-300",
    title: "Custom Question Bank",
    desc: "Import your company's proprietary coding questions, test cases, and hidden unit validations.",
  },
  {
    icon: Clock,
    badgeBg: "bg-amber-400/10 border-amber-400/20 text-amber-300",
    title: "Automated Scheduling Sync",
    desc: "Seamless Google Calendar and Outlook integrations to auto-generate one-click candidate interview rooms.",
  },
];

const THREE_MAIN_FEATURES = [
  {
    id: "1on1",
    title: "1 : 1 Live Technical Interview",
    subtitle: "Sub-50ms Collaborative Workspace",
    badge: "Live 1:1 Session",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    icon: VideoIcon,
    iconColor: "text-cyan-400",
    glowColor: "from-cyan-500/20 to-sky-500/20",
    borderColor: "hover:border-cyan-400/50",
    bullets: [
      "Sub-50ms lockstep collaborative code editor with cursor sync",
      "Low-latency HD video & crisp audio streaming built right in",
      "30+ compilers with live terminal execution and error logs",
      "Interactive system design whiteboard for architecture diagrams"
    ],
    ctaText: "Try 1:1 Live Room"
  },
  {
    id: "practice",
    title: "Practice Questions Library",
    subtitle: "1,000+ Curated DSA & System Design",
    badge: "Problem Bank",
    badgeBg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    icon: BookOpen,
    iconColor: "text-teal-400",
    glowColor: "from-teal-500/20 to-emerald-500/20",
    borderColor: "hover:border-teal-400/50",
    bullets: [
      "Curated LeetCode & Indian tech company-tagged coding problems",
      "Built-in automated test suite with edge case validation",
      "Detailed time & space complexity optimal solutions",
      "Filter by difficulty (Easy, Medium, Hard) & topics"
    ],
    ctaText: "Explore Questions"
  },
  {
    id: "guidance",
    title: "1 : 1 Guidance & Mentorship",
    subtitle: "Career & Interview Preparation",
    badge: "Mentorship",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: Compass,
    iconColor: "text-amber-400",
    glowColor: "from-amber-500/20 to-orange-500/20",
    borderColor: "hover:border-amber-400/50",
    bullets: [
      "1-on-1 mock interviews with Indian Unicorn senior tech leads",
      "In-depth candidate scorecard report & actionable feedback",
      "Resume, GitHub, and system design portfolio review",
      "Step-by-step technical career growth roadmap"
    ],
    ctaText: "Book Guidance Session"
  }
];

const INDUSTRY_SOLUTIONS = [
  {
    id: "startups",
    title: "Indian Tech Startups",
    tagline: "Hire 3x Faster With Zero Setup Overhead",
    badge: "Bengaluru & NCR Seed",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    icon: Rocket,
    iconColor: "text-cyan-400",
    desc: "Speed is everything. Instant 1:1 rooms with zero software installation allow founders and tech leads to evaluate candidates on the spot.",
    highlights: ["Instant one-click links", "Pre-built scoring rubrics", "Fast candidate onboarding"]
  },
  {
    id: "enterprise",
    title: "IT Services & GCC Enterprises",
    tagline: "SOC-2 Certified & Large-Scale Hiring",
    badge: "Enterprise India",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    icon: Building2,
    iconColor: "text-indigo-400",
    desc: "Enterprise-grade compliance, SSO/SAML authentication, role-based access control, and seamless integrations with Greenhouse & Lever.",
    highlights: ["Greenhouse & Lever ATS sync", "SOC-2 Type II certified", "Anti-cheat tab audit logs"]
  },
  {
    id: "bootcamps",
    title: "EdTech & Engineering Colleges",
    tagline: "Train & Assess 10,000+ Students Concurrently",
    badge: "Education India",
    badgeBg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    icon: BookOpen,
    iconColor: "text-teal-400",
    desc: "Empower mentors and instructors with collaborative 1:1 pair programming, automated test grading, and student progress metrics.",
    highlights: ["Collaborative pair programming", "Automated code grading", "Mentorship session reports"]
  },
  {
    id: "recruitment",
    title: "Staffing & Offshore Agencies",
    tagline: "Deliver Vetted Candidate Video Proofs to Clients",
    badge: "Agency Search",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: Briefcase,
    iconColor: "text-amber-400",
    desc: "Differentiate your agency by sharing verified technical scorecard links and video replay highlights directly with hiring managers.",
    highlights: ["Shareable candidate replays", "Multi-client team isolation", "Verified skill scorecards"]
  }
];

const TESTIMONIALS = [
  {
    id: "aarav",
    name: "Aarav Sharma",
    role: "VP of Engineering at Swiggy",
    location: "Bengaluru",
    avatar: "AS",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    rating: 5,
    tag: "Bengaluru Tech Lead",
    quote: "InterviewFlow drastically improved our tech hiring speed across Bengaluru & Hyderabad teams. The real-time code editor and HD video call in one URL made candidate evaluation seamless."
  },
  {
    id: "priya",
    name: "Priya Patel",
    role: "Senior Tech Lead at Flipkart",
    location: "Gurugram",
    avatar: "PP",
    badgeBg: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    rating: 5,
    tag: "100+ Interviews",
    quote: "Conducting 100+ MERN & Java interviews every month was challenging. InterviewFlow's anti-cheat logs, instant 1:1 rooms, and automated scorecards have been a game changer."
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    role: "Full Stack Software Engineer",
    location: "Pune",
    avatar: "RV",
    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rating: 5,
    tag: "Candidate Review",
    quote: "Best coding interview experience I've had in India. Zero lag while typing code, instant terminal compiler outputs, and clear feedback from the interviewer."
  },
  {
    id: "ananya",
    name: "Ananya Gupta",
    role: "Head of Tech Hiring at Zomato",
    location: "Delhi NCR",
    avatar: "AG",
    badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    rating: 5,
    tag: "Zomato Hiring Lead",
    quote: "The ability to run live React & Node.js code with instant terminal outputs helped us hire top 1% full-stack talent without setup friction."
  },
  {
    id: "karan",
    name: "Karan Malhotra",
    role: "Lead Architect at Razorpay",
    location: "Bengaluru",
    avatar: "KM",
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    rating: 5,
    tag: "System Design Lead",
    quote: "The system whiteboard alongside the live compiler allowed us to evaluate system architecture thinking and coding syntax in a single 45-minute call."
  },
  {
    id: "neha",
    name: "Neha Kulkarni",
    role: "Backend Engineer Candidate",
    location: "Hyderabad",
    avatar: "NK",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    rating: 5,
    tag: "Verified Candidate",
    quote: "Super intuitive interface! No third-party plugins needed. I solved the Go binary tree challenge while talking directly with the interviewer."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B151E] text-white font-sans flex flex-col selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">

      <div className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] z-0" />
      <div className="pointer-events-none fixed top-1/3 right-10 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] z-0" />
      <div className="pointer-events-none fixed bottom-10 left-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] z-0" />

      <div className="absolute top-44 left-6 z-10 w-16 h-16 rounded-full bubble-3d-purple animate-bubble-float opacity-80 pointer-events-none" />
      <div className="absolute top-80 left-16 z-10 w-10 h-10 rounded-full bubble-3d-purple animate-bubble-float opacity-60 pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-36 right-8 z-10 w-20 h-20 rounded-full bubble-3d-purple animate-bubble-float opacity-75 pointer-events-none" style={{ animationDelay: "0.8s" }} />
      <div className="absolute top-96 right-14 z-10 w-12 h-12 rounded-full bubble-3d-purple animate-bubble-float opacity-70 pointer-events-none" style={{ animationDelay: "2s" }} />

      <Header />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 lg:pb-16 flex flex-col justify-center gap-12 sm:gap-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-bold text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>India&apos;s #1 Real-Time Technical Interview Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              The fastest way to conduct live,{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                human
              </span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                technical interviews
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-xl font-normal">
              Engineers and tech teams in India, create frictionless 1:1 sessions. Live coding, real-time sync, HD video, and human feedback—all in one integrated workspace. Evaluate real engineers, not AI.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <Link
                href="/register"
                className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-extrabold shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98]"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-cyan-500/25 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <span>Sign In</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs font-semibold text-slate-400 border-t border-white/10 w-full">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Instant 1:1 Rooms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Installation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Real-Time Code Sync</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-6 relative flex items-center justify-center w-full">
            <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

            <div className="relative w-full max-w-full rounded-3xl bg-[#111C28] border border-cyan-500/25 shadow-2xl p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-4 overflow-hidden backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 border-b border-white/10 text-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                  </span>
                  <span className="font-extrabold tracking-wide text-cyan-300 text-[11px] sm:text-xs">LIVE 1:1 INTERVIEW</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">Room #4092</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 text-[10px] sm:text-[11px] px-2.5 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10">
                  <Users className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>2 Connected</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div className="relative rounded-2xl overflow-hidden bg-[#070D15] border border-cyan-500/30 group shadow-md aspect-[4/3] sm:aspect-[16/11]">
                  <video
                    src="/assests/videos/man.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-[#0B151E]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-white text-[10px] sm:text-[11px] font-semibold">
                    <span className="truncate">Interviewer (Senior Lead)</span>
                    <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-[#070D15] border border-cyan-500/30 group shadow-md aspect-[4/3] sm:aspect-[16/11]">
                  <video
                    src="/assests/videos/women.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-[#0B151E]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-white text-[10px] sm:text-[11px] font-semibold">
                    <span className="truncate">Candidate (Software Eng)</span>
                    <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#080E18] border border-white/10 p-2.5 sm:p-3 flex items-center justify-between text-xs text-slate-300 font-mono gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-400 hidden xs:inline">Code Sync:</span>
                  <span className="text-cyan-300 font-semibold truncate text-[11px] sm:text-xs">
                    const [state, setState] = useState()
                  </span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 shrink-0">
                  Syncing
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer">
                  <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer">
                  <VideoIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer shadow-lg shadow-red-500/20">
                  <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 rotate-90 fill-current" />
                </div>
              </div>

            </div>

          </div>

        </div>

        <div className="w-full py-6 sm:py-8 rounded-3xl bg-[#0E1B27]/80 border border-cyan-500/20 shadow-2xl flex flex-col gap-4 sm:gap-5 overflow-hidden relative backdrop-blur-xl">
          <div className="text-center px-4">
            <h3 className="text-xs sm:text-base font-bold tracking-wide text-amber-300/95 font-sans leading-snug">
              InterviewFlow - Trusted by Top Indian Tech Companies &amp; Unicorns
            </h3>
          </div>

          <div className="relative w-full overflow-hidden flex">

            <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 marquee-fade-box-left z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 marquee-fade-box-right z-10 pointer-events-none" />

            <div className="flex gap-6 sm:gap-8 animate-marquee-left whitespace-nowrap">
              {[...INDIAN_COMPANIES, ...INDIAN_COMPANIES].map((comp, idx) => (
                <div
                  key={`gold-single-${comp.name}-${idx}`}
                  className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/5 border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all cursor-pointer group"
                >
                  <span className="text-sm sm:text-base font-extrabold text-amber-300 group-hover:text-amber-200 transition-colors tracking-tight font-sans">
                    {comp.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-amber-400/60 font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                    {comp.tag}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

        <section id="features" className="w-full flex flex-col gap-8 sm:gap-12 py-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto px-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CORE PLATFORM PILLARS</span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight">
              What Features We <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">Offer</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              From real-time 1:1 live interview sessions and extensive problem banks to expert mentorship guidance—InterviewFlow equips candidates and engineering teams for complete success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {THREE_MAIN_FEATURES.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className={`group relative rounded-3xl bg-[#111C28] border border-cyan-500/20 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-2 ${feature.borderColor}`}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.glowColor} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                      <div className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${feature.iconColor} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 sm:w-6 h-5 sm:h-6" />
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full border ${feature.badgeBg}`}>
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mb-5 sm:mb-6">
                      {feature.subtitle}
                    </p>

                    <ul className="space-y-2.5 sm:space-y-3">
                      {feature.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-snug">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative z-10 pt-6 sm:pt-8 mt-5 sm:mt-6 border-t border-white/10">
                    <Link
                      href="/register"
                      className="flex items-center justify-between w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-xs font-bold text-white group-hover:text-cyan-300 transition-all"
                    >
                      <span>{feature.ctaText}</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        <section id="solutions" className="w-full flex flex-col gap-8 sm:gap-12 py-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto px-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-bold text-cyan-300">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>TAILORED WORKFLOWS</span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight">
              Industry <span className="text-cyan-400">Solutions</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Purpose-built technical evaluation workflows tailored for every hiring scale and sector in India—from fast-moving seed startups to IT GCC enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-left">
            {INDUSTRY_SOLUTIONS.map((sol) => {
              const IconComp = sol.icon;
              return (
                <div
                  key={sol.id}
                  className="group rounded-3xl bg-[#111C28] border border-cyan-500/20 p-6 sm:p-7 flex flex-col justify-between shadow-2xl hover:border-cyan-400/50 hover:-translate-y-1.5 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${sol.iconColor} group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-5 sm:w-6 h-5 sm:h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sol.badgeBg}`}>
                        {sol.badge}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {sol.title}
                    </h3>
                    <p className="text-xs font-semibold text-cyan-400 mb-2.5 sm:mb-3">
                      {sol.tagline}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 sm:mb-5">
                      {sol.desc}
                    </p>

                    <div className="space-y-2 pt-3.5 border-t border-white/10">
                      {sol.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 sm:pt-6 mt-4 sm:mt-6">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors"
                    >
                      <span>Explore Solution</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        <section id="testimonials" className="w-full flex flex-col gap-8 sm:gap-10 py-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto px-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-bold text-cyan-300">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>INDIAN TECH TESTIMONIALS</span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight">
              Loved by Tech Leaders &amp; Candidates Across <span className="text-cyan-400">India</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              See how VPs of Engineering, Tech Leads, and Software Developers across Bengaluru, Gurugram, Pune, and Hyderabad use InterviewFlow.
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex py-2">
            <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 marquee-fade-left z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 marquee-fade-right z-10 pointer-events-none" />

            <div className="flex gap-5 sm:gap-6 animate-marquee-left whitespace-normal">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                <div
                  key={`testimonial-marquee-${t.id}-${idx}`}
                  className="w-[280px] sm:w-[340px] shrink-0 rounded-3xl bg-[#111C28] border border-cyan-500/20 p-6 sm:p-7 flex flex-col justify-between shadow-2xl hover:border-cyan-400/40 transition-all hover:-translate-y-1 relative overflow-hidden text-left"
                >
                  <Quote className="absolute top-5 right-5 w-8 sm:w-10 h-8 sm:h-10 text-white/5 pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{t.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-5 italic">
                      &quot;{t.quote}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-sky-500 text-[#0B151E] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
                        {t.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {t.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] sm:max-w-[150px]">
                          {t.role}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${t.badgeBg} shrink-0`}>
                      {t.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        <section id="why" className="w-full flex flex-col gap-8 sm:gap-10 py-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto px-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-bold text-cyan-300">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>THE INTERVIEWFLOW ADVANTAGE</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Engineering Teams Choose <span className="text-cyan-400">InterviewFlow</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Ditch the clunky stack of Zoom call links, screen-sharing lag, and separate editor tabs. InterviewFlow combines live video, IDE code execution, and candidate evaluation in one unified room.
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex py-2">
            <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 marquee-fade-left z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 marquee-fade-right z-10 pointer-events-none" />

            <div className="flex gap-5 sm:gap-6 animate-marquee-left whitespace-normal">
              {[...WHY_INTERVIEWFLOW, ...WHY_INTERVIEWFLOW].map((item, idx) => {
                const IconComp = item.icon;

                <div
                  key={`card-single-${item.title}-${idx}`}
                  className="w-[260px] sm:w-[300px] shrink-0 rounded-3xl bg-[#111C28] border border-cyan-500/20 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:border-cyan-400/40 hover:-translate-y-1 transition-all group text-left"
                >
                  <div>
                    <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-2xl flex items-center justify-center mb-3.5 border ${item.badgeBg}`}>
                      <IconComp className="w-4 sm:w-5 h-4 sm:h-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-[10px] sm:text-[11px] font-semibold text-cyan-400">
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span>Included in all plans</span>
                  </div>
                </div>

              })}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-[#0E1B27]/90 border border-cyan-500/20 shadow-2xl backdrop-blur-xl mt-2">
            <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border-r border-white/10 last:border-0">
              <div className="flex items-center gap-1 text-xl sm:text-3xl font-extrabold text-cyan-300">
                <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
                <span>4x</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1">Faster Hiring Setup</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border-r border-white/10 last:border-0">
              <div className="flex items-center gap-1 text-xl sm:text-3xl font-extrabold text-emerald-300">
                <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
                <span>&lt; 50ms</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1">Global Latency</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border-r border-white/10 last:border-0">
              <div className="flex items-center gap-1 text-xl sm:text-3xl font-extrabold text-teal-300">
                <Award className="w-4 sm:w-5 h-4 sm:h-5 text-teal-400" />
                <span>98%</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1">Candidate Satisfaction</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 sm:p-3">
              <div className="flex items-center gap-1 text-xl sm:text-3xl font-extrabold text-sky-300">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-sky-400" />
                <span>50,000+</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1">Interviews Conducted</span>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}