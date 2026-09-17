"use client";

import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/data/api";

type UserRegisterInputs = {
  Name: string;
  PhoneNumber: string;
  Email: string;
  ConfirmPassword: string;
  Password: string;
  Photos: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [imageApproval, setImageApproval] = useState<boolean>(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserRegisterInputs>({
    defaultValues: {
      Name: "",
      PhoneNumber: "",
      Email: "",
      ConfirmPassword: "",
      Password: "",
      Photos: "",
    },
  });

  const onSubmit = async (data: UserRegisterInputs) => {
    try {
      setLoading(true);
      setServerError("");

      const res = await axios.post(
        `${API_BASE_URL}/api/register`,
        {
          Name: data.Name,
          Email: data.Email,
          PhoneNumber: data.PhoneNumber,
          Password: data.Password,
          ConfirmPassword: data.ConfirmPassword,
          Photos: imageApproval ? data.Photos : "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data && res.data.status) {
        router.push("/login");
      } else {
        setServerError(res.data.message || "Registration failed");
      }
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Failed to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              Intern<span className="text-gray-900">Area</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register to find and apply for the best opportunities
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
            {serverError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. John Doe"
              {...register("Name", {
                required: "Name is required",
              })}
            />
            {errors.Name && (
              <p className="text-xs text-red-500 mt-1">{errors.Name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="name@example.com"
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
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="10-digit mobile number"
              {...register("PhoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Phone number must be 10 digits",
                },
              })}
            />
            {errors.PhoneNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.PhoneNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                placeholder="At least 6 characters"
                {...register("Password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "At least 6 characters",
                  },
                })}
              />
              {errors.Password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.Password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                placeholder="Re-enter password"
                {...register("ConfirmPassword", {
                  required: "Please confirm your password",
                  validate: (value, formValues) =>
                    value === formValues.Password || "Passwords do not match",
                })}
              />
              {errors.ConfirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.ConfirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-gray-600 font-medium">
                Add profile photo URL?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageApproval(true)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    imageApproval
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setImageApproval(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    !imageApproval
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {imageApproval && (
              <div className="mt-2">
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  placeholder="https://example.com/photo.jpg"
                  {...register("Photos", {
                    required: imageApproval ? "Photo URL is required" : false,
                  })}
                />
                {errors.Photos && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.Photos.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <div>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Login here
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
