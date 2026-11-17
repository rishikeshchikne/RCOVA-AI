import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, FormError } from "@/components/site/AuthLayout";
import { FormField } from "@/components/site/FormField";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";
import { passwordSchema } from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: seo("Set a New Password", "Choose a new password for your RCOVA AI account.", {
      noindex: true,
    }),
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady("ok");
    });
    const isRecovery = window.location.hash.includes("type=recovery");
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady("ok");
      else if (!isRecovery) setReady("invalid");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return setFieldError(parsed.error.issues[0]?.message);
    if (password !== confirm) return setFieldError("Passwords don't match.");
    setFieldError(undefined);
    setError(null);
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("We couldn't update your password. The link may have expired — request a new one.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      {ready === "checking" && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Checking your reset link…
        </p>
      )}
      {ready === "invalid" && (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            This reset link is invalid or has expired.
          </p>
          <Button asChild variant="hero" className="w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      )}
      {ready === "ok" && (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormError message={error} />
          <FormField id="password" label="New password" error={fieldError} hint="At least 8 characters.">
            <Input id="password" name="password" type="password" autoComplete="new-password" className="bg-surface" />
          </FormField>
          <FormField id="confirm" label="Confirm new password">
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" className="bg-surface" />
          </FormField>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
