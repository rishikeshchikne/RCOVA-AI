import { Bot, GraduationCap, PenLine, type LucideIcon } from "lucide-react";

export const SITE = {
  name: "RCOVA AI",
  tagline: "Think Smarter. Create More.",
  description: "Create, learn and explore with intelligent AI tools in one place.",
} as const;

export const MAIN_NAV = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "AI Tools" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export const FOOTER_NAV = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
] as const;

export interface ToolInfo {
  id: "chat" | "writer" | "study";
  to: "/tools/chat" | "/tools/writer" | "/tools/study";
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
}

export const TOOLS: ToolInfo[] = [
  {
    id: "chat",
    to: "/tools/chat",
    name: "AI Chat",
    short: "Ask anything, think out loud.",
    description:
      "A conversational assistant for questions, brainstorming and everyday problem solving.",
    icon: Bot,
    bullets: ["Multi-turn conversations", "New and clear conversation", "Session history"],
  },
  {
    id: "writer",
    to: "/tools/writer",
    name: "AI Writer",
    short: "Drafts in the tone you need.",
    description:
      "Turn a short prompt into blog posts, emails, captions and more — in the tone you choose.",
    icon: PenLine,
    bullets: ["Content type presets", "Tone selection", "Copy-ready output"],
  },
  {
    id: "study",
    to: "/tools/study",
    name: "AI Study",
    short: "Understand topics faster.",
    description:
      "Ask questions, get topics explained simply and summarize long text into study notes.",
    icon: GraduationCap,
    bullets: ["Ask a question", "Explain a topic", "Summarize text"],
  },
];
