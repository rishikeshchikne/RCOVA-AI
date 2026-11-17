import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coins,
  Compass,
  Globe2,
  Layers,
  MousePointerClick,
  Rocket,
  UserPlus,
  Wallet,
} from "lucide-react";

import heroImage from "@/assets/hero-ai-core.jpg";
import { Button } from "@/components/ui/button";
import { Faq } from "@/components/site/Faq";
import { PricingCards } from "@/components/site/PricingCards";
import { Eyebrow, Section, SectionHeading } from "@/components/site/Section";
import { TOOLS } from "@/config/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seo(
      "RCOVA AI — Think Smarter. Create More.",
      "RCOVA AI brings AI Chat, AI Writer and AI Study together in one premium platform. Create, learn and explore with intelligent AI tools.",
    ),
  }),
  component: HomePage,
});

const WHY = [
  {
    icon: MousePointerClick,
    title: "Easy to use",
    body: "A clean, focused interface that feels natural from your very first prompt.",
  },
  {
    icon: Layers,
    title: "Multiple AI tools, one platform",
    body: "Chat, write and study in one place, with one account and one credit balance.",
  },
  {
    icon: Wallet,
    title: "Flexible usage plans",
    body: "Start free with welcome credits and upgrade only when you need more.",
  },
  {
    icon: Globe2,
    title: "Designed for worldwide users",
    body: "Built for students, creators and professionals wherever they are.",
  },
];

const STEPS = [
  { icon: UserPlus, title: "Create an account", body: "Sign up in under a minute." },
  { icon: Coins, title: "Receive free credits", body: "Get 100 welcome credits to start." },
  { icon: Compass, title: "Explore AI tools", body: "Try Chat, Writer and Study." },
  { icon: Rocket, title: "Upgrade when needed", body: "Move to Pro or Ultra anytime." },
];

function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-50"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-28">
          <div>
            <Eyebrow>Think Smarter. Create More.</Eyebrow>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Your Ideas. <span className="text-gradient">Powered by AI.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty sm:text-xl">
              Create, learn and explore with intelligent AI tools in one place.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="xl">
                <Link to="/tools">
                  Explore AI Tools <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              100 free welcome credits · No card required
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="absolute inset-8 rounded-full bg-primary/30 blur-3xl"
              aria-hidden="true"
            />
            <img
              src={heroImage}
              alt="Glowing abstract AI core made of violet and blue light"
              width={1280}
              height={1280}
              className="animate-float relative aspect-square w-full rounded-[2rem] object-cover [mask-image:radial-gradient(circle_at_center,black_55%,transparent_72%)]"
            />
          </div>
        </div>
      </div>

      {/* Tools */}
      <Section id="tools">
        <SectionHeading
          eyebrow="AI Tools"
          title="Three focused tools. One intelligent workspace."
          description="Each tool is built for a specific job, so you get to a useful result faster."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              to={tool.to}
              className="surface-card surface-interactive group flex flex-col p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <tool.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{tool.name}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{tool.description}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-lavender">
                Open {tool.name}{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Why */}
      <div className="border-y border-border/60 bg-surface">
        <Section>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeading
              align="left"
              eyebrow="Why RCOVA"
              title="Serious AI, made simple."
              description="RCOVA AI is built to feel effortless for beginners and capable enough for everyday professional work."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {WHY.map((w) => (
                <div key={w.title} className="surface-card p-6">
                  <w.icon className="size-5 text-lavender" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{w.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* How it works */}
      <Section>
        <SectionHeading eyebrow="How it works" title="From sign-up to results in four steps." />
        <ol className="relative mt-14 grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="surface-card relative p-6">
              <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
              <s.icon className="mt-4 size-6 text-electric" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Pricing preview */}
      <div className="border-y border-border/60 bg-surface">
        <Section>
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Scale when you're ready."
            description="Simple monthly plans with clear credit limits. Prices are provisional while we prepare launch."
          />
          <div className="mt-14">
            <PricingCards />
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="link" className="text-lavender">
              <Link to="/pricing">
                Compare all plan details <ArrowRight />
              </Link>
            </Button>
          </div>
        </Section>
      </div>

      {/* FAQ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Questions, answered."
            description="Everything you need to know before getting started."
          />
          <Faq />
        </div>
      </Section>

      {/* CTA */}
      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-card p-10 text-center shadow-glow sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Think smarter. Create more.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create your free account and start with 100 welcome credits.
            </p>
            <Button asChild variant="hero" size="xl" className="mt-8">
              <Link to="/signup">
                Get Started Free <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
