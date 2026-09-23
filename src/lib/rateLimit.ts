// In-memory sliding window rate limiter for demo traffic
// Tracks request timestamps per IP address.

interface RateLimitRecord {
  timestamps: number[];
}

const WINDOW_MS = 60 * 1000; // 1 minute sliding window
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

const ipStore = new Map<string, RateLimitRecord>();

// Periodically clean up stale IP records every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);
    if (validTimestamps.length === 0) {
      ipStore.delete(ip);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = ipStore.get(clientIp) || { timestamps: [] };

  // Filter timestamps within current sliding window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = validTimestamps[0];
    const resetMs = WINDOW_MS - (now - oldestTimestamp);
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(resetMs, 1000),
    };
  }

  validTimestamps.push(now);
  ipStore.set(clientIp, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - validTimestamps.length,
    resetMs: WINDOW_MS,
  };
}
