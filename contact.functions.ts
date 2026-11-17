import { createServerFn } from "@tanstack/react-start";

import { contactSchema } from "@/lib/validation";

/** Saves a Contact page message. Public: validates input and writes with server credentials. */
export const submitContact = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot: bots fill the hidden field; pretend success without storing.
    if (data.website) return { ok: true as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) {
      console.error("contact insert failed", error);
      throw new Error("We couldn't send your message. Please try again.");
    }
    return { ok: true as const };
  });
