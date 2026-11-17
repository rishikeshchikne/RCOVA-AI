import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Coins, Gift } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatCredits, getPlan } from "@/config/plans";
import type { ToolInfo } from "@/config/site";
import { useAuth } from "@/lib/auth";
import { creditAccountQuery } from "@/lib/queries";

export function ToolShell({
  tool,
  cost,
  costUnit,
  children,
}: {
  tool: ToolInfo;
  cost: number;
  costUnit: string;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const { data: account } = useQuery({ ...creditAccountQuery(user?.id ?? ""), enabled: !!user });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> All tools
      </Link>
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <tool.icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tool.name}</h1>
            <p className="text-muted-foreground">{tool.short}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Coins className="size-3.5 text-lavender" aria-hidden="true" />
            Uses{" "}
            <strong className="font-semibold text-foreground">
              {cost} credit{cost === 1 ? "" : "s"}
            </strong>{" "}
            per {costUnit}
          </span>
          {account && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-muted-foreground">
              Balance:{" "}
              <strong className="font-semibold text-foreground">
                {formatCredits(account.balance)}
              </strong>
            </span>
          )}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** Inline prompt shown instead of a tool action while signed out. */
export function SignInPrompt({ action, redirect }: { action: string; redirect: string }) {
  const free = getPlan("free");
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-primary/40 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <Gift className="mt-0.5 size-5 shrink-0 text-lavender" aria-hidden="true" />
        <div>
          <p className="font-medium">Sign in to {action}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            New accounts get {free.credits} free welcome credits.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="glass" size="sm">
          <Link to="/login" search={{ redirect }}>
            Log in
          </Link>
        </Button>
        <Button asChild variant="hero" size="sm">
          <Link to="/signup">Sign up free</Link>
        </Button>
      </div>
    </div>
  );
}

/** Shown when a request fails; credits are refunded on the server for AI errors. */
export function ToolError({ message }: { message: string }) {
  const lowBalance = message.toLowerCase().includes("balance is too low");
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
      <p className="text-destructive">{message}</p>
      {lowBalance && (
        <Button asChild variant="hero" size="sm" className="mt-3">
          <Link to="/pricing">See plans</Link>
        </Button>
      )}
    </div>
  );
}
