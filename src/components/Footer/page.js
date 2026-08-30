"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2, Terminal, Video, BookOpen, Compass, ShieldCheck,
  Mail, Sparkles, Check, ArrowRight, MapPin, Globe, Award,
  Cpu, Users, Building2, CheckCircle2, Lock
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function Footer() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem("interviewflow_session");
      if (session) {
        setIsLoggedIn(true);
      }
    } catch (e) {}
  }, []);

  if (isLoggedIn) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 4000);
    }
  };

  const footerBg = isDark
    ? "bg-[#070D15] border-cyan-500/20 text-white"
    : "bg-slate-900 border-slate-800 text-slate-100";

  const cardBg = isDark
    ? "bg-[#0E1B27] border-cyan-500/20 shadow-2xl"
    : "bg-slate-800/90 border-slate-700 shadow-xl";

  const inputBg = isDark
    ? "bg-[#070D15] border-cyan-500/30 text-white placeholder-slate-500 focus:border-cyan-400"
    : "bg-slate-950 border-slate-700 text-white placeholder-slate-400 focus:border-cyan-400";

  return (
    <footer className={`w-full border-t pt-16 pb-10 relative overflow-hidden font-sans z-10 ${footerBg}`}>
      {/* Ambient Radial Glow Background Effects */}
      <div className="pointer-events-none absolute bottom-0 left-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[140px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-14 relative z-10">
        
        {/* ══════════════ 1. NEWSLETTER BANNER ══════════════ */}
        <div className={`rounded-3xl border p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden ${cardBg}`}>
          <div className="flex flex-col gap-2 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-black text-cyan-300 w-fit mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>INTERVIEWFLOW INSIGHTS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Engineering Hiring &amp; DSA Insights
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Subscribe to receive weekly live coding strategies, System Design patterns, and top tech interview trends.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto items-center gap-2 max-w-md">
            {subscribed ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold w-full text-center justify-center animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! You are subscribed.</span>
              </div>
            ) : (
              <>
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className={`w-full rounded-full pl-10 pr-4 py-3 text-xs outline-none transition-colors font-medium ${inputBg}`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] px-6 py-3 text-xs font-black shadow-lg shadow-cyan-500/20 transition-all shrink-0 active:scale-95 cursor-pointer"
                >
                  Subscribe
                </button>
              </>
            )}
          </form>
        </div>

        {/* ══════════════ 2. NAVIGATION & FEATURE COLUMNS ══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info & Security Badges */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl p-[2px] bg-gradient-to-tr from-amber-400 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[14px] bg-[#0B151E] flex items-center justify-center font-extrabold text-xs text-white">
                  <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">iF</span>
                </div>
              </div>
              <span className="text-xl font-black text-white tracking-tight font-sans">
                Interview<span className="text-cyan-400">Flow</span>
              </span>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              The all-in-one technical hiring and practice platform. Execute multi-language code on FlowCode sandbox, solve 1,000+ DSA problems, conduct live 1:1 coding rounds, and book mentorship with top tech leads.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Made with ❤️ in India (Bengaluru • Gurugram • Pune)</span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>SOC-2 Type II Certified &amp; ISO 27001 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>End-to-End Anti-Cheat &amp; Code Privacy</span>
              </div>
            </div>
          </div>

          {/* Column 1: Core Platform Features */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Platform Features
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-bold">
              <li>
                <Link href="/compiler" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-cyan-400" /> FlowCode Compiler
                </Link>
              </li>
              <li>
                <Link href="/dashboard/candidate" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-cyan-400" /> 1,000+ DSA Problem Bank
                </Link>
              </li>
              <li>
                <Link href="/dashboard/candidate" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-cyan-400" /> 1:1 Live Interview Rooms
                </Link>
              </li>
              <li>
                <Link href="/dashboard/candidate" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-cyan-400" /> 1:1 Guidance &amp; Mentorship
                </Link>
              </li>
              <li>
                <Link href="/compiler" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-cyan-400" /> 8+ Language Sandbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Role Dashboards */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Role Portals
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-bold">
              <li>
                <Link href="/dashboard/candidate" className="hover:text-teal-300 transition-colors">
                  Candidate Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/interviewer" className="hover:text-teal-300 transition-colors">
                  Interviewer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-teal-300 transition-colors">
                  Company &amp; Recruiter Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/super-admin" className="hover:text-teal-300 transition-colors">
                  Super Admin Management
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-teal-300 transition-colors">
                  My Profile &amp; Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Company &amp; Support
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-bold">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors">
                  Home &amp; Overview
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-amber-300 transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-300 transition-colors">
                  Sign In to Account
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-300 transition-colors">
                  Register Candidate / Company
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-amber-300 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ══════════════ 3. BOTTOM BAR & SOCIAL LINKS ══════════════ */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-medium text-center sm:text-left">
            © {new Date().getFullYear()} InterviewFlow Inc. All rights reserved. Built with Next.js &amp; Tailwind CSS.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
              aria-label="GitHub"
              title="GitHub Repository"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
              aria-label="LinkedIn"
              title="LinkedIn Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Twitter"
              title="Twitter Handle"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
              aria-label="YouTube"
              title="YouTube Channel"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
