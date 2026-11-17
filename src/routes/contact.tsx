import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Section } from "@/components/site/Section";
import { seo } from "@/lib/seo";
import { submitContact } from "@/lib/contact.functions";
import { contactSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: seo(
      "Contact",
      "Contact the RCOVA AI team with questions, feedback or partnership enquiries.",
    ),
  }),
  component: ContactPage,
});

function ContactPage() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      name: data.get("name") ?? "",
      email: data.get("email") ?? "",
      message: data.get("message") ?? "",
      website: data.get("website") ?? "",
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError(null);
    setStatus("sending");
    try {
      await submitContact({ data: parsed.data });
      setStatus("done");
    } catch {
      setFormError("We couldn't send your message. Please try again in a moment.");
      setStatus("idle");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        description="Send us a message and the RCOVA AI team will get back to you."
      />
      <Section className="py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          {status === "done" ? (
            <div role="status" className="surface-card flex flex-col items-center p-8 text-center">
              <CheckCircle2 className="size-10 text-lavender" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">Message sent</h2>
              <p className="mt-2 text-muted-foreground">
                Thanks for reaching out — the RCOVA AI team has received your message.
              </p>
              <Button variant="glass" className="mt-6" onClick={() => setStatus("idle")}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="surface-card space-y-5 p-6 sm:p-8">
              {formError && (
                <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </p>
              )}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Name" error={errors.name}>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    className="bg-surface"
                    aria-invalid={!!errors.name}
                  />
                </Field>
                <Field id="email" label="Email" error={errors.email}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="bg-surface"
                    aria-invalid={!!errors.email}
                  />
                </Field>
              </div>
              <Field id="message" label="Message" error={errors.message}>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="bg-surface"
                  aria-invalid={!!errors.message}
                />
              </Field>
              <Button type="submit" variant="hero" size="lg" disabled={status === "sending"}>
                {status === "sending" && <Loader2 className="animate-spin" />} Send message
              </Button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
