import { ChatMessage, ComingSoonFeature, DemoState, PersonaKey, UserProfile } from "./types";
import { PERSONAS } from "./personas";

export const INITIAL_PROFILE: UserProfile = {
  nama: "",
  jenjangKelas: "SMA/SMK Kelas 10",
  keahlianSudah: ["Teknologi & Coding"],
  keahlianIngin: ["Sains & Riset (OPSI/OSN)"],
  ritmeBelajar: "30–45 Menit (Fokus)",
  targetTujuan: ["Menang OSN/OPSI", "Bangun Portofolio SNBP"],
  isConsentGiven: false,
  isCompleted: false,
};

export const INITIAL_CHAT_THREADS: Record<PersonaKey, ChatMessage[]> = {
  karsa: [],
  ara: [],
  radit: [],
  sekar: [],
  arka: [],
};

export const INITIAL_DEMO_STATE: DemoState = {
  profile: INITIAL_PROFILE,
  onboardingStep: 0,
  ftuxCompleted: false,
  ftuxPhase: "door",
  ftuxTourIndex: 0,
  koinBalance: 250,
  hasClaimedBonusCoin: false,
  hasIncrementedFirstChatCoin: false,
  activePersona: null,
  pendingInitialText: null,
  activeComingSoon: null,
  chatThreads: INITIAL_CHAT_THREADS,
};

/**
 * Pure Domain Reducer Functions
 * Deterministic state transitions with zero side-effects (no localStorage, setTimeout, or fetch).
 */

export function setProfileData(state: DemoState, data: Partial<UserProfile>): DemoState {
  return {
    ...state,
    profile: { ...state.profile, ...data },
  };
}

export function setOnboardingStep(state: DemoState, step: number): DemoState {
  return {
    ...state,
    onboardingStep: step,
  };
}

export function completeOnboarding(state: DemoState): DemoState {
  return {
    ...state,
    profile: { ...state.profile, isCompleted: true },
    ftuxPhase: "door",
    ftuxTourIndex: 0,
  };
}

export function advanceFTUXPhase(state: DemoState): DemoState {
  if (state.ftuxPhase === "door") {
    return { ...state, ftuxPhase: "modal" };
  }
  if (state.ftuxPhase === "modal") {
    return { ...state, ftuxPhase: "tour", ftuxTourIndex: 0, hasClaimedBonusCoin: true };
  }
  if (state.ftuxPhase === "tour") {
    if (state.ftuxTourIndex < 3) {
      return { ...state, ftuxTourIndex: state.ftuxTourIndex + 1 };
    }
    return { ...state, ftuxPhase: "done", ftuxCompleted: true };
  }
  return { ...state, ftuxPhase: "done", ftuxCompleted: true };
}

export function skipFTUXPhase(state: DemoState): DemoState {
  return {
    ...state,
    ftuxPhase: "done",
    ftuxCompleted: true,
    hasClaimedBonusCoin: true,
  };
}

export function openChatThread(
  state: DemoState,
  personaKey: PersonaKey,
  initialUserText?: string
): DemoState {
  const currentThread = state.chatThreads[personaKey] || [];
  const updatedThreads = { ...state.chatThreads };

  if (currentThread.length === 0) {
    const persona = PERSONAS[personaKey];
    const studentName = state.profile.nama || "Teman";
    const greeting = `Halo ${studentName}! ${persona.greetingText}`;
    updatedThreads[personaKey] = [
      {
        id: `msg-seed-${Date.now()}`,
        sender: "agent",
        personaKey,
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
  }

  return {
    ...state,
    activePersona: personaKey,
    pendingInitialText: initialUserText || null,
    chatThreads: updatedThreads,
  };
}

export function closeChatThread(state: DemoState): DemoState {
  return {
    ...state,
    activePersona: null,
    pendingInitialText: null,
  };
}

export function clearPendingText(state: DemoState): DemoState {
  return {
    ...state,
    pendingInitialText: null,
  };
}

export interface AddMessageResult {
  nextState: DemoState;
  isFirstUserMsg: boolean;
}

export function addMessageToThread(
  state: DemoState,
  personaKey: PersonaKey,
  message: ChatMessage
): AddMessageResult {
  const currentThread = state.chatThreads[personaKey] || [];
  const isFirstUserMsg = message.sender === "user" && !state.hasIncrementedFirstChatCoin;

  const nextState: DemoState = {
    ...state,
    koinBalance: isFirstUserMsg ? state.koinBalance + 50 : state.koinBalance,
    hasIncrementedFirstChatCoin: isFirstUserMsg ? true : state.hasIncrementedFirstChatCoin,
    celebratingPersona: isFirstUserMsg ? personaKey : state.celebratingPersona,
    chatThreads: {
      ...state.chatThreads,
      [personaKey]: [...currentThread, message],
    },
  };

  return { nextState, isFirstUserMsg };
}

export function clearCelebratingPersona(state: DemoState): DemoState {
  return {
    ...state,
    celebratingPersona: null,
  };
}

export function updateLastAgentMessageInThread(
  state: DemoState,
  personaKey: PersonaKey,
  newContent: string
): DemoState {
  const thread = [...(state.chatThreads[personaKey] || [])];
  if (thread.length === 0) return state;

  const lastMsgIndex = thread.length - 1;
  if (thread[lastMsgIndex].sender === "agent") {
    thread[lastMsgIndex] = {
      ...thread[lastMsgIndex],
      content: newContent,
    };
  }

  return {
    ...state,
    chatThreads: {
      ...state.chatThreads,
      [personaKey]: thread,
    },
  };
}

export function openComingSoonFeature(state: DemoState, feature: ComingSoonFeature): DemoState {
  return {
    ...state,
    activeComingSoon: feature,
  };
}

export function closeComingSoonFeature(state: DemoState): DemoState {
  return {
    ...state,
    activeComingSoon: null,
  };
}

export function resetDemoState(): DemoState {
  return {
    ...INITIAL_DEMO_STATE,
    profile: { ...INITIAL_PROFILE },
    chatThreads: { ...INITIAL_CHAT_THREADS },
  };
}
