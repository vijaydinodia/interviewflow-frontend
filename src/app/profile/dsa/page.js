"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2, ArrowLeft, LayoutDashboard, User, ShieldCheck,
  Award, Sparkles
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import ProtectedRoute from "@/components/ProtectedRoute/page";
import DsaProfileTab from "@/components/DsaProfileTab/page";

export default function DsaProfilePage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("interviewflow_session");
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch {}
    }
  }, []);

  const pageBg = isDark ? "bg-[#0B151E] text-slate-100" : "bg-slate-50 text-slate-900";
  const headerBg = isDark ? "bg-[#060D16] border-white/10" : "bg-white border-slate-200";

  return (
    <ProtectedRoute allowedRoles={["candidate", "interviewer", "admin", "superadmin"]}>
      <div className={`min-h-screen ${pageBg} transition-colors flex flex-col font-sans`}>
        
        {/* Top Navigation */}
        <header className={`border-b ${headerBg} sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md bg-opacity-95`}>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/candidate"
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-black text-xs text-black shadow-md shadow-cyan-400/20">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold flex items-center gap-2">
                  FlowCode Profile
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 font-bold">
                    Pro Track
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Problem solving performance, analytics & submission track</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <User className="h-3.5 w-3.5" /> General Profile
            </Link>
            <Link
              href="/dashboard/candidate"
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors ${
                isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Candidate Workspace
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <DsaProfileTab user={user} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
