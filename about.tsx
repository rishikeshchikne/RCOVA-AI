import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Eye, HeartHandshake, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section, SectionHeading } from "@/components/site/Section";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: seo(
      "About",
      "RCOVA AI is building a simple, trustworthy AI platform that helps people worldwide create, learn and explore.",
    ),
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Compass,
    title: "Simple by design",
    body: "Powerful AI should feel approachable. We remove complexity so beginners feel at home.",
  },
  {
    icon: Lock,
    title: "Privacy and security first",
    body: "Secret keys stay on our servers, and your data is handled with care.",
  },
  {
    icon: Eye,
    title: "Honest and transparent",
    body: "Clear pricing, visible credit costs, and no invented claims.",
  },
  {
    icon: HeartHandshake,
    title: "Built for everyone",
    body: "Designed for students, creators and professionals around the world.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About RCOVA AI"
        title={
          <>
            We're building AI that helps you <span className="text-gradient">think smarter.</span>
          </>
        }
        description="RCOVA AI brings practical AI tools into one premium, easy-to-use platform — so anyone, anywhere can create more and learn faster."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our mission"
              title="Make intelligent tools useful for everyday life."
            />
          </div>
          <div className="space-y-5 text-lg text-muted-foreground">
            <p>
              Most people don't need a dozen AI apps. They need a few great tools that just work —
              for answering questions, writing clearly and understanding new topics.
            </p>
            <p>
              RCOVA AI focuses on exactly that: AI Chat, AI Writer and AI Study, connected by a
              single account and a transparent credit system.
            </p>
          </div>
        </div>
      </Section>
      <div className="border-y border-border/60 bg-surface">
        <Section>
          <SectionHeading eyebrow="Values" title="What we stand for" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="surface-card p-6">
                <v.icon className="size-5 text-lavender" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <Section className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Want to get in touch?</h2>
        <p className="mt-3 text-muted-foreground">
          Questions, feedback or partnership ideas — we'd love to hear from you.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link to="/tools">Explore AI Tools</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
