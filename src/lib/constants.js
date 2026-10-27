import {
  BookOpen,
  Cake,
  CalendarDays,
  Cross,
  Flower,
  Gift,
  GraduationCap,
  Guitar,
  Heart,
  HeartHandshake,
  Mic,
  Music,
  PartyPopper,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";

// Royal purple, gold, plum, and lavender family — enough spread to keep
// departments apart without leaving the palette.
export const DEPARTMENT_COLORS = {
  violet: {
    badge: "bg-violet-100 text-violet-800",
    soft: "bg-violet-50",
    solid: "bg-violet-700",
    text: "text-violet-800",
    border: "border-violet-200",
  },
  purple: {
    badge: "bg-purple-100 text-purple-800",
    soft: "bg-purple-50",
    solid: "bg-purple-700",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  gold: {
    badge: "bg-amber-100 text-amber-900",
    soft: "bg-amber-50",
    solid: "bg-amber-500",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  plum: {
    badge: "bg-fuchsia-100 text-fuchsia-900",
    soft: "bg-fuchsia-50",
    solid: "bg-fuchsia-800",
    text: "text-fuchsia-900",
    border: "border-fuchsia-200",
  },
  lavender: {
    badge: "bg-indigo-100 text-indigo-800",
    soft: "bg-indigo-50",
    solid: "bg-indigo-600",
    text: "text-indigo-800",
    border: "border-indigo-200",
  },
  rose: {
    badge: "bg-rose-100 text-rose-800",
    soft: "bg-rose-50",
    solid: "bg-rose-700",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  // Older churches saved these keys — they keep working in the new palette.
  blue: {
    badge: "bg-indigo-100 text-indigo-800",
    soft: "bg-indigo-50",
    solid: "bg-indigo-600",
    text: "text-indigo-800",
    border: "border-indigo-200",
  },
  emerald: {
    badge: "bg-fuchsia-100 text-fuchsia-900",
    soft: "bg-fuchsia-50",
    solid: "bg-fuchsia-800",
    text: "text-fuchsia-900",
    border: "border-fuchsia-200",
  },
  teal: {
    badge: "bg-purple-100 text-purple-800",
    soft: "bg-purple-50",
    solid: "bg-purple-700",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  indigo: {
    badge: "bg-indigo-100 text-indigo-800",
    soft: "bg-indigo-50",
    solid: "bg-indigo-600",
    text: "text-indigo-800",
    border: "border-indigo-200",
  },
};

export const DEPARTMENT_ICONS = {
  music: Music,
  users: Users,
  hands: HeartHandshake,
  sparkles: Sparkles,
  guitar: Guitar,
  book: BookOpen,
  mic: Mic,
  heart: Heart,
  star: Star,
  trophy: Trophy,
  cross: Cross,
};

export const ICON_OPTIONS = [
  { value: "music", label: "Music" },
  { value: "guitar", label: "Instruments" },
  { value: "mic", label: "Worship team" },
  { value: "users", label: "Group of people" },
  { value: "hands", label: "Fellowship" },
  { value: "heart", label: "Care" },
  { value: "book", label: "Study" },
  { value: "sparkles", label: "Youth" },
  { value: "star", label: "Ministry" },
  { value: "trophy", label: "Sports" },
  { value: "cross", label: "Faith" },
];

export const COLOR_OPTIONS = ["violet", "purple", "plum", "gold", "lavender", "rose"];

export const getDepartmentIcon = (iconKey) => DEPARTMENT_ICONS[iconKey] || Users;
export const getDepartmentColor = (colorKey) => DEPARTMENT_COLORS[colorKey] || DEPARTMENT_COLORS.violet;

export const DEFAULT_DEPARTMENTS = [
  {
    name: "Choir",
    icon: "music",
    color: "violet",
    description: "Leads the congregation in song and carries the worship ministry.",
    meeting_schedule: "Rehearsals — Thursdays, 7:00 PM",
  },
  {
    name: "Brotherhood",
    icon: "users",
    color: "lavender",
    description: "Men of the church growing in faith, accountability, and service.",
    meeting_schedule: "Meets — 2nd Saturday, 8:00 AM",
  },
  {
    name: "Sisterhood",
    icon: "hands",
    color: "rose",
    description: "Women of the church in prayer, fellowship, and outreach.",
    meeting_schedule: "Meets — 1st Saturday, 10:00 AM",
  },
  {
    name: "Youth Department",
    icon: "sparkles",
    color: "gold",
    description: "Teens and young adults learning, serving, and growing together.",
    meeting_schedule: "Meets — Sundays, 5:00 PM",
  },
  {
    name: "Musicians",
    icon: "guitar",
    color: "plum",
    description: "Instrumentalists and worship team supporting every service.",
    meeting_schedule: "Rehearsals — Saturdays, 4:00 PM",
  },
];

export const FUNDS = [
  { value: "tithe", label: "Tithe", icon: Cross },
  { value: "offering", label: "Offering", icon: Gift },
  { value: "building", label: "Building Fund", icon: Star },
  { value: "missions", label: "Missions", icon: HeartHandshake },
  { value: "other", label: "Other", icon: Heart },
];

export const GIVING_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "card", label: "Card" },
  { value: "transfer", label: "Bank transfer" },
];

export const GIVING_STATUSES = {
  recorded: { label: "Recorded", className: "bg-emerald-100 text-emerald-800" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-900" },
  paid: { label: "Confirmed", className: "bg-emerald-100 text-emerald-800" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-800" },
};

export const fundLabel = (value) => FUNDS.find((f) => f.value === value)?.label || value || "";
export const methodLabel = (value) => GIVING_METHODS.find((m) => m.value === value)?.label || value || "";

export const EVENT_TYPES = [
  { value: "rehearsal", label: "Rehearsal" },
  { value: "service", label: "Service" },
  { value: "meeting", label: "Meeting" },
  { value: "outreach", label: "Outreach" },
  { value: "other", label: "Other" },
];

export const NEWS_CATEGORIES = [
  { value: "birthday", label: "Birthday", icon: Cake, className: "bg-fuchsia-100 text-fuchsia-900" },
  { value: "anniversary", label: "Anniversary", icon: Heart, className: "bg-rose-100 text-rose-800" },
  { value: "new_baby", label: "New Baby", icon: Flower, className: "bg-violet-100 text-violet-800" },
  { value: "wedding", label: "Wedding", icon: Sparkles, className: "bg-purple-100 text-purple-800" },
  { value: "graduation", label: "Graduation", icon: GraduationCap, className: "bg-indigo-100 text-indigo-800" },
  { value: "condolence", label: "In Memory", icon: Flower, className: "bg-muted text-muted-foreground" },
  { value: "prayer", label: "Prayer Request", icon: HeartHandshake, className: "bg-purple-100 text-purple-900" },
  { value: "praise", label: "Praise Report", icon: PartyPopper, className: "bg-amber-100 text-amber-900" },
  { value: "other", label: "General", icon: CalendarDays, className: "bg-muted text-muted-foreground" },
];

export const newsCategory = (value) =>
  NEWS_CATEGORIES.find((c) => c.value === value) || NEWS_CATEGORIES[NEWS_CATEGORIES.length - 1];

export const REACTIONS = [
  { value: "amen", label: "Amen", emoji: "🙏" },
  { value: "love", label: "Love", emoji: "❤️" },
  { value: "praising", label: "Praising", emoji: "🙌" },
  { value: "praying", label: "Praying", emoji: "🕊️" },
];