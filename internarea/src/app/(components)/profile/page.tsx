"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/data/api";
import Navbar from "@/Components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
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
  LogOut,
  Shield,
  CreditCard,
  FileText,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Star,
  Download,
  AlertTriangle,
  History,
} from "lucide-react";

interface UserProfile {
  _id?: string;
  Name?: string;
  Email?: string;
  PhoneNumber?: string;
  Photos?: string;
  company?: string;
  language?: string;
  subscription?: any;
  defaultResumeId?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<
    "applications" | "subscription" | "resumes" | "security" | "languages"
  >("applications");

  // Tab Data States
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [resumes, setResumes] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [languageHistory, setLanguageHistory] = useState<any[]>([]);

  const [sessionActionMessage, setSessionActionMessage] = useState("");

  const fetchAllData = (email: string) => {
    // 1. Applications
    setLoadingApps(true);
    axios
      .get(`${API_BASE_URL}/api/application/user/${encodeURIComponent(email)}`)
      .then((res) => setApplications(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingApps(false));

    // 2. Subscription & Invoices
    axios
      .get(`${API_BASE_URL}/api/subscription/status/${encodeURIComponent(email)}`)
      .then((res) => setSubscription(res.data?.subscription || null))
      .catch(() => {});

    axios
      .get(`${API_BASE_URL}/api/subscription/invoices/${encodeURIComponent(email)}`)
      .then((res) => setInvoices(res.data?.data || []))
      .catch(() => {});

    // 3. Resumes
    axios
      .get(`${API_BASE_URL}/api/resume/user/${encodeURIComponent(email)}`)
      .then((res) => setResumes(res.data?.data || []))
      .catch(() => {});

    // 4. Security & Login History
    axios
      .get(`${API_BASE_URL}/api/user/${encodeURIComponent(email)}/login-history`)
      .then((res) => {
        if (res.data && res.data.status) {
          setLoginHistory(res.data.loginHistory || []);
          setTrustedDevices(res.data.trustedDevices || []);
          setActiveSessions(res.data.activeSessions || []);
          setLanguageHistory(res.data.languageHistory || []);
        }
      })
      .catch(() => {});
  };

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
        fetchAllData(parsed.Email);
      } catch (e) {
        router.push("/login?redirect=/profile");
      }
    }
  }, [router]);

  const handleTerminateOtherSessions = async () => {
    if (!user?.Email) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sessions/terminate-others`, {
        Email: user.Email,
      });
      if (res.data && res.data.status) {
        setSessionActionMessage("All other active sessions have been terminated successfully.");
        setActiveSessions(res.data.activeSessions || []);
        setTimeout(() => setSessionActionMessage(""), 4000);
      }
    } catch (e) {
      alert("Failed to terminate other sessions");
    }
  };

  const handleSetDefaultResume = async (resumeId: string) => {
    if (!user?.Email) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/resume/${resumeId}/set-default`, {
        userEmail: user.Email,
      });
      if (res.data && res.data.status) {
        setResumes((prev) =>
          prev.map((r) => ({ ...r, isDefault: r._id === resumeId }))
        );
        const updatedUser = { ...user, defaultResumeId: resumeId };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (e) {}
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
        <div className="text-gray-500 font-medium text-xs">Checking session...</div>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const acceptedCount = applications.filter((a) => a.status === "accepted").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-2xl shadow-xs">
              {user.Name ? user.Name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">{user.Name || "Student"}</h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Candidate
                </span>
                {subscription && (
                  <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {subscription.plan} Member
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-gray-600">
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
              href="/resume-builder"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Resume Builder
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition ${
              activeTab === "applications"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Briefcase size={14} />
            <span>Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition ${
              activeTab === "subscription"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CreditCard size={14} />
            <span>Subscription & Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab("resumes")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition ${
              activeTab === "resumes"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText size={14} />
            <span>My Resumes ({resumes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition ${
              activeTab === "security"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Shield size={14} />
            <span>Login History & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("languages")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition ${
              activeTab === "languages"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Globe size={14} />
            <span>Language Audit History</span>
          </button>
        </div>

        {/* TAB 1: Applications */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  Total Applied
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="text-[11px] text-yellow-600 font-bold uppercase tracking-wider">
                  Under Review
                </div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="text-[11px] text-green-600 font-bold uppercase tracking-wider">
                  Accepted
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">{acceptedCount}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="text-[11px] text-red-600 font-bold uppercase tracking-wider">
                  Rejected
                </div>
                <div className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Submitted Applications</h2>
              {loadingApps ? (
                <div className="text-center py-8 text-xs text-gray-400">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  You have not applied to any roles yet. Explore opportunities!
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800">{app.company}</span>
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.2 rounded font-semibold">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 italic">
                          &quot;{app.coverLetter}&quot;
                        </p>
                        <span className="text-[10px] text-gray-400 block">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

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
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Subscription & Invoices */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            {subscription && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Current Subscription
                  </span>
                  <h2 className="text-2xl font-black text-gray-900">{subscription.plan} Plan</h2>
                  <p className="text-xs text-gray-500">
                    Monthly Application Quota:{" "}
                    <strong>
                      {subscription.usedApplications} /{" "}
                      {subscription.applicationLimit === 999999
                        ? "Unlimited"
                        : subscription.applicationLimit}{" "}
                      used
                    </strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Cycle Reset Date:{" "}
                    <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
                  </p>
                </div>

                <Link
                  href="/subscriptions"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Upgrade or Change Plan
                </Link>
              </div>
            )}

            {/* Invoices List */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-gray-900">Payment & Invoice History</h3>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">No payment records yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                      <tr>
                        <th className="p-3">Invoice #</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Transaction ID</th>
                        <th className="p-3">Date (IST)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-blue-600">
                            {inv.invoiceNumber}
                          </td>
                          <td className="p-3 font-semibold text-gray-800">
                            {inv.type === "resume_download"
                              ? "Resume Builder (₹50)"
                              : `${inv.plan} Subscription`}
                          </td>
                          <td className="p-3 font-bold text-gray-900">₹{inv.amount}</td>
                          <td className="p-3 font-mono text-gray-500">{inv.transactionId}</td>
                          <td className="p-3 text-gray-500">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Resumes & ATS Versions */}
        {activeTab === "resumes" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">ATS Resume Versions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your active default resume is automatically attached when applying for opportunities.
                </p>
              </div>
              <Link
                href="/resume-builder"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
              >
                + Create New Resume
              </Link>
            </div>

            {resumes.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">
                You haven&apos;t generated any resumes yet. Click above to build your first ATS resume!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {resumes.map((res) => (
                  <div
                    key={res._id}
                    className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{res.title}</div>
                        <div className="text-[11px] text-gray-500">
                          v{res.version} • {res.templateId} template • Updated{" "}
                          {new Date(res.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {res.isDefault ? (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-blue-800" /> Default Resume
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultResume(res._id)}
                          className="text-[11px] text-blue-600 hover:underline font-bold"
                        >
                          Make Default
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-gray-600">
                      Applicant: <strong>{res.personalInfo?.fullName}</strong> ({res.personalInfo?.email})
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                      <span className="text-gray-400 text-[11px]">
                        Downloads: {res.downloadHistory?.length || 0}
                      </span>
                      <Link
                        href="/resume-builder"
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Edit in Builder →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Login History & Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {sessionActionMessage && (
              <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle size={16} /> {sessionActionMessage}
              </div>
            )}

            {/* Active Sessions Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Active Sessions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Review devices and browsers currently signed in to your account.
                  </p>
                </div>
                <button
                  onClick={handleTerminateOtherSessions}
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Sign Out from Other Devices
                </button>
              </div>

              <div className="divide-y divide-gray-100 text-xs">
                {activeSessions.length === 0 ? (
                  <div className="py-4 text-gray-400">Current device session active</div>
                ) : (
                  activeSessions.map((s, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                          {s.deviceType === "mobile" ? (
                            <Smartphone size={16} />
                          ) : s.deviceType === "tablet" ? (
                            <Tablet size={16} />
                          ) : s.deviceType === "laptop" ? (
                            <Laptop size={16} />
                          ) : (
                            <Monitor size={16} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {s.browser} on {s.os}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            IP: {s.ip} • Logged in: {new Date(s.loginTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Login History Log Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-gray-900">Detailed Login Activity History</h3>
              <p className="text-xs text-gray-500">
                Audited records of all authentication attempts, environments, and device models.
              </p>

              {loginHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">No login logs available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Browser & Version</th>
                        <th className="p-3">OS</th>
                        <th className="p-3">Device Type & Model</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loginHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-600 whitespace-nowrap">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold text-gray-900">
                            {item.browser} {item.browserVersion ? `v${item.browserVersion}` : ""}
                          </td>
                          <td className="p-3 text-gray-700">{item.os}</td>
                          <td className="p-3 capitalize text-gray-700">
                            {item.deviceType} ({item.deviceModel || "Generic"})
                          </td>
                          <td className="p-3 font-mono text-gray-600">{item.ip}</td>
                          <td className="p-3">
                            {item.status === "success" ? (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Success
                              </span>
                            ) : item.status === "rejected_mobile_hours" ? (
                              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full" title={item.reason}>
                                Mobile Time Restricted
                              </span>
                            ) : item.status === "otp_required" ? (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Chrome OTP Challenged
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {item.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Language Audit History */}
        {activeTab === "languages" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Language Preference History</h2>
            <p className="text-xs text-gray-500">
              Audit log of language switching events, timestamps, IP addresses, and browsers.
            </p>

            {languageHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No language switch events recorded yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                    <tr>
                      <th className="p-3">Changed At</th>
                      <th className="p-3">Selected Language</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Browser</th>
                      <th className="p-3">Device</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {languageHistory.map((l, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-600">{new Date(l.changedAt).toLocaleString()}</td>
                        <td className="p-3 font-bold text-blue-700 uppercase">{l.language}</td>
                        <td className="p-3 font-mono text-gray-600">{l.ip || "Localhost"}</td>
                        <td className="p-3 text-gray-700">{l.browser || "Browser"}</td>
                        <td className="p-3 capitalize text-gray-700">{l.device || "Desktop"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
