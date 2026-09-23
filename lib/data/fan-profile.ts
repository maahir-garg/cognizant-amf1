import { FanProfile, FanLevel } from "./schemas";

export const DEFAULT_FAN_PROFILE: FanProfile = {
  fan_level: "new",
  home_city: "Singapore",
  interests: ["environment", "stem", "tech"],
  impact_credits: 120,
  completed_quizzes: [],
  chosen_actions: [],
};

const STORAGE_KEY = "impact_lap_fan_profile_v1";

export function loadFanProfile(): FanProfile {
  if (typeof window === "undefined") {
    return DEFAULT_FAN_PROFILE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FAN_PROFILE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FAN_PROFILE;
  }
}

export function saveFanProfile(profile: FanProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save fan profile:", err);
  }
}

export const POPULAR_CITIES = [
  "Singapore",
  "London",
  "Melbourne",
  "Tokyo",
  "Austin",
  "Montreal",
  "Milan",
  "São Paulo",
  "Abu Dhabi",
  "Kuala Lumpur",
  "Jakarta",
];

export const INTEREST_OPTIONS = [
  { id: "environment", label: "Environmental Decarbonisation", icon: "Leaf" },
  { id: "stem", label: "STEM & Student Education", icon: "GraduationCap" },
  { id: "inclusion", label: "Workforce Diversity & Belonging", icon: "Users" },
  { id: "tech", label: "AI & Racing Telemetry", icon: "Cpu" },
  { id: "community", label: "Local Charities & Community", icon: "Heart" },
];
