export type PersonaKey = "karsa" | "ara" | "radit" | "sekar" | "arka";

export interface PersonaInfo {
  id: PersonaKey;
  name: string;
  role: string;
  subtitle: string;
  statusText: string;
  accentColor: string; // Hex color code
  bgGradient: string;
  badgeBg: string;
  stationName: string;
  stationDescription: string;
  systemPrompt: string;
  greetingText: string;
  tourCallout: string;
  suggestedPrompts: string[];
  avatarIcon: string;
}

export interface UserProfile {
  nama: string;
  jenjangKelas: string;
  keahlianSudah: string[];
  keahlianIngin: string[];
  ritmeBelajar: string;
  targetTujuan: string[];
  isConsentGiven: boolean;
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  personaKey: PersonaKey;
  content: string;
  timestamp: string;
}

export type ComingSoonFeature = "roadmap" | "brankas" | "snbp" | "ruangan" | null;

export interface DemoState {
  profile: UserProfile;
  onboardingStep: number;
  ftuxCompleted: boolean;
  ftuxPhase: "door" | "modal" | "tour" | "done";
  ftuxTourIndex: number;
  koinBalance: number;
  hasClaimedBonusCoin: boolean;
  hasIncrementedFirstChatCoin: boolean;
  activePersona: PersonaKey | null;
  pendingInitialText?: string | null;
  celebratingPersona?: PersonaKey | null;
  activeComingSoon: ComingSoonFeature;
  chatThreads: Record<PersonaKey, ChatMessage[]>;
}
