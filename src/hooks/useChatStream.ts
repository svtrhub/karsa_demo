"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, PersonaKey, UserProfile } from "@/lib/types";

interface UseChatStreamOptions {
  personaKey: PersonaKey | null;
  userProfile?: Partial<UserProfile>;
  onChunk: (accumulatedText: string) => void;
  onError?: (error: unknown) => void;
}

export function useChatStream({
  personaKey,
  userProfile,
  onChunk,
  onError,
}: UseChatStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Auto-abort stream if active persona changes or component unmounts
  useEffect(() => {
    return () => {
      abortStream();
    };
  }, [personaKey, abortStream]);

  const sendUserMessage = useCallback(
    async (historyMessages: ChatMessage[]) => {
      if (!personaKey || isStreaming) return;

      // Abort any previous pending request
      abortStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsStreaming(true);

      try {
        const fullHistory = historyMessages.map((m) => ({
          sender: m.sender,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            persona: personaKey,
            messages: fullHistory,
            userProfile,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          onChunk("Maaf, terjadi masalah koneksi.");
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          onChunk(accumulatedText);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // Stream was cancelled cleanly
          return;
        }
        console.error("Streaming error occurred");
        onChunk("Terjadi kesalahan saat memproses jawaban.");
        if (onError) onError(err);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setIsStreaming(false);
        }
      }
    },
    [personaKey, isStreaming, userProfile, onChunk, onError, abortStream]
  );

  return {
    isStreaming,
    sendUserMessage,
    abortStream,
  };
}
