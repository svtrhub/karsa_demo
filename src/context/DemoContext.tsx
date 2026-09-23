"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  ChatMessage,
  ComingSoonFeature,
  DemoState,
  PersonaKey,
  UserProfile,
} from "@/lib/types";
import {
  INITIAL_DEMO_STATE,
  INITIAL_PROFILE,
  INITIAL_CHAT_THREADS,
  setProfileData as domainSetProfileData,
  setOnboardingStep as domainSetOnboardingStep,
  completeOnboarding as domainCompleteOnboarding,
  advanceFTUXPhase as domainAdvanceFTUXPhase,
  skipFTUXPhase as domainSkipFTUXPhase,
  openChatThread as domainOpenChatThread,
  closeChatThread as domainCloseChatThread,
  clearPendingText as domainClearPendingText,
  addMessageToThread as domainAddMessageToThread,
  clearCelebratingPersona as domainClearCelebratingPersona,
  updateLastAgentMessageInThread as domainUpdateLastAgentMessageInThread,
  openComingSoonFeature as domainOpenComingSoonFeature,
  closeComingSoonFeature as domainCloseComingSoonFeature,
  resetDemoState as domainResetDemoState,
} from "@/lib/domainEngine";

const STORAGE_KEY = "karsa_demo_state_v1";

interface DemoContextType {
  state: DemoState;
  setProfileData: (data: Partial<UserProfile>) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  advanceFTUX: () => void;
  skipFTUX: () => void;
  openChat: (personaKey: PersonaKey, initialUserText?: string) => void;
  closeChat: () => void;
  clearPendingInitialText: () => void;
  addMessage: (personaKey: PersonaKey, message: ChatMessage) => void;
  updateLastAgentMessage: (personaKey: PersonaKey, chunk: string) => void;
  openComingSoon: (feature: ComingSoonFeature) => void;
  closeComingSoon: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const celebrateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount (Side Effect)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          ...parsed,
          profile: { ...INITIAL_PROFILE, ...parsed.profile },
          chatThreads: { ...INITIAL_CHAT_THREADS, ...parsed.chatThreads },
        }));
      }
    } catch {
      console.error("Failed to load saved state");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist state changes to localStorage (Side Effect)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        console.error("Failed to persist state");
      }
    }
  }, [state, isLoaded]);

  // Clean up celebrate timer on unmount
  useEffect(() => {
    return () => {
      if (celebrateTimerRef.current) {
        clearTimeout(celebrateTimerRef.current);
      }
    };
  }, []);

  const setProfileData = (data: Partial<UserProfile>) => {
    setState((prev) => domainSetProfileData(prev, data));
  };

  const setOnboardingStep = (step: number) => {
    setState((prev) => domainSetOnboardingStep(prev, step));
  };

  const completeOnboarding = () => {
    setState((prev) => domainCompleteOnboarding(prev));
  };

  const advanceFTUX = () => {
    setState((prev) => domainAdvanceFTUXPhase(prev));
  };

  const skipFTUX = () => {
    setState((prev) => domainSkipFTUXPhase(prev));
  };

  const openChat = (personaKey: PersonaKey, initialUserText?: string) => {
    setState((prev) => domainOpenChatThread(prev, personaKey, initialUserText));
  };

  const closeChat = () => {
    setState((prev) => domainCloseChatThread(prev));
  };

  const clearPendingInitialText = () => {
    setState((prev) => domainClearPendingText(prev));
  };

  const addMessage = (personaKey: PersonaKey, message: ChatMessage) => {
    setState((prev) => {
      const { nextState, isFirstUserMsg } = domainAddMessageToThread(prev, personaKey, message);

      if (isFirstUserMsg) {
        if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
        celebrateTimerRef.current = setTimeout(() => {
          setState((latest) => domainClearCelebratingPersona(latest));
        }, 2500);
      }

      return nextState;
    });
  };

  const updateLastAgentMessage = (personaKey: PersonaKey, chunk: string) => {
    setState((prev) => domainUpdateLastAgentMessageInThread(prev, personaKey, chunk));
  };

  const openComingSoon = (feature: ComingSoonFeature) => {
    setState((prev) => domainOpenComingSoonFeature(prev, feature));
  };

  const closeComingSoon = () => {
    setState((prev) => domainCloseComingSoonFeature(prev));
  };

  const resetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error("Failed to reset demo state");
    }
    setState(domainResetDemoState());
  };

  return (
    <DemoContext.Provider
      value={{
        state,
        setProfileData,
        setOnboardingStep,
        completeOnboarding,
        advanceFTUX,
        skipFTUX,
        openChat,
        closeChat,
        clearPendingInitialText,
        addMessage,
        updateLastAgentMessage,
        openComingSoon,
        closeComingSoon,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
};
