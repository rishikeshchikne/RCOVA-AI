import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Verifies the bearer token on a raw server-route request and returns an RLS-scoped client. */
export async function authenticateRequest(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const header = request.headers.get("authorization");
  if (!url || !key || !header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  if (token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;
  return { supabase, userId };
}

export function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Charges credits with the server-only ledger function. Returns an error Response on failure. */
export async function chargeCredits(userId: string, amount: number, tool: string, description: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("spend_credits", {
    _user_id: userId,
    _amount: amount,
    _tool: tool,
    _description: description,
  });
  if (error) {
    if (error.message.includes("insufficient_credits")) {
      return {
        error: jsonError(
          402,
          `You need ${amount} credit${amount === 1 ? "" : "s"} for this, but your balance is too low. Upgrade your plan to continue.`,
        ),
      };
    }
    console.error("spend_credits failed", error);
    return { error: jsonError(500, "We couldn't check your credits. Please try again.") };
  }
  return { balance: data as number };
}

export async function refundCredits(userId: string, amount: number, tool: string, description: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("refund_credits", {
    _user_id: userId,
    _amount: amount,
    _tool: tool,
    _description: description,
  });
  if (error) console.error("refund_credits failed", error);
}

/** Maps AI gateway failures to a safe message for the user. */
export function aiErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode: unknown }).statusCode)
      : undefined;
  if (status === 429) return "RCOVA AI is busy right now. Please wait a moment and try again.";
  if (status === 402 || status === 403)
    return "The AI service is temporarily unavailable. Your credits were refunded.";
  return "Something went wrong generating a response. Your credits were refunded.";
}
