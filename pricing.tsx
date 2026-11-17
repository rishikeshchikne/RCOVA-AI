import { createFileRoute } from "@tanstack/react-router";
import { Coins, CreditCard, Info, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/site/DemoNotice";
import { Faq } from "@/components/site/Faq";
import { PricingCards } from "@/components/site/PricingCards";
import { PageHeader, Section, SectionHeading } from "@/components/site/Section";
import {
  COMPARISON_ROWS,
  CREDIT_PACKS,
  PLANS,
  TOOL_CREDIT_COST,
  formatCredits,
  formatPrice,
} from "@/config/plans";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: seo(
      "Pricing",
      "Simple RCOVA AI plans: Free with 100 welcome credits, Pro with 2,000 monthly credits and Ultra with 6,000 monthly credits.",
    ),
  }),
  component: PricingPage,
});

const BILLING = [
  {
    icon: CreditCard,
    title: "Monthly billing",
    body: "Paid plans renew monthly. You'll see the exact amount before confirming.",
  },
  {
    icon: RefreshCw,
    title: "Credits reset monthly",
    body: "Pro and Ultra credits refresh at the start of each billing cycle.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    body: "Payments will be processed by a verified provider. We never store card details.",
  },
  {
    icon: Info,
    title: "Provisional pricing",
    body: "Prices shown are examples and may change before launch.",
  },
];

function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            Plans that grow <span className="text-gradient">with you.</span>
          </>
        }
        description="Start free with welcome credits. Upgrade for a larger monthly allowance whenever you need it."
      />
      <Section className="py-14 md:py-20">
        <DemoNotice title="Billing not connected yet" className="mb-10">
          Upgrades and credit packs can't be purchased yet. Prices are provisional examples, not
          final commercial commitments.
        </DemoNotice>
        <PricingCards />
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Compare" title="Compare plan features" />
        <div className="surface-card mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Plan comparison</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-6 py-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                {PLANS.map((p) => (
                  <th key={p.id} scope="col" className="px-6 py-4 text-left font-semibold">
                    {p.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {formatPrice(p.priceMonthly)}
                      {p.priceMonthly ? " / month" : ""}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border/60 last:border-0">
                  <th scope="row" className="px-6 py-4 text-left font-normal text-muted-foreground">
                    {row.label}
                  </th>
                  {PLANS.map((p) => (
                    <td key={p.id} className="px-6 py-4">
                      {row.values[p.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="border-y border-border/60 bg-surface">
        <Section>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Credits"
                title="How credits are used"
                description="Every action shows its credit cost before you run it. Balances are always calculated securely on our servers."
              />
              <ul className="mt-8 space-y-3">
                {(
                  [
                    ["AI Chat", TOOL_CREDIT_COST.chat, "message"],
                    ["AI Writer", TOOL_CREDIT_COST.writer, "generation"],
                    ["AI Study", TOOL_CREDIT_COST.study, "answer"],
                  ] as const
                ).map(([name, cost, unit]) => (
                  <li
                    key={name}
                    className="surface-card flex items-center justify-between px-5 py-4"
                  >
                    <span>{name}</span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Coins className="size-4 text-lavender" /> {cost} credit
                      {cost === 1 ? "" : "s"} / {unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Extra credits"
                title="Top up anytime"
                description="Need more in a busy month? Add a one-time credit pack on Pro or Ultra."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {CREDIT_PACKS.map((pack) => (
                  <div key={pack.id} className="surface-card flex flex-col p-5">
                    <p className="text-2xl font-semibold">{formatCredits(pack.credits)}</p>
                    <p className="text-sm text-muted-foreground">credits</p>
                    <p className="mt-4 font-medium text-lavender">{formatPrice(pack.price)}</p>
                    <Button
                      variant="glass"
                      size="sm"
                      className="mt-4"
                      onClick={() =>
                        toast("Credit packs aren't available yet", {
                          description: "Purchasing will open once secure billing is connected.",
                        })
                      }
                    >
                      Add pack
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading eyebrow="Billing" title="Clear billing information" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BILLING.map((b) => (
            <div key={b.title} className="surface-card p-6">
              <b.icon className="size-5 text-electric" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">Pricing FAQ</h2>
          <Faq />
        </div>
      </Section>
    </>
  );
}
