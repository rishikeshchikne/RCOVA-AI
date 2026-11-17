import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PLANS, formatPrice } from "@/config/plans";
import { cn } from "@/lib/utils";

export function PricingCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <article
          key={plan.id}
          className={cn(
            "surface-card relative flex flex-col p-7",
            plan.highlighted && "border-primary/60 shadow-glow",
          )}
        >
          {plan.highlighted && (
            <span className="absolute -top-3 left-7 rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium text-primary-foreground">
              Most popular
            </span>
          )}
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
          <p className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight">
              {formatPrice(plan.priceMonthly)}
            </span>
            <span className="text-sm text-muted-foreground">
              {plan.priceMonthly === 0 ? "forever" : "/ month"}
            </span>
          </p>
          <p className="mt-2 text-sm font-medium text-lavender">{plan.creditsLabel}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-electric" aria-hidden="true" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {plan.id === "free" ? (
              <Button asChild variant="glass" size="lg" className="w-full">
                <Link to="/signup">Get started free</Link>
              </Button>
            ) : (
              <Button
                variant={plan.highlighted ? "hero" : "glass"}
                size="lg"
                className="w-full"
                onClick={() =>
                  toast("Payments aren't connected yet", {
                    description: `Upgrading to ${plan.name} will be available once secure billing is live.`,
                  })
                }
              >
                Upgrade to {plan.name}
              </Button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
