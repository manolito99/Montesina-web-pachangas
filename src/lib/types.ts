import type { Category } from "@/components/ui/cat-chip";

export type { Category };

export interface Pachanga {
  id: string;
  cat: Category;
  date: string;
  time: string;
  pista: string;
  nivel: number;
  filled: number;
  max: number;
  organizer: string;
  price: string;
  avatars: string[];
  accent?: boolean;
  notes?: string;
  waitlist?: WaitlistEntry[];
  chat?: ChatEntry[];
}

export interface WaitlistEntry {
  name: string;
  initial: string;
  nivel: number;
  position: number;
}

export interface ChatEntry {
  who: string;
  text: string;
  time: string;
  mine?: boolean;
}

export interface Player {
  id: string;
  name: string;
  initial: string;
  level: number;
  gender: "H" | "M";
}

export interface Court {
  id: string;
  name: string;
  type: "indoor" | "outdoor";
  free: boolean;
}

export interface UserNotification {
  id: string;
  icon: string;
  text: string;
  time: string;
  kind: "ok" | "warn" | "lime" | "neutral";
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  initial: string;
  level: number;
  gender: "H" | "M";
  memberSince: number;
  stats: {
    played: number;
    created: number;
    attendance: string;
    favCategory: string;
    thisMonth: number;
  };
}

export type BookingState = 0 | 1 | 2 | 3;
