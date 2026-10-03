"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/context/DemoContext";
import { PERSONAS, getPersonaTheme } from "@/lib/personas";
import { ASSETS, PERSONA_POSES } from "@/lib/constants";
import { PersonaKey, ChatMessage } from "@/lib/types";
import { useChatStream } from "@/hooks/useChatStream";
import Image from "next/image";
import {
  X,
  Send,
  Loader2,
} from "lucide-react";

export const ChatModal: React.FC = () => {
  const {
    state,
    closeChat,
    openChat,
    addMessage,
    updateLastAgentMessage,
    clearPendingInitialText,
  } = useDemo();

  const personaKey = state.activePersona;
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const persona = personaKey ? PERSONAS[personaKey] : null;
  const thread = personaKey ? state.chatThreads[personaKey] || [] : [];
  const theme = personaKey ? getPersonaTheme(personaKey) : null;

  // Stream accumulated chunk callback
  const handleChunk = useCallback(
    (accumulatedText: string) => {
      if (personaKey) {
        updateLastAgentMessage(personaKey, accumulatedText);
      }
    },
    [personaKey, updateLastAgentMessage]
  );

  // Custom hook for LLM streaming with AbortController support
  const { isStreaming, sendUserMessage, abortStream } = useChatStream({
    personaKey,
    userProfile: state.profile,
    onChunk: handleChunk,
  });

  const processedPendingRef = useRef<string | null>(null);
  const lastSubmittedTimeRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread, isStreaming]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText.trim();
    if (!textToSend || isStreaming || !personaKey) return;

    // Guard against duplicate submission within 400ms
    const now = Date.now();
    if (now - lastSubmittedTimeRef.current < 400) return;
    lastSubmittedTimeRef.current = now;

    if (!textOverride) setInputText("");

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      personaKey,
      content: textToSend,
      timestamp,
    };

    addMessage(personaKey, userMessage);

    const agentMsgId = `agent-${Date.now() + 1}`;
    const placeholderAgentMsg: ChatMessage = {
      id: agentMsgId,
      sender: "agent",
      personaKey,
      content: "",
      timestamp,
    };

    addMessage(personaKey, placeholderAgentMsg);

    const fullHistory = [...thread, userMessage];
    await sendUserMessage(fullHistory);
  };

  useEffect(() => {
    if (
      state.pendingInitialText &&
      !isStreaming &&
      personaKey &&
      processedPendingRef.current !== state.pendingInitialText
    ) {
      const textToSend = state.pendingInitialText;
      processedPendingRef.current = textToSend;
      clearPendingInitialText();
      handleSendMessage(textToSend);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pendingInitialText, personaKey, isStreaming]);

  if (!personaKey || !persona || !theme) return null;

  const handleCloseModal = () => {
    abortStream();
    closeChat();
  };

  const handleSwitchPersona = (newKey: PersonaKey) => {
    abortStream();
    openChat(newKey);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl h-[85vh] max-h-[720px] liquid-glass-modal rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden relative"
          style={{
            borderColor: theme.border,
            boxShadow: `0 0 60px ${theme.bg}, 0 20px 60px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Clean Top-Left Exit Button (No Container) */}
          <button
            onClick={handleCloseModal}
            aria-label="Tutup chat"
            className="absolute top-4 left-4 z-30 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── Header: Clean Avatar + Agent Name & Role Badge (Decluttered) ── */}
          <div
            className="py-4 sm:py-5 border-b flex items-center gap-4 z-10 relative pl-14 sm:pl-16 pr-6"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: `linear-gradient(90deg, ${theme.bg} 0%, transparent 80%)`,
            }}
          >
            {/* Avatar Frame (Compact & Crisp) */}
            <div
              className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl overflow-hidden border border-white/15 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${persona.accentColor}25` }}
            >
              <Image
                src={ASSETS.pose(personaKey, PERSONA_POSES[personaKey].idle)}
                alt={`${persona.name} pose`}
                fill
                className="object-contain p-1 drop-shadow-md"
                sizes="64px"
                priority
              />
            </div>

            {/* Decluttered Info: Just Agent Name & Role Badge */}
            <div className="min-w-0 flex-1 flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight">{persona.name}</h3>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${persona.badgeBg}`}
              >
                {persona.role}
              </span>
            </div>
          </div>

          {/* ── Persona Switcher Pill-Strip (Below Header) ──────────────────── */}
          <div
            className="px-4 py-2.5 border-b flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-950/60"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1">
              Ganti Sobat:
            </span>
            {(["karsa", "ara", "radit", "sekar", "arka"] as PersonaKey[]).map((pKey) => {
              const p = PERSONAS[pKey];
              const isSel = pKey === personaKey;
              return (
                <button
                  key={pKey}
                  onClick={() => handleSwitchPersona(pKey)}
                  aria-label={`Beralih ke ${p.name}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    isSel
                      ? "liquid-glass border-amber-400/80 shadow-[0_0_12px_rgba(230,194,128,0.2)] text-white"
                      : "liquid-glass-card text-slate-400 hover:text-slate-200 border-white/10"
                  }`}
                >
                  <div
                    className="relative w-5 h-6 shrink-0 rounded-md overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: `${p.accentColor}25` }}
                  >
                    <Image
                      src={ASSETS.pose(pKey, PERSONA_POSES[pKey].idle)}
                      alt={p.name}
                      fill
                      className="object-contain p-0.5"
                      sizes="20px"
                    />
                  </div>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* ── Chat Messages Body ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 batik-overlay">
            {thread.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {isUser ? (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md text-slate-950"
                      style={{ backgroundColor: "#48CAE4" }}
                      aria-label="Pesan kamu"
                    >
                      {(state.profile.nama?.[0] || "S").toUpperCase()}
                    </div>
                  ) : (
                    <div
                      className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/10 flex items-center justify-center relative"
                      style={{ backgroundColor: `${persona.accentColor}25` }}
                    >
                      <Image
                        src={ASSETS.pose(personaKey, PERSONA_POSES[personaKey].idle)}
                        alt={`${persona.name} avatar`}
                        fill
                        className="object-contain p-0.5"
                        sizes="36px"
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] md:max-w-[74%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed space-y-1 shadow-lg ${
                      isUser ? "rounded-br-none border" : "rounded-bl-none border"
                    }`}
                    style={
                      isUser
                        ? {
                            background: "rgba(28,37,65,0.9)",
                            borderColor: "rgba(72,202,228,0.30)",
                          }
                        : {
                            background: theme.bg,
                            borderColor: theme.border,
                          }
                    }
                  >
                    <div
                      className="flex items-center justify-between gap-4 border-b pb-1 mb-1"
                      style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                      <span
                        className="font-bold text-[11px]"
                        style={{ color: isUser ? "#48CAE4" : persona.accentColor }}
                      >
                        {isUser ? state.profile.nama || "Siswa" : persona.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {!isUser && isStreaming && msg.id === thread[thread.length - 1]?.id && !msg.content && (
                      <div className="flex items-center gap-1.5 pt-1 text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs italic">{persona.name} sedang mengetik…</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Chat Input Bar (FCC-Style Clean Input) ─────────────────────── */}
          <div
            className="p-4 border-t"
            style={{ background: "rgba(8,12,24,0.95)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center liquid-glass rounded-xl border border-white/20 shadow-inner px-1"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Kirim pesan ke ${persona.name}…`}
                disabled={isStreaming}
                aria-label={`Kirim pesan ke ${persona.name}`}
                className="w-full py-3.5 pl-4 pr-12 bg-transparent text-white placeholder-slate-400 text-xs md:text-sm focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isStreaming}
                aria-label="Kirim pesan"
                className="absolute right-1.5 p-2 rounded-lg text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all shadow-md font-bold"
                style={{
                  background: `linear-gradient(135deg, ${persona.accentColor}, ${persona.accentColor}cc)`,
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

