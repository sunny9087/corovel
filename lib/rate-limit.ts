/**
 * Rate limiting utility using Upstash Redis or in-memory fallback
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

// Use Redis if available, otherwise use in-memory (not recommended for production)
const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : undefined;

// In-memory store fallback (not persistent across restarts)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

class MemoryRateLimit {
  private limit: number;
  private window: number; // in seconds

  constructor(config: { limit: number; window: number }) {
    this.limit = config.limit;
    this.window = config.window;
  }

  async limitRequest(key: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const record = memoryStore.get(key);
    
    if (!record || now > record.resetAt) {
      memoryStore.set(key, { count: 1, resetAt: now + this.window * 1000 });
      return { success: true };
    }
    
    if (record.count >= this.limit) {
      return { success: false };
    }
    
    record.count++;
    return { success: true };
  }
}

// Helper to create memory rate limiter
function createMemoryRateLimiter(limit: number, window: number) {
  const limiter = new MemoryRateLimit({ limit, window });
  return {
    limit: (key: string) => limiter.limitRequest(key),
  };
}

// Rate limiters for different endpoints
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
      analytics: true,
    })
  : createMemoryRateLimiter(5, 15 * 60); // 5 requests per 15 minutes

export const checkInRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 d"), // 10 requests per day
      analytics: true,
    })
  : createMemoryRateLimiter(10, 24 * 60 * 60); // 10 requests per day

export const generalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour
      analytics: true,
    })
  : createMemoryRateLimiter(100, 60 * 60); // 100 requests per hour

/**
 * Get client identifier for rate limiting
 */
export function getRateLimitKey(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  return ip;
}
