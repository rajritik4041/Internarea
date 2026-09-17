"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/Components/Navbar";
import { API_BASE_URL } from "@/data/api";
import { useLanguage } from "@/context/LanguageContext";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Zap,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function SubscriptionsPage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [paymentWindow, setPaymentWindow] = useState<{
    allowed: boolean;
    currentTimeIST: string;
    requiredWindow: string;
    message?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<"plans" | "checkout" | "success">("plans");
  const [purchaseError, setPurchaseError] = useState("");
  const [invoice, setInvoice] = useState<any>(null);

  // Live IST Clock
  const [liveIstTime, setLiveIstTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + 5.5 * 3600000);
      setLiveIstTime(
        ist.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSubscriptionStatus = async (email: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/subscription/status/${encodeURIComponent(email)}`);
      if (res.data && res.data.status) {
        setCurrentSubscription(res.data.subscription);
        setPaymentWindow(res.data.paymentWindow);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          fetchSubscriptionStatus(parsed.Email);
        } catch (e) {}
      }
    }
  }, []);

  const plans = [
    {
      id: "Free",
      name: "Free Starter",
      price: 0,
      applications: 1,
      badge: "Default Plan",
      features: [
        "1 Internship Application / month",
        "Standard employer response time",
        "Public community space access",
        "Standard candidate profile",
      ],
      color: "border-gray-200",
      buttonColor: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    },
    {
      id: "Bronze",
      name: "Bronze Explorer",
      price: 100,
      applications: 3,
      badge: "Popular for Freshers",
      features: [
        "Up to 3 Applications / month",
        "Priority application badges",
        "Application status tracker",
        "Email notifications on recruiter view",
      ],
      color: "border-amber-200 bg-amber-50/20",
      buttonColor: "bg-amber-600 text-white hover:bg-amber-700",
    },
    {
      id: "Silver",
      name: "Silver Pro",
      price: 300,
      applications: 5,
      badge: "Most Recommended",
      features: [
        "Up to 5 Applications / month",
        "Highlighted candidate profile",
        "Direct HR messaging badge",
        "Resume score review assistance",
        "Priority recruiter matching",
      ],
      color: "border-blue-300 ring-2 ring-blue-600 bg-blue-50/30",
      buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
      recommended: true,
    },
    {
      id: "Gold",
      name: "Gold Unlimited",
      price: 1000,
      applications: "Unlimited",
      badge: "Maximum Career Exposure",
      features: [
        "Unlimited Internship Applications / month",
        "Top of list placement on applications",
        "All ATS templates unlocked",
        "VIP dedicated support",
        "Direct referrals to hiring partners",
      ],
      color: "border-purple-300 bg-purple-50/30",
      buttonColor: "bg-purple-700 text-white hover:bg-purple-800",
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    if (planId === "Free") return;
    if (!currentUser) {
      setPurchaseError("Please log in to upgrade your subscription plan");
      return;
    }

    try {
      setLoading(true);
      setPurchaseError("");

      // Backend verifies payment window: 5:00 AM to 11:45 AM IST
      const res = await axios.post(`${API_BASE_URL}/api/subscription/initiate-payment`, {
        userEmail: currentUser.Email,
        plan: planId,
      });

      if (res.data && res.data.status) {
        setSelectedPlan(planId);
        setPurchaseStep("checkout");
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.code === "PAYMENT_HOURS_RESTRICTED") {
        setPurchaseError(
          err.response.data.message ||
            "Subscription payments are only permitted between 5:00 AM and 11:45 AM IST. Please initiate your payment during this window."
        );
      } else {
        setPurchaseError(err.response?.data?.message || "Failed to initiate subscription payment");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSubscriptionPayment = async () => {
    try {
      setLoading(true);
      setPurchaseError("");

      const res = await axios.post(`${API_BASE_URL}/api/subscription/verify-payment`, {
        userEmail: currentUser.Email,
        plan: selectedPlan,
        paymentId: "pay_sub_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        billingDetails: {
          name: currentUser.Name,
          email: currentUser.Email,
          phone: currentUser.PhoneNumber,
        },
      });

      if (res.data && res.data.status) {
        setCurrentSubscription(res.data.subscription);
        setInvoice(res.data.invoice);
        setPurchaseStep("success");

        // Update local user
        const updatedUser = { ...currentUser, subscription: res.data.subscription };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.code === "PAYMENT_HOURS_RESTRICTED") {
        setPurchaseError(err.response.data.message);
      } else {
        setPurchaseError(err.response?.data?.message || "Payment verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Zap size={14} className="text-amber-300" /> Subscription Application System
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t("sub.title", "Internship Application Plans")}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Supercharge your internship search with flexible monthly plans. Compare quotas, purchase or upgrade, and track your quota seamlessly.
            </p>
          </div>

          {/* Live IST Clock & Payment Window Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center shrink-0 w-full md:w-auto space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-bold">
              <Clock size={16} /> Live IST Time
            </div>
            <div className="text-2xl font-black font-mono tracking-wider">{liveIstTime || "Loading..."}</div>
            <div className="text-[11px] text-blue-100 font-medium">
              Payment Window: <strong>5:00 AM – 11:45 AM IST</strong>
            </div>
          </div>
        </div>

        {/* Payment Window Notice Alert */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-800">
              Strict Security Time Window Policy
            </div>
            <p className="text-amber-700 leading-relaxed">
              To guarantee secure banking synchronization and reconciliation, subscription payments can ONLY be initiated between <strong>5:00 AM and 11:45 AM IST</strong>. Payment attempts outside this window are automatically rejected.
            </p>
          </div>
        </div>

        {/* Error alert */}
        {purchaseError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {purchaseError}
          </div>
        )}

        {/* Current User Subscription Bar (if logged in) */}
        {currentUser && currentSubscription && (
          <div className="mb-8 p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Your Current Active Plan
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-blue-600">
                  {currentSubscription.plan} Plan
                </span>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-gray-500 block">Quota Used:</span>
                <span className="font-bold text-gray-900">
                  {currentSubscription.usedApplications} /{" "}
                  {currentSubscription.applicationLimit === 999999
                    ? "Unlimited"
                    : currentSubscription.applicationLimit}{" "}
                  Applications
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Renewal / Reset:</span>
                <span className="font-bold text-gray-900">
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {purchaseStep === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => {
              const isCurrent = currentSubscription?.plan === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between relative transition hover:shadow-lg ${p.color}`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      Best Value
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {p.badge}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 mt-1">{p.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">₹{p.price}</span>
                      <span className="text-xs text-gray-500 font-semibold">/ month</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs font-bold text-blue-700 flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>
                        {p.applications === "Unlimited"
                          ? "Unlimited Applications"
                          : `${p.applications} Applications / mo`}
                      </span>
                    </div>

                    <ul className="space-y-2.5 pt-2 text-xs text-gray-600">
                      {p.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-xl text-center cursor-default"
                      >
                        Current Plan
                      </button>
                    ) : p.id === "Free" ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl text-center cursor-default"
                      >
                        Default Tier
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(p.id)}
                        disabled={loading}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${p.buttonColor}`}
                      >
                        {loading ? "Checking..." : `Upgrade to ${p.id}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 2: Checkout Confirmation Modal */}
        {purchaseStep === "checkout" && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Subscription</h2>
              <p className="text-xs text-gray-500 mt-1">
                Verified between 5:00 AM and 11:45 AM IST window
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Selected:</span>
                <span className="font-bold text-gray-900">{selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subscriber:</span>
                <span className="font-semibold text-gray-800">{currentUser?.Name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Validity:</span>
                <span className="font-semibold text-gray-800">30 Days</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-gray-900">Total Due:</span>
                <span className="font-extrabold text-blue-600">
                  ₹{selectedPlan === "Bronze" ? "100" : selectedPlan === "Silver" ? "300" : "1000"}.00
                </span>
              </div>
            </div>

            <button
              onClick={handleCompleteSubscriptionPayment}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Processing..." : "Authorize Payment (Razorpay Test Mode)"}
            </button>

            <button
              onClick={() => setPurchaseStep("plans")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
            >
              Back to plans
            </button>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {purchaseStep === "success" && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Subscription Activated!</h2>
              <p className="text-xs text-gray-500 mt-1">
                Your monthly internship application quota has been updated immediately.
              </p>
            </div>

            {invoice && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice:</span>
                  <span className="font-mono font-bold text-gray-800">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-gray-700">{invoice.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan Activated:</span>
                  <span className="font-bold text-blue-600">{invoice.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-green-700">₹{invoice.amount}.00 INR</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setPurchaseStep("plans")}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Return to Subscriptions
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
