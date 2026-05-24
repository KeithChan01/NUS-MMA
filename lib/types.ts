export type Session = {
  id: string;
  title: string;
  date_time: string;
  location: string;
  notes: string | null;
  created_at: string;
  signups?: Signup[];
};

export type Signup = {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  profile?: Profile | null;
};

export type Profile = {
  id: string;
  display_name: string;
  weight_class: string | null;
  muay_thai: string | null;
  bjj: string | null;
  wrestling: string | null;
  boxing: string | null;
  kickboxing: string | null;
  created_at: string;
  updated_at: string;
};

export const WEIGHT_CLASSES = [
  "Strawweight (< 52 kg)",
  "Flyweight (52–57 kg)",
  "Bantamweight (57–61 kg)",
  "Featherweight (61–66 kg)",
  "Lightweight (66–71 kg)",
  "Welterweight (71–77 kg)",
  "Middleweight (77–84 kg)",
  "Light Heavyweight (84–93 kg)",
  "Heavyweight (93–120 kg)",
];

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const MARTIAL_ARTS: { key: keyof Pick<Profile, "muay_thai" | "bjj" | "wrestling" | "boxing" | "kickboxing">; label: string }[] = [
  { key: "muay_thai", label: "Muay Thai" },
  { key: "kickboxing", label: "Kickboxing" },
  { key: "boxing", label: "Boxing" },
  { key: "bjj", label: "BJJ" },
  { key: "wrestling", label: "Wrestling" },
];
