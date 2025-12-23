"use client";

import { useState, useEffect } from "react";
import GoogleSignInButton from "./GoogleSignInButton";

/**
 * OAuth buttons component that only shows if providers are configured
 */
export default function OAuthButtons() {
  const [hasGoogle, setHasGoogle] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if Google OAuth is configured
  useEffect(() => {
    const checkProviders = async () => {
      try {
        const res = await fetch("/api/auth/providers");
        const data = await res.json();
        setHasGoogle(!!data.google);
      } catch {
        // If check fails, assume no providers
        setHasGoogle(false);
      } finally {
        setLoading(false);
      }
    };
    checkProviders();
  }, []);

  // Don't render if no OAuth providers are configured
  if (loading || !hasGoogle) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-[#6B7280]">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton fullWidth />
    </div>
  );
}
