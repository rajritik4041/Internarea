"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/data/api";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Briefcase,
  ArrowRight,
  LogOut,
} from "lucide-react";

interface UserProfile {
  _id?: string;
  Name?: string;
  Email?: string;
  PhoneNumber?: string;
  Photos?: string;
  company?: string;
}

interface UserApplication {
  _id: string;
  company: string;
  category: string;
  coverLetter: string;
  status: "accepted" | "rejected" | "pending";
  createdAt: string;
  Application?: any;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login?redirect=/profile");
        return;
      }
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        fetchUserApplications(parsed.Email);
      } catch (e) {
        router.push("/login?redirect=/profile");
      }
    }
  }, [router]);

  const fetchUserApplications = async (email?: string) => {
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/application/user/${encodeURIComponent(email)}`
      );
      if (res.data && res.data.data) {
        setApplications(res.data.data);
      }
    } catch (err: any) {
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      window.dispatchEvent(new Event("authChange"));
      router.push("/login");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-medium">Checking session...</div>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const acceptedCount = applications.filter((a) => a.status === "accepted").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
              {user.Name ? user.Name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.Name || "Student"}</h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Candidate
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-400" />
                  <span>{user.Email}</span>
                </div>
                {user.PhoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-400" />
                    <span>{user.PhoneNumber}</span>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-gray-400" />
                    <span>{user.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              href="/job"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Browse Jobs
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Total Applied
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="text-xs text-yellow-600 font-semibold uppercase tracking-wider">
              Pending Review
            </div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="text-xs text-green-600 font-semibold uppercase tracking-wider">
              Accepted
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">{acceptedCount}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="text-xs text-red-600 font-semibold uppercase tracking-wider">
              Rejected
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Job Applications</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Track status and feedback for roles you applied to
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {applications.length} {applications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium text-sm">
              Loading your applications...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium text-sm">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Briefcase size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                No Applications Submitted Yet
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                You haven&apos;t applied to any jobs or internships. Explore openings and apply today!
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/internship"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition"
                >
                  Explore Internships
                </Link>
                <Link
                  href="/job"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Explore Jobs
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const targetJob = app.Application;
                const roleTitle =
                  typeof targetJob === "object" && targetJob?.title
                    ? targetJob.title
                    : `${app.category || "Opportunity"} at ${app.company}`;
                const targetId =
                  typeof targetJob === "object" && targetJob?._id
                    ? targetJob._id
                    : typeof targetJob === "string"
                    ? targetJob
                    : null;

                return (
                  <div
                    key={app._id}
                    className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {app.category || "General"}
                        </span>
                        <span className="text-xs text-gray-400">
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900">{roleTitle}</h3>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
                        <Building size={14} className="text-gray-400" />
                        {app.company}
                      </p>

                      {app.coverLetter && (
                        <p className="text-xs text-gray-500 line-clamp-1 italic mt-1">
                          &quot;{app.coverLetter}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200">
                      <div>
                        {app.status === "accepted" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            <CheckCircle size={14} /> Accepted
                          </span>
                        ) : app.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <XCircle size={14} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                            <Clock size={14} /> Under Review
                          </span>
                        )}
                      </div>

                      {targetId && (
                        <Link
                          href={`/internareaid/${targetId}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                        >
                          View Details <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
