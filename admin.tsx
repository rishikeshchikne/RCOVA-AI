import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Coins, Mail, ShieldAlert, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { formatCredits } from "@/config/plans";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: seo("Admin", "RCOVA AI admin overview.", { noindex: true }) }),
  component: AdminPage,
});

interface Overview {
  total_users: number;
  active_users_30d: number;
  ai_requests_30d: number;
  credits_used_30d: number;
  plans: Record<string, number>;
}

function AdminPage() {
  // Access is enforced inside the database function, which rejects non-admins.
  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_overview");
      if (error) throw error;
      return data as unknown as Overview;
    },
    retry: false,
  });
  const { data: inbox } = useQuery({
    queryKey: ["admin-contact-submissions"],
    enabled: !!data,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id, name, email, message, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldAlert className="mx-auto size-8 text-destructive" />
        <h1 className="mt-4 text-2xl font-semibold">No admin access</h1>
        <p className="mt-2 text-muted-foreground">This page is only available to RCOVA AI administrators.</p>
      </div>
    );
  }

  const metrics = [
    { icon: Users, label: "Registered users", value: data?.total_users },
    { icon: Activity, label: "Active users (30 days)", value: data?.active_users_30d },
    { icon: Activity, label: "AI requests (30 days)", value: data?.ai_requests_30d },
    { icon: Coins, label: "Credits used (30 days)", value: data?.credits_used_30d },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <p className="text-sm text-muted-foreground">Admin</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Platform overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="surface-card p-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <m.icon className="size-4 text-lavender" /> {m.label}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {isLoading || m.value === undefined ? "…" : formatCredits(m.value)}
            </p>
          </div>
        ))}
      </div>
      <section className="surface-card mt-6 p-6">
        <h2 className="font-semibold">Users by plan</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {Object.entries(data?.plans ?? {}).map(([plan, n]) => (
            <li key={plan} className="flex justify-between rounded-lg bg-surface px-4 py-2 capitalize">
              <span>{plan}</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">Revenue and AI cost aren't tracked yet — payments are not connected.</p>
      </section>
      <section className="surface-card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Mail className="size-4 text-lavender" /> Contact messages
        </h2>
        {inbox && inbox.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No messages yet.</p>
        )}
        <ul className="mt-4 space-y-3">
          {inbox?.map((m) => (
            <li key={m.id} className="rounded-lg bg-surface p-4 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {m.name}{" "}
                  <a href={`mailto:${m.email}`} className="font-normal text-lavender hover:underline">
                    {m.email}
                  </a>
                </p>
                <time className="text-xs text-muted-foreground" dateTime={m.created_at}>
                  {new Date(m.created_at).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{m.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
