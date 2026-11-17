import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CopyButton } from "@/components/site/CopyButton";
import { LogoMark } from "@/components/site/Logo";
import { ToolError } from "@/components/site/ToolShell";
import { readableError } from "@/lib/ai/generate-client";
import { getAccessToken } from "@/lib/auth";

export const pendingKey = (threadId: string) => `rcova-chat-pending:${threadId}`;

const textOf = (m: UIMessage) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();

export function ChatWindow({
  threadId,
  title,
  initialMessages,
}: {
  threadId: string;
  title: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const token = await getAccessToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );

  const refreshSideData = () => {
    void queryClient.invalidateQueries({ queryKey: ["credit-account"] });
    void queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    void queryClient.invalidateQueries({ queryKey: ["chat-thread", threadId] });
  };

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      setErrorText(readableError(err.message));
      refreshSideData();
    },
    onFinish: () => {
      refreshSideData();
      queryClient.removeQueries({ queryKey: ["chat-messages", threadId] });
    },
  });
  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setErrorText(null);
    void sendMessage({ text: trimmed });
  };

  // A first message typed on the chat start page is handed over once, then removed.
  useEffect(() => {
    const key = pendingKey(threadId);
    if (!window.sessionStorage.getItem(key)) return;
    // Deferred so a dev-mode double mount cancels the first attempt instead of losing it.
    const timer = window.setTimeout(() => {
      const pending = window.sessionStorage.getItem(key);
      if (!pending) return;
      window.sessionStorage.removeItem(key);
      send(pending);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy, threadId]);

  const last = messages.at(-1);
  const waiting =
    status === "submitted" || (status === "streaming" && last?.role === "assistant" && !textOf(last));

  return (
    <section
      className="surface-card flex h-[72vh] min-h-[480px] flex-col overflow-hidden"
      aria-label="Chat"
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="truncate text-sm font-medium">{title}</h2>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="gap-6 px-4 py-6">
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<LogoMark className="size-12" />}
              title="Start a conversation"
              description="Ask a question, brainstorm an idea or work through a problem."
            />
          )}
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const text = textOf(m);
            return (
              <Message key={m.id} from={m.role}>
                {m.role === "assistant" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LogoMark className="size-5" /> RCOVA AI
                  </div>
                )}
                <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                  {m.parts.map((part, j) => {
                    if (part.type === "text") {
                      return m.role === "user" ? (
                        <p key={j} className="whitespace-pre-wrap">{part.text}</p>
                      ) : (
                        <MessageResponse key={j} isAnimating={isLast && status === "streaming"}>
                          {part.text}
                        </MessageResponse>
                      );
                    }
                    if (part.type === "reasoning" && part.text.trim()) {
                      return (
                        <Reasoning
                          key={j}
                          isStreaming={isLast && status === "streaming" && !text}
                          defaultOpen={false}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
                {m.role === "assistant" && text && !(isLast && busy) && (
                  <MessageActions>
                    <CopyButton text={text} />
                  </MessageActions>
                )}
              </Message>
            );
          })}
          {waiting && (
            <div className="flex items-center gap-2 text-sm" aria-live="polite">
              <LogoMark className="size-5" />
              <Shimmer>Thinking…</Shimmer>
            </div>
          )}
          {errorText && <ToolError message={errorText} />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-3">
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputBody>
            <PromptInputTextarea
              ref={inputRef}
              autoFocus
              placeholder="Message RCOVA AI…"
              maxLength={8000}
              aria-label="Message"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <p className="px-1 text-xs text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </section>
  );
}
