import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/site/FormField";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";
import { seo } from "@/lib/seo";
import { passwordSchema } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: seo("Account", "Manage your RCOVA AI profile and password.", { noindex: true }),
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(profileQuery(user.id));
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim().slice(0, 80);
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name || null }).eq("id", user.id);
    setSaving(false);
    if (error) return void toast.error("Couldn't save your profile. Please try again.");
    toast.success("Profile saved");
    void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    const parsed = passwordSchema.safeParse(next);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Invalid password");
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current });
    if (error) return void toast.error("Couldn't change your password. Check your current password.");
    form.reset();
    toast.success("Password updated");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <p className="mt-1 text-muted-foreground">{user.email}</p>

      <form onSubmit={saveProfile} className="surface-card mt-8 space-y-5 p-6 sm:p-8">
        <h2 className="font-semibold">Profile</h2>
        <FormField id="name" label="Display name">
          <Input id="name" name="name" key={profile?.display_name ?? ""} defaultValue={profile?.display_name ?? ""} className="bg-surface" maxLength={80} />
        </FormField>
        <Button type="submit" variant="hero" disabled={saving}>Save changes</Button>
      </form>

      <form onSubmit={changePassword} className="surface-card mt-6 space-y-5 p-6 sm:p-8">
        <h2 className="font-semibold">Change password</h2>
        <FormField id="current" label="Current password">
          <Input id="current" name="current" type="password" autoComplete="current-password" className="bg-surface" />
        </FormField>
        <FormField id="next" label="New password" hint="At least 8 characters.">
          <Input id="next" name="next" type="password" autoComplete="new-password" className="bg-surface" />
        </FormField>
        <Button type="submit" variant="glass">Update password</Button>
      </form>
    </div>
  );
}
