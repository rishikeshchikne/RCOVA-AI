import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";

import { TOOL_CREDIT_COST } from "@/config/plans";
import {
  STUDY_LEVELS,
  WRITER_CONTENT_TYPES,
  WRITER_TONES,
  buildGeneration,
} from "@/lib/ai/prompts";
import { createGateway, REASONING_OPTIONS } from "@/lib/ai/gateway.server";
import { withLovableAiGatewayRunIdHeader } from "@/lib/ai/run-id";
import {
  authenticateRequest,
  chargeCredits,
  jsonError,
  refundCredits,
} from "@/lib/server/request-auth.server";

const schema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("writer"),
    prompt: z.string().trim().min(5).max(2000),
    contentType: z.enum(WRITER_CONTENT_TYPES),
    tone: z.enum(WRITER_TONES),
  }),
  z.object({
    tool: z.literal("study"),
    mode: z.enum(["ask", "explain", "summarize"]),
    prompt: z.string().trim().min(3).max(10000),
    level: z.enum(STUDY_LEVELS).optional(),
  }),
]);

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth) return jsonError(401, "Please sign in to use this tool.");

        let parsed;
        try {
          parsed = schema.safeParse(await request.json());
        } catch {
          return jsonError(400, "Invalid request.");
        }
        if (!parsed.success) return jsonError(400, "Please check your input and try again.");
        const input = parsed.data;

        const { instructions, userText, label } = buildGeneration(input);
        const cost = TOOL_CREDIT_COST[input.tool];
        const toolName = input.tool === "writer" ? "AI Writer" : "AI Study";
        const charge = await chargeCredits(auth.userId, cost, input.tool, `${toolName}: ${label}`);
        if ("error" in charge) return charge.error;

        let refunded = false;
        const { model, runIdFetch } = createGateway(request);
        const result = streamText({
          model,
          instructions,
          messages: [{ role: "user", content: userText }],
          abortSignal: request.signal,
          providerOptions: REASONING_OPTIONS,
          onError: async ({ error }) => {
            console.error("generate stream error", error);
            if (refunded) return;
            refunded = true;
            await refundCredits(auth.userId, cost, input.tool, `Refund: ${toolName} error`);
          },
        });

        return withLovableAiGatewayRunIdHeader(
          result.toTextStreamResponse({ headers: { "X-RCOVA-Credits": String(charge.balance) } }),
          runIdFetch,
        );
      },
    },
  },
});
