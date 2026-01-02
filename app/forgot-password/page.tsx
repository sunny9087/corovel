"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchWithCsrf } from "@/lib/csrf-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetchWithCsrf("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "If an account exists with this email, a password reset link has been sent.");
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-10">
      <div className="max-w-md w-full premium-card card-hover card-glow rounded-xl p-6 md:p-8 animate-fade-in">
        <div className="premium-card-content">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image src="/corovel-logo.png" alt="Corovel Logo" width={56} height={56} className="rounded-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">Forgot Password</h1>
            <p className="text-sm text-[#6B7280] mt-1">We’ll email you a reset link.</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white transition-all text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg hover:from-[#8B5CF6] hover:to-[#6366F1] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <p className="text-center text-sm text-[#6B7280]">
              Remember your password?{" "}
              <Link href="/login" className="text-[#6366F1] hover:text-[#8B5CF6] font-medium">
                Login
              </Link>
            </p>
            <p className="text-center">
              <Link href="/" className="text-sm text-[#6B7280] hover:text-[#1F2937]">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
