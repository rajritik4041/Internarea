"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/data/api";
import {
  KeyRound,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateLimitBlock, setRateLimitBlock] = useState<{ message: string; hoursRemaining?: number } | null>(null);

  // Step 2: OTP Verification State
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [otp, setOtp] = useState("");
  const [previewOtp, setPreviewOtp] = useState("");
  const [maskedTarget, setMaskedTarget] = useState("");

  // Step 3: Success State
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Handle Step 1: Request Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter your registered ${method === "email" ? "email address" : "mobile number"}`);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRateLimitBlock(null);

      const res = await axios.post(`${API_BASE_URL}/api/forgot-password/request`, {
        method,
        identifier: identifier.trim(),
      });

      if (res.data && res.data.status) {
        setMaskedTarget(res.data.email || identifier);
        setPreviewOtp(res.data.previewOtp || "");
        setStep("verify");
      } else {
        setError(res.data.message || "Failed to initiate password recovery");
      }
    } catch (err: any) {
      if (err.response?.status === 429 || err.response?.data?.code === "RESET_LIMIT_EXCEEDED") {
        setRateLimitBlock({
          message: err.response?.data?.message || "You can use this option only once per day.",
          hoursRemaining: err.response?.data?.hoursRemaining,
        });
      } else {
        setError(err.response?.data?.message || "User not found or recovery request failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP and Generate Letters-Only Password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_BASE_URL}/api/forgot-password/verify-and-reset`, {
        identifier: identifier.trim(),
        otp: otp.trim(),
      });

      if (res.data && res.data.status) {
        setGeneratedPassword(res.data.generatedPassword);
        setStep("success");
      } else {
        setError(res.data.message || "Invalid or expired OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              Intern<span className="text-gray-900">Area</span>
            </span>
          </Link>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("forgot.title", "Forgot Password")}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t(
              "forgot.subtitle",
              "Reset your account password via registered email or mobile number."
            )}
          </p>
        </div>

        {/* 24-Hour Rate Limit Blocker Alert */}
        {rateLimitBlock && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-amber-800">
                {rateLimitBlock.message}
              </div>
              <p className="text-amber-700">
                For security reasons, password resets are strictly restricted to once every 24 hours.
                {rateLimitBlock.hoursRemaining && ` Please try again in approximately ${rateLimitBlock.hoursRemaining} hour(s).`}
              </p>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center">
            {error}
          </div>
        )}

        {/* STEP 1: Request Reset */}
        {step === "request" && !rateLimitBlock && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setIdentifier("");
                  setError("");
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  method === "email"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Mail size={14} /> Registered Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("phone");
                  setIdentifier("");
                  setError("");
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  method === "phone"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Phone size={14} /> Mobile Number
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {method === "email" ? "Registered Email Address" : "Registered Mobile Number"}
              </label>
              <input
                type={method === "email" ? "email" : "tel"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={method === "email" ? "name@example.com" : "+91 9876543210"}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Security Requirements:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Permitted only once every 24 hours per account</li>
                <li>New password will contain letters only (A-Z, a-z)</li>
                <li>Mandatory password change required on next login</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-xs text-gray-500">Verification code sent to:</span>
              <div className="text-xs font-bold text-gray-800 mt-0.5">{maskedTarget}</div>
            </div>

            {previewOtp && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                <span>
                  Demo Verification OTP: <strong>{previewOtp}</strong>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                  TEST MODE
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Enter 6-Digit One-Time Password
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying & Generating Password..." : "Verify & Generate Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
            >
              Change email or phone number
            </button>
          </form>
        )}

        {/* STEP 3: Success & Letters-Only Password Display */}
        {step === "success" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Password Reset Successful!</h2>
              <p className="text-xs text-gray-500 mt-1">
                A new secure password consisting strictly of English uppercase and lowercase letters has been generated.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Your Temporary Password:
              </span>
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2.5">
                <span className="font-mono text-base font-bold text-blue-700 tracking-wider">
                  {generatedPassword}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-1.5 text-gray-500 hover:text-blue-600 transition"
                  title="Copy password"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                ⚠️ Requirement: You will be asked to change this password immediately upon your next login.
              </p>
            </div>

            <Link
              href="/login"
              className="block w-full text-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              Proceed to Login
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
