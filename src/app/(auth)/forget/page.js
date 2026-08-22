"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import AuthLayout from "../_components/AuthLayout";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

// 3 steps: "email" → "otp" → "reset"
export default function ForgotPasswordPage() {
  const { isDark } = useTheme();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState("");

  // ── Step 1: Send OTP to email ───────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setDevOtpHint("");
    if (!email.trim()) { setError("Email address is required."); return; }

    setIsLoading(true);
    try {
      const res = await api.post("/user/forgot-password", { email: email.trim() });
      if (res.data?.success) {
        if (res.data?.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        setStep("otp");
        startResendCooldown();
      } else {
        setError(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const otpCode = otpDigits.join("");
    if (otpCode.length < 6) { setError("Please enter all 6 digits of your OTP."); return; }

    setIsLoading(true);
    try {
      const res = await api.post("/user/verify-otp", { email, otpCode });
      if (res.data?.success) {
        setStep("reset");
      } else {
        setError(res.data?.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const otpCode = otpDigits.join("");
      const res = await api.post("/user/reset-password", { email, otpCode, newPassword });
      if (res.data?.success) {
        setSuccess(true);
      } else {
        setError(res.data?.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP digit input handling ────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      e.preventDefault();
    }
  };

  // ── Resend cooldown timer ───────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setIsLoading(true);
    try {
      await api.post("/user/forgot-password", { email });
      setOtpDigits(["", "", "", "", "", ""]);
      startResendCooldown();
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared styling helpers ──────────────────────────────────────────────────
  const inputCls = `w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
    isDark
      ? "border-white/10 bg-[#080E18] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
      : "border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 focus:bg-white"
  }`;

  const btnCls = `w-full rounded-xl py-3 text-sm font-extrabold shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
    isDark
      ? "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:brightness-110 text-[#0B151E] shadow-cyan-500/25"
      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:opacity-95"
  }`;

  // ── Brand header (shared) ───────────────────────────────────────────────────
  const BrandHeader = () => (
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
  );

  // ── Error banner (shared) ───────────────────────────────────────────────────
  const ErrorBanner = () =>
    error ? (
      <div className={`mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
        isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
      }`}>
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    ) : null;

  // ── Step progress dots ──────────────────────────────────────────────────────
  const StepDots = () => {
    const steps = ["email", "otp", "reset"];
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              steps.indexOf(step) >= i
                ? isDark ? "bg-cyan-400 w-8" : "bg-indigo-600 w-8"
                : isDark ? "bg-white/10 w-4" : "bg-slate-200 w-4"
            }`}
          />
        ))}
      </div>
    );
  };

  // ── SUCCESS STATE ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout>
        <BrandHeader />
        <div className="text-center py-6">
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${
            isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-100"
          }`}>
            <CheckCircle2 className={`h-8 w-8 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            Password Reset!
          </h2>
          <p className={`text-sm mb-8 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center justify-center w-full rounded-xl py-3 text-sm font-extrabold shadow-lg transition-all ${
              isDark
                ? "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E]"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            }`}
          >
            Go to Sign In →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <BrandHeader />
      <StepDots />

      {/* ── STEP 1: Enter Email ──────────────────────────────────────────── */}
      {step === "email" && (
        <div>
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isDark ? "bg-cyan-500/10 border-cyan-500/30" : "bg-indigo-50 border-indigo-100"
          }`}>
            <Mail className={`h-7 w-7 ${isDark ? "text-cyan-400" : "text-indigo-600"}`} />
          </div>

          <h2 className={`text-2xl font-extrabold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            Forgot Password?
          </h2>
          <p className={`text-sm mb-6 leading-relaxed max-w-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            Enter your account email and we&apos;ll send you a 6-digit OTP to verify your identity.
          </p>

          <ErrorBanner />

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@company.com"
                  className={inputCls}
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={btnCls}>
              {isLoading ? "Sending OTP…" : "Send OTP →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
              isDark ? "text-slate-400 hover:text-cyan-300" : "text-slate-500 hover:text-indigo-600"
            }`}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* ── STEP 2: Enter OTP ────────────────────────────────────────────── */}
      {step === "otp" && (
        <div>
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-100"
          }`}>
            <KeyRound className={`h-7 w-7 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
          </div>

          <h2 className={`text-2xl font-extrabold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            Enter OTP
          </h2>
          <p className={`text-sm mb-1 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            We sent a 6-digit code to
          </p>
          <p className={`text-sm font-bold mb-6 ${isDark ? "text-cyan-300" : "text-indigo-700"}`}>
            {email}
          </p>

          <ErrorBanner />

          {devOtpHint && (
            <div className={`mb-4 p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
              isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              <span>🔑 Development OTP Code:</span>
              <span className="text-sm font-black text-cyan-400 bg-black/40 px-2 py-0.5 rounded border border-cyan-500/30">
                {devOtpHint}
              </span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* OTP digit boxes */}
            <div>
              <label className={`block text-xs font-semibold mb-3 text-center ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                6-Digit OTP Code
              </label>
              <div className="flex items-center justify-center gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-11 h-13 text-center text-xl font-black rounded-xl border outline-none transition-all ${
                      isDark
                        ? "bg-[#080E18] border-white/10 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        : "bg-white border-slate-200 text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    } ${digit ? (isDark ? "border-cyan-400/50 bg-cyan-500/10" : "border-indigo-400 bg-indigo-50") : ""}`}
                    style={{ height: "52px" }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className={`text-center text-[11px] mt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                ⏱ OTP expires in 10 minutes
              </p>
            </div>

            <button type="submit" disabled={isLoading} className={btnCls}>
              {isLoading ? "Verifying…" : "Verify OTP →"}
            </button>
          </form>

          {/* Resend + Back */}
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("email")}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isDark ? "text-slate-400 hover:text-cyan-300" : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change Email
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                isDark ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: New Password ──────────────────────────────────────────── */}
      {step === "reset" && (
        <div>
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-100"
          }`}>
            <Lock className={`h-7 w-7 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>

          <h2 className={`text-2xl font-extrabold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            New Password
          </h2>
          <p className={`text-sm mb-6 leading-relaxed max-w-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            OTP verified! Choose a strong new password for your account.
          </p>

          <ErrorBanner />

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  placeholder="Min. 6 characters"
                  className={inputCls + " pr-10"}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= n * 2
                            ? n <= 1 ? "bg-red-400" : n <= 2 ? "bg-amber-400" : n <= 3 ? "bg-yellow-400" : "bg-emerald-400"
                            : isDark ? "bg-white/10" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {newPassword.length < 4 ? "Too short" : newPassword.length < 6 ? "Weak" : newPassword.length < 8 ? "Fair" : "Strong"}
                  </p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className={btnCls}>
              {isLoading ? "Resetting…" : "Reset Password →"}
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-6">
        <Lock className="h-3 w-3" />
        Your data is protected with enterprise-grade encryption.
      </div>
    </AuthLayout>
  );
}
