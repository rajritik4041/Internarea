"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/data/api";

type AdminLoginFormInputs = {
  Email: string;
  Password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<AdminLoginFormInputs>({
    defaultValues: {
      Email: "",
      Password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormInputs) => {
    try {
      setLoading(true);
      setServerError("");

      const response = await axios.post(
        `${API_BASE_URL}/api/adminlogin`,
        {
          Email: data.Email,
          Password: data.Password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status) {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin", JSON.stringify(response.data.admin));
          window.dispatchEvent(new Event("authChange"));
        }
        router.push("/admin");
      } else {
        setServerError(response.data.message || "Invalid admin credentials");
      }
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Failed to log in as admin."
      );
    } finally {
      setLoading(false);
    }
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
          <div className="inline-block px-2.5 py-0.5 mb-2 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            Admin Portal
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access administrator dashboard and listings
          </p>
        </div>


        {serverError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="text"
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              {...register("Email", {
                required: "Admin email is required",
              })}
            />
            {errors.Email && (
              <p className="text-xs text-red-500 mt-1">{errors.Email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              {...register("Password", {
                required: "Password is required",
              })}
            />
            {errors.Password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.Password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying..." : "Login to Admin Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <div>
            Are you a student or user?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              User Login
            </Link>
          </div>
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}