import { NextRequest } from "next/server";
import { PersonaKey, UserProfile } from "@/lib/types";
import { streamPersonaResponse, InputMessage } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. CORS & Direct-Call Protection (Origin / Referer Validation)
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    if (origin || referer) {
      const allowedHost = host || "localhost:3000";
      const requestSource = origin || referer || "";
      
      // Allow requests from same host or local development
      const isAllowed =
        requestSource.includes(allowedHost) ||
        requestSource.includes("localhost") ||
        requestSource.includes("127.0.0.1");

      if (!isAllowed) {
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
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid or empty JSON body.", { status: 400 });
    }

    const { persona, messages, userProfile } = body as {
      persona: PersonaKey;
      messages: InputMessage[];
      userProfile?: Partial<UserProfile>;
    };

    if (!persona || !messages || !Array.isArray(messages)) {
      return new Response("Invalid request parameters. Must include persona and messages array.", {
        status: 400,
      });
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
