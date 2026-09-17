"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/data/api";

type LoginFormInputs = {
  Email: string;
  Password: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get("redirect") : null;

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      Email: "",
      Password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      setServerError("");

      const response = await axios.post(
        `${API_BASE_URL}/api/login`,
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
          localStorage.setItem("user", JSON.stringify(response.data.user));
          window.dispatchEvent(new Event("authChange"));
        }
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push("/");
        }
      } else {
        setServerError(response.data.message || "Invalid credentials");
      }
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Failed to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-3">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            Intern<span className="text-gray-900">Area</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Login</h1>
        <p className="text-sm text-gray-500 mt-1">
          Login to apply for jobs and internships
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
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            {...register("Email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
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
            placeholder="Enter your password"
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register here
          </Link>
        </div>
        <div>
          Are you an admin?{" "}
          <Link
            href="/adminlogin"
            className="font-semibold text-gray-700 hover:text-blue-600"
          >
            Admin Login
          </Link>
        </div>
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}