import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/Section";
import { TOOL_CREDIT_COST } from "@/config/plans";
import { TOOLS } from "@/config/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: seo(
      "AI Tools",
      "Explore RCOVA AI's tools: AI Chat for conversations, AI Writer for content, and AI Study for learning faster.",
    ),
  }),
  component: ToolsPage,
});

const UNIT: Record<string, string> = { chat: "message", writer: "generation", study: "answer" };

function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Tools"
        title={
          <>
            Everything you need to <span className="text-gradient">create and learn.</span>
          </>
        }
        description="Pick a tool to get started. Each one shows its credit cost upfront, so there are no surprises."
      />
      <Section className="py-14 md:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <article key={tool.id} className="surface-card surface-interactive flex flex-col p-7">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                  <tool.icon className="size-5" aria-hidden="true" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Coins className="size-3.5 text-lavender" aria-hidden="true" />
                  {TOOL_CREDIT_COST[tool.id]} credit{TOOL_CREDIT_COST[tool.id] === 1 ? "" : "s"} /{" "}
                  {UNIT[tool.id]}
                </span>
              </div>
              <h2 className="mt-6 text-xl font-semibold">{tool.name}</h2>
              <p className="mt-2 text-muted-foreground">{tool.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {tool.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-muted-foreground">
                    <Check className="mt-0.5 size-4 text-electric" aria-hidden="true" /> {b}
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-8">
                <Link to={tool.to}>
                  Open {tool.name} <ArrowRight />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
