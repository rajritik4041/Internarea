"use client";

import React, { useState, useEffect } from "react";
import { Search, User as UserIcon, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);

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

  return (
    <nav className="w-full h-20 bg-white border-b border-gray-200 flex items-center px-4 sm:px-8">
      <div className="flex w-full justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              Intern<span className="text-gray-900">Area</span>
            </span>
          </Link>

          <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-700">
            <Link href="/internship" className="hover:text-blue-600 transition">
              Internships
            </Link>
            <Link href="/job" className="hover:text-blue-600 transition">
              Jobs
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 w-72">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="bg-transparent border-none outline-none text-xs text-gray-700 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-blue-600 transition px-2 py-1"
              >
                <FileText size={14} />
                <span>My Applications</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 transition"
              >
                <UserIcon size={14} />
                <span>{user.Name || user.Email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 px-2 py-1.5 transition cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : admin ? (
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition"
              >
                Admin Panel
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 px-2 py-1.5 transition cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Link
                className="px-3.5 py-1.5 font-semibold text-gray-700 hover:text-blue-600 transition"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg transition"
                href="/register"
              >
                Register
              </Link>
              <Link
                className="text-gray-500 hover:text-gray-800 text-xs font-medium px-2 py-1"
                href="/adminlogin"
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
