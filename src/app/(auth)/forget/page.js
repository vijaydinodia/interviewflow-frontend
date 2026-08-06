"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import AuthLayout from "../_components/AuthLayout";
import { useTheme } from "@/custom_hook/UseTheme";

const initialData = {
  email: "",
};

export default function ForgotPasswordPage() {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    const updatedErrors = { ...errors };
    delete updatedErrors[name];
    delete updatedErrors.form;
    setErrors(updatedErrors);

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newError = {};

    if (formData.email === "") {
      newError.email = "Email is required.";
    }

    if (Object.keys(newError).length > 0) {
      setErrors(newError);
      return;
    }

    setIsLoading(true);

    const savedUsers = localStorage.getItem("interviewflow_users");
    let usersList = [];
    if (savedUsers) {
      usersList = JSON.parse(savedUsers);
    }

    let userFound = false;
    for (let i = 0; i < usersList.length; i++) {
      if (usersList[i].email.toLowerCase() === formData.email.toLowerCase()) {
        userFound = true;
        break;
      }
    }

    if (!userFound) {
      const authError = {};
      authError.form = "No account found with this email address.";
      setErrors(authError);
      setIsLoading(false);
      return;
    }

    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <div className="flex items-center gap-2 mb-5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-extrabold text-sm shadow ${
          isDark ? "bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E]" : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
        }`}>
          iF
        </div>
        <span className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
          Interview<span className={isDark ? "text-cyan-400" : "text-indigo-600"}>Flow</span>
        </span>
      </div>

      {isSubmitted === false ? (
        <div>
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isDark ? "bg-cyan-500/10 border-cyan-500/30" : "bg-indigo-50 border-indigo-100"
          }`}>
            <Lock className={`h-7 w-7 ${isDark ? "text-cyan-400" : "text-indigo-600"}`} />
          </div>

          <h2 className={`text-2xl font-extrabold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            Forgot Password?
          </h2>
          <p className={`text-sm mb-6 leading-relaxed max-w-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            No worries! Enter your account email and we&apos;ll send you password reset instructions.
          </p>

          {errors.form && (
            <div className={`mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
              isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <AlertCircle className={`h-4 w-4 shrink-0 ${isDark ? "text-red-400" : "text-red-500"}`} />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? isDark
                        ? "border-red-500/50 bg-red-500/10 text-white focus:border-red-400 focus:ring-red-400/20"
                        : "border-red-300 bg-red-50/50 text-slate-900 focus:border-red-400 focus:ring-red-400/20"
                      : isDark
                        ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                        : "border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 focus:bg-white"
                  }`}
                />
              </div>
              {errors.email && (
                <p className={`text-[11px] mt-1 font-medium pl-1 ${isDark ? "text-red-400" : "text-red-500"}`}>{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-xl py-3 text-sm font-extrabold shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] shadow-cyan-500/25"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:opacity-95"
              }`}
            >
              {isLoading ? "Sending Link…" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
                isDark ? "text-slate-400 hover:text-cyan-300" : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>

          <p className={`text-center text-xs mt-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className={`font-bold hover:underline ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-600"}`}>
              Create Account
            </Link>
          </p>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${
            isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-100"
          }`}>
            <CheckCircle2 className={`h-8 w-8 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Check Your Email</h2>
          <p className={`text-sm mb-1 ${isDark ? "text-slate-300" : "text-slate-500"}`}>We sent a password reset link to</p>
          <p className={`text-sm font-bold mb-8 ${isDark ? "text-cyan-300" : "text-slate-800"}`}>{formData.email}</p>

          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setFormData(initialData);
              setErrors({});
            }}
            className={`w-full mb-3 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
              isDark
                ? "border-white/10 bg-[#080E18] text-slate-200 hover:bg-white/5 hover:border-cyan-500/30"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Didn&apos;t receive it? Try again
          </button>

          <Link
            href="/login"
            className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
              isDark ? "text-slate-400 hover:text-cyan-300" : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-6">
        <Lock className="h-3 w-3" />
        Your data is protected with enterprise-grade encryption.
      </div>
    </AuthLayout>
  );
}
