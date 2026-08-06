"use client";

import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Heart,
  MapPin,
  Mail,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#070D15] border-t border-cyan-500/20 text-white pt-16 pb-10 relative overflow-hidden font-sans z-10">
      return (
      <footer className="w-full bg-[#070D15] border-t border-cyan-500/20 text-white pt-16 pb-10 relative overflow-hidden font-sans z-10">
        <div className="pointer-events-none absolute bottom-0 left-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[140px]" />

        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-14">
          <div className="rounded-3xl bg-[#0E1B27] border border-cyan-500/20 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col gap-2 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-bold text-cyan-300 w-fit mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>STAY UPDATED</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Get Engineering Hiring Insights
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Subscribe to our monthly newsletter for live coding best
                practices, system design questions, and hiring trends in India.
              </p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full sm:w-auto items-center gap-2 max-w-md"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full bg-[#070D15] border border-cyan-500/30 rounded-full pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] px-6 py-3 text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all shrink-0 active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 flex flex-col items-start gap-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <div className="w-full h-full rounded-full bg-[#0B151E] flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin-slow" />
                  </div>
                </div>
                <span className="text-xl font-black text-white tracking-tight font-sans">
                  Interview<span className="text-cyan-400">Flow</span>
                </span>
              </Link>

              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                The real-time 1:1 technical interview workspace built for
                software engineers, tech leads, and modern hiring teams across
                India. Evaluate real skills with zero friction.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Made with ❤️ in India (Bengaluru • Gurugram • Pune)</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>SOC-2 Type II Certified &amp; ISO 27001 Compliant</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400">
                Product
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium">
                <li>
                  <Link
                    href="/#features"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    1:1 Live Interview Room
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Practice Question Bank
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    1:1 Expert Guidance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#why"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Sub-50ms Code Compiler
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#why"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    System Design Whiteboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#why"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Anti-Cheat Security
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-teal-400">
                Solutions
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium">
                <li>
                  <Link
                    href="/#solutions"
                    className="hover:text-teal-300 transition-colors"
                  >
                    Indian Tech Startups
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#solutions"
                    className="hover:text-teal-300 transition-colors"
                  >
                    IT Services &amp; GCCs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#solutions"
                    className="hover:text-teal-300 transition-colors"
                  >
                    EdTech &amp; Bootcamps
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#solutions"
                    className="hover:text-teal-300 transition-colors"
                  >
                    Staffing &amp; Agencies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-teal-300 transition-colors"
                  >
                    MERN Stack Hiring
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-teal-300 transition-colors"
                  >
                    Java &amp; Python Assessment
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400">
                Company
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium">
                <li>
                  <Link
                    href="/"
                    className="hover:text-amber-300 transition-colors"
                  >
                    About InterviewFlow
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#testimonials"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Customer Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Careers (We&apos;re Hiring!)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} InterviewFlow Inc. All rights
              reserved.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all"
                aria-label="GitHub"
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
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </footer>
  );
}
