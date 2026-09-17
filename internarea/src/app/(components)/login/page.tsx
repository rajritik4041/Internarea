"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/data/api";
import {
  ShieldAlert,
  Smartphone,
  KeyRound,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type LoginFormInputs = {
  Email: string;
  Password: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get("redirect") : null;
  const { t } = useLanguage();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Chrome OTP State
  const [chromeOtpRequired, setChromeOtpRequired] = useState(false);
  const [chromeOtp, setChromeOtp] = useState("");
  const [chromeOtpEmail, setChromeOtpEmail] = useState("");
  const [previewOtp, setPreviewOtp] = useState("");
  const [chromeOtpLoading, setChromeOtpLoading] = useState(false);
  const [chromeOtpError, setChromeOtpError] = useState("");

  // Mobile Hour Restriction Alert
  const [mobileRestricted, setMobileRestricted] = useState<{
    message: string;
    currentTimeIST: string;
    requiredWindow: string;
  } | null>(null);

  // Mandatory Password Change State (for users reset via forgot password)
  const [mustChangePwdUser, setMustChangePwdUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdChangeError, setPwdChangeError] = useState("");
  const [pwdChangeSuccess, setPwdChangeSuccess] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      Email: "",
      Password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      setServerError("");
      setMobileRestricted(null);
      setChromeOtpRequired(false);

      const response = await axios.post(
        `${API_BASE_URL}/api/login`,
        {
          Email: data.Email,
          Password: data.Password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if Chrome OTP verification is required
      if (response.data && response.data.requiresChromeOtp) {
        setChromeOtpRequired(true);
        setChromeOtpEmail(response.data.email);
        setPreviewOtp(response.data.previewOtp || "");
        return;
      }

      if (response.data && response.data.status) {
        handleSuccessfulAuth(response.data);
      } else {
        setServerError(response.data.message || "Invalid credentials");
      }
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.code === "MOBILE_HOURS_RESTRICTED") {
        setMobileRestricted({
          message: error.response.data.message,
          currentTimeIST: error.response.data.currentTimeIST,
          requiredWindow: error.response.data.requiredWindow,
        });
      } else {
        setServerError(
          error.response?.data?.message || "Failed to log in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyChromeOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chromeOtp.trim()) {
      setChromeOtpError("Please enter the 6-digit OTP code");
      return;
    }

    try {
      setChromeOtpLoading(true);
      setChromeOtpError("");

      const res = await axios.post(`${API_BASE_URL}/api/login/verify-chrome-otp`, {
        Email: chromeOtpEmail,
        otp: chromeOtp.trim(),
      });

      if (res.data && res.data.status) {
        handleSuccessfulAuth(res.data);
      } else {
        setChromeOtpError(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setChromeOtpError(err.response?.data?.message || "Chrome OTP verification failed");
    } finally {
      setChromeOtpLoading(false);
    }
  };

  const handleSuccessfulAuth = (authData: any) => {
    if (authData.user && authData.user.mustChangePassword) {
      setMustChangePwdUser(authData.user.Email);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(authData.user));
      }
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(authData.user));
      if (authData.user.language) {
        localStorage.setItem("platform_language", authData.user.language);
      }
      window.dispatchEvent(new Event("authChange"));
    }

    if (redirectPath) {
      router.push(redirectPath);
    } else {
      router.push("/");
    }
  };

  const handleForcedPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwdChangeError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdChangeError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setPwdChangeError("");

      const res = await axios.post(`${API_BASE_URL}/api/login/change-forced-password`, {
        Email: mustChangePwdUser,
        newPassword,
        confirmPassword,
      });

      if (res.data && res.data.status) {
        setPwdChangeSuccess(true);
        setTimeout(() => {
          window.dispatchEvent(new Event("authChange"));
          if (redirectPath) router.push(redirectPath);
          else router.push("/");
        }, 1500);
      } else {
        setPwdChangeError(res.data.message || "Failed to update password");
      }
    } catch (err: any) {
      setPwdChangeError(err.response?.data?.message || "Password update error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-3">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            Intern<span className="text-gray-900">Area</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("nav.login", "User Login")}</h1>
        <p className="text-xs text-gray-500 mt-1">
          Access your internship applications, community posts & resume builder
        </p>
      </div>

      {/* Mobile Hours Restriction Blocker Alert */}
      {mobileRestricted && (
        <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs flex items-start gap-3">
          <Smartphone size={22} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-red-800">Mobile Access Window Restricted</div>
            <p className="text-red-700 leading-relaxed">{mobileRestricted.message}</p>
            <div className="text-[11px] bg-red-100/70 p-2 rounded text-red-900 mt-1">
              <strong>Permitted Window:</strong> {mobileRestricted.requiredWindow} <br />
              <strong>Current Time:</strong> {mobileRestricted.currentTimeIST}
            </div>
          </div>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
          {serverError}
        </div>
      )}

      {/* Google Chrome OTP Challenge Modal */}
      {chromeOtpRequired && (
        <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-800">
            <ShieldAlert size={18} className="text-blue-600" />
            Google Chrome Security Verification
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            As required by security policy for <strong>Google Chrome</strong> users, an OTP has been sent to your registered email (<strong>{chromeOtpEmail}</strong>).
          </p>

          {previewOtp && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
              <span>Demo OTP: <strong>{previewOtp}</strong></span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">TEST MODE</span>
            </div>
          )}

          {chromeOtpError && (
            <div className="p-2 bg-red-100 border border-red-200 text-xs text-red-700 rounded-lg">
              {chromeOtpError}
            </div>
          )}

          <form onSubmit={verifyChromeOtp} className="space-y-3 pt-1">
            <input
              type="text"
              maxLength={6}
              value={chromeOtp}
              onChange={(e) => setChromeOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="w-full text-center tracking-widest text-lg font-bold py-2 bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={chromeOtpLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
            >
              {chromeOtpLoading ? "Verifying..." : "Verify OTP & Continue"}
            </button>
          </form>
        </div>
      )}

      {/* Mandatory Password Change Modal */}
      {mustChangePwdUser && (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-300 rounded-xl space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <Lock size={18} className="text-amber-700" />
            Password Change Required
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Your password was recently reset with a temporary letters-only password. Please choose a new personal password to continue.
          </p>

          {pwdChangeError && (
            <div className="p-2 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {pwdChangeError}
            </div>
          )}

          {pwdChangeSuccess && (
            <div className="p-2 bg-green-50 border border-green-200 text-xs text-green-700 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Password updated! Redirecting...
            </div>
          )}

          <form onSubmit={handleForcedPasswordChange} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
            >
              Update Password & Enter
            </button>
          </form>
        </div>
      )}

      {/* Main Login Form */}
      {!chromeOtpRequired && !mustChangePwdUser && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              {...register("Email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.Email && (
              <p className="text-xs text-red-500 mt-1">{errors.Email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
              >
                <KeyRound size={12} /> Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-10"
                {...register("Password", {
                  required: "Password is required",
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.Password && (
              <p className="text-xs text-red-500 mt-1">{errors.Password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-gray-600 space-y-2">
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register here
          </Link>
        </div>
        <div>
          Are you an admin?{" "}
          <Link
            href="/adminlogin"
            className="font-semibold text-gray-700 hover:text-blue-600"
          >
            Admin Login
          </Link>
        </div>
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}