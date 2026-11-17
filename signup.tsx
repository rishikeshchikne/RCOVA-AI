import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gift, Loader2, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, FormError, GoogleButton, OrDivider } from "@/components/site/AuthLayout";
import { FormField } from "@/components/site/FormField";
import { getPlan } from "@/config/plans";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";
import { type FieldErrors, fieldErrors, signupSchema } from "@/lib/validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: seo(
      "Sign Up",
      "Create your free RCOVA AI account and receive 100 welcome credits to explore AI Chat, Writer and Study.",
    ),
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const free = getPlan("free");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.name },
      },
    });
    setLoading(false);
    if (error) {
      setFormError(
        error.message.toLowerCase().includes("already")
          ? "An account with this email already exists. Try logging in instead."
          : error.message.toLowerCase().includes("password")
            ? "Please choose a stronger password that hasn't appeared in a data breach."
            : "We couldn't create your account. Please try again.",
      );
      return;
    }
    if (data.session) navigate({ to: "/dashboard", replace: true });
    else setSentTo(parsed.data.email);
  };

  return (
    <AuthLayout
      title={sentTo ? "Check your email" : "Create your account"}
      subtitle={sentTo ? "One more step to activate your account." : "Start free — no card required."}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-lavender hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-lavender">
            <MailCheck className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{sentTo}</strong>.
            Open it to activate your account and receive your {free.credits} welcome credits.
          </p>
          <Button asChild variant="glass" className="w-full">
            <Link to="/login">Go to login</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
            <Gift className="size-4 shrink-0 text-lavender" aria-hidden="true" />
            <span>
              Get <strong>{free.credits} free welcome credits</strong> when you join.
            </span>
          </div>
          <GoogleButton
            label="Sign up with Google"
            onSignedIn={() => navigate({ to: "/dashboard", replace: true })}
            onError={setFormError}
          />
          <OrDivider />
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <FormError message={formError} />
            <FormField id="name" label="Full name" error={errors.name}>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                className="bg-surface"
                aria-invalid={!!errors.name}
              />
            </FormField>
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
            <FormField
              id="password"
              label="Password"
              error={errors.password}
              hint="At least 8 characters."
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="bg-surface"
                aria-invalid={!!errors.password}
              />
            </FormField>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Create account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our{" "}
              <Link to="/terms" className="underline hover:text-foreground">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
