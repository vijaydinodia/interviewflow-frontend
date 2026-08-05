"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, CheckCircle, XCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthLayout from "../_components/AuthLayout";

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-2xl text-xs font-semibold ${
      type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 text-slate-400 hover:text-slate-600 text-sm">✕</button>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const users = JSON.parse(localStorage.getItem("interviewflow_users") || "[]");
    const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    setTimeout(() => {
      setIsLoading(false);
      if (!userExists) { showToast("No account found with this email address."); return; }
      setIsSubmitted(true);
    }, 900);
  };

  return (
    <AuthLayout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Logo */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow">iF</div>
        <span className="text-base font-bold text-slate-800">Interview<span className="text-indigo-600">Flow</span></span>
      </div>

      {!isSubmitted ? (
        /* ── Request form ── */
        <div>
          {/* Lock icon */}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
            <Lock className="h-7 w-7 text-indigo-600" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Forgot Password?</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xs">
            No worries! Enter your account email and we&apos;ll send you password reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending Link…" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">Create Account</Link>
          </p>
        </div>
      ) : (
        /* ── Success ── */
        <div className="text-center py-6">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Check Your Email</h2>
          <p className="text-sm text-slate-500 mb-1">We sent a password reset link to</p>
          <p className="text-sm font-bold text-slate-800 mb-8">{email}</p>

          <button
            type="button"
            onClick={() => { setIsSubmitted(false); setEmail(""); }}
            className="w-full mb-3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Didn&apos;t receive it? Try again
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      )}

      {/* Encryption note */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-6">
        <Lock className="h-3 w-3" />
        Your data is protected with enterprise-grade encryption.
      </div>
    </AuthLayout>
  );
}
