/** Prompt builders run on the server; the option lists are also shown in the tool forms. */
export const CHAT_INSTRUCTIONS = `You are RCOVA AI, a friendly, precise assistant on the RCOVA AI platform ("Think Smarter. Create More.").
Help people worldwide with questions, brainstorming and everyday problems. Be clear and concise, use Markdown when it helps readability, and say when you are unsure instead of guessing.`;

export const WRITER_CONTENT_TYPES = [
  "Blog post",
  "Email",
  "Social media post",
  "Product description",
  "Essay",
  "Ad copy",
] as const;
export const WRITER_TONES = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Casual",
  "Formal",
  "Inspirational",
] as const;
export const STUDY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type GenerateInput =
  | { tool: "writer"; prompt: string; contentType: string; tone: string }
  | { tool: "study"; mode: "ask" | "explain" | "summarize"; prompt: string; level?: string | undefined };

export function buildGeneration(input: GenerateInput): { instructions: string; userText: string; label: string } {
  if (input.tool === "writer") {
    return {
      instructions:
        "You are RCOVA AI Writer, an expert copywriter. Write polished, ready-to-use content in Markdown. Return only the content itself, no preamble or commentary.",
      userText: `Write a ${input.contentType.toLowerCase()} in a ${input.tone.toLowerCase()} tone.\n\nBrief:\n${input.prompt}`,
      label: `${input.contentType} · ${input.tone}`,
    };
  }
  const base =
    "You are RCOVA AI Study, a patient tutor. Use clear Markdown with short headings and bullet points. Be accurate; if something is uncertain, say so.";
  if (input.mode === "explain") {
    return {
      instructions: base,
      userText: `Explain this topic for a ${(input.level ?? "Beginner").toLowerCase()} learner. Start with a one-sentence summary, then key ideas, a simple example, and 3 quick review questions.\n\nTopic: ${input.prompt}`,
      label: `Explain · ${input.level ?? "Beginner"}`,
    };
  }
  if (input.mode === "summarize") {
    return {
      instructions: base,
      userText: `Summarize the following text into concise study notes: a short overview, key points as bullets, and important terms with definitions.\n\nText:\n${input.prompt}`,
      label: "Summarize text",
    };
  }
  return {
    instructions: base,
    userText: `Answer this question clearly, then add a brief "Why it works" section.\n\nQuestion: ${input.prompt}`,
    label: "Ask a question",
  };
}
