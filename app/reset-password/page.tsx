"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchWithCsrf } from "@/lib/csrf-client";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchWithCsrf("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Password has been reset successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-10">
        <div className="max-w-md w-full premium-card card-hover card-glow rounded-xl p-6 md:p-8 animate-fade-in">
          <div className="premium-card-content">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Image src="/corovel-logo.png" alt="Corovel Logo" width={56} height={56} className="rounded-xl" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">Reset Password</h1>
              <p className="text-sm text-[#6B7280] mt-1">This link looks invalid or expired.</p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg hover:from-[#8B5CF6] hover:to-[#6366F1] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl min-h-[48px]"
              >
                Request new reset link
              </Link>
              <Link href="/login" className="block text-center text-sm text-[#6B7280] hover:text-[#1F2937]">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-10">
      <div className="max-w-md w-full premium-card card-hover card-glow rounded-xl p-6 md:p-8 animate-fade-in">
        <div className="premium-card-content">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image src="/corovel-logo.png" alt="Corovel Logo" width={56} height={56} className="rounded-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">Reset Password</h1>
            <p className="text-sm text-[#6B7280] mt-1">Set a new password for your account.</p>
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
            <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white transition-all text-base"
            />
            <p className="mt-2 text-xs text-[#6B7280]">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#1F2937] mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white transition-all text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg hover:from-[#8B5CF6] hover:to-[#6366F1] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

          <p className="mt-4 text-center text-sm text-[#6B7280]">
            <Link href="/login" className="text-[#6366F1] hover:text-[#8B5CF6] font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-10">
        <div className="max-w-md w-full premium-card rounded-xl p-8 animate-fade-in">
          <div className="premium-card-content">
            <h1 className="text-2xl font-bold text-center text-[#1F2937]">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
