"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { API_BASE_URL } from "@/data/api";
import {
  MapPin,
  Briefcase,
  Calendar,
  IndianRupee,
  Building,
  CheckCircle,
  ArrowLeft,
  Users,
} from "lucide-react";

interface ItemDetail {
  _id: string;
  title: string;
  company: string;
  location?: string;
  category?: string;
  Experience?: string;
  CTC?: string | number;
  stipend?: string | number;
  startDate?: string;
  StartDate?: string;
  numberOfOpening?: string;
  aboutCompany?: string;
  aboutJob?: string;
  aboutInternship?: string;
  whoCanApply?: string;
  perks?: string[];
  additionalInfo?: string;
  AdditionalInfo?: string;
}

export default function DetailAndApplyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          setCurrentUser(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/detail/${id}`);
        if (res.data && res.data.status && res.data.data) {
          setItem(res.data.data);
        } else {
          setError("Listing not found");
        }
      } catch (err) {
        try {
          const fallbackRes = await axios.get(`${API_BASE_URL}/api/job`);
          const found = fallbackRes.data.data?.find((j: any) => j._id === id);
          if (found) {
            setItem(found);
          } else {
            const internRes = await axios.get(`${API_BASE_URL}/api/internship`);
            const foundIntern = internRes.data.data?.find((i: any) => i._id === id);
            if (foundIntern) {
              setItem(foundIntern);
            } else {
              setError("Could not find opportunity details");
            }
          }
        } catch (fallbackErr) {
          setError("Failed to load details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleApplyClick = () => {
    if (!currentUser) {
      router.push(`/login?redirect=/internareaid/${id}`);
      return;
    }
    setShowModal(true);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !item) return;

    try {
      setSubmitting(true);
      setApplyError("");

      const payload = {
        company: item.company,
        category: item.category || "General",
        coverLetter: coverLetter,
        user: currentUser,
        Application: item,
      };

      const res = await axios.post(`${API_BASE_URL}/api/application`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data && res.data.status) {
        setApplied(true);
        setShowModal(false);
      } else {
        setApplyError(res.data.message || "Failed to submit application");
      }
    } catch (err: any) {
      setApplyError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-gray-500 font-medium">Loading details...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <p className="text-red-600 font-semibold mb-4">{error || "Opportunity not found"}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} /> Back to listings
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mb-2">
                Actively Hiring
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{item.title}</h1>
              <p className="text-base text-gray-600 mt-1 flex items-center gap-2">
                <Building size={18} className="text-gray-400" />
                {item.company}
              </p>
            </div>

            <div>
              {applied ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold">
                  <CheckCircle size={18} />
                  Applied Successfully
                </div>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow cursor-pointer"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-100 text-sm">
            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">LOCATION</span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                <MapPin size={16} className="text-gray-400" />
                {item.location || "Remote / Hybrid"}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">
                {item.CTC ? "CTC (ANNUAL)" : "STIPEND"}
              </span>
              <div className="flex items-center gap-1 font-semibold text-gray-800">
                <IndianRupee size={16} className="text-gray-400" />
                {item.CTC || item.stipend || "Best in Industry"}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">EXPERIENCE</span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                <Briefcase size={16} className="text-gray-400" />
                {item.Experience || "Fresher"}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">START DATE</span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                <Calendar size={16} className="text-gray-400" />
                {item.startDate || item.StartDate || "Immediately"}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 text-sm text-gray-700">
            {item.numberOfOpening && (
              <div>
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Users size={16} className="text-gray-400" /> Number of Openings
                </h3>
                <p>{item.numberOfOpening}</p>
              </div>
            )}

            {(item.aboutJob || item.aboutInternship) && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">About the Role</h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {item.aboutJob || item.aboutInternship}
                </p>
              </div>
            )}

            {item.aboutCompany && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">About {item.company}</h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {item.aboutCompany}
                </p>
              </div>
            )}

            {item.whoCanApply && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">Who Can Apply</h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {item.whoCanApply}
                </p>
              </div>
            )}

            {item.perks && item.perks.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">Perks & Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {item.perks.map((perk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(item.additionalInfo || item.AdditionalInfo) && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">Additional Information</h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {item.additionalInfo || item.AdditionalInfo}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">
                {currentUser
                  ? `Logged in as ${currentUser.Name || currentUser.Email}`
                  : "You need to log in to submit your application"}
              </p>
            </div>

            {applied ? (
              <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold">
                <CheckCircle size={18} />
                Application Submitted
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow cursor-pointer"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Apply for {item.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{item.company}</p>

            {applyError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {applyError}
              </div>
            )}

            <form onSubmit={submitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Applicant Name
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.Name || ""}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Email
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.Email || ""}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Cover Letter / Why should we hire you?
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Mention your relevant skills, past projects, or why you are a great fit..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}