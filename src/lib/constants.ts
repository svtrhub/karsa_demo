// Camera stations — % of room-master native dimensions, resolution-independent
export const STATIONS = {
  home:  { x: 50.5, y: 51.5, scale: 1.35 },
  karsa: { x: 50.4, y: 46.7, scale: 1.35 },
  ara:   { x: 37.9, y: 40.2, scale: 1.45 },
  arka:  { x: 59, y: 47.2, scale: 1.45 },
  radit: { x: 36.6, y: 45.6, scale: 1.45 },
  sekar: { x: 65.6, y: 42.7, scale: 1.45 },
  loft:  { x: 49.9, y: 21.4, scale: 1.35 },
} as const;

// Home seats — all 5 characters sit together around the tea table in the
// default/no-chat-open view (the "lived-in crew" state).
export const HOME_SEATS = {
  karsa: { x: 50.4, y: 46.5 },
  arka:  { x: 46.5, y: 50.1 },
  ara:   { x: 54.2, y: 50.0 },
  sekar: { x: 47.4, y: 54.5 },
  radit: { x: 53.4, y: 54.5 },
} as const;

// Pose → state mapping, corrected per-character (NOT a blind 1:1:1:1 index —
// verified against what each pose actually depicts)
export const PERSONA_POSES = {
  karsa: { idle: 'karsa_pose_1', working: 'karsa_pose_2', active: 'karsa_pose_3', celebrate: 'karsa_pose_4' },
  ara:   { idle: 'ara_pose_1',   working: 'ara_pose_2',   active: 'ara_pose_3',   celebrate: 'ara_pose_4'   },
  radit: { idle: 'radit_pose_1', active: 'radit_pose_2',  working: 'radit_pose_4', celebrate: 'radit_pose_3' },
  sekar: { idle: 'sekar_pose_1', active: 'sekar_pose_2',  working: 'sekar_pose_3', celebrate: 'sekar_pose_4' },
  arka:  { idle: 'arka_pose_1',  active: 'arka_pose_2',   working: 'arka_pose_3',  celebrate: 'arka_pose_4'  },
} as const;

import { Coins, MapPin, FileText, Palette, LucideIcon } from "lucide-react";
import { ComingSoonFeature } from "./types";

export interface ComingSoonItem {
  id: NonNullable<ComingSoonFeature>;
  label: string;
  icon: LucideIcon;
  desc: string;
}

export const COMING_SOON_FEATURES: ComingSoonItem[] = [
  {
    id: "brankas",
    label: "Brankas Koin Detail",
    icon: Coins,
    desc: "Buku Kas & Riwayat Koin",
  },
  {
    id: "roadmap",
    label: "Feed Lomba & Roadmap",
    icon: MapPin,
    desc: "Timeline & Kurasi Kompetisi",
  },
  {
    id: "snbp",
    label: "Dokumen & Portofolio SNBP",
    icon: FileText,
    desc: "Penilaian Sertifikat PTN",
  },
  {
    id: "ruangan",
    label: "Kustomisasi Ruangan",
    icon: Palette,
    desc: "Dekorasi & Furniture Teak",
  },
];

// Asset paths
export const ASSETS = {
  roomInterior: '/assets/rumah_karsa/rumah_karsa_interior_fullisland.webp',
  spaceBg: '/assets/rumah_karsa/space_bg.webp',
  roomExterior: '/assets/rumah_karsa/rumah_karsa_exterior.webp',
  logoWhite: '/assets/logo/white.svg',
  logoBlack: '/assets/logo/black.svg',
  koin: '/assets/koins/koin_karsa.svg',
  portrait: (name: string) => `/assets/sobat_karsa/portrait/${name}.webp`,
  pose: (name: string, pose: string) => `/assets/sobat_karsa/sprite_pose/${name}/${pose}.webp`,
} as const;

