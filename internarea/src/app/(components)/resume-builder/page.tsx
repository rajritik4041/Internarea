"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/Components/Navbar";
import { API_BASE_URL } from "@/data/api";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileText,
  Sparkles,
  Download,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Palette,
  Type,
  Layout,
  Star,
  ExternalLink,
  History,
  X,
} from "lucide-react";

export default function ResumeBuilderPage() {
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Resume Form State
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState("Professional ATS Resume");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 9876543210",
    location: "Bengaluru, India",
    photo: "",
    careerObjective:
      "Results-driven Computer Science student with a strong foundation in Full Stack Web Development, Cloud Computing, and Data Structures. Passionate about building scalable applications and eager to contribute to high-impact software engineering internships.",
  });

  const [education, setEducation] = useState([
    {
      institution: "Indian Institute of Technology",
      degree: "B.Tech in Computer Science & Engineering",
      fieldOfStudy: "Computer Science",
      startYear: "2023",
      endYear: "2027",
      score: "8.9 CGPA",
    },
  ]);

  const [skills, setSkills] = useState([
    "JavaScript (ES6+)",
    "TypeScript",
    "React.js / Next.js",
    "Node.js / Express",
    "Python",
    "MongoDB",
    "SQL / PostgreSQL",
    "Git & GitHub",
    "REST APIs",
    "Tailwind CSS",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const [workExperience, setWorkExperience] = useState([
    {
      company: "TechNova Solutions",
      role: "Software Development Intern",
      startDate: "June 2025",
      endDate: "August 2025",
      currentlyWorking: false,
      description:
        "Engineered RESTful microservices reducing API latency by 28%. Collaborated with product designers to implement responsive React components with 100% test coverage.",
    },
  ]);

  const [projects, setProjects] = useState([
    {
      title: "Collaborative Coding Workspace",
      technologies: "Next.js, WebSockets, Node.js, Redis",
      link: "https://github.com/example/collab-code",
      description:
        "Built a real-time collaborative code editor supporting multi-user pairing with syntax highlighting and room permissions.",
    },
  ]);

  const [certifications, setCertifications] = useState([
    {
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      year: "2025",
      url: "https://aws.amazon.com",
    },
  ]);

  const [languages, setLanguages] = useState(["English (Fluent)", "Hindi (Native)"]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "https://linkedin.com/in/aarav-sharma",
    github: "https://github.com/aaravsharma",
    portfolio: "https://aaravsharma.dev",
  });
  const [references, setReferences] = useState([
    {
      name: "Dr. K. Raman",
      designation: "Head of Dept, CSE",
      contact: "k.raman@institution.edu",
    },
  ]);

  // Design customization
  const [templateId, setTemplateId] = useState<"modern" | "classic_ats" | "minimal" | "creative">("modern");
  const [themeColor, setThemeColor] = useState("#2563EB");
  const [fontFamily, setFontFamily] = useState("Inter");

  // Payment & Verification Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"otp" | "checkout" | "success">("otp");
  const [paymentOtp, setPaymentOtp] = useState("");
  const [previewOtp, setPreviewOtp] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // Resume Versions Drawer
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [showVersionsDrawer, setShowVersionsDrawer] = useState(false);

  const fetchSavedResumes = async (email: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/user/${encodeURIComponent(email)}`);
      if (res.data && res.data.status) {
        setSavedResumes(res.data.data || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          setPersonalInfo((prev) => ({
            ...prev,
            fullName: parsed.Name || prev.fullName,
            email: parsed.Email || prev.email,
            phone: parsed.PhoneNumber || prev.phone,
          }));
          fetchSavedResumes(parsed.Email);
        } catch (e) {}
      }
    }
  }, []);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Resume Draft
  const handleSaveDraft = async () => {
    if (!currentUser) {
      setErrorMessage("Please log in to save your resume");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      const payload = {
        userEmail: currentUser.Email,
        resumeId: resumeId || undefined,
        title: resumeTitle,
        personalInfo,
        education,
        skills,
        workExperience,
        internships: [],
        projects,
        certifications,
        achievements: [],
        languages,
        socialLinks,
        references,
        templateId,
        themeColor,
        fontFamily,
      };

      const res = await axios.post(`${API_BASE_URL}/api/resume/save`, payload);
      if (res.data && res.data.status) {
        setResumeId(res.data.resume._id);
        setStatusMessage("Resume draft saved successfully!");
        fetchSavedResumes(currentUser.Email);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to save resume");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Trigger Download/Generate Flow (Requires Identity Verification OTP before ₹50 Razorpay)
  const handleInitiateDownload = async () => {
    if (!currentUser) {
      setErrorMessage("Please log in to generate or download your resume");
      return;
    }

    // First auto-save
    await handleSaveDraft();

    // Reset payment modal
    setPaymentStep("otp");
    setPaymentOtp("");
    setPaymentError("");
    setShowPaymentModal(true);

    // Request OTP from server
    try {
      setPaymentLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/resume/request-payment-otp`, {
        userEmail: currentUser.Email,
        resumeId,
      });
      if (res.data && res.data.previewOtp) {
        setPreviewOtp(res.data.previewOtp);
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || "Failed to request identity verification OTP");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpForPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentOtp.trim()) {
      setPaymentError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      const res = await axios.post(`${API_BASE_URL}/api/resume/verify-otp-and-initiate-pay`, {
        userEmail: currentUser.Email,
        otp: paymentOtp.trim(),
        resumeId,
      });

      if (res.data && res.data.status) {
        setPaymentStep("checkout");
      } else {
        setPaymentError(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Step 3: Complete ₹50 Payment
  const handleCompletePayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError("");

      const paymentId = "pay_rzp_" + Math.random().toString(36).substring(2, 10).toUpperCase();

      const res = await axios.post(`${API_BASE_URL}/api/resume/verify-payment`, {
        userEmail: currentUser.Email,
        resumeId,
        paymentId,
        orderId: "order_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        billingDetails: {
          name: currentUser.Name,
          email: currentUser.Email,
          phone: currentUser.PhoneNumber,
        },
      });

      if (res.data && res.data.status) {
        setGeneratedInvoice(res.data.invoice);
        setPaymentStep("success");
        fetchSavedResumes(currentUser.Email);

        // Update local user default resume
        const updatedUser = { ...currentUser, defaultResumeId: res.data.resume._id };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || "Payment processing failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Print to PDF
  const triggerPdfDownload = () => {
    if (resumeId) {
      axios.post(`${API_BASE_URL}/api/resume/${resumeId}/download-log`).catch(() => {});
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Banner */}
        <div className="print:hidden bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
              <Sparkles size={14} /> Premium ATS-Optimized Resume Builder
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Build a Job-Winning Resume
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Designed with recruiters and ATS algorithms in mind. Customize templates, verify identity with secure OTP, and download a verified PDF for ₹50 with automatic profile linkage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowVersionsDrawer(!showVersionsDrawer)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <History size={14} /> My Resumes ({savedResumes.length})
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={handleInitiateDownload}
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              <Download size={14} /> Download PDF (₹50)
            </button>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {statusMessage && (
          <div className="print:hidden mb-6 p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 size={16} /> {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="print:hidden mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        {/* Workspace: Left Form Controls (Col 5) vs Right Live Preview (Col 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Hidden when printing) */}
          <div className="print:hidden lg:col-span-5 space-y-6">
            {/* Template & Theme Selector Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layout size={16} className="text-blue-600" /> Template & Styling
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "modern", name: "Modern Clean" },
                  { id: "classic_ats", name: "Classic ATS" },
                  { id: "minimal", name: "Minimalist" },
                  { id: "creative", name: "Executive Tech" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setTemplateId(tpl.id as any)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                      templateId === tpl.id
                        ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700">Accent Color:</span>
                  <div className="flex items-center gap-1.5">
                    {["#2563EB", "#059669", "#7C3AED", "#DC2626", "#0F172A"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setThemeColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border transition ${
                          themeColor === c ? "ring-2 ring-offset-1 ring-blue-500 scale-110" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Type size={14} className="text-gray-400" />
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg p-1 font-semibold text-gray-700 outline-none"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Details Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Resume Title</label>
                  <input
                    type="text"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Career Objective</label>
                  <textarea
                    rows={3}
                    value={personalInfo.careerObjective}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, careerObjective: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                2. Key Skills & Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSkillInput.trim()) {
                      e.preventDefault();
                      setSkills([...skills, newSkillInput.trim()]);
                      setNewSkillInput("");
                    }
                  }}
                  placeholder="Add skill (press Enter)..."
                  className="flex-1 text-xs border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkillInput.trim()) {
                      setSkills([...skills, newSkillInput.trim()]);
                      setNewSkillInput("");
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-900"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  3. Work Experience & Internships
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setWorkExperience([
                      ...workExperience,
                      {
                        company: "Company Name",
                        role: "Intern / Role",
                        startDate: "Jan 2025",
                        endDate: "Present",
                        currentlyWorking: true,
                        description: "Key responsibilities and achievements.",
                      },
                    ])
                  }
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Plus size={12} /> Add Role
                </button>
              </div>

              {workExperience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200/60">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-gray-700">Role #{idx + 1}</span>
                    {workExperience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[idx].company = e.target.value;
                        setWorkExperience(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Role Title"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[idx].role = e.target.value;
                        setWorkExperience(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. Jun 2025 - Aug 2025)"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[idx].startDate = e.target.value;
                        setWorkExperience(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5 col-span-2"
                    />
                    <textarea
                      rows={2}
                      placeholder="Key achievements and impact..."
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[idx].description = e.target.value;
                        setWorkExperience(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5 col-span-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  4. Education
                </h3>
              </div>
              {education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200/60">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].institution = e.target.value;
                        setEducation(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5 col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5"
                    />
                    <input
                      type="text"
                      placeholder="CGPA / Score"
                      value={edu.score}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].score = e.target.value;
                        setEducation(updated);
                      }}
                      className="text-xs bg-white border border-gray-200 rounded p-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live High-Fidelity Resume Preview Column (Col 7) */}
          <div className="lg:col-span-7 bg-gray-100 p-2 sm:p-4 rounded-3xl border border-gray-200">
            <div className="print:hidden flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                <FileText size={16} className="text-blue-600" /> Live ATS Preview
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                Standard A4 Dimensions
              </span>
            </div>

            {/* A4 Sheet Container */}
            <div
              ref={printRef}
              style={{ fontFamily: fontFamily }}
              className="bg-white w-full max-w-[800px] mx-auto min-h-[1050px] shadow-xl p-8 sm:p-12 rounded-xl text-gray-800 border border-gray-300 print:border-0 print:shadow-none print:p-0 print:m-0"
            >
              {/* Header Section */}
              <div className="border-b-2 pb-6 mb-6" style={{ borderColor: themeColor }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h1
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: themeColor }}
                    >
                      {personalInfo.fullName || "Your Full Name"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 font-medium">
                      <span>{personalInfo.email}</span>
                      <span>•</span>
                      <span>{personalInfo.phone}</span>
                      <span>•</span>
                      <span>{personalInfo.location}</span>
                    </div>
                    {socialLinks.linkedin && (
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-0.5">
                        <Link href={socialLinks.linkedin} className="hover:underline">
                          LinkedIn: {socialLinks.linkedin}
                        </Link>
                        {socialLinks.github && (
                          <span>| GitHub: {socialLinks.github}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {personalInfo.photo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={personalInfo.photo}
                      alt="Profile"
                      className="w-20 h-20 rounded-xl object-cover border-2 shadow-xs shrink-0"
                      style={{ borderColor: themeColor }}
                    />
                  )}
                </div>

                {personalInfo.careerObjective && (
                  <p className="text-xs text-gray-700 leading-relaxed mt-4 pt-3 border-t border-gray-100">
                    {personalInfo.careerObjective}
                  </p>
                )}
              </div>

              {/* Body Sections */}
              <div className="space-y-6 text-xs">
                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <h2
                      className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b"
                      style={{ color: themeColor, borderColor: themeColor + "40" }}
                    >
                      Technical & Core Competencies
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[11px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {workExperience.length > 0 && (
                  <div>
                    <h2
                      className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b"
                      style={{ color: themeColor, borderColor: themeColor + "40" }}
                    >
                      Work Experience & Internships
                    </h2>
                    <div className="space-y-3">
                      {workExperience.map((exp, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-center font-bold text-gray-900">
                            <span>
                              {exp.role} — <span style={{ color: themeColor }}>{exp.company}</span>
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {exp.startDate}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[11.5px]">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <div>
                    <h2
                      className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b"
                      style={{ color: themeColor, borderColor: themeColor + "40" }}
                    >
                      Featured Projects
                    </h2>
                    <div className="space-y-2.5">
                      {projects.map((proj, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-center font-bold text-gray-900">
                            <span>{proj.title}</span>
                            <span className="text-[11px] font-semibold text-gray-500">
                              {proj.technologies}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-[11.5px]">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div>
                    <h2
                      className="text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b"
                      style={{ color: themeColor, borderColor: themeColor + "40" }}
                    >
                      Education
                    </h2>
                    <div className="space-y-2">
                      {education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-gray-900">{edu.institution}</div>
                            <div className="text-gray-600 text-[11px]">{edu.degree}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">{edu.score}</div>
                            <div className="text-[11px] text-gray-500">
                              {edu.startYear} - {edu.endYear}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Languages */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  {certifications.length > 0 && (
                    <div>
                      <h3
                        className="font-bold text-xs uppercase tracking-wider mb-1"
                        style={{ color: themeColor }}
                      >
                        Certifications
                      </h3>
                      {certifications.map((c, i) => (
                        <div key={i} className="text-[11px] text-gray-700">
                          <strong>{c.name}</strong> — {c.issuer} ({c.year})
                        </div>
                      ))}
                    </div>
                  )}

                  {languages.length > 0 && (
                    <div>
                      <h3
                        className="font-bold text-xs uppercase tracking-wider mb-1"
                        style={{ color: themeColor }}
                      >
                        Languages
                      </h3>
                      <div className="text-[11px] text-gray-700">
                        {languages.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment & OTP Identity Verification Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>

            {/* STEP 1: OTP Identity Verification */}
            {paymentStep === "otp" && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Identity Verification</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Before initiating payment through Razorpay, an OTP has been sent to your registered email (<strong>{currentUser?.Email}</strong>).
                  </p>
                </div>

                {previewOtp && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                    <span>Demo OTP: <strong>{previewOtp}</strong></span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">TEST MODE</span>
                  </div>
                )}

                {paymentError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
                    {paymentError}
                  </div>
                )}

                <form onSubmit={handleVerifyOtpForPayment} className="space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={paymentOtp}
                    onChange={(e) => setPaymentOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-widest text-lg font-bold py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                  >
                    {paymentLoading ? "Verifying..." : "Verify OTP & Proceed to Payment"}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Razorpay ₹50 Checkout */}
            {paymentStep === "checkout" && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Razorpay Payment Gateway</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Premium Resume Generation & High-Resolution PDF Download
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-bold text-gray-900">ATS Resume PDF Export</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applicant:</span>
                    <span className="font-semibold text-gray-800">{currentUser?.Name}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                    <span className="font-bold text-gray-900">Total Payable:</span>
                    <span className="font-extrabold text-blue-600">₹50.00</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
                    {paymentError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={paymentLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {paymentLoading ? "Processing ₹50 Payment..." : "Pay ₹50 (Razorpay Test Mode)"}
                </button>
              </div>
            )}

            {/* STEP 3: Payment Verified & Success */}
            {paymentStep === "success" && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-black text-gray-900">Payment Verified!</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your resume has been generated, linked to your profile, and set as your <strong>Default Resume</strong> for internship applications.
                </p>

                {generatedInvoice && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Invoice Number:</span>
                      <span className="font-mono font-bold text-gray-800">{generatedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="font-mono text-gray-700">{generatedInvoice.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="font-bold text-green-700">₹50.00 INR</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      triggerPdfDownload();
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> Download PDF Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Resumes History Drawer */}
      {showVersionsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <History size={18} className="text-blue-600" /> Saved Resumes ({savedResumes.length})
              </h2>
              <button
                onClick={() => setShowVersionsDrawer(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {savedResumes.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">No saved resumes found</div>
            ) : (
              <div className="space-y-3">
                {savedResumes.map((resItem) => (
                  <div
                    key={resItem._id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition space-y-2 bg-gray-50/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{resItem.title}</div>
                        <div className="text-[11px] text-gray-500">
                          v{resItem.version} • {new Date(resItem.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {resItem.isDefault && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-blue-800" /> Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                      <button
                        onClick={() => {
                          setResumeId(resItem._id);
                          setResumeTitle(resItem.title);
                          setPersonalInfo(resItem.personalInfo || personalInfo);
                          setSkills(resItem.skills || []);
                          setEducation(resItem.education || []);
                          setWorkExperience(resItem.workExperience || []);
                          setProjects(resItem.projects || []);
                          setShowVersionsDrawer(false);
                        }}
                        className="px-2.5 py-1 bg-white border border-gray-200 text-blue-600 font-semibold rounded hover:bg-blue-50"
                      >
                        Load Editor
                      </button>
                      <button
                        onClick={async () => {
                          await axios.post(`${API_BASE_URL}/api/resume/${resItem._id}/set-default`, {
                            userEmail: currentUser.Email,
                          });
                          fetchSavedResumes(currentUser.Email);
                        }}
                        className="px-2.5 py-1 text-gray-600 hover:text-gray-900"
                      >
                        Set as Default
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
