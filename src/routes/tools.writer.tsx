import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eraser, Loader2, Square, Wand2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/site/CopyButton";
import { SignInPrompt, ToolError, ToolShell } from "@/components/site/ToolShell";
import { TOOL_CREDIT_COST } from "@/config/plans";
import { TOOLS } from "@/config/site";
import { streamGenerate } from "@/lib/ai/generate-client";
import { WRITER_CONTENT_TYPES, WRITER_TONES } from "@/lib/ai/prompts";
import { useAuth } from "@/lib/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tools/writer")({
  head: () => ({
    meta: seo(
      "AI Writer",
      "Generate blog posts, emails, social captions and more with RCOVA AI Writer — choose your content type and tone.",
    ),
  }),
  component: WriterPage,
});

function WriterPage() {
  const tool = TOOLS.find((t) => t.id === "writer")!;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<string>("Blog post");
  const [tone, setTone] = useState<string>("Professional");
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done">("idle");
  const [inputError, setInputError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const busy = status === "loading" || status === "streaming";

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || busy) return;
    if (prompt.trim().length < 5) {
      setInputError("Please describe what you want to write (at least 5 characters).");
      return;
    }
    setInputError(null);
    setRequestError(null);
    setOutput("");
    setStatus("loading");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamGenerate(
        { tool: "writer", prompt: prompt.trim(), contentType: type, tone },
        (text) => {
          setStatus("streaming");
          setOutput(text);
        },
        controller.signal,
      );
      setStatus("done");
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("done");
      } else {
        setRequestError(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("idle");
      }
    } finally {
      abortRef.current = null;
      void queryClient.invalidateQueries({ queryKey: ["credit-account"] });
      void queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    }
  };

  const clear = () => {
    abortRef.current?.abort();
    setPrompt("");
    setOutput("");
    setStatus("idle");
    setInputError(null);
    setRequestError(null);
  };

  return (
    <ToolShell tool={tool} cost={TOOL_CREDIT_COST.writer} costUnit="generation">
      {!user && (
        <div className="mb-6">
          <SignInPrompt action="generate content" redirect="/tools/writer" />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={generate} className="surface-card space-y-5 p-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="writer-prompt">What should we write?</Label>
            <Textarea
              id="writer-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A short launch announcement for a new productivity app"
              rows={7}
              maxLength={2000}
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "writer-error" : undefined}
              className="bg-surface"
            />
            {inputError && (
              <p id="writer-error" className="text-sm text-destructive">
                {inputError}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="writer-type">Content type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="writer-type" className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WRITER_CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="writer-tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="writer-tone" className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WRITER_TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {busy ? (
              <Button type="button" variant="glass" size="lg" onClick={() => abortRef.current?.abort()}>
                <Square /> Stop
              </Button>
            ) : (
              <Button type="submit" variant="hero" size="lg" disabled={!user}>
                <Wand2 /> Generate
              </Button>
            )}
            <Button type="button" variant="glass" size="lg" onClick={clear}>
              <Eraser /> Clear
            </Button>
          </div>
        </form>

        <section className="surface-card flex min-h-80 flex-col p-6" aria-label="Output">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Output</h2>
            <CopyButton text={output} />
          </div>
          <div className="mt-4 flex-1" aria-live="polite">
            {requestError && <ToolError message={requestError} />}
            {!requestError && status === "idle" && (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Your generated content will appear here.
              </div>
            )}
            {status === "loading" && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-busy="true">
                <Loader2 className="size-4 animate-spin" /> Writing your {type.toLowerCase()}…
              </p>
            )}
            {output && (
              <div className="text-sm leading-relaxed">
                <MessageResponse isAnimating={status === "streaming"}>{output}</MessageResponse>
              </div>
            )}
          </div>
        </section>
      </div>
    </ToolShell>
  );
}
