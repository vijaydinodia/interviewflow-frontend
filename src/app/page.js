"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Video as VideoIcon, ShieldCheck, Code2, Play, Users,
  CheckCircle2, Zap, Globe, Terminal, Award, Clock, Laptop, FileCode,
  BookOpen, Compass, Rocket, Star, Quote, Building2, Briefcase, ChevronRight,
  Cpu, Layers, HelpCircle, Check, ArrowUpRight, MessageSquare
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

const METRICS = [
  { value: "1,000+", label: "DSA & Coding Questions", icon: BookOpen, color: "from-sky-400 to-cyan-400" },
  { value: "8+", label: "Language Compilers", icon: Terminal, color: "from-emerald-400 to-teal-400" },
  { value: "<50ms", label: "Real-Time Code Sync", icon: Zap, color: "from-amber-400 to-orange-400" },
  { value: "100%", label: "Verified 1:1 Mentors", icon: ShieldCheck, color: "from-purple-400 to-pink-400" },
];

const CORE_FEATURES = [
  {
    id: "flowcode",
    title: "FlowCode Compiler & Sandbox",
    tagline: "Powered by Multi-Language Execution Engine",
    badge: "Execution Engine",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    icon: Terminal,
    iconColor: "text-emerald-400",
    glowColor: "from-emerald-500/20 to-teal-500/20",
    borderColor: "hover:border-emerald-400/50",
    desc: "Execute code securely in 8+ programming languages (JavaScript, Python 3, Java, C++, TypeScript, Go, Rust, C) with real-time stdout, stderr, compile output, execution time, and memory metrics.",
    bullets: [
      "Zero-setup Monaco code editor with syntax highlighting",
      "Custom standard input (stdin) support for algorithmic testing",
      "Instant execution time & memory consumption telemetry",
      "Sub-second response speed via secure sandbox integration"
    ],
    ctaText: "Try FlowCode Compiler",
    ctaLink: "/compiler",
  },
  {
    id: "leetcode",
    title: "1,000+ DSA & Coding Questions",
    tagline: "Interactive Split Solver Workspace",
    badge: "Problem Bank",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    icon: BookOpen,
    iconColor: "text-cyan-400",
    glowColor: "from-cyan-500/20 to-sky-500/20",
    borderColor: "hover:border-cyan-400/50",
    desc: "Browse a rich collection of 1,000+ curated DSA coding problems with HTML problem descriptions, constraints, examples, topic tags, hints, and language starter snippets.",
    bullets: [
      "1,000+ top DSA problems categorized by topic, difficulty & frequency",
      "Embedded Monaco editor with dark theme & syntax highlighting",
      "Instant code execution with time & memory telemetry details",
      "Step-by-step problem hints & comprehensive topic tag breakdown"
    ],
    ctaText: "Solve DSA Questions",
    ctaLink: "/dashboard/candidate",
  },
  {
    id: "1on1",
    title: "1 : 1 Live Technical Interviews",
    tagline: "Collaborative Code Editor & Video Calls",
    badge: "Live 1:1 Workspace",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    icon: VideoIcon,
    iconColor: "text-indigo-400",
    glowColor: "from-indigo-500/20 to-purple-500/20",
    borderColor: "hover:border-indigo-400/50",
    desc: "Conduct live 1-on-1 technical coding interviews with HD video calls, sub-50ms collaborative code synchronization, and candidate evaluation scorecards.",
    bullets: [
      "HD video & audio room with instant meeting link assignment",
      "Synchronized collaborative code editor for live pair programming",
      "Anti-cheat audit logs and candidate tab-switch monitoring",
      "Automated interviewer assignment and request dispatching"
    ],
    ctaText: "Start Live 1:1 Room",
    ctaLink: "/dashboard/candidate",
  },
  {
    id: "guidance",
    title: "1 : 1 Guidance & Mentorship Portal",
    tagline: "Career Coaching with Verified Tech Leads",
    badge: "Mentorship",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: Compass,
    iconColor: "text-amber-400",
    glowColor: "from-amber-500/20 to-orange-500/20",
    borderColor: "hover:border-amber-400/50",
    desc: "Book personalized 1-on-1 mentorship sessions for System Design, DSA strategy, STAR leadership coaching, and resume audits with active tech leads.",
    bullets: [
      "4 specialized mentorship tracks tailored for engineering roles",
      "Filter verified mentors with active isMentor availability",
      "Detailed session deliverables & personalized growth roadmaps",
      "Direct request dispatching with interviewer confirmation"
    ],
    ctaText: "Book Guidance Session",
    ctaLink: "/dashboard/candidate",
  },
];

const ROLE_PORTALS = [
  {
    role: "Candidates",
    badge: "For Job Seekers",
    icon: Users,
    color: "from-sky-500 to-cyan-500",
    desc: "Practice 1,000+ DSA questions, test code in FlowCode compiler, request live 1:1 mock interviews, and book mentorship sessions.",
    link: "/dashboard/candidate",
  },
  {
    role: "Interviewers",
    badge: "For Tech Leads",
    icon: Code2,
    color: "from-emerald-500 to-teal-500",
    desc: "Accept candidate interview requests, set availability, conduct live coding sessions, evaluate scorecards, and toggle mentor status.",
    link: "/dashboard/interviewer",
  },
  {
    role: "Companies",
    badge: "For Employers",
    icon: Building2,
    color: "from-purple-500 to-indigo-500",
    desc: "Schedule technical interview rounds, manage company interviewers, view candidate scorecards, and streamline tech recruitment.",
    link: "/dashboard/admin",
  },
  {
    role: "Super Admin",
    badge: "For Platform Admins",
    icon: ShieldCheck,
    color: "from-amber-500 to-orange-500",
    desc: "Full backend-driven pagination, user management (Name, Email, Role, Status, Registered Date), and platform audit controls.",
    link: "/dashboard/super-admin",
  },
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "Senior Full Stack Lead at Swiggy",
    avatar: "AS",
    quote: "InterviewFlow transformed our engineering hiring. Having real-time code execution alongside HD video calls in one URL saved us hours per candidate.",
  },
  {
    name: "Priya Patel",
    role: "Tech Lead at Flipkart",
    avatar: "PP",
    quote: "The 1,000+ DSA question bank with the split solver workspace is incredible for candidates preparing for top tech rounds.",
  },
  {
    name: "Rohan Verma",
    role: "Backend Software Engineer",
    avatar: "RV",
    quote: "The 1:1 Guidance & Mentorship portal helped me crack my System Design round. My mentor walked me through real architecture patterns step-by-step.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("flowcode");

  const activeFeature = CORE_FEATURES.find((f) => f.id === activeTab) || CORE_FEATURES[0];

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500 selection:text-black ${
      isDark ? "bg-[#0B151E] text-white" : "bg-slate-50 text-slate-900"
    }`}>
      <Header />

      {/* ══════════════ 1. HERO SECTION ══════════════ */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
        {/* Background Ambient Glow Effects */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-purple-500/20 blur-[130px] rounded-full opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6 sm:space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-black tracking-wide shadow-lg animate-pulse">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>All-In-One Technical Interview &amp; Mentorship Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Master Tech Interviews with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Live Coding, Mentorship &amp; 1,000+ Problems
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practice 1,000+ DSA questions, run multi-language code on our secure execution engine, conduct 1:1 live technical interviews, and book career guidance with top tech leads.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/dashboard/candidate"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-black text-sm flex items-center gap-2 hover:brightness-110 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <span>Explore Candidate Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/compiler"
              className={`px-6 py-3.5 rounded-2xl border font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${
                isDark
                  ? "bg-white/5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  : "bg-white border-teal-300 text-teal-700 hover:bg-teal-50"
              }`}
            >
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Try Online Compiler</span>
            </Link>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className={`p-4 rounded-2xl border shadow-xl flex flex-col items-center justify-center space-y-1.5 transition-all hover:-translate-y-1 ${
                    isDark ? "bg-[#080E18]/80 border-white/10" : "bg-white border-slate-200"
                  }`}
                >
                  <Icon className="h-5 w-5 text-cyan-400" />
                  <span className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
                    {m.value}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 text-center">{m.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════ 2. CORE FEATURES INTERACTIVE SHOWCASE ══════════════ */}
      <section id="features" className="py-16 sm:py-24 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Complete Technical Hiring &amp; Practice Suite
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              Everything You Need to Succeed in Coding Interviews
            </h2>
          </div>

          {/* Feature Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {CORE_FEATURES.map((feat) => {
              const Icon = feat.icon;
              const isActive = feat.id === activeTab;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveTab(feat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-lg scale-105"
                      : isDark
                      ? "bg-white/5 text-slate-400 border border-white/10 hover:text-white"
                      : "bg-slate-200 text-slate-700 hover:text-black"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{feat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Feature Detail Card */}
          <div className={`p-6 sm:p-10 rounded-3xl border shadow-2xl transition-all ${
            isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200"
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Descriptions & Bullets */}
              <div className="lg:col-span-6 space-y-5">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black ${activeFeature.badgeBg}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {activeFeature.badge}
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {activeFeature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {activeFeature.desc}
                </p>

                <ul className="space-y-2.5 pt-2">
                  {activeFeature.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link
                    href={activeFeature.ctaLink}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all"
                  >
                    <span>{activeFeature.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Code Editor Mock Preview */}
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#1e1e1e] p-5 shadow-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">FlowCode Sandbox — Live Demo</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    FlowCode Engine
                  </span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="text-cyan-400">// JavaScript (Node.js) Execution</p>
                  <p><span className="text-purple-400">function</span> <span className="text-yellow-300">twoSum</span>(nums, target) &#123;</p>
                  <p className="pl-4"><span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> Map();</p>
                  <p className="pl-4"><span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = 0; i &lt; nums.length; i++) &#123;</p>
                  <p className="pl-8"><span className="text-purple-400">if</span> (map.has(target - nums[i])) <span className="text-purple-400">return</span> [map.get(target - nums[i]), i];</p>
                  <p className="pl-8">map.set(nums[i], i);</p>
                  <p className="pl-4">&#125;</p>
                  <p>&#125;</p>
                  <p className="text-emerald-400">console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]</p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">✔ Accepted</span>
                    <span>Time: 0.012s | Memory: 320 KB</span>
                  </div>
                  <p className="text-emerald-300 font-bold">[0, 1]</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════ 3. ROLE PORTALS (CANDIDATE, INTERVIEWER, ADMIN) ══════════════ */}
      <section id="portals" className="py-16 sm:py-24 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400">
              Multi-User Role Dashboards
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              Tailored Portals for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLE_PORTALS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 transition-all hover:-translate-y-1.5 ${
                    isDark ? "bg-[#080E18] border-white/10 hover:border-cyan-500/40" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl bg-gradient-to-tr ${p.color} text-black font-black`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white">{p.role} Portal</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>

                  <Link
                    href={p.link}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-400 hover:text-cyan-300 pt-2"
                  >
                    <span>Open Dashboard</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════ 4. WHY US / ADVANTAGES ══════════════ */}
      <section id="why" className="py-16 sm:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400">
              Why Engineers &amp; Companies Choose Us
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              Built For Speed, Accuracy &amp; Technical Growth
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "FlowCode Remote Compiler",
                desc: "Run code securely in 8+ major languages with instant stdout, stderr, compile error outputs, and telemetry metrics.",
                icon: Terminal,
                color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
              },
              {
                title: "Interactive Split Solver",
                desc: "Solve 1,000+ top DSA questions inside a dual-panel workspace with problem description, constraints, and hints.",
                icon: BookOpen,
                color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
              },
              {
                title: "1:1 Mentorship Directory",
                desc: "Connect with verified senior tech leads (with active isMentor toggle) for System Design, DSA, and STAR leadership coaching.",
                icon: Compass,
                color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
              },
            ].map((adv) => {
              const Icon = adv.icon;
              return (
                <div
                  key={adv.title}
                  className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
                    isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200"
                  }`}
                >
                  <div className={`p-3 rounded-2xl border w-fit ${adv.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{adv.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{adv.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════ 5. TESTIMONIALS ══════════════ */}
      <section id="testimonials" className="py-16 sm:py-24 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Community Reviews
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              Loved by Candidates &amp; Engineering Managers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
                  isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 text-black font-extrabold text-xs flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════ 6. FINAL CTA BANNER ══════════════ */}
      <section className="py-16 sm:py-20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black">
            Ready to Elevate Your Technical Hiring &amp; Practice?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of software engineers practicing DSA, compiling code on FlowCode, and booking 1:1 guidance sessions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/candidate"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-black text-sm shadow-2xl hover:brightness-110 transition-all"
            >
              Get Started Now — Candidate Portal
            </Link>
            <Link
              href="/compiler"
              className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 font-extrabold text-sm text-white hover:bg-white/10 transition-all"
            >
              Open FlowCode Compiler
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}