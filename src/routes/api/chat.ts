import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { TOOL_CREDIT_COST } from "@/config/plans";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/prompts";
import { createGateway, REASONING_OPTIONS } from "@/lib/ai/gateway.server";
import { withLovableAiGatewayRunIdHeader } from "@/lib/ai/run-id";
import {
  aiErrorMessage,
  authenticateRequest,
  chargeCredits,
  jsonError,
  refundCredits,
} from "@/lib/server/request-auth.server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_HISTORY = 40;

function textOf(message: UIMessage) {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth) return jsonError(401, "Please sign in to chat.");

        let body: { id?: unknown; messages?: unknown };
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "Invalid request.");
        }
        const threadId = typeof body.id === "string" ? body.id : "";
        const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : [];
        const last = messages.at(-1);
        if (!UUID.test(threadId) || !last || last.role !== "user") {
          return jsonError(400, "Invalid request.");
        }
        const userText = textOf(last);
        if (!userText || userText.length > 8000) {
          return jsonError(400, "Messages must be between 1 and 8,000 characters.");
        }

        const { supabase, userId } = auth;
        const { data: thread, error: threadError } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", threadId)
          .maybeSingle();
        if (threadError) return jsonError(500, "Couldn't load this conversation.");
        if (!thread) return jsonError(404, "Conversation not found.");

        const cost = TOOL_CREDIT_COST.chat;
        const charge = await chargeCredits(userId, cost, "chat", "AI Chat message");
        if ("error" in charge) return charge.error;

        const { error: saveError } = await supabase.from("chat_messages").upsert(
          {
            thread_id: threadId,
            user_id: userId,
            message_id: last.id,
            role: "user",
            parts: last.parts as never,
          },
          { onConflict: "thread_id,message_id" },
        );
        if (saveError) {
          console.error("save user message failed", saveError);
          await refundCredits(userId, cost, "chat", "Refund: message not saved");
          return jsonError(500, "Couldn't save your message. Your credits were refunded.");
        }

        await supabase
          .from("chat_threads")
          .update({
            updated_at: new Date().toISOString(),
            ...(thread.title === "New conversation" ? { title: userText.slice(0, 60) } : {}),
          })
          .eq("id", threadId);

        let refunded = false;
        const refundOnce = async () => {
          if (refunded) return;
          refunded = true;
          await refundCredits(userId, cost, "chat", "Refund: AI Chat error");
        };

        const { model, runIdFetch } = createGateway(request);
        const result = streamText({
          model,
          instructions: CHAT_INSTRUCTIONS,
          messages: await convertToModelMessages(messages.slice(-MAX_HISTORY)),
          abortSignal: request.signal,
          providerOptions: REASONING_OPTIONS,
          onError: async ({ error }) => {
            console.error("chat stream error", error);
            await refundOnce();
          },
        });

        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages,
            sendReasoning: true,
            onError: (error) => aiErrorMessage(error),
            onFinish: async ({ responseMessage }) => {
              if (!responseMessage.parts.some((p) => p.type === "text" && p.text.trim())) return;
              const { error } = await supabase.from("chat_messages").upsert(
                {
                  thread_id: threadId,
                  user_id: userId,
                  message_id: responseMessage.id,
                  role: "assistant",
                  parts: responseMessage.parts as never,
                },
                { onConflict: "thread_id,message_id" },
              );
              if (error) console.error("save assistant message failed", error);
            },
          }),
          runIdFetch,
        );
      },
    },
  },
});
