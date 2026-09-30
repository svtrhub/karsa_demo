import { NextRequest } from "next/server";
import { PersonaKey, UserProfile } from "@/lib/types";
import { streamPersonaResponse, InputMessage } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Input caps — enforced at the route boundary before any downstream processing
const MAX_MESSAGES = 15;
const MAX_MSG_LENGTH = 1000;

interface ChatRequestBody {
  persona: PersonaKey;
  messages: InputMessage[];
  userProfile?: Partial<UserProfile>;
}

/**
 * Checks if the request origin hostname matches the server host or is a known
 * local development address. Uses URL parsing to prevent substring-bypass attacks
 * (e.g. evil.com/karsademo.vercel.app would pass a naive .includes() check).
 */
function isOriginAllowed(source: string, host: string): boolean {
  try {
    const { hostname } = new URL(source);
    const serverHostname = host.split(":")[0]; // strip port if present
    return (
      hostname === serverHostname ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. CORS & Direct-Call Protection (Origin / Referer Validation)
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    if (origin || referer) {
      const allowedHost = host || "localhost:3000";
      const requestSource = origin || referer || "";

      if (!isOriginAllowed(requestSource, allowedHost)) {
        console.warn(`[Security Alert] Blocked unauthorized cross-site request from: ${requestSource}`);
        return new Response("Forbidden: Unauthorized request origin.", { status: 403 });
      }
    }

    // 2. Rate Limiting per Client IP (Sliding Window: 10 requests / 60 seconds)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return new Response("Terlalu banyak permintaan. Silakan tunggu 1 menit sebelum mencoba lagi.", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
        },
      });
    }

    // 3. Request Body Parsing & Validation
    let body: ChatRequestBody;
    try {
      body = await req.json() as ChatRequestBody;
    } catch {
      return new Response("Invalid or empty JSON body.", { status: 400 });
    }

    const { persona, messages, userProfile } = body;

    if (!persona || !messages || !Array.isArray(messages)) {
      return new Response("Invalid request parameters. Must include persona and messages array.", {
        status: 400,
      });
    }

    // 4. Input Size Caps — reject oversized payloads before hitting the LLM
    if (messages.length > MAX_MESSAGES) {
      return new Response(
        `Too many messages. Maximum ${MAX_MESSAGES} messages per request.`,
        { status: 400 }
      );
    }

    for (const msg of messages) {
      if (typeof msg.content === "string" && msg.content.length > MAX_MSG_LENGTH) {
        return new Response(
          `Message exceeds maximum length of ${MAX_MSG_LENGTH} characters.`,
          { status: 400 }
        );
      }
    }

    return await streamPersonaResponse({
      persona,
      messages,
      userProfile,
    });
  } catch (error) {
    console.error("Error in /api/chat route handler:", error);
    return new Response("Terjadi kesalahan pada server saat memproses obrolan.", {
      status: 500,
    });
  }
}
