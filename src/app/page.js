"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Mic, Video as VideoIcon,
  ShieldCheck, Code2, Play, Users, CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 lg:py-16 flex flex-col justify-center gap-16">
        
        {/* Hero 2-Column Section */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Text matching the reference image */}
          <div className="lg:col-span-6 flex flex-col items-start text-left gap-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-bold text-indigo-600 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Technical Interview Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              The fastest way to conduct live,{" "}
              <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                human
              </span>{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                technical interviews
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              Engineers and tech teams, create frictionless 1:1 sessions. Live coding, real-time sync, HD video, and human feedback—all in one integrated workspace. Evaluate real engineers, not AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 px-6 py-3.5 text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Create Account</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-500 border-t border-slate-200/60 w-full">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant 1:1 Rooms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Installation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Code Sync</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Video Call Card (Using Assets Folder Videos) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-sky-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

            {/* Main Video Call Frame */}
            <div className="relative w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-5 flex flex-col gap-4 overflow-hidden">
              
              {/* Call Header Status Bar */}
              <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800 text-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="font-bold tracking-wide text-red-400">LIVE SESSION</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300 font-mono">Room #4092</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2 Participants</span>
                </div>
              </div>

              {/* 2-Video Grid (Man & Women videos from public/assests/videos) */}
              <div className="grid grid-cols-2 gap-3 aspect-[16/10] w-full">
                
                {/* Video 1: Man */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-md">
                  <video
                    src="/assests/videos/man.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Badge */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-semibold">
                    <span className="truncate">Interviewer (Senior Lead)</span>
                    <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                </div>

                {/* Video 2: Woman */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-md">
                  <video
                    src="/assests/videos/women.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Badge */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-semibold">
                    <span className="truncate">Candidate (Software Engineer)</span>
                    <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                </div>

              </div>

              {/* Live Code Preview Floating Bar */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-slate-400">Code Syncing:</span>
                  <span className="text-emerald-400 font-semibold truncate">
                    const [user, setUser] = useState()
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Active
                </span>
              </div>

              {/* Call Control Buttons */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 cursor-pointer">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 cursor-pointer">
                  <VideoIcon className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer shadow-lg shadow-red-500/20">
                  <Play className="w-4 h-4 rotate-90 fill-current" />
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full pt-4 text-left">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Live Coding Workspace</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-language collaborative code editor with real-time cursor sync and syntax highlighting.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <VideoIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">HD Video 1:1 Calls</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Low-latency video &amp; audio built directly into the interview room interface.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Human-Driven Evaluation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assess real engineering skills, problem solving, and team communication in 1:1 human sessions.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}