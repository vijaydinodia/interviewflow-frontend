"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sun, Moon, User, Key, LogOut, ChevronDown, Camera, X, CheckCircle2, AlertCircle, Edit3, ShieldCheck, Mail, Tag, CheckCircle
} from "lucide-react";
import { useTheme } from "@/custom_hook/UseTheme";

export default function DashboardHeader({ title, roleBadge }) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({ fullName: "", email: "", avatarUrl: "" });
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const session = localStorage.getItem("interviewflow_session");
    if (session) {
      const parsed = JSON.parse(session);
      setUser(parsed);
      setProfileForm({
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        avatarUrl: parsed.avatarUrl || "",
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("interviewflow_session");
    localStorage.removeItem("interviewflow_token");
    router.push("/login");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      fullName: profileForm.fullName,
      email: profileForm.email,
      avatarUrl: profileForm.avatarUrl,
    };
    setUser(updatedUser);
    localStorage.setItem("interviewflow_session", JSON.stringify(updatedUser));
    setProfileSuccess("Profile updated successfully!");
    setTimeout(() => {
      setProfileSuccess("");
      setEditProfileOpen(false);
    }, 1200);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSuccess("Password reset successfully!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => {
      setPasswordSuccess("");
      setResetPasswordOpen(false);
    }, 1200);
  };

  if (!user) return null;

  return (
    <>
      <header className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md transition-colors ${
        isDark ? "border-white/10 bg-[#0B151E]/80 text-white" : "border-slate-200 bg-white/80 text-slate-900"
      }`}>
        {/* Brand & Role */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 font-black text-[#0B151E] shadow-md">
            iF
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight">Interview<span className="text-cyan-400">Flow</span></span>
            <span className={`ml-2.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              isDark ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-indigo-200 bg-indigo-50 text-indigo-700"
            }`}>
              {roleBadge || title || user.role || "Dashboard"}
            </span>
          </div>
        </div>

        {/* Quick Nav, Theme Toggle & Profile Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              isDark
                ? "border-white/10 bg-[#080E18] text-amber-400 hover:bg-white/5 hover:border-amber-400/30"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Profile Photo Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2.5 rounded-xl border p-1.5 transition-all ${
                isDark
                  ? "border-white/10 bg-[#080E18] hover:border-cyan-400/40 hover:bg-white/5 text-white"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white text-slate-900"
              }`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-lg object-cover border border-cyan-400/40"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 font-extrabold text-xs text-[#0B151E] shadow-sm">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
              )}

              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-bold leading-tight">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>

              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Options */}
            {dropdownOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl z-50 transition-all ${
                isDark ? "border-white/10 bg-[#080E18] text-white shadow-cyan-500/10" : "border-slate-200 bg-white text-slate-900 shadow-slate-300/50"
              }`}>
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold truncate">{user.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                {/* Profile option (View Profile Page) */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/profile");
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    isDark ? "hover:bg-white/5 text-slate-200" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <User className="h-4 w-4 text-cyan-400" />
                  Profile
                </button>

                {/* Reset Password option */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setResetPasswordOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    isDark ? "hover:bg-white/5 text-slate-200" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Key className="h-4 w-4 text-amber-400" />
                  Reset Password
                </button>

                <div className="my-1 border-t border-white/10" />

                {/* Logout option */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition-colors ${
                    isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                  }`}
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* View Complete Profile Modal */}
      {viewProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative transition-all ${
            isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" /> User Profile
              </h3>
              <button onClick={() => setViewProfileOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Profile Avatar & Primary Details */}
            <div className="flex flex-col items-center text-center mb-6">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg mb-3"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-teal-400 font-black text-2xl text-[#0B151E] shadow-lg mb-3">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
              )}
              <h4 className="text-xl font-black">{user.fullName}</h4>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider mt-1 ${
                isDark ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300" : "bg-indigo-50 border border-indigo-200 text-indigo-700"
              }`}>
                <Tag className="h-3 w-3" /> {user.role || "User"}
              </span>
            </div>

            {/* Complete Profile Details Cards */}
            <div className="space-y-3 mb-6">
              <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                isDark ? "border-white/5 bg-[#080E18]" : "border-slate-100 bg-slate-50"
              }`}>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">EMAIL ADDRESS</p>
                    <p className="text-xs font-bold truncate max-w-[220px]">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                isDark ? "border-white/5 bg-[#080E18]" : "border-slate-100 bg-slate-50"
              }`}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">ACCOUNT STATUS</p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Active &amp; Verified
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Edit Profile & Close */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setViewProfileOpen(false)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                  isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewProfileOpen(false);
                  setEditProfileOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] py-2.5 text-xs font-extrabold shadow hover:brightness-110"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
            isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-cyan-400" /> Edit Profile
              </h3>
              <button onClick={() => setEditProfileOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {profileSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                    isDark ? "border-white/10 bg-[#080E18] text-white focus:border-cyan-400" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                    isDark ? "border-white/10 bg-[#080E18] text-white focus:border-cyan-400" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Profile Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileForm.avatarUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                    className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                      isDark ? "border-white/10 bg-[#080E18] text-white focus:border-cyan-400" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 text-[#0B151E] py-2.5 text-xs font-extrabold shadow hover:brightness-110"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
            isDark ? "border-white/10 bg-[#0B151E] text-white" : "border-slate-200 bg-white text-slate-900"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" /> Reset Password
              </h3>
              <button onClick={() => setResetPasswordOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400 font-semibold">
                <AlertCircle className="h-4 w-4" /> {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                    isDark ? "border-white/10 bg-[#080E18] text-white focus:border-amber-400" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">New Password (8+ chars)</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                    isDark ? "border-white/10 bg-[#080E18] text-white focus:border-amber-400" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                    isDark ? "border-white/10 bg-[#080E18] text-white focus:border-amber-400" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordOpen(false)}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                    isDark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 text-xs font-extrabold shadow hover:brightness-110"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
