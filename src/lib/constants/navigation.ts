import {
  CalendarDays,
  CreditCard,
  Home,
  MessageSquare,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  disabled?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
};

export const dashboardNavigationItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { disabled: true, href: "/dashboard/profile", icon: UserRound, label: "Profile" },
  { disabled: true, href: "/dashboard/matching", icon: Sparkles, label: "AI Matching" },
  { disabled: true, href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { disabled: true, href: "/dashboard/sessions", icon: CalendarDays, label: "Sessions" },
  { disabled: true, href: "/dashboard/reviews", icon: Star, label: "Reviews" },
  { disabled: true, href: "/dashboard/community", icon: UsersRound, label: "Community" },
  { disabled: true, href: "/dashboard/billing", icon: CreditCard, label: "Premium" },
] satisfies NavigationItem[];
