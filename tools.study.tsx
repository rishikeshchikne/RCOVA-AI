import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, HelpCircle, Loader2, NotebookPen, ScrollText, Square } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { MessageResponse } from "@/components/ai-elements/message";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/site/CopyButton";
import { SignInPrompt, ToolError, ToolShell } from "@/components/site/ToolShell";
import { TOOL_CREDIT_COST } from "@/config/plans";
import { TOOLS } from "@/config/site";
import { streamGenerate } from "@/lib/ai/generate-client";
import { STUDY_LEVELS } from "@/lib/ai/prompts";
import { useAuth } from "@/lib/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tools/study")({
  head: () => ({
    meta: seo(
      "AI Study",
      "Learn faster with RCOVA AI Study: ask questions, get topics explained simply and summarize long text into study notes.",
    ),
  }),
  component: StudyPage,
});

type Mode = "ask" | "explain" | "summarize";

function StudyPage() {
  const tool = TOOLS.find((t) => t.id === "study")!;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("ask");
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<string>("Beginner");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const busy = status === "loading" || status === "streaming";

  const current = mode === "ask" ? question : mode === "explain" ? topic : text;
  const minLen = mode === "summarize" ? 40 : 3;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || busy) return;
    if (current.trim().length < minLen) {
      setError(
        mode === "summarize"
          ? "Paste at least 40 characters of text to summarize."
          : "Please enter a little more detail.",
      );
      return;
    }
    setError(null);
    setRequestError(null);
    setResponse("");
    setStatus("loading");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamGenerate(
        {
          tool: "study",
          mode,
          prompt: current.trim(),
          ...(mode === "explain" ? { level } : {}),
        },
        (t) => {
          setStatus("streaming");
          setResponse(t);
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

  const onModeChange = (v: string) => {
    if (busy) return;
    setMode(v as Mode);
    setError(null);
  };

  return (
    <ToolShell tool={tool} cost={TOOL_CREDIT_COST.study} costUnit="answer">
      {!user && (
        <div className="mb-6">
          <SignInPrompt action="use AI Study" redirect="/tools/study" />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <form onSubmit={submit} className="surface-card p-6" noValidate>
            <Tabs value={mode} onValueChange={onModeChange}>
              <TabsList className="grid h-auto w-full grid-cols-3 bg-surface p-1">
                <TabsTrigger value="ask" className="gap-1.5 py-2">
                  <HelpCircle className="size-4" /> Ask
                </TabsTrigger>
                <TabsTrigger value="explain" className="gap-1.5 py-2">
                  <BookOpen className="size-4" /> Explain
                </TabsTrigger>
                <TabsTrigger value="summarize" className="gap-1.5 py-2">
                  <ScrollText className="size-4" /> Summarize
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ask" className="mt-5 space-y-2">
                <Label htmlFor="study-q">Ask a question</Label>
                <Textarea
                  id="study-q"
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Why does the moon have phases?"
                  className="bg-surface"
                />
              </TabsContent>
              <TabsContent value="explain" className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="study-topic">Topic to explain</Label>
                  <Input
                    id="study-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis"
                    className="bg-surface"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="study-level">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="study-level" className="bg-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="summarize" className="mt-5 space-y-2">
                <Label htmlFor="study-text">Text to summarize</Label>
                <Textarea
                  id="study-text"
                  rows={7}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste an article, chapter or lecture notes…"
                  className="bg-surface"
                  maxLength={10000}
                />
              </TabsContent>
            </Tabs>
            {error && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {busy ? (
              <Button
                type="button"
                variant="glass"
                size="lg"
                className="mt-5"
                onClick={() => abortRef.current?.abort()}
              >
                <Square /> Stop
              </Button>
            ) : (
              <Button type="submit" variant="hero" size="lg" className="mt-5" disabled={!user}>
                {mode === "ask" ? "Get answer" : mode === "explain" ? "Explain topic" : "Summarize"}
              </Button>
            )}
          </form>

          <section className="surface-card p-6" aria-label="Response">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Response</h2>
              <CopyButton text={response} label="Copy response" />
            </div>
            <div className="mt-4" aria-live="polite">
              {requestError && <ToolError message={requestError} />}
              {!requestError && status === "idle" && (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Answers and explanations will appear here.
                </p>
              )}
              {status === "loading" && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-busy="true">
                  <Loader2 className="size-4 animate-spin" /> Thinking it through…
                </p>
              )}
              {response && (
                <div className="text-sm leading-relaxed">
                  <MessageResponse isAnimating={status === "streaming"}>{response}</MessageResponse>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="surface-card flex flex-col p-6" aria-label="Study notes">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <NotebookPen className="size-4 text-lavender" /> Study notes
            </h2>
            <CopyButton text={notes} label="Copy notes" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Write your own notes as you learn. Notes stay on this page and aren't saved.
          </p>
          <Label htmlFor="study-notes" className="sr-only">
            Study notes
          </Label>
          <Textarea
            id="study-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"• Key idea\n• Definition\n• Example"}
            className="mt-4 min-h-80 flex-1 resize-none bg-surface font-mono text-sm leading-relaxed"
          />
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{notes.trim() ? notes.trim().split(/\s+/).length : 0} words</span>
            <button
              type="button"
              className="hover:text-foreground disabled:opacity-50"
              onClick={() => setNotes("")}
              disabled={!notes}
            >
              Clear notes
            </button>
          </div>
        </section>
      </div>
    </ToolShell>
  );
}
