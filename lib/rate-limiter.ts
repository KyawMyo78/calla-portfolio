// Rate limiter for public chat API
// Tracks requests per visitor using localStorage (client) and IP (server)

export interface RateLimitData {
  count: number;
  resetAt: number; // timestamp
}

const RATE_LIMIT_KEY = 'publicChatRateLimit';
const MAX_REQUESTS = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Client-side rate limit check using localStorage
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkClientRateLimit(): { allowed: boolean; remaining: number; resetAt: number } {
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: MAX_REQUESTS, resetAt: Date.now() + WINDOW_MS };
  }

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    
    if (!stored) {
      // First request
      const data: RateLimitData = {
        count: 0,
        resetAt: now + WINDOW_MS
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return { allowed: true, remaining: MAX_REQUESTS, resetAt: data.resetAt };
    }

    const data: RateLimitData = JSON.parse(stored);
    
    // Check if window has expired
    if (now >= data.resetAt) {
      // Reset the counter
      const newData: RateLimitData = {
        count: 0,
        resetAt: now + WINDOW_MS
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
      return { allowed: true, remaining: MAX_REQUESTS, resetAt: newData.resetAt };
    }

    // Check if limit reached
    if (data.count >= MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetAt: data.resetAt };
    }

    // Allow request
    const remaining = MAX_REQUESTS - data.count;
    return { allowed: true, remaining, resetAt: data.resetAt };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request
    return { allowed: true, remaining: MAX_REQUESTS, resetAt: Date.now() + WINDOW_MS };
  }
}

/**
 * Increment the client-side request counter
 */
export function incrementClientRateLimit(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    
    if (!stored) {
      const data: RateLimitData = {
        count: 1,
        resetAt: now + WINDOW_MS
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return;
    }

    const data: RateLimitData = JSON.parse(stored);
    
    // If window expired, reset
    if (now >= data.resetAt) {
      const newData: RateLimitData = {
        count: 1,
        resetAt: now + WINDOW_MS
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
      return;
    }

    // Increment count
    data.count += 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    
  } catch (error) {
    console.error('Rate limit increment error:', error);
  }
}

/**
 * Get remaining requests for display
 */
export function getRemainingRequests(): { remaining: number; resetAt: number } {
  const { remaining, resetAt } = checkClientRateLimit();
  return { remaining, resetAt };
}

/**
 * Server-side rate limiter using in-memory Map
 * (In production, consider using Redis or similar)
 */
const ipRateLimitMap = new Map<string, RateLimitData>();

export function checkServerRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const data = ipRateLimitMap.get(identifier);

  if (!data) {
    // First request from this IP
    const newData: RateLimitData = {
      count: 1,
      resetAt: now + WINDOW_MS
    };
    ipRateLimitMap.set(identifier, newData);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: newData.resetAt };
  }

  // Check if window expired
  if (now >= data.resetAt) {
    const newData: RateLimitData = {
      count: 1,
      resetAt: now + WINDOW_MS
    };
    ipRateLimitMap.set(identifier, newData);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: newData.resetAt };
  }

  // Check if limit reached
  if (data.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: data.resetAt };
  }

  // Increment and allow
  data.count += 1;
  ipRateLimitMap.set(identifier, data);
  return { allowed: true, remaining: MAX_REQUESTS - data.count, resetAt: data.resetAt };
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  ipRateLimitMap.forEach((data, key) => {
    if (now >= data.resetAt) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => ipRateLimitMap.delete(key));
}

// Auto-cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 60 * 1000);
}
