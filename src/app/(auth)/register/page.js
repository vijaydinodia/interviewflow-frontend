"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Code2, Laptop, Video, Building2, Briefcase,
  Lock, Mail, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import AuthLayout from "../_components/AuthLayout";

const ROLES = [
  {
    id: "candidate",
    title: "Candidate",
    btnText: "Create Candidate Account",
    bullets: ["Practice coding interviews", "Attend interviews", "Track applications"],
    icon: (
      <div className="flex items-center justify-center gap-0.5 text-indigo-600 text-xs">
        <User className="h-4 w-4" />+<Code2 className="h-4 w-4" />
      </div>
    ),
  },
  {
    id: "interviewer",
    title: "Interviewer",
    btnText: "Create Interviewer Account",
    bullets: ["Conduct interviews", "Evaluate candidates", "Submit feedback"],
    icon: (
      <div className="flex items-center justify-center gap-0.5 text-indigo-600 text-xs">
        <Laptop className="h-4 w-4" />+<Video className="h-4 w-4" />
      </div>
    ),
  },
  {
    id: "company",
    title: "Company",
    btnText: "Create Company Account",
    bullets: ["Schedule interviews", "Manage hiring", "View analytics"],
    icon: (
      <div className="flex items-center justify-center gap-0.5 text-indigo-600 text-xs">
        <Building2 className="h-4 w-4" />+<Briefcase className="h-4 w-4" />
      </div>
    ),
  },
];

const initialData = {
  fullName: "",
  email: "",
  password: "",
  agreeTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("candidate");
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRoleSelect = (roleId) => {
    setErrors({});
    setSelectedRole(roleId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newError = {};

    if (formData.fullName === "") {
      newError.fullName = "Full name is required.";
    }
    if (formData.email === "") {
      newError.email = "Email is required.";
    }
    if (formData.password.length < 8) {
      newError.password = "Password must be at least 8 characters.";
    }
    if (formData.agreeTerms === false) {
      newError.agreeTerms = "You must agree to the Terms of Service.";
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

    let emailAlreadyExists = false;
    for (let i = 0; i < usersList.length; i++) {
      if (usersList[i].email.toLowerCase() === formData.email.toLowerCase()) {
        emailAlreadyExists = true;
        break;
      }
    }

    if (emailAlreadyExists) {
      const authError = {};
      authError.form = "This email is already registered. Please sign in instead.";
      setErrors(authError);
      setIsLoading(false);
      return;
    }

    const newUser = {
      id: "user_" + Date.now(),
      fullName: formData.fullName,
      email: formData.email.toLowerCase(),
      password: formData.password,
      role: selectedRole,
    };

    usersList.push(newUser);
    localStorage.setItem("interviewflow_users", JSON.stringify(usersList));

    const sessionUser = {
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    };
    localStorage.setItem("interviewflow_session", JSON.stringify(sessionUser));

    router.push("/");
  };

  return (
    <AuthLayout>
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow">
          iF
        </div>
        <span className="text-base font-bold text-slate-800">
          Interview<span className="text-indigo-600">Flow</span>
        </span>
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Create Your Account</h2>
      <p className="text-sm text-slate-500 mb-5">Join thousands of developers &amp; companies</p>

      {errors.form && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-5">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role.id)}
              className={`flex flex-col items-center text-center rounded-2xl p-3 border-2 transition-all duration-200 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <div className="mb-1.5">{role.icon}</div>
              <div
                className={`text-xs font-bold mb-2 ${
                  isSelected ? "text-indigo-700" : "text-slate-800"
                }`}
              >
                {role.title}
              </div>
              <ul className="space-y-0.5">
                {role.bullets.map((bulletText) => (
                  <li key={bulletText} className="text-[10px] text-slate-500 leading-snug">
                    {bulletText}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign up with Google
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign up with GitHub
        </button>
      </div>

      <div className="relative mb-4 flex items-center">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-4 text-xs text-slate-400 uppercase tracking-widest font-medium">
          OR
        </span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.fullName
                ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20"
                : "border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-indigo-400/20 focus:bg-white"
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-500 mt-1 font-medium pl-1">{errors.fullName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20"
                    : "border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-indigo-400/20 focus:bg-white"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1 font-medium pl-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (8+)"
                className={`w-full rounded-xl border pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20"
                    : "border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-indigo-400/20 focus:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1 font-medium pl-1">{errors.password}</p>
            )}
          </div>
        </div>

        {formData.password.length > 0 && (
          <div className="flex gap-1.5">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-0.5 flex-1 rounded-full transition-all ${
                  formData.password.length >= (index + 1) * 3
                    ? formData.password.length < 8
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}

        <div>
          <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-500">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 h-3.5 w-3.5 shrink-0"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="text-indigo-600 font-semibold hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-indigo-600 font-semibold hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] text-red-500 mt-1 font-medium pl-1">{errors.agreeTerms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account…" : "Create Candidate Account"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-4 mb-3">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:underline">
          Sign In
        </Link>
      </p>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <Lock className="h-3 w-3" />
        Your data is protected with enterprise-grade encryption.
      </div>
    </AuthLayout>
  );
}