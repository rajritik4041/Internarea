"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  User as UserIcon,
  LogOut,
  FileText,
  Globe,
  Bell,
  Sparkles,
  Users,
  CreditCard,
  ChevronDown,
  Menu,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/data/api";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageCode } from "@/data/translations";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const storedAdmin = localStorage.getItem("admin");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setAdmin(storedAdmin ? JSON.parse(storedAdmin) : null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user && user.Email) {
      axios
        .get(`${API_BASE_URL}/api/notifications/${encodeURIComponent(user.Email)}`)
        .then((res) => {
          if (res.data && res.data.status) {
            setNotifications(res.data.data || []);
            setUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      setUser(null);
      setAdmin(null);
      window.dispatchEvent(new Event("authChange"));
      router.push("/login");
    }
  };

  const markNotificationsRead = () => {
    if (user && user.Email && unreadCount > 0) {
      axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`, { userEmail: user.Email });
      setUnreadCount(0);
    }
  };

  const currentLangObj = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Main Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              Intern<span className="text-gray-900">Area</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-5 text-xs font-bold text-gray-700">
            <Link
              href="/internship"
              className={`transition hover:text-blue-600 ${
                pathname === "/internship" ? "text-blue-600 font-extrabold" : ""
              }`}
            >
              {t("nav.internships", "Internships")}
            </Link>
            <Link
              href="/job"
              className={`transition hover:text-blue-600 ${
                pathname === "/job" ? "text-blue-600 font-extrabold" : ""
              }`}
            >
              {t("nav.jobs", "Jobs")}
            </Link>
            <Link
              href="/public-space"
              className={`flex items-center gap-1 transition hover:text-blue-600 ${
                pathname === "/public-space" ? "text-blue-600 font-extrabold" : ""
              }`}
            >
              <Users size={14} className="text-indigo-500" />
              <span>{t("nav.publicSpace", "Public Space")}</span>
            </Link>
            <Link
              href="/resume-builder"
              className={`flex items-center gap-1 transition hover:text-blue-600 ${
                pathname === "/resume-builder" ? "text-blue-600 font-extrabold" : ""
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>{t("nav.resumeBuilder", "Resume Builder")}</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                ₹50
              </span>
            </Link>
            <Link
              href="/subscriptions"
              className={`flex items-center gap-1 transition hover:text-blue-600 ${
                pathname === "/subscriptions" ? "text-blue-600 font-extrabold" : ""
              }`}
            >
              <CreditCard size={14} className="text-emerald-500" />
              <span>{t("nav.pricing", "Plans")}</span>
            </Link>
          </div>
        </div>

        {/* Right Section: Language Selector, Notifications, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition cursor-pointer"
              title="Change Language"
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <ChevronDown size={12} className="text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  Select Language
                </div>
                {availableLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as LanguageCode);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition hover:bg-blue-50 ${
                      language === l.code ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {language === l.code && <Check size={14} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* In-App Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) markNotificationsRead();
                }}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 relative transition cursor-pointer"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Notifications</span>
                    <span className="text-[11px] text-gray-400">{notifications.length} Total</span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 text-xs transition hover:bg-gray-50 ${
                            !n.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="font-semibold text-gray-800 mb-0.5">{n.title || "Notification"}</div>
                          <p className="text-gray-600 text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 transition"
              >
                <UserIcon size={14} />
                <span className="max-w-[100px] truncate">{user.Name || user.Email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 px-2 py-1.5 transition cursor-pointer"
                title="Logout"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">{t("nav.logout", "Logout")}</span>
              </button>
            </div>
          ) : admin ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition"
              >
                {t("nav.admin", "Admin Panel")}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 px-2 py-1.5 transition cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Link
                className="px-3 py-1.5 font-semibold text-gray-700 hover:text-blue-600 transition"
                href="/login"
              >
                {t("nav.login", "Login")}
              </Link>
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition text-xs shadow-xs"
                href="/register"
              >
                {t("nav.register", "Register")}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-gray-600 hover:text-blue-600"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/internship"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            {t("nav.internships", "Internships")}
          </Link>
          <Link
            href="/job"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            {t("nav.jobs", "Jobs")}
          </Link>
          <Link
            href="/public-space"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              {t("nav.publicSpace", "Public Space Community")}
            </span>
          </Link>
          <Link
            href="/resume-builder"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              {t("nav.resumeBuilder", "Resume Builder")}
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">₹50</span>
          </Link>
          <Link
            href="/subscriptions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-500" />
              {t("nav.pricing", "Subscription Plans")}
            </span>
          </Link>
          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <FileText size={16} />
              {t("nav.myApplications", "My Applications & Profile")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
