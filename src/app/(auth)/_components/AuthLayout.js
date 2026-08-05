"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Monitor, Settings, Video, Shield, BarChart3, Users2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CHIP  (left / right of mockup)
// ─────────────────────────────────────────────────────────────────────────────
function Chip({ icon, label }) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-slate-100/80 whitespace-nowrap transition-transform duration-200 hover:scale-105">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAUGE — circular arc with "68" in centre, matching the reference
// ─────────────────────────────────────────────────────────────────────────────
function Gauge({ value = 68 }) {
  const r = 18;
  const circ = 2 * Math.PI * r;          // ≈ 113.1
  const trackArc = circ * 0.75;          // 270° track
  const filled = trackArc * (value / 100); // value% of track

  return (
    <svg viewBox="0 0 44 44" className="w-14 h-14">
      {/* background track */}
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4"
        strokeDasharray={`${trackArc} ${circ - trackArc}`} strokeLinecap="round"
        style={{ transform: "rotate(135deg)", transformOrigin: "22px 22px" }} />
      {/* progress */}
      <circle cx="22" cy="22" r={r} fill="none" stroke="url(#gaugeG)" strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ transform: "rotate(135deg)", transformOrigin: "22px 22px" }} />
      <defs>
        <linearGradient id="gaugeG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <text x="22" y="26" textAnchor="middle" className="fill-slate-800 font-extrabold"
        style={{ fontSize: 10, fontWeight: 800, fontFamily: "sans-serif" }}>
        {value}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MOCKUP
// ─────────────────────────────────────────────────────────────────────────────
function DashboardMockup() {
  const codeLines = [
    { n: 1,  text: "export { tests, tsomeo, { eslice }",  c: "#89b4fa" },
    { n: 2,  text: "import Stock from 'keep.statices'",   c: "#a6e3a1" },
    { n: 3,  text: "",                                    c: "" },
    { n: 4,  text: "const analysis = createAnalysis = {}", c: "#f9e2af" },
    { n: 5,  text: "  istefuted.interpret{",              c: "#cba6f7" },
    { n: 6,  text: "",                                    c: "" },
    { n: 7,  text: "const resources = () => {",           c: "#89b4fa" },
    { n: 8,  text: "  const results = {};",               c: "#cdd6f4" },
    { n: 9,  text: "}",                                   c: "#cdd6f4" },
    { n: 10, text: "expost.resources = () => {",          c: "#f9e2af" },
    { n: 11, text: "  createFunctions('score',",          c: "#a6e3a1" },
    { n: 12, text: "  createFunctions('reset',",          c: "#a6e3a1" },
    { n: 13, text: "}",                                   c: "#cdd6f4" },
    { n: 14, text: "return path",                         c: "#89b4fa" },
  ];

  const candidates = [
    { name: "Moschino Tosatiny", desc: "Connected load have the sets",   color: "bg-indigo-300" },
    { name: "Yannne Daisey",     desc: "Reasonable and be already",       color: "bg-purple-300" },
    { name: "Hansen Davidoga",   desc: "Lead acceleration 24x weeks",     color: "bg-blue-300" },
  ];

  const library = [
    { name: "Reawon Davidson",    handle: "@azahriqure",  lib: "Coding Question Library", date: "Apr 30, 2023" },
    { name: "Reawon Davidson",    handle: "@azahriqure",  lib: "Coding Questionlibry",    date: "Apr 30, 2023" },
    { name: "Team Collaboration", handle: "@lazocqueen",  lib: "Coding Devero library",   date: "Apr 30, 2023" },
  ];

  const calendarDays = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, null, null],
  ];

  return (
    <div className="w-full rounded-2xl bg-white shadow-2xl border border-slate-200/50 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-[7px]">iF</div>
          <span className="text-[9px] font-bold text-slate-700">InterviewFlow</span>
          <span className="text-[9px] text-slate-400 mx-1">|</span>
          <span className="text-[9px] font-semibold text-slate-600">Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 rounded-full px-2 py-0.5 gap-1">
            <svg className="h-2 w-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <div className="h-1.5 w-14 bg-slate-200 rounded-full" />
          </div>
          <div className="h-4 w-4 rounded-full border border-slate-200 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-red-400" />
          </div>
          <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400" />
        </div>
      </div>

      {/* Body */}
      <div className="flex" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <div className="w-[76px] bg-white border-r border-slate-100 py-2 px-1.5 shrink-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 bg-indigo-600 rounded-lg px-1.5 py-1 mb-1">
            <div className="w-2 h-2 rounded-sm bg-white/80 shrink-0" />
            <span className="text-[6.5px] font-bold text-white truncate">Dashboard</span>
          </div>
          {["lta", "Candidates", "Interviews", "Forctings", "Analytics"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 px-1.5 py-[3px]">
              <div className="w-2 h-2 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6.5px] text-slate-500 truncate">{item}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-1.5 py-[3px] mt-auto">
            <div className="w-2 h-2 rounded-sm bg-slate-200 shrink-0" />
            <span className="text-[6.5px] text-slate-500">Settings</span>
            <span className="ml-auto text-[5px] bg-indigo-600 text-white rounded-full px-1 leading-tight">20</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-slate-50/30 flex flex-col overflow-hidden">
          {/* ROW 1: IDE | AI Score | Video */}
          <div className="flex border-b border-slate-100" style={{ height: 105 }}>
            {/* Live Coding IDE */}
            <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1 bg-white border-b border-slate-100 shrink-0">
                <span className="text-[7px] font-bold text-slate-700">Live Coding IDE</span>
                <span className="text-[5.5px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">● LiveMode</span>
              </div>
              <div className="flex-1 overflow-hidden p-1.5" style={{ background: "#1e1e2e" }}>
                {codeLines.map((line) => (
                  <div key={line.n} className="flex items-center gap-1.5 leading-none" style={{ marginBottom: 1.5 }}>
                    <span style={{ fontSize: 5.5, color: "#45475a", minWidth: 10, textAlign: "right" }}>{line.n}</span>
                    <span style={{ fontSize: 6, fontFamily: "monospace", color: line.c || "#45475a", whiteSpace: "nowrap" }}>
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Evaluation Score */}
            <div className="flex flex-col border-r border-slate-100 bg-white overflow-hidden" style={{ width: 92 }}>
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 shrink-0">
                <span className="text-[6.5px] font-bold text-slate-700 leading-tight">AI Evaluation<br/>Score</span>
                <div className="w-2.5 h-2.5 rounded-full border border-slate-200" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-1 gap-1">
                <Gauge value={68} />
                <div className="text-center">
                  <div className="text-[6px] font-semibold text-slate-600">AI Feedback</div>
                  <div className="text-[5.5px] text-slate-400">● 0 5 Feedback</div>
                </div>
              </div>
            </div>

            {/* Video Interview */}
            <div className="flex flex-col bg-white overflow-hidden" style={{ width: 100 }}>
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 shrink-0">
                <span className="text-[7px] font-bold text-slate-700">Video Interview</span>
                <div className="w-3 h-3 rounded-full bg-red-400 flex items-center justify-center">
                  <span style={{ fontSize: 5, color: "white" }}>✕</span>
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden" style={{ background: "#334155" }}>
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 rounded-t-full" style={{ background: "#d4a574" }} />
                  <div className="absolute w-9 h-9 rounded-full bottom-6 left-1/2 -translate-x-1/2" style={{ background: "#c8956c" }} />
                  <div className="absolute w-9 h-5 rounded-t-full bottom-11 left-1/2 -translate-x-1/2" style={{ background: "#2d1b0e" }} />
                </div>
                <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-1.5">
                  {[{ c: "#ffffff30" }, { c: "#ef4444" }, { c: "#ffffff30" }].map((b, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: b.c }}>
                      <div className="w-1 h-1 rounded-full bg-white/80" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Candidate Timeline | Analytics Charts */}
          <div className="flex border-b border-slate-100" style={{ height: 82 }}>
            <div className="flex-1 border-r border-slate-100 bg-white p-2 overflow-hidden">
              <div className="text-[7px] font-bold text-slate-700 mb-2">Candidate Timeline</div>
              {candidates.map((c) => (
                <div key={c.name} className="flex items-start gap-1.5 mb-1.5">
                  <div className={`w-4 h-4 rounded-full ${c.color} flex items-center justify-center shrink-0`}>
                    <span style={{ fontSize: 5, fontWeight: 700, color: "white" }}>{c.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 leading-none mb-0.5" style={{ fontSize: 6.5 }}>{c.name}</div>
                    <div className="text-slate-400 leading-none" style={{ fontSize: 5.5 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-2 overflow-hidden" style={{ width: 128 }}>
              <div className="text-[7px] font-bold text-slate-700 mb-1.5">Analytics Charts</div>
              <div className="flex items-end gap-0.5" style={{ height: 40 }}>
                {[
                  { h: 45, c: "#6366f1" }, { h: 70, c: "#a855f7" }, { h: 30, c: "#3b82f6" },
                  { h: 80, c: "#6366f1" }, { h: 55, c: "#a855f7" }, { h: 65, c: "#3b82f6" },
                  { h: 42, c: "#6366f1" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ height: `${bar.h}%`, background: bar.c }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["Jan", "Feb", "Mar", "Apt", "Sts"].map((m) => (
                  <span key={m} className="text-slate-400" style={{ fontSize: 5 }}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3: Coding Question Library | Interview Calendar */}
          <div className="flex" style={{ minHeight: 0, flex: 1 }}>
            <div className="flex-1 border-r border-slate-100 bg-white p-2 overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[7px] font-bold text-slate-700">Coding Question Library</span>
                <div className="text-[5.5px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">Filter ▾</div>
              </div>
              <div className="grid gap-0.5 pb-1 border-b border-slate-100 mb-1" style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr" }}>
                {["No/Name", "Duration", "Listed Date", "Status"].map((h) => (
                  <span key={h} className="font-semibold text-slate-400" style={{ fontSize: 5.5 }}>{h}</span>
                ))}
              </div>
              {library.map((row, i) => (
                <div key={i} className="grid items-center gap-0.5 mb-1.5" style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr" }}>
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-4 h-4 rounded-full bg-indigo-200 shrink-0 flex items-center justify-center">
                      <span style={{ fontSize: 5, color: "#4f46e5", fontWeight: 700 }}>{row.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate leading-none" style={{ fontSize: 5.5 }}>{row.name}</div>
                      <div className="text-slate-400 truncate" style={{ fontSize: 5 }}>{row.handle}</div>
                    </div>
                  </div>
                  <span className="text-slate-500 truncate" style={{ fontSize: 5.5 }}>{row.lib}</span>
                  <span className="text-slate-500" style={{ fontSize: 5.5 }}>{row.date}</span>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span className="text-orange-500 font-medium" style={{ fontSize: 5 }}>Reviewing</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-2 overflow-hidden shrink-0" style={{ width: 118 }}>
              <div className="text-[7px] font-bold text-slate-700 mb-1.5">Interview Calendar</div>
              <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <span key={d} className="text-center font-semibold text-slate-400" style={{ fontSize: 5 }}>{d}</span>
                ))}
              </div>
              {calendarDays.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {week.map((day, di) => (
                    <div key={di}
                      className={`flex items-center justify-center rounded-full aspect-square ${
                        day === 8 ? "bg-indigo-600 text-white font-bold" : day ? "text-slate-600 hover:bg-slate-100" : ""
                      }`}
                      style={{ fontSize: 5.5 }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH CURSOR EFFECT (Canvas-based Light Tone Fluid Splash & Ripple)
// ─────────────────────────────────────────────────────────────────────────────
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

    // Light tone pastel palette: soft violet, indigo, lavender, sky blue
    const colors = [
      "rgba(167, 139, 250, ", // soft violet (#a78bfa)
      "rgba(129, 140, 248, ", // soft indigo (#818cf8)
      "rgba(192, 132, 252, ", // soft lavender (#c084fc)
      "rgba(147, 197, 253, ", // soft sky blue (#93c5fd)
    ];

    let lastX = 0;
    let lastY = 0;

    const addSplash = (x, y, isClick = false) => {
      // Ripple rings
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

      // Light splash particles
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

      // Render ripples
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

      // Render particles
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

// ─────────────────────────────────────────────────────────────────────────────
// AUTH LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
export default function AuthLayout({ children }) {
  return (
    <div
      className="h-screen overflow-hidden flex font-sans relative"
      style={{ background: "linear-gradient(135deg,#ede9fe 0%,#e4e0fd 30%,#ddd6fe 70%,#e8e3ff 100%)" }}
    >
      {/* ── LIGHT TONE SPLASH CURSOR EFFECT ── */}
      <SplashCursor />


      {/* ── 3D FLOATING BUBBLES (Smaller, balanced scale) ── */}
      {/* Right side 3D sphere bubble (matching reference img top right) */}
      <div className="absolute top-7 right-8 z-20 w-9 h-9 rounded-full bubble-3d-purple bubble-3d animate-bubble-float transition-transform duration-300 hover:scale-125 cursor-pointer shadow-lg" />

      {/* Hero top-left 3D bubble */}
      <div className="absolute top-6 left-6 z-0 w-7 h-7 rounded-full bubble-3d-purple bubble-3d animate-bubble-float opacity-75 transition-transform duration-300 hover:scale-125 cursor-pointer" />

      {/* Decorative background ambient glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle,#a78bfa,transparent 65%)" }} />
      <div className="pointer-events-none absolute bottom-10 left-1/3 w-48 h-48 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }} />

      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col px-10 xl:px-14 py-7 overflow-hidden">
        {/* Logo */}
        <div className="shrink-0 flex items-center gap-2.5 mb-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-md">
            iF
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Interview<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        {/* Hero */}
        <div className="shrink-0 mb-5">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 leading-[1.12] mb-2.5 tracking-tight font-sans">
            The smarter way to conduct
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              technical interviews
            </span>
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md font-sans">
            Conduct live coding interviews, collaborate in real time, evaluate candidates
            with AI, and hire top developers—all from one platform.
          </p>
        </div>

        {/* Mockup + chips + liquid 3D blobs */}
        <div className="flex-1 min-h-0 relative">
          {/* Organic liquid 3D blob: top-right of mockup */}
          <div className="absolute z-0 w-14 h-14 bubble-3d-purple bubble-3d animate-blob-1 opacity-90 transition-transform duration-300 hover:scale-120 cursor-pointer pointer-events-auto"
            style={{ right: 125, top: "-10px" }} />

          {/* Organic liquid 3D blob: bottom-left of mockup */}
          <div className="absolute z-0 w-16 h-16 bubble-3d-indigo bubble-3d animate-blob-2 opacity-90 transition-transform duration-300 hover:scale-120 cursor-pointer pointer-events-auto"
            style={{ left: 85, bottom: "-14px" }} />

          {/* Organic liquid 3D blob: bottom-center of mockup */}
          <div className="absolute z-0 w-22 h-11 bubble-3d-purple bubble-3d animate-blob-1 opacity-85 transition-transform duration-300 hover:scale-120 cursor-pointer pointer-events-auto"
            style={{ left: "42%", bottom: "-16px" }} />


          {/* Dashboard mockup */}
          <div className="absolute z-1 flex items-center" style={{ left: 118, right: 158, top: 0, bottom: 0 }}>
            <DashboardMockup />
          </div>


          {/* Left chips */}
          <div className="absolute z-10 animate-float-1" style={{ left: 0, top: "8%" }}>
            <Chip icon={<Monitor className="h-5 w-5 text-indigo-600" />} label="Live Coding" />
          </div>
          <div className="absolute z-10 animate-float-2" style={{ left: 0, top: "40%" }}>
            <Chip icon={<Settings className="h-5 w-5 text-purple-600" />} label="AI Feedback" />
          </div>
          <div className="absolute z-10 animate-float-3" style={{ left: 0, top: "67%" }}>
            <Chip icon={<Video className="h-5 w-5 text-blue-600" />} label="Video Interview" />
          </div>

          {/* Right chips */}
          <div className="absolute z-10 animate-float-4" style={{ right: 0, top: "22%" }}>
            <Chip icon={<Shield className="h-5 w-5 text-indigo-600" />} label="Enterprise Security" />
          </div>
          <div className="absolute z-10 animate-float-5" style={{ right: 0, top: "47%" }}>
            <Chip icon={<BarChart3 className="h-5 w-5 text-indigo-600" />} label="Analytics" />
          </div>
          <div className="absolute z-10 animate-float-6" style={{ right: 0, top: "70%" }}>
            <Chip icon={<Users2 className="h-5 w-5 text-purple-600" />} label="Real-Time Collaboration" />
          </div>
        </div>

        {/* Trusted by */}
        <div className="shrink-0 mt-4">
          <p className="text-slate-500 text-sm">
            Trusted by{" "}
            {["Google", "Microsoft", "Amazon", "Adobe", "Meta", "Stripe"].map((c, i, arr) => (
              <span key={c}>
                <span className="font-semibold text-slate-700">{c}</span>
                {i < arr.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — card slot ──────────────────────── */}
      <div className="shrink-0 w-[480px] xl:w-[520px] flex items-center justify-center p-6">
        <div className="w-full rounded-3xl bg-white border border-slate-100/60 shadow-2xl shadow-indigo-200/30 p-7 max-h-[calc(100vh-48px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
