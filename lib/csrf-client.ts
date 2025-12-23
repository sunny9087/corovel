/**
 * Client-side CSRF token utilities
 */
"use client";

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * Get CSRF token (cached)
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (!tokenPromise) {
    tokenPromise = fetch("/api/csrf-token")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to get CSRF token");
        }
        return res.json();
      })
      .then((data) => {
        if (!data.token) {
          throw new Error("Invalid CSRF token response");
        }
        csrfToken = data.token;
        return csrfToken!;
      })
      .catch((error) => {
        console.error("CSRF token error:", error);
        throw error;
      })
      .finally(() => {
        tokenPromise = null;
      });
  }

  return tokenPromise;
}

/**
 * Fetch with CSRF token
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken();
  
  const headers = new Headers(options.headers);
  headers.set("x-csrf-token", token);

  return fetch(url, {
    ...options,
    headers,
  });
}
