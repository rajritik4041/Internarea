"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/data/api";
import { Check, X, Clock, User, Building, Mail, FileText, ArrowLeft, LogOut, ShieldCheck } from "lucide-react";

interface ApplicationItem {
  _id: string;
  company: string;
  category: string;
  coverLetter: string;
  user: {
    name?: string;
    Name?: string;
    email?: string;
    Email?: string;
    phoneNumber?: string;
    PhoneNumber?: string;
    photo?: string;
    Photos?: string;
  };
  status: string;
  createdAt: string;
  Application?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/application`);
      if (res.data && res.data.data) {
        setApplications(res.data.data);
      }
    } catch (err: any) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin");
      if (!stored) {
        router.push("/adminlogin");
        return;
      }
      try {
        setAdmin(JSON.parse(stored));
        fetchApplications();
      } catch (e) {
        router.push("/adminlogin");
      }
    }
  }, [router]);

  const handleAdminLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin");
      window.dispatchEvent(new Event("authChange"));
      router.push("/adminlogin");
    }
  };

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      await axios.put(`${API_BASE_URL}/api/application/${id}/status`, {
        status,
      });
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 font-medium">Checking admin access...</div>
      </div>
    );
  }

  const filteredApps = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-gray-400 hover:text-gray-600 text-sm inline-flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck size={12} /> Admin Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Application Review
            </h1>
            <p className="text-sm text-gray-500">
              Manage candidate submissions, accept shortlisted applicants or reject
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending ({applications.filter((a) => a.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === "accepted"
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Accepted ({applications.filter((a) => a.status === "accepted").length})
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rejected ({applications.filter((a) => a.status === "rejected").length})
              </button>
            </div>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            Loading candidate applications...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-medium">
            {error}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500">
            No applications found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const candidateName =
                app.user?.Name || app.user?.name || "Anonymous Candidate";
              const candidateEmail =
                app.user?.Email || app.user?.email || "No email provided";
              const targetTitle =
                typeof app.Application === "object"
                  ? app.Application?.title
                  : null;

              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        {app.category || "General"}
                      </span>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          app.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {app.status === "accepted" && <Check size={12} />}
                        {app.status === "rejected" && <X size={12} />}
                        {app.status === "pending" && <Clock size={12} />}
                        {app.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <Building size={18} className="text-gray-400" />
                      {app.company}
                    </h2>

                    {targetTitle && (
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Role: {targetTitle}
                      </p>
                    )}

                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-gray-800 font-semibold">
                        <User size={14} className="text-gray-400" />
                        {candidateName}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {candidateEmail}
                      </div>
                    </div>

                    {app.coverLetter && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1">
                          <FileText size={12} /> Cover Letter
                        </span>
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 line-clamp-4">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(app._id, "accepted")}
                        disabled={app.status === "accepted"}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(app._id, "rejected")}
                        disabled={app.status === "rejected"}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}