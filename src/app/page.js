"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import { useTheme } from "@/custom_hook/UseTheme";
import {
  Sparkles, ArrowRight, Video as VideoIcon, ShieldCheck, Code2, Play, Users,
  CheckCircle2, Zap, Terminal, Award, Clock, BookOpen, Star, Building2,
  Briefcase, ChevronRight, Check, Send, Mail, RefreshCw, Layers, TrendingUp,
  Cpu, Target, HelpCircle, ExternalLink, SlidersHorizontal, Eye
} from "lucide-react";

// Rupee currency icon component
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

// Key metric counters
const KEY_METRICS = [
  { value: "1,000+", label: "DSA & System Questions", icon: BookOpen, accent: "text-cyan-400" },
  { value: "1 to 10", label: "Granular Skill Ratings", icon: Star, accent: "text-amber-400" },
  { value: "≥ 70%", label: "Direct Hiring Threshold", icon: Target, accent: "text-purple-400" },
  { value: "100%", label: "Direct Recruiter Connections", icon: Building2, accent: "text-emerald-400" },
];

// 4-step end-to-end workflow
const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "1:1 Live Mock Interview",
    desc: "Book sessions with verified senior engineers. Solve real problems on a live Monaco code editor with multi-language execution.",
    icon: VideoIcon,
    tag: "Candidate & Interviewer",
    color: "from-cyan-500 to-blue-500",
  },
  {
    step: "02",
    title: "Granular 1–10 Skill Ratings",
    desc: "After the session, the interviewer grades your specific technical skills out of 10 and provides structured written feedback.",
    icon: Award,
    tag: "Verified Evaluation",
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "03",
    title: "Company Sets Skill Weights",
    desc: "Hiring companies post jobs with custom target ratings for each required skill and choose their minimum match percentage threshold.",
    icon: SlidersHorizontal,
    tag: "Recruiter Portal",
    color: "from-purple-500 to-indigo-500",
  },
  {
    step: "04",
    title: "Direct Recruiter Outreach",
    desc: "Zero manual applications or resume spam. Companies directly email qualifying candidates, who respond inside their portal inbox.",
    icon: Mail,
    tag: "Direct Hiring",
    color: "from-emerald-500 to-teal-500",
  },
];

// Multi-role platform portals
const ROLE_PORTALS = [
  {
    role: "Candidate",
    title: "Engineering Candidates",
    tagline: "Practice, Get Verified & Get Hired Directly",
    bullets: [
      "1:1 mock interviews with live video & Monaco editor",
      "Curated 1,000+ DSA problem bank with testcase runner",
      "Verified skill scorecard with ratings out of 10",
      "Direct company connections inbox without resume spam",
    ],
    cta: "Candidate Portal",
    link: "/dashboard/candidate",
    color: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/30",
    btnColor: "bg-cyan-500 hover:bg-cyan-400 text-black",
  },
  {
    role: "Interviewer",
    title: "Verified Interviewers",
    tagline: "Mentor Talent, Grade Skills & Earn in Rupees",
    bullets: [
      "Set custom availability slots and schedule windows",
      "Instant room generation with Nodemailer alerts",
      "Structured evaluation form with 1–10 skill scoring",
      "Transparent session compensation in Indian Rupees (₹)",
    ],
    cta: "Interviewer Portal",
    link: "/dashboard/interviewer",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    btnColor: "bg-amber-500 hover:bg-amber-400 text-black",
  },
  {
    role: "Company",
    title: "Hiring Companies",
    tagline: "Skip Resume Spam — Connect with Verified Talent",
    bullets: [
      "Post jobs with custom skill markings (1 to 10)",
      "Decide qualifying match percentage threshold (e.g. 70%+)",
      "Instant list of pre-vetted candidates meeting criteria",
      "One-click direct email invitation to candidates",
    ],
    cta: "Company Portal",
    link: "/dashboard/admin",
    color: "from-purple-500/20 to-indigo-500/10",
    border: "border-purple-500/30",
    btnColor: "bg-purple-500 hover:bg-purple-400 text-white",
  },
];

export default function HomePage() {
  const { isDark } = useTheme();

  // Interactive feature showcase active tab
  const [activeTab, setActiveTab] = useState("interview");

  const cardBg = isDark ? "bg-[#080E18] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900";
  const innerBg = isDark ? "bg-[#0B151E] border-white/5" : "bg-slate-50 border-slate-100";

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#04080F] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16 space-y-24">

        {/* 1. HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle gradient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-6 relative z-10 max-w-4xl mx-auto">
            {/* Top ecosystem badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              1:1 Technical Mock Interviews & Direct Skill-Matched Hiring
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Master Technical Interviews. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                Get Verified. Get Recruited Directly.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Book live 1-to-1 mock interviews with verified industry engineers, receive verified ratings out of 10 across technical skills, and let companies directly connect with you based on your verified performance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                href="/dashboard/candidate"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-extrabold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <VideoIcon className="h-4 w-4" /> Start Mock Interview
              </Link>

              <Link
                href="/dashboard/admin"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Building2 className="h-4 w-4" /> Hire Pre-Vetted Talent
              </Link>

              <Link
                href="/compiler"
                className={`px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all flex items-center gap-2 ${
                  isDark ? "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300" : "border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Terminal className="h-4 w-4 text-cyan-400" /> Open Code Runner
              </Link>
            </div>

            {/* Guarantee Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-3">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 1-to-1 Live Video & Monaco Editor
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" /> 1–10 Skill Scorecard
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-purple-400" /> Direct Outreach (Zero Resume Spam)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Indian Rupee (₹) Pricing
              </span>
            </div>
          </div>

          {/* Interactive Hero Product Preview Card */}
          <div className="mt-12 max-w-5xl mx-auto rounded-3xl border border-cyan-500/30 p-2 sm:p-4 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent backdrop-blur-xl shadow-2xl">
            <div className={`rounded-2xl border overflow-hidden ${cardBg} p-5 sm:p-8 space-y-6`}>
              {/* Card top toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold">
                    <VideoIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                      Full-Stack Technical Mock Session • Room: <span className="font-mono text-cyan-300">IF-9281-LIVE</span>
                    </h3>
                    <p className="text-xs text-slate-400">Interviewer: Senior SDE at Tech Unicorn • Candidate: Rahul Sharma</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Session Completed
                  </span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    🎯 88% Company Match
                  </span>
                </div>
              </div>

              {/* Grid: Monaco Code Execution & Verified Skill Marks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Code Editor Preview (7 cols) */}
                <div className={`lg:col-span-7 rounded-xl border p-4 space-y-3 font-mono text-xs ${innerBg}`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Terminal className="h-3.5 w-3.5" /> Solution.cpp • Judge0 Runner
                    </span>
                    <span className="text-emerald-400 font-bold">Status: All 3 Testcases Passed (2ms)</span>
                  </div>
                  <pre className="text-slate-300 leading-relaxed overflow-x-auto text-[11px]">
{`// 1:1 Live Coding in Session Room
vector<int> findMatchingPairs(vector<int>& skills, int targetScore) {
    unordered_map<int, int> lookup;
    for (int i = 0; i < skills.size(); i++) {
        int complement = targetScore - skills[i];
        if (lookup.count(complement)) return {lookup[complement], i};
        lookup[skills[i]] = i;
    }
    return {};
}`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                    <span>Input: [8, 9, 7, 10], Target: 17</span>
                    <span className="font-bold">Output: [1, 0] ✓ Accepted</span>
                  </div>
                </div>

                {/* Right: Post-Interview Feedback & Ratings (5 cols) */}
                <div className={`lg:col-span-5 rounded-xl border p-4 space-y-3 ${innerBg}`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-400" /> Verified Skill Scorecard
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black">
                      4.8 / 5.0 ⭐
                    </span>
                  </div>

                  {/* Skills ratings list */}
                  <div className="space-y-2">
                    {[
                      { skill: "React & Architecture", rating: 9 },
                      { skill: "Data Structures & Algos", rating: 8 },
                      { skill: "System Design & API", rating: 8 },
                      { skill: "Problem Solving Speed", rating: 9 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.skill}</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-[11px] flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                          {item.rating}/10
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Direct hiring match status */}
                  <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1 text-purple-300">
                        <Sparkles className="h-3.5 w-3.5" /> High Match (88% &ge; 70%)
                      </span>
                      <span className="text-[10px] uppercase font-black text-emerald-400">Direct Invite Sent</span>
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-snug">
                      PhonePe directly connected with Rahul for Senior SDE Role with ₹24 - ₹32 LPA package.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PLATFORM METRICS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KEY_METRICS.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border shadow-lg text-center space-y-2 transition-all hover:scale-[1.02] ${cardBg}`}
                >
                  <Icon className={`h-6 w-6 mx-auto ${metric.accent}`} />
                  <p className="text-2xl sm:text-3xl font-black text-white">{metric.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. INTERACTIVE 4-STEP PIPELINE */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              The Modern Hiring Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              How InterviewFlow Works
            </h2>
            <p className="text-sm text-slate-400">
              From live mock interview practice to direct job offers — verified by real engineering evaluations without resume spam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {WORKFLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all ${cardBg}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-500 font-mono">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 uppercase">
                        {item.tag}
                      </span>
                    </div>

                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white font-bold shadow-md">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center text-xs font-bold text-cyan-400">
                    Learn more <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. MULTI-ROLE PORTALS ACCESS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Role-Based Portals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Tailored Workspaces for Every Role
            </h2>
            <p className="text-sm text-slate-400">
              Whether you are an aspiring engineer, verified mentor, or recruiting team, InterviewFlow has a dedicated interface built for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLE_PORTALS.map((portal, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-3xl border shadow-xl flex flex-col justify-between space-y-6 ${cardBg} ${portal.border}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {portal.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">{portal.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{portal.tagline}</p>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {portal.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={portal.link}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${portal.btnColor}`}
                  >
                    Enter {portal.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PRICING & LOCALIZATION (INDIAN RUPEES ₹) */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Transparent Pricing in Indian Rupees
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Simple, Honest Investment
            </h2>
            <p className="text-sm text-slate-400">
              All mock sessions, candidate credits, and recruiter plans are strictly denominated in Indian Rupees (₹).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className={`p-7 rounded-3xl border shadow-xl flex flex-col justify-between space-y-6 ${cardBg}`}>
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-cyan-400">Free Starter</span>
                <div className="flex items-baseline gap-1">
                  <RupeeIcon className="h-6 w-6 text-white" />
                  <span className="text-3xl sm:text-4xl font-black text-white">0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-400">Perfect for exploring curated DSA questions and peer problem-solving.</p>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> 1,000+ Algorithmic Questions</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> In-Browser Judge0 Code Runner</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Submission Tracker &amp; Heatmap</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Public Candidate Profile</li>
                </ul>
              </div>

              <Link
                href="/dashboard/candidate"
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center"
              >
                Start Practicing Free
              </Link>
            </div>

            {/* Pro Mock Tier (Featured) */}
            <div className={`p-7 rounded-3xl border shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden ${cardBg} border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent`}>
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-black uppercase">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-cyan-300">Verified Mock Interview</span>
                <div className="flex items-baseline gap-1">
                  <RupeeIcon className="h-6 w-6 text-cyan-300" />
                  <span className="text-3xl sm:text-4xl font-black text-white">999</span>
                  <span className="text-xs text-slate-400">/ 1:1 session</span>
                </div>
                <p className="text-xs text-slate-300">Full 60-min live session with a verified FAANG/Unicorn interviewer.</p>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> 1:1 Video Call with Senior Engineer</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Live Monaco Collaborative Coding</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Detailed 1–10 Skill Evaluation Form</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Direct 70%+ Company Match Activation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Direct Recruiter Connection Inbox</li>
                </ul>
              </div>

              <Link
                href="/dashboard/candidate"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                Book 1:1 Session Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Enterprise Recruiter Tier */}
            <div className={`p-7 rounded-3xl border shadow-xl flex flex-col justify-between space-y-6 ${cardBg}`}>
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-purple-400">Company Recruiter</span>
                <div className="flex items-baseline gap-1">
                  <RupeeIcon className="h-6 w-6 text-white" />
                  <span className="text-3xl sm:text-4xl font-black text-white">14,999</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">Unlimited direct outreach to candidates scoring &ge; 70% in your required skills.</p>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Post Unlimited Job Vacancies</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Custom Rate Skills (1 to 10 points)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Custom Match Percentage (60%–90%)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Unlimited Direct Candidate Invites</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Zero Agency / Placement Commission</li>
                </ul>
              </div>

              <Link
                href="/dashboard/admin"
                className="w-full py-3 rounded-xl bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center"
              >
                Access Recruiter Portal
              </Link>
            </div>
          </div>
        </section>

        {/* 6. FINAL CALL TO ACTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl border border-cyan-500/30 p-8 sm:p-14 bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-transparent backdrop-blur-xl text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Ready to Accelerate Your Engineering Career?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of software engineers practicing with verified experts and getting directly hired by fast-growing engineering teams.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard/candidate"
                className="px-8 py-3.5 rounded-2xl bg-cyan-500 text-black font-black text-sm hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/25"
              >
                Get Started as Candidate →
              </Link>
              <Link
                href="/dashboard/admin"
                className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                Employer Portal
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}