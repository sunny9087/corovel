"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface GoogleSignInButtonProps {
  variant?: "default" | "outline";
  fullWidth?: boolean;
}

export default function GoogleSignInButton({ 
  variant = "default", 
  fullWidth = false 
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const ref = searchParams.get("ref");
      if (ref && ref.trim()) {
        // Persist referral for OAuth signup flow
        await fetch("/api/auth/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: ref.trim() }),
        }).catch(() => {
          // Non-fatal: proceed with sign-in even if this fails
        });
      }

      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false, // Handle redirect manually for better error control
      });

      if (result?.error) {
        setError("Unable to sign in with Google. Please try again or use email/password.");
        setLoading(false);
      } else if (result?.ok) {
        // Success - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const baseClasses = fullWidth 
    ? "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    : "flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = variant === "outline"
    ? "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow"
    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md";

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`${baseClasses} ${variantClasses}`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-label="Google logo">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}
