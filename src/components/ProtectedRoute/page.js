"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const { isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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

      // 1. Check if user is logged in
      if (!sessionStr) {
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      const session = JSON.parse(sessionStr);
      const userRole = (session?.role || "candidate").toLowerCase();

      // 2. Check if specific roles are required
      if (allowedRoles && allowedRoles.length > 0) {
        const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
        const hasAccess = normalizedAllowed.includes(userRole);

        if (!hasAccess) {
          setIsAuthorized(false);
          setIsLoading(false);
          // Redirect user to their own dashboard based on their role
          const targetUrl = getDashboardUrl(userRole);
          router.replace(targetUrl);
          return;
        }
      }

      // 3. User is logged in and authorized
      setIsAuthorized(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthorized(false);
      setIsLoading(false);
      router.replace("/login");
    }
  }, [router, allowedRoles]);

  // Render loading / verifying screen to prevent FOUC (flash of unauthenticated content)
  if (isLoading || !isAuthorized) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
          isDark ? "bg-[#0B151E] text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div
            className={`p-4 rounded-2xl ${
              isDark ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-indigo-50 border border-indigo-100"
            }`}
          >
            <Loader2
              className={`h-8 w-8 animate-spin ${
                isDark ? "text-cyan-400" : "text-indigo-600"
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold">Verifying Access...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Checking authentication and permissions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
