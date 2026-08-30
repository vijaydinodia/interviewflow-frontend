"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function GuestRoute({ children }) {
  const router = useRouter();
  const { isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const getDashboardUrl = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") return "/dashboard/super-admin";
    if (r === "admin" || r === "company") return "/dashboard/admin";
    if (r === "interviewer") return "/dashboard/interviewer";
    return "/dashboard/candidate";
  };

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("interviewflow_session");

      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const userRole = session?.role || "candidate";
        const dashboardUrl = getDashboardUrl(userRole);
        setIsGuest(false);
        setIsLoading(false);
        router.replace(dashboardUrl);
        return;
      }

      setIsGuest(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Guest route check error:", error);
      setIsGuest(true);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading || !isGuest) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
          isDark ? "bg-[#0B151E] text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className={`h-8 w-8 animate-spin ${isDark ? "text-cyan-400" : "text-indigo-600"}`} />
          <p className="text-xs text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return children;
}
