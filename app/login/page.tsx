"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchWithCsrf } from "@/lib/csrf-client";
import OAuthButtons from "@/components/OAuthButtons";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("Email verified successfully! You can now login.");
    }
    // Handle OAuth errors gracefully
    if (searchParams.get("error")) {
      const errorParam = searchParams.get("error");
      if (errorParam === "auth_error" || errorParam === "Configuration") {
        // OAuth error - show helpful message
        setError("Authentication failed. Please try again or use email/password to sign in.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetchWithCsrf("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred. Please try again.";
      console.error("Login error:", error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4">
      <div className="max-w-md w-full premium-card rounded-xl p-8">
        <div className="premium-card-content">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image src="/corovel-logo.png" alt="Corovel Logo" width={64} height={64} className="rounded-xl" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Login</h1>
            <p className="text-[#6B7280]">Welcome back to Corovel</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg hover:from-[#8B5CF6] hover:to-[#6366F1] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <OAuthButtons />

          <div className="mt-6 space-y-2">
            <p className="text-center text-sm text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#6366F1] hover:text-[#8B5CF6] font-medium">
                Register
              </Link>
            </p>
            <p className="text-center text-sm text-[#6B7280]">
              <Link href="/forgot-password" className="text-[#6366F1] hover:text-[#8B5CF6] font-medium">
                Forgot password?
              </Link>
            </p>
            <p className="text-center mt-4">
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center gradient-mesh px-4">
        <div className="max-w-md w-full premium-card rounded-xl p-8">
          <div className="premium-card-content">
            <h1 className="text-2xl font-bold text-center text-[#1F2937]">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
