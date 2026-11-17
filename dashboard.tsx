import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Coins, Settings, Sparkle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCredits, getPlan, type PlanId } from "@/config/plans";
import { TOOLS } from "@/config/site";
import { creditAccountQuery, transactionsQuery } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: seo("Dashboard", "Your RCOVA AI credits, usage history and AI tools.", { noindex: true }),
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { data: account } = useQuery(creditAccountQuery(user.id));
  const { data: transactions } = useQuery(transactionsQuery(user.id));
  const plan = getPlan(((account?.plan as PlanId | undefined) ?? "free"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="glass">
            <Link to="/account">
              <Settings /> Account
            </Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/pricing">
              Plans <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="surface-card p-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="size-4 text-lavender" /> Available credits
          </p>
          <p className="mt-4 text-5xl font-semibold tracking-tight">
            {account ? formatCredits(account.balance) : "…"}
          </p>
        </div>
        <div className="surface-card p-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkle className="size-4 text-lavender" /> Current plan
          </p>
          <p className="mt-4 text-3xl font-semibold">{plan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{plan.creditsLabel}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card overflow-hidden" aria-labelledby="usage-heading">
          <h2 id="usage-heading" className="border-b border-border px-6 py-4 font-semibold">
            Credit history
          </h2>
          {transactions && transactions.length === 0 && (
            <p className="px-6 py-6 text-sm text-muted-foreground">No activity yet.</p>
          )}
          <ul>
            {transactions?.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 border-t border-border/60 px-6 py-3 text-sm first:border-t-0">
                <span>
                  <span className="block font-medium">{t.description || t.kind}</span>
                  <span className="block text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </span>
                <span className={t.amount < 0 ? "font-medium text-destructive" : "font-medium text-success"}>
                  {t.amount > 0 ? "+" : "−"}
                  {Math.abs(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="shortcuts-heading" className="space-y-3">
          <h2 id="shortcuts-heading" className="font-semibold">Quick start</h2>
          {TOOLS.map((tool) => (
            <Link key={tool.id} to={tool.to} className="surface-card surface-interactive group flex items-center gap-4 p-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                <tool.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-medium">{tool.name}</span>
                <span className="block text-sm text-muted-foreground">{tool.short}</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
