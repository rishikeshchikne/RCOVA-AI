/**
 * Plan and credit configuration.
 * Prices are provisional examples, not final commercial commitments.
 * Display only: real balances and deductions must be computed on the server.
 */
export type PlanId = "free" | "pro" | "ultra";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  currency: "INR";
  credits: number;
  creditsLabel: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    currency: "INR",
    credits: 100,
    creditsLabel: "100 welcome credits",
    description: "Try every RCOVA tool with a one-time credit gift.",
    features: ["Access to AI Chat, Writer and Study", "Limited usage", "Standard response speed"],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 199,
    currency: "INR",
    credits: 2000,
    creditsLabel: "2,000 credits / month",
    description: "For people who use AI every week for work or study.",
    features: [
      "Everything in Free",
      "2,000 monthly credits",
      "Longer writing outputs",
      "Saved conversation history",
    ],
    highlighted: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    priceMonthly: 499,
    currency: "INR",
    credits: 6000,
    creditsLabel: "6,000 credits / month",
    description: "For heavy daily use and power creators.",
    features: [
      "Everything in Pro",
      "6,000 monthly credits",
      "Priority access to new tools",
      "Priority support",
    ],
  },
];

/** Provisional extra credit packs — purchasing is not connected yet. */
export const CREDIT_PACKS = [
  { id: "pack-500", credits: 500, price: 79 },
  { id: "pack-1500", credits: 1500, price: 199 },
  { id: "pack-5000", credits: 5000, price: 549 },
] as const;

/** Provisional credit cost per action, shown before a request is made. */
export const TOOL_CREDIT_COST = {
  chat: 1,
  writer: 5,
  study: 2,
} as const;

export const COMPARISON_ROWS: { label: string; values: Record<PlanId, string> }[] = [
  {
    label: "Credits",
    values: { free: "100 one-time", pro: "2,000 / month", ultra: "6,000 / month" },
  },
  { label: "AI Chat", values: { free: "Yes", pro: "Yes", ultra: "Yes" } },
  { label: "AI Writer", values: { free: "Yes", pro: "Yes", ultra: "Yes" } },
  { label: "AI Study", values: { free: "Yes", pro: "Yes", ultra: "Yes" } },
  { label: "Conversation history", values: { free: "Session only", pro: "Saved", ultra: "Saved" } },
  { label: "Extra credit packs", values: { free: "—", pro: "Available", ultra: "Available" } },
  { label: "Support", values: { free: "Community", pro: "Email", ultra: "Priority" } },
];

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function formatPrice(amount: number, currency: Plan["currency"] = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCredits(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}
