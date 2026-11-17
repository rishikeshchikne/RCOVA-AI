import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ_ITEMS = [
  {
    q: "What is RCOVA AI?",
    a: "RCOVA AI is a single platform that brings together AI Chat, AI Writer and AI Study so you can create, learn and explore without switching between apps.",
  },
  {
    q: "How do credits work?",
    a: "Each AI action uses a small number of credits, shown before you run it. New accounts receive free welcome credits, and paid plans add a monthly credit allowance.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan includes 100 welcome credits so you can try every tool before deciding whether to upgrade.",
  },
  {
    q: "Can I change or cancel my plan?",
    a: "Plan changes and cancellations will be available from your dashboard once billing launches. Pricing shown today is provisional.",
  },
  {
    q: "Is the AI live right now?",
    a: "Yes. AI Chat, AI Writer and AI Study generate real responses. Create a free account to get your welcome credits and start using them.",
  },
  {
    q: "Who can use RCOVA AI?",
    a: "RCOVA AI is designed for people worldwide — students, creators and professionals — with a simple interface that works well for beginners.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible className="surface-card divide-y divide-border px-6">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`} className="border-0">
          <AccordionTrigger className="py-5 text-base hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
