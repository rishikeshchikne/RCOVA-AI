import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, FormError, GoogleButton, OrDivider } from "@/components/site/AuthLayout";
import { FormField } from "@/components/site/FormField";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/auth";
import { seo } from "@/lib/seo";
import { type FieldErrors, fieldErrors, loginSchema } from "@/lib/validation";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = safeRedirect(search["redirect"]);
    return redirect ? { redirect } : {};
  },
  head: () => ({
    meta: seo(
      "Login",
      "Log in to your RCOVA AI account to access AI Chat, AI Writer, AI Study and your credits.",
    ),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    if (redirect) navigate({ href: redirect, replace: true });
    else navigate({ to: "/dashboard", replace: true });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      setFormError(
        error.message.toLowerCase().includes("confirm")
          ? "Please confirm your email first — check your inbox for the link."
          : "That email and password don't match. Please try again.",
      );
      return;
    }
    goNext();
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to RCOVA AI."
      footer={
        <>
          New to RCOVA AI?{" "}
          <Link to="/signup" className="font-medium text-lavender hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton onSignedIn={goNext} onError={setFormError} />
      <OrDivider />
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
        <FormField
          id="password"
          label="Password"
          error={errors.password}
          aside={
            <Link to="/forgot-password" className="text-xs text-lavender hover:underline">
              Forgot password?
            </Link>
          }
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="bg-surface"
            aria-invalid={!!errors.password}
          />
        </FormField>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
