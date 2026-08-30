"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header/page";
import { Monitor, Settings, Video, Shield, BarChart3, Users2, Search, LayoutDashboard, Users, Bell, FileText, HelpCircle, PhoneOff, Mic, ChevronDown } from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

function Chip({ icon, label, isDark }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl shadow-xl px-3.5 py-2 whitespace-nowrap transition-all duration-300 hover:scale-105 backdrop-blur-md ${
        isDark
          ? "bg-[#111C28]/95 border border-cyan-500/30 text-white shadow-cyan-950/40"
          : "bg-white/95 border border-slate-100/90 text-slate-800 shadow-indigo-100/40"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
          isDark
            ? "bg-cyan-500/20 border border-cyan-400/30 text-cyan-300"
            : "bg-indigo-50 border border-indigo-100 text-indigo-600"
        }`}
      >
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-bold tracking-tight">{label}</span>
    </div>
  );
}

function Gauge({ value = 68, isDark }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const trackArc = circ * 0.75;
  const filled = trackArc * (value / 100);

  return (
    <svg viewBox="0 0 44 44" className="w-14 h-14">
      <circle cx="22" cy="22" r={r} fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="4"
        strokeDasharray={`${trackArc} ${circ - trackArc}`} strokeLinecap="round"
        style={{ transform: "rotate(135deg)", transformOrigin: "22px 22px" }} />
      <circle cx="22" cy="22" r={r} fill="none" stroke={`url(#gaugeG_${isDark ? "dark" : "light"})`} strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ transform: "rotate(135deg)", transformOrigin: "22px 22px" }} />
      <defs>
        <linearGradient id={`gaugeG_${isDark ? "dark" : "light"}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isDark ? "#38bdf8" : "#06b6d4"} />
          <stop offset="100%" stopColor={isDark ? "#2dd4bf" : "#6366f1"} />
        </linearGradient>
      </defs>
      <text x="22" y="26" textAnchor="middle" className={isDark ? "fill-white font-black" : "fill-slate-900 font-black"}
        style={{ fontSize: 10, fontWeight: 900, fontFamily: "sans-serif" }}>
        {value}
      </text>
    </svg>
  );
}

function DashboardMockup({ isDark }) {
  const codeLines = [
    { n: 1,  text: "import { scale, device } from 'keep';", c: "#89b4fa" },
    { n: 2,  text: "import Stock from 'keep.statices';",   c: "#a6e3a1" },
    { n: 3,  text: "",                                    c: "" },
    { n: 4,  text: "export {",                            c: "#cba6f7" },
    { n: 5,  text: "  const { scale, devices } = useScale();", c: "#f9e2af" },
    { n: 6,  text: "};",                                  c: "#cba6f7" },
    { n: 7,  text: "",                                    c: "" },
    { n: 8,  text: "const runCode = () => {",             c: "#89b4fa" },
    { n: 9,  text: "  const resources = simulate.createRun();", c: "#89dceb", hl: true },
    { n: 10, text: "};",                                  c: "#cdd6f4" },
    { n: 11, text: "",                                    c: "" },
    { n: 12, text: "return path;",                        c: "#f9e2af" },
    { n: 13, text: "",                                    c: "" },
    { n: 14, text: "export function () {",                c: "#a6e3a1" },
    { n: 15, text: "  return simulate.create();",         c: "#89b4fa" },
    { n: 16, text: "};",                                  c: "#cdd6f4" },
  ];

  const candidates = [
    { name: "Moschino Tosatiny", desc: "Connected load and score file data", color: isDark ? "bg-cyan-500" : "bg-indigo-600" },
    { name: "Yannne Daisey",     desc: "Reasonable and be already",           color: isDark ? "bg-teal-500" : "bg-purple-600" },
    { name: "Hansen Davidoga",   desc: "Lead acceleration 24x weeks",         color: isDark ? "bg-sky-500" : "bg-blue-600" },
  ];

  const library = [
    { name: "Desros Evaluation", handle: "@azahriqure",  lib: "Coding Question Library", date: "Apr 30, 2023", status: "Reviewing", stBg: "bg-rose-500/15 text-rose-500 border-rose-500/30" },
    { name: "Desros Evaluation", handle: "@azahriqure",  lib: "Coding Question Library", date: "Apr 30, 2023", status: "Reviewing", stBg: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
    { name: "Fenn Collaboration", handle: "@lazocqueen",  lib: "Coding Devero library",   date: "Apr 30, 2023", status: "Reviewing", stBg: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  ];

  const calendarDays = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null],
  ];

  return (
    <div className={`w-full rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${
      isDark
        ? "bg-[#111C28] border border-cyan-500/25 shadow-cyan-950/70"
        : "bg-white border border-slate-200/70 shadow-indigo-200/40"
    }`}>
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${
        isDark ? "bg-[#080E18] border-white/10" : "bg-white border-slate-100"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-lg font-black text-[9px] ${
            isDark ? "bg-gradient-to-tr from-sky-400 to-teal-400 text-[#0B151E]" : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
          }`}>iF</div>
          <span className={`text-[10px] font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>InterviewFlow</span>
          <span className="text-[9px] text-slate-400 mx-1">|</span>
          <span className={`text-[9.5px] font-bold ${isDark ? "text-cyan-300" : "text-slate-700"}`}>Dashboard</span>
        </div>

        {/* Search Bar */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[8px] min-w-[170px] ${
          isDark ? "bg-[#060913] border-white/10 text-slate-400" : "bg-slate-50 border-slate-200/80 text-slate-400"
        }`}>
          <Search className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          <span>Search...</span>
        </div>

        {/* Right User & Notification Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </div>
          <div className="w-5 h-5 rounded-full overflow-hidden border border-indigo-400">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="flex" style={{ minHeight: 0 }}>
        {/* Left Navigation Sidebar */}
        <div className={`w-[85px] border-r py-2 px-1.5 shrink-0 flex flex-col justify-between ${
          isDark ? "bg-[#0A0F1A] border-white/10" : "bg-slate-50/70 border-slate-100"
        }`}>
          <div className="flex flex-col gap-0.5">
            <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 mb-1 ${
              isDark ? "bg-cyan-500/20 border border-cyan-400/30 text-cyan-300" : "bg-indigo-600 text-white shadow-xs"
            }`}>
              <LayoutDashboard className="w-2.5 h-2.5 shrink-0" />
              <span className="text-[7.5px] font-extrabold truncate">Dashboard</span>
            </div>

            {[
              { label: "Candidates", icon: Users },
              { label: "Question Bank", icon: FileText },
              { label: "Interviews", icon: Video },
              { label: "Feedbacks", icon: HelpCircle },
              { label: "Analytics", icon: BarChart3 },
              { label: "Settings", icon: Settings, badge: "01" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between px-2 py-[3.5px] rounded-md ${
                isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-200/50 text-slate-600"
              }`}>
                <div className="flex items-center gap-1.5 truncate">
                  <item.icon className="w-2.5 h-2.5 shrink-0" />
                  <span className="text-[7px] font-medium truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[5.5px] font-bold bg-indigo-500 text-white px-1 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar Bottom User Profile */}
          <div className={`flex items-center gap-1 p-1 rounded-lg border ${
            isDark ? "bg-[#060913] border-white/10" : "bg-white border-slate-200/60"
          }`}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Team"
              className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className={`text-[6px] font-bold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>Team Collab</div>
              <div className="text-[5px] text-slate-400 truncate">@hostname</div>
            </div>
          </div>
        </div>

        {/* Center Main Dashboard Canvas */}
        <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? "bg-[#111C28]" : "bg-slate-50/40"}`}>
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ROW 1: Live Coding IDE | AI Evaluation Score | Video Interview */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className={`flex border-b ${isDark ? "border-white/10" : "border-slate-100"}`} style={{ height: 145 }}>
            {/* Live Coding IDE */}
            <div className={`flex-1 flex flex-col border-r overflow-hidden ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div className={`flex items-center justify-between px-2.5 py-1 border-b shrink-0 ${
                isDark ? "bg-[#0A0F1A] border-white/10" : "bg-white border-slate-100"
              }`}>
                <span className={`text-[8.5px] font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Live Coding IDE</span>
                <span className="text-[6px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">● LiveMode</span>
              </div>
              <div className="flex-1 overflow-hidden p-2" style={{ background: isDark ? "#060913" : "#181825" }}>
                {codeLines.slice(0, 10).map((line) => (
                  <div
                    key={line.n}
                    className={`flex items-center gap-2 leading-none py-[1px] px-1 rounded ${
                      line.hl ? (isDark ? "bg-cyan-500/15" : "bg-indigo-500/20") : ""
                    }`}
                  >
                    <span style={{ fontSize: 6, color: "#6c7086", minWidth: 12, textAlign: "right" }}>{line.n}</span>
                    <span style={{ fontSize: 7, fontFamily: "monospace", color: line.c || "#cdd6f4", whiteSpace: "nowrap" }}>
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Evaluation Score */}
            <div className={`flex flex-col border-r overflow-hidden ${isDark ? "bg-[#0A0F1A] border-white/10" : "bg-white border-slate-100"}`} style={{ width: 120 }}>
              <div className={`flex items-center justify-between px-2 py-1 border-b shrink-0 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <span className={`text-[7.5px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>AI Evaluation Score</span>
                <div className={`w-2.5 h-2.5 rounded-full border ${isDark ? "border-slate-700" : "border-slate-300"}`} />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-1 gap-1">
                <Gauge value={68} isDark={isDark} />
                <div className="flex items-center gap-2 text-[6px]">
                  <span className="text-blue-500 font-bold">■ AI Feedback</span>
                  <span className="text-emerald-500 font-bold">● 0 5 Feedback</span>
                </div>
              </div>
            </div>

            {/* Video Interview */}
            <div className={`flex flex-col overflow-hidden ${isDark ? "bg-[#0A0F1A]" : "bg-white"}`} style={{ width: 135 }}>
              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 text-white shrink-0">
                <span className="text-[7.5px] font-bold">Video Interview</span>
                <span className="text-[8px] text-slate-400 cursor-pointer">✕</span>
              </div>
              <div className="flex-1 relative overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                  alt="Candidate Video"
                  className="w-full h-full object-cover"
                />
                {/* Floating Video Control Buttons */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs">
                  <div className="w-3 h-3 rounded-full bg-slate-700 flex items-center justify-center">
                    <Mic className="w-1.5 h-1.5 text-white" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-slate-700 flex items-center justify-center">
                    <Video className="w-1.5 h-1.5 text-white" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-rose-600 flex items-center justify-center">
                    <PhoneOff className="w-1.5 h-1.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ROW 2: Candidate Timeline | Analytics Charts */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className={`flex border-b ${isDark ? "border-white/10" : "border-slate-100"}`} style={{ height: 105 }}>
            {/* Candidate Timeline */}
            <div className={`flex-1 border-r p-2 overflow-hidden ${isDark ? "border-white/10 bg-[#0A0F1A]" : "border-slate-100 bg-white"}`}>
              <div className={`text-[8px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Candidate Timeline</div>
              {candidates.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 mb-1.5">
                  <div className={`w-4 h-4 rounded-full ${c.color} flex items-center justify-center shrink-0 shadow-xs`}>
                    <span style={{ fontSize: 6.5, fontWeight: 800, color: "white" }}>{c.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className={`font-bold leading-none mb-0.5 truncate ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ fontSize: 7.5 }}>{c.name}</div>
                    <div className="text-slate-400 leading-none truncate" style={{ fontSize: 6 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Charts */}
            <div className={`p-2 overflow-hidden ${isDark ? "bg-[#0A0F1A]" : "bg-white"}`} style={{ width: 155 }}>
              <div className={`text-[8px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Analytics Charts</div>
              <div className="flex items-end gap-1.5 px-1" style={{ height: 52 }}>
                {[
                  { m: "Jan", h: 45, c: isDark ? "#38bdf8" : "#6366f1" },
                  { m: "Feb", h: 70, c: isDark ? "#2dd4bf" : "#a855f7" },
                  { m: "Mar", h: 30, c: isDark ? "#818cf8" : "#3b82f6" },
                  { m: "Apr", h: 85, c: isDark ? "#38bdf8" : "#6366f1" },
                  { m: "May", h: 55, c: isDark ? "#2dd4bf" : "#a855f7" },
                  { m: "Jun", h: 65, c: isDark ? "#818cf8" : "#3b82f6" },
                  { m: "Jul", h: 42, c: isDark ? "#38bdf8" : "#6366f1" },
                ].map((bar) => (
                  <div key={bar.m} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                    <div className="w-full rounded-t" style={{ height: `${bar.h}%`, background: bar.c }} />
                    <span className="text-[5px] text-slate-400 font-semibold">{bar.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ROW 3: Coding Question Library | Interview Calendar */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className="flex" style={{ height: 105 }}>
            {/* Coding Question Library */}
            <div className={`flex-1 border-r p-2 overflow-hidden ${isDark ? "border-white/10 bg-[#0A0F1A]" : "border-slate-100 bg-white"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Coding Question Library</span>
                <span className="text-[5.5px] text-slate-400 flex items-center gap-0.5 cursor-pointer">Filter by <ChevronDown className="w-1.5 h-1.5" /></span>
              </div>
              <div className="space-y-1">
                {library.map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-1 py-0.5 border-b border-slate-100/50 last:border-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src={i === 0 ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"}
                        alt="User"
                        className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className={`font-bold leading-none ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ fontSize: 6.5 }}>{row.name}</div>
                        <div className="text-slate-400 leading-none" style={{ fontSize: 5.5 }}>{row.handle}</div>
                      </div>
                    </div>
                    <span className={`text-[5.5px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${row.stBg}`}>
                      ★ {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Calendar */}
            <div className={`p-2 overflow-hidden shrink-0 ${isDark ? "bg-[#0A0F1A]" : "bg-white"}`} style={{ width: 155 }}>
              <div className={`text-[8px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Interview Calendar</div>
              <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <span key={d} className="text-center font-bold text-slate-400" style={{ fontSize: 5.5 }}>{d}</span>
                ))}
              </div>
              {calendarDays.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {week.map((day, di) => (
                    <div key={di}
                      className={`flex items-center justify-center rounded-full aspect-square ${
                        day === 8 ? (isDark ? "bg-cyan-500 text-[#0B151E] font-bold" : "bg-indigo-600 text-white font-bold") : day ? (isDark ? "text-slate-400" : "text-slate-600") : ""
                      }`}
                      style={{ fontSize: 6.5 }}>
                      {day || ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplashCursor() {
  useEffect(() => {
    const canvas = document.getElementById("splash-cursor-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let ripples = [];
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = [
      "rgba(167, 139, 250, ",
      "rgba(129, 140, 248, ",
      "rgba(192, 132, 252, ",
      "rgba(147, 197, 253, ",
    ];

    let lastX = 0;
    let lastY = 0;

    const addSplash = (x, y, isClick = false) => {
      const count = isClick ? 3 : 1;
      for (let i = 0; i < count; i++) {
        ripples.push({
          x,
          y,
          radius: isClick ? 6 : 3,
          maxRadius: isClick ? 42 + i * 14 : 20,
          speed: isClick ? 2.2 : 1.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: isClick ? 0.45 : 0.25,
        });
      }

      const pCount = isClick ? 10 : 2;
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = isClick ? Math.random() * 3.5 + 1 : Math.random() * 1.2 + 0.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          radius: Math.random() * (isClick ? 3.5 : 2) + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: isClick ? 0.55 : 0.3,
          decay: Math.random() * 0.025 + 0.015,
        });
      }
    };

    const handleMouseMove = (e) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 10) {
        addSplash(e.clientX, e.clientY, false);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const handleClick = (e) => {
      addSplash(e.clientX, e.clientY, true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color + r.alpha + ")";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="splash-cursor-canvas"
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}

export default function AuthLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden flex flex-col font-sans relative transition-colors duration-300 ${
        isDark
          ? "bg-[#0B151E] text-white"
          : "bg-gradient-to-br from-[#ede9fe] via-[#e4e0fd] to-[#e8e3ff] text-slate-900"
      }`}
    >
      {/* Top Header Bar */}
      <Header />

      {/* Main Layout Body */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row relative pt-20 sm:pt-24 pb-4 lg:pb-3 px-3 sm:px-6 lg:px-0 gap-6 lg:gap-0">
        {/* Splash Cursor */}
        <SplashCursor />

        {/* Floating Ambient Glows */}
        {isDark && (
          <>
            <div className="pointer-events-none absolute top-10 left-10 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[150px]" />
            <div className="pointer-events-none absolute bottom-10 right-1/3 w-[550px] h-[550px] bg-teal-500/15 rounded-full blur-[160px]" />
          </>
        )}

        {/* Left hero & mockups (Visible on Desktop / Laptop lg+) */}
        <div className="hidden lg:flex flex-1 min-w-0 flex-col px-4 lg:px-6 xl:px-10 py-2 overflow-hidden justify-between">
          <div className="shrink-0 mb-3 text-left">
            <h1 className={`text-3xl lg:text-4xl xl:text-[45px] font-black leading-[1.12] mb-2 tracking-tight font-sans ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              The smarter way to conduct
              <br />
              <span className={isDark ? "bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent" : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent"}>
                technical interviews
              </span>
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed max-w-xl font-sans ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              Conduct live coding interviews, collaborate in real time, evaluate candidates
              with AI, and hire top developers—all from one platform.
            </p>
          </div>

          <div className="flex-1 min-h-0 relative my-auto">
            {/* 3D Organic Blobs behind mockup */}
            <div className="pointer-events-none absolute -top-4 -right-4 w-28 h-28 bg-gradient-to-br from-purple-400/25 to-indigo-500/25 rounded-3xl blur-md rotate-12" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-blue-400/25 to-indigo-500/25 rounded-full blur-md" />

            <div className="absolute z-1 flex items-center justify-center inset-0" style={{ left: 55, right: 75 }}>
              <DashboardMockup isDark={isDark} />
            </div>

            <div className="absolute z-10 animate-float-1" style={{ left: 0, top: "8%" }}>
              <Chip icon={<Monitor className={`h-5 w-5 ${isDark ? "text-cyan-400" : "text-indigo-600"}`} />} label="Live Coding" isDark={isDark} />
            </div>
            <div className="absolute z-10 animate-float-2" style={{ left: 0, top: "42%" }}>
              <Chip icon={<Settings className={`h-5 w-5 ${isDark ? "text-cyan-300" : "text-purple-600"}`} />} label="AI Feedback" isDark={isDark} />
            </div>
            <div className="absolute z-10 animate-float-3" style={{ left: 0, top: "72%" }}>
              <Chip icon={<Video className={`h-5 w-5 ${isDark ? "text-teal-400" : "text-blue-600"}`} />} label="Video Interview" isDark={isDark} />
            </div>

            <div className="absolute z-10 animate-float-4" style={{ right: 0, top: "18%" }}>
              <Chip icon={<Shield className={`h-5 w-5 ${isDark ? "text-cyan-400" : "text-indigo-600"}`} />} label="Enterprise Security" isDark={isDark} />
            </div>
            <div className="absolute z-10 animate-float-5" style={{ right: 0, top: "48%" }}>
              <Chip icon={<BarChart3 className={`h-5 w-5 ${isDark ? "text-sky-400" : "text-indigo-600"}`} />} label="Analytics" isDark={isDark} />
            </div>
            <div className="absolute z-10 animate-float-6" style={{ right: 0, top: "76%" }}>
              <Chip icon={<Users2 className={`h-5 w-5 ${isDark ? "text-teal-300" : "text-purple-600"}`} />} label="Real-Time Collaboration" isDark={isDark} />
            </div>
          </div>

          {/* Bottom Trust Section */}
          <div className="shrink-0 pt-2 pb-1 text-center text-xs font-semibold text-slate-500 tracking-tight">
            Trusted by Google, Microsoft, Amazon, Adobe, Meta, Stripe
          </div>
        </div>

        {/* Right Auth Card Slot (Responsive across all screens) */}
        <div className="w-full max-w-md lg:max-w-none lg:w-[480px] xl:w-[510px] 2xl:w-[540px] shrink-0 flex flex-col h-full mx-auto lg:mx-0 p-1 sm:p-2.5 lg:p-3 overflow-hidden">
          <div className={`w-full h-full flex flex-col justify-between rounded-3xl p-4 sm:p-6 overflow-y-auto transition-all duration-300 ${
            isDark
              ? "bg-[#111C28] border border-cyan-500/25 shadow-2xl shadow-cyan-950/60 text-white"
              : "bg-white border border-slate-100/60 shadow-2xl shadow-indigo-200/30 text-slate-900"
          }`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}