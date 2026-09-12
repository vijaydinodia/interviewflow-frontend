"use client";

import { useState, useEffect } from "react";
import {
  Mail, ShieldCheck, Key, ArrowRight, CheckCircle2, AlertCircle,
  Loader2, X, RefreshCw, Lock, Sparkles
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";
import { api } from "@/api";

export default function EmailUpdateModal({ isOpen, onClose, currentEmail, onEmailUpdated }) {
  const { isDark } = useTheme();

  // Step 1 = verify current email; Step 2 = enter & verify new email; Step 3 = success
  const [step, setStep] = useState(1);

  // Step 1 state
  const [step1OtpSent, setStep1OtpSent] = useState(false);
  const [step1Otp, setStep1Otp] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);
  const [proofToken, setProofToken] = useState(null);

  // Step 2 state
  const [newEmail, setNewEmail] = useState("");
  const [step2OtpSent, setStep2OtpSent] = useState(false);
  const [step2Otp, setStep2Otp] = useState("");
  const [step2Loading, setStep2Loading] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep(1);
      setStep1OtpSent(false);
      setStep1Otp("");
      setProofToken(null);
      setNewEmail("");
      setStep2OtpSent(false);
      setStep2Otp("");
      setErrorMsg("");
      setSuccessMsg("");
      setResendTimer(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Step 1 Handlers ────────────────────────────────────────────────────────
  const handleSendCurrentOtp = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setStep1Loading(true);

    try {
      const res = await api.post("/user/email-change/send-current-otp");
      const json = res.data;
      if (json.success) {
        setStep1OtpSent(true);
        setSuccessMsg(`OTP sent to your current email: ${currentEmail}`);
        setResendTimer(60);
      } else {
        setErrorMsg(json.message || "Failed to send OTP to current email.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Server error sending OTP.");
    } finally {
      setStep1Loading(false);
    }
  };

  const handleVerifyCurrentOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!step1Otp || step1Otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP.");
      return;
    }

    setStep1Loading(true);
    try {
      const res = await api.post("/user/email-change/verify-current-otp", { otpCode: step1Otp.trim() });
      const json = res.data;
      if (json.success && json.proofToken) {
        setProofToken(json.proofToken);
        setSuccessMsg("Current email verified! Now proceed to enter your new email.");
        setTimeout(() => {
          setSuccessMsg("");
          setStep(2);
          setResendTimer(0);
        }, 1000);
      } else {
        setErrorMsg(json.message || "Invalid OTP code.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Verification failed.");
    } finally {
      setStep1Loading(false);
    }
  };

  // ── Step 2 Handlers ────────────────────────────────────────────────────────
  const handleSendNewOtp = async (e) => {
    e?.preventDefault?.();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newEmail || !newEmail.includes("@") || !newEmail.includes(".")) {
      setErrorMsg("Please enter a valid new email address.");
      return;
    }

    if (newEmail.trim().toLowerCase() === currentEmail?.toLowerCase()) {
      setErrorMsg("New email cannot be identical to your current email.");
      return;
    }

    setStep2Loading(true);
    try {
      const res = await api.post("/user/email-change/send-new-otp", {
        proofToken,
        newEmail: newEmail.trim().toLowerCase(),
      });
      const json = res.data;
      if (json.success) {
        setStep2OtpSent(true);
        setSuccessMsg(`Verification code sent to ${newEmail}!`);
        setResendTimer(60);
      } else {
        setErrorMsg(json.message || "Failed to send verification to new email.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Error sending new email OTP.");
    } finally {
      setStep2Loading(false);
    }
  };

  const handleVerifyNewOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!step2Otp || step2Otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code sent to your new email.");
      return;
    }

    setStep2Loading(true);
    try {
      const res = await api.post("/user/email-change/verify-new-otp", {
        proofToken,
        newEmail: newEmail.trim().toLowerCase(),
        otpCode: step2Otp.trim(),
      });
      const json = res.data;
      if (json.success) {
        // Update local session & token
        if (json.token) {
          localStorage.setItem("interviewflow_token", json.token);
        }
        if (json.user) {
          localStorage.setItem("interviewflow_session", JSON.stringify(json.user));
        }

        setSuccessMsg("Email successfully updated and verified!");
        if (onEmailUpdated) {
          onEmailUpdated(newEmail.trim().toLowerCase());
        }

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(json.message || "Invalid OTP code for new email.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "New email verification failed.");
    } finally {
      setStep2Loading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl relative transition-all ${
        isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Two-Step Email Change</h3>
              <p className="text-[11px] text-slate-400">Secure ownership verification workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="my-5 flex items-center justify-between gap-3">
          <div className={`flex-1 p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
            step === 1
              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
              : "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
          }`}>
            <span className={`h-6 w-6 rounded-full text-xs font-black flex items-center justify-center ${
              step === 1 ? "bg-indigo-600 text-white" : "bg-emerald-500 text-black font-extrabold"
            }`}>
              {step === 1 ? "1" : "✓"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider">Step 1</p>
              <p className="text-xs font-extrabold truncate">Verify Current Email</p>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />

          <div className={`flex-1 p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
            step === 2
              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
              : "border-white/10 bg-white/5 text-slate-400"
          }`}>
            <span className={`h-6 w-6 rounded-full text-xs font-black flex items-center justify-center ${
              step === 2 ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
            }`}>
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider">Step 2</p>
              <p className="text-xs font-extrabold truncate">Verify New Email</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── STEP 1: VERIFY CURRENT EMAIL ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#080E18] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Registered Email</span>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-black text-indigo-400">{currentEmail}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              </div>
            </div>

            {!step1OtpSent ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendCurrentOtp}
                  disabled={step1Loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {step1Loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Send Verification OTP to Current Email</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyCurrentOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300">
                    Enter 6-Digit OTP sent to {currentEmail}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={step1Otp}
                    onChange={(e) => setStep1Otp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[8px] text-lg font-mono font-bold py-2.5 rounded-xl border border-indigo-500/40 bg-slate-950 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleSendCurrentOtp}
                    disabled={resendTimer > 0 || step1Loading}
                    className="text-slate-400 hover:text-indigo-400 font-semibold disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={step1Loading || step1Otp.length !== 6}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {step1Loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Next"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── STEP 2: VERIFY NEW EMAIL ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-300">
                Enter Your New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new.email@example.com"
                disabled={step2OtpSent}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#080E18] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
                required
              />
            </div>

            {!step2OtpSent ? (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendNewOtp}
                  disabled={step2Loading || !newEmail}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {step2Loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP to New Email"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyNewOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300">
                    Enter 6-Digit Verification Code sent to {newEmail}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={step2Otp}
                    onChange={(e) => setStep2Otp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[8px] text-lg font-mono font-bold py-2.5 rounded-xl border border-indigo-500/40 bg-slate-950 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleSendNewOtp}
                    disabled={resendTimer > 0 || step2Loading}
                    className="text-slate-400 hover:text-indigo-400 font-semibold disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep2OtpSent(false);
                      setStep2Otp("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Change new email
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={step2Loading || step2Otp.length !== 6}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {step2Loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Update Email"}
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
