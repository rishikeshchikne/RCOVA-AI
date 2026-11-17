import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, FormError } from "@/components/site/AuthLayout";
import { FormField } from "@/components/site/FormField";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";
import { type FieldErrors, fieldErrors, forgotSchema } from "@/lib/validation";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: seo("Forgot Password", "Reset the password for your RCOVA AI account.") }),
  component: ForgotPage,
});

function ForgotPage() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = forgotSchema.safeParse({ email: form.get("email") });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError(null);
    setStatus("loading");
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setStatus("idle");
      setFormError("We couldn't send the reset email right now. Please try again in a minute.");
      return;
    }
    setStatus("done");
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-lavender hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {status === "done" ? (
        <div className="space-y-3 text-center" role="status">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-lavender">
            <MailCheck className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link is on its way. It may take a minute
            to arrive.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormError message={formError} />
          <FormField id="email" label="Email" error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="bg-surface"
              aria-invalid={!!errors.email}
            />
          </FormField>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" && <Loader2 className="animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
