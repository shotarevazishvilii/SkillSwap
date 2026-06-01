import {
  BookOpen,
  CalendarDays,
  Home,
  MessageSquare,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const dashboardNavigationItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/profile", icon: UserRound, label: "Profile" },
  { href: "/dashboard/skills", icon: BookOpen, label: "Skills" },
  { href: "/dashboard/matches", icon: Sparkles, label: "Matches" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/sessions", icon: CalendarDays, label: "Sessions" },
] satisfies NavigationItem[];

export const dashboardPageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/profile": "Profile",
  "/dashboard/skills": "Skills",
  "/dashboard/matches": "Matches",
  "/dashboard/messages": "Messages",
  "/dashboard/sessions": "Sessions",
} as const;
