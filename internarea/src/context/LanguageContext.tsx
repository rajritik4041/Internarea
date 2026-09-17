"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/data/api";
import {
  LanguageCode,
  LANGUAGES,
  translations,
} from "@/data/translations";
import { ShieldAlert, X, CheckCircle, Clock } from "lucide-react";

interface LanguageContextType {
  language: LanguageCode;
  t: (key: string, fallback?: string) => string;
  setLanguage: (lang: LanguageCode) => void;
  availableLanguages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: (key) => key,
  setLanguage: () => {},
  availableLanguages: LANGUAGES,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // French OTP Modal state
  const [showFrenchOtpModal, setShowFrenchOtpModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [previewOtp, setPreviewOtp] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);

  useEffect(() => {
    const storedLang = typeof window !== "undefined" ? (localStorage.getItem("platform_language") as LanguageCode) : null;
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.language && translations[parsed.language as LanguageCode]) {
            setLanguageState(parsed.language as LanguageCode);
          }
        } catch (e) {}
      }
    }
  }, []);

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    if (dict[key]) return dict[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  const handleLanguageChange = async (targetLang: LanguageCode) => {
    if (targetLang === language) return;

    // Requirement: Security check for French language switch
    if (targetLang === "fr") {
      let email = "";
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            email = JSON.parse(storedUser).Email || "";
          } catch (e) {}
        }
      }

      setTargetEmail(email);
      setOtpInput("");
      setOtpError("");
      setOtpSuccess("");
      setShowFrenchOtpModal(true);

      // Trigger OTP request
      try {
        setLoadingOtp(true);
        const res = await axios.post(`${API_BASE_URL}/api/language/request-french-otp`, {
          email: email || "security@internarea.com",
        });
        if (res.data && res.data.previewOtp) {
          setPreviewOtp(res.data.previewOtp);
        }
      } catch (err: any) {
        setOtpError(err.response?.data?.message || "Failed to send security OTP");
      } finally {
        setLoadingOtp(false);
      }
      return;
    }

    // Direct switch for other languages (applied dynamically without page reload)
    setLanguageState(targetLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("platform_language", targetLang);
      const storedUser = localStorage.getItem("user");
      let email = "";
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userObj.language = targetLang;
          email = userObj.Email;
          localStorage.setItem("user", JSON.stringify(userObj));
        } catch (e) {}
      }

      // Sync with server audit trail in background
      axios.post(`${API_BASE_URL}/api/language/change`, {
        email: email || undefined,
        language: targetLang,
      }).catch(() => {});
    }
  };

  const submitFrenchOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setOtpError("Please enter the 6-digit verification code");
      return;
    }

    try {
      setLoadingOtp(true);
      setOtpError("");

      const res = await axios.post(`${API_BASE_URL}/api/language/change`, {
        email: targetEmail || "security@internarea.com",
        language: "fr",
        otp: otpInput.trim(),
      });

      if (res.data && res.data.status) {
        setOtpSuccess("Verification successful! Switching language to French.");
        setLanguageState("fr");
        if (typeof window !== "undefined") {
          localStorage.setItem("platform_language", "fr");
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              u.language = "fr";
              localStorage.setItem("user", JSON.stringify(u));
            } catch (e) {}
          }
        }
        setTimeout(() => {
          setShowFrenchOtpModal(false);
        }, 1200);
      } else {
        setOtpError(res.data.message || "Invalid OTP code");
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        setLanguage: handleLanguageChange,
        availableLanguages: LANGUAGES,
      }}
    >
      {children}

      {/* French OTP Verification Modal */}
      {showFrenchOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setShowFrenchOtpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              {t("lang.frenchSecurity", "Security Verification Required")}
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              {t(
                "lang.frenchDesc",
                "As an additional security requirement, switching to French requires OTP verification sent to your registered email address."
              )}
            </p>

            {previewOtp && (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                <span>
                  Demo Verification OTP: <strong>{previewOtp}</strong>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                  TEST MODE
                </span>
              </div>
            )}

            {otpError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
                {otpError}
              </div>
            )}

            {otpSuccess && (
              <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-xs text-green-700 rounded-lg flex items-center gap-1.5">
                <CheckCircle size={14} />
                {otpSuccess}
              </div>
            )}

            <form onSubmit={submitFrenchOtp} className="space-y-4">
              {!targetEmail && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t("lang.otpLabel", "Enter 6-Digit OTP")}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-3 py-2 text-center tracking-widest text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowFrenchOtpModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loadingOtp}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {loadingOtp ? t("common.loading", "Verifying...") : t("lang.confirmSwitch", "Verify & Apply")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};
