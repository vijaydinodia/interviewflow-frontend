"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Home, KeyRound, ChevronDown, Menu, X, Sun, Moon, LayoutDashboard, UserCheck } from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const savedSession = localStorage.getItem("interviewflow_session");
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("interviewflow_session");
    localStorage.removeItem("interviewflow_token");
    sessionStorage.removeItem("interviewflow_session_temp");
    setUser(null);
    router.push("/login");
  };

  const getDashboardUrl = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") return "/dashborads/superAdminDashborad";
    if (r === "admin" || r === "company") return "/dashborads/adminDashboard";
    if (r === "interviewer") return "/dashborads/interviewerDashboard";
    return "/dashborads/candidateDashboard";
  };

  const dashboardUrl = user ? getDashboardUrl(user.role) : "/login";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-2xl border-b shadow-2xl transition-colors duration-300 ${
      isDark
        ? "bg-[#0B151E]/80 border-cyan-500/20 text-white"
        : "bg-white/80 border-slate-200/60 text-slate-900 shadow-indigo-100/50"
    }`}>
      <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] ${
        isDark
          ? "bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          : "bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link href={user ? dashboardUrl : "/"} className="flex items-center gap-2.5 sm:gap-3 group">
          <div className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full p-[2px] shadow-lg group-hover:scale-105 transition-transform ${
            isDark
              ? "bg-gradient-to-tr from-amber-400 via-sky-400 to-cyan-500 shadow-cyan-500/20"
              : "bg-gradient-to-tr from-indigo-600 via-purple-500 to-amber-400 shadow-indigo-200"
          }`}>
            <div className={`flex h-full w-full items-center justify-center rounded-full font-extrabold text-xs sm:text-sm ${
              isDark ? "bg-[#0A0F17] text-white" : "bg-white text-indigo-600"
            }`}>
              <span className={isDark ? "bg-gradient-to-r from-amber-300 via-sky-400 to-cyan-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"}>iF</span>
            </div>
          </div>
          <span className={`text-lg sm:text-xl font-bold tracking-tight font-sans ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Interview<span className={isDark ? "text-cyan-400" : "text-indigo-600"}>Flow</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={`hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}>
          {user ? (
            <>
              <Link href={dashboardUrl} className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/profile" className={`flex items-center gap-1.5 ${pathname === "/profile" ? (isDark ? "text-cyan-400 font-bold" : "text-indigo-600 font-bold") : (isDark ? "hover:text-cyan-400" : "hover:text-indigo-600")}`}>
                <User className="w-4 h-4" /> Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={`flex items-center gap-1.5 ${pathname === "/" ? (isDark ? "text-cyan-400 font-bold" : "text-indigo-600 font-bold") : (isDark ? "hover:text-cyan-400" : "hover:text-indigo-600")}`}>
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link href="#features" className={isDark ? "hover:text-cyan-400 transition-colors" : "hover:text-indigo-600 transition-colors"}>
                Features
              </Link>
              <Link href="#solutions" className={`flex items-center gap-1 ${isDark ? "hover:text-cyan-400" : "hover:text-indigo-600"}`}>
                <span>Solutions</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link href="#why" className={isDark ? "hover:text-cyan-400 transition-colors" : "hover:text-indigo-600 transition-colors"}>
                Why Us
              </Link>
              <Link href="#testimonials" className={isDark ? "hover:text-cyan-400 transition-colors" : "hover:text-indigo-600 transition-colors"}>
                Reviews
              </Link>
            </>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-xs ${
              isDark
                ? "bg-white/10 border-cyan-500/30 hover:border-cyan-400/60 text-slate-200 hover:text-white"
                : "bg-indigo-50/80 border-indigo-200/80 hover:border-indigo-300 text-slate-800 hover:text-indigo-600"
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  pathname === "/profile"
                    ? isDark
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm"
                      : "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : isDark
                    ? "bg-white/5 border-white/10 text-slate-200 hover:border-cyan-400 hover:text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{user.fullName || user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold border border-red-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-4">
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold shadow-lg shadow-cyan-500/30 transition-all active:scale-95 whitespace-nowrap"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="hidden xs:inline text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B151E]/95 backdrop-blur-2xl border-b border-cyan-500/20 px-6 py-5 flex flex-col gap-3 text-sm font-semibold text-slate-300">
          {!user && (
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400 transition-colors py-1 flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-cyan-400" /> Home Page
            </Link>
          )}

          {user && (
            <>
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-cyan-400 transition-colors py-1 flex items-center gap-2 text-cyan-400 font-bold"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-cyan-400 transition-colors py-1 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-cyan-400" /> My Profile
              </Link>
            </>
          )}

          {!user && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-cyan-400 font-bold py-1 border-t border-white/10 pt-3"
            >
              Sign In to Account
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
