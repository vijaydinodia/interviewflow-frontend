"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Home, LayoutDashboard, Sparkles, ArrowRight, User } from "lucide-react";
import AuthLayout from "../_components/AuthLayout";
import GuestRoute from "@/components/GuestRoute/page";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

const initialData = {
  email: "",
  password: "",
  rememberMe: false,
};

export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem("interviewflow_session");
      if (session) {
        const parsed = JSON.parse(session);
        const url = getDashboardUrl(parsed?.role);
        router.replace(url);
      }
    } catch (e) {}
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    const updatedErrors = { ...errors };
    delete updatedErrors[name];
    delete updatedErrors.form;
    setErrors(updatedErrors);

    setFormData({
      ...formData,
      [name]: fieldValue,
    });
  };

  const getDashboardUrl = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") return "/dashboard/super-admin";
    if (r === "admin" || r === "company") return "/dashboard/admin";
    if (r === "interviewer") return "/dashboard/interviewer";
    return "/dashboard/candidate";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newError = {};
    if (formData.email === "") {
      newError.email = "Email is required.";
    }
    if (formData.password === "") {
      newError.password = "Password is required.";
    }

    if (Object.keys(newError).length > 0) {
      setErrors(newError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/user/login", {
        email: formData.email,
        password: formData.password,
      });

      const data = response.data;

      if (data && data.success) {
        if (data.token) {
          localStorage.setItem("interviewflow_token", data.token);
        }

        const userRole = data.user?.role || "candidate";
        const sessionUser = {
          fullName: data.user?.firstName
            ? `${data.user.firstName} ${data.user.lastName || ""}`.trim()
            : data.user?.username || formData.email,
          email: data.user?.email || formData.email,
          role: userRole,
        };

        localStorage.setItem("interviewflow_session", JSON.stringify(sessionUser));
        setIsLoading(false);

        // Directly redirect to dashboard
        const dashboardUrl = getDashboardUrl(userRole);
        router.push(dashboardUrl);
        return;
      }
    } catch (err) {
      setIsLoading(false);

      if (err.response && err.response.data && err.response.data.message) {
        setErrors({ form: err.response.data.message });
        return;
      }

      // Check local storage fallback for saved users
      const savedUsers = localStorage.getItem("interviewflow_users");
      if (savedUsers) {
        let usersList = [];
        try {
          usersList = JSON.parse(savedUsers);
        } catch (e) {}

        const match = usersList.find(
          (u) => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password
        );

        if (match) {
          const userRole = match.role || "candidate";
          const sessionUser = {
            fullName: match.fullName,
            email: match.email,
            role: userRole,
          };
          localStorage.setItem("interviewflow_session", JSON.stringify(sessionUser));

          // Directly redirect to dashboard
          const dashboardUrl = getDashboardUrl(userRole);
          router.push(dashboardUrl);
          return;
        }
      }

      const errorMessage =
        err.code === "ERR_NETWORK"
          ? "Unable to connect to backend server (http://localhost:5000). Please ensure backend is running."
          : err.message || "Invalid email or password.";
      setErrors({ form: errorMessage });
      return;
    }
  };

  const inputCls = (hasErr) =>
    `w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all outline-none font-medium ${
      hasErr
        ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-500/5 text-red-200 placeholder-red-300/50"
        : isDark
        ? "bg-[#080E18] border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
    }`;

  return (
    <GuestRoute>
      <AuthLayout>
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-extrabold text-sm shadow ${
          isDark ? "bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E]" : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
        }`}>
          iF
        </div>
        <span className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
          Interview<span className={isDark ? "text-cyan-400" : "text-indigo-600"}>Flow</span>
        </span>
      </div>

      <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
        Welcome back
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mb-6">
        Sign in to your account to continue
      </p>

      {/* Global error */}
      {errors.form && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={inputCls(errors.email)}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <Link
              href="/forget"
              className={`text-xs font-bold transition-colors ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-600 hover:text-indigo-500"}`}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPwd ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={inputCls(errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-0"
          />
          <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-400 font-medium select-none cursor-pointer">
            Remember me on this device
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] font-extrabold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{" "}
          <Link href="/register" className={`font-bold ${isDark ? "text-cyan-400 hover:underline" : "text-indigo-600 hover:underline"}`}>
            Create one free
          </Link>
        </p>
      </form>
      </AuthLayout>
    </GuestRoute>
  );
}
