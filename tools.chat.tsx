import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { pendingKey } from "@/components/chat/ChatWindow";
import { LogoMark } from "@/components/site/Logo";
import { SignInPrompt, ToolShell } from "@/components/site/ToolShell";
import { TOOL_CREDIT_COST } from "@/config/plans";
import { TOOLS } from "@/config/site";
import { useAuth } from "@/lib/auth";
import { createThread } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tools/chat")({
  head: () => ({
    meta: seo(
      "AI Chat",
      "Chat with RCOVA AI to ask questions, brainstorm ideas and solve everyday problems in a clean conversational interface.",
    ),
  }),
  component: ChatStartPage,
});

function ChatStartPage() {
  const tool = TOOLS.find((t) => t.id === "chat")!;
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);

  const start = async (text: string) => {
    const trimmed = text.trim();
    if (!user || !trimmed || starting) return;
    setStarting(true);
    try {
      const id = await createThread(user.id);
      window.sessionStorage.setItem(pendingKey(id), trimmed);
      await queryClient.invalidateQueries({ queryKey: ["chat-threads", user.id] });
      navigate({ to: "/chat/$threadId", params: { threadId: id } });
    } catch {
      toast.error("Couldn't start the conversation. Please try again.");
      setStarting(false);
    }
  };

  return (
    <ToolShell tool={tool} cost={TOOL_CREDIT_COST.chat} costUnit="message">
      {!loading && !user && (
        <div className="mb-6">
          <SignInPrompt action="chat with RCOVA AI" redirect="/tools/chat" />
        </div>
      )}
      <div className={user ? "grid gap-4 lg:grid-cols-[260px_1fr]" : ""}>
        {user && <ChatSidebar userId={user.id} />}
        <section
          className="surface-card flex h-[72vh] min-h-[480px] flex-col overflow-hidden"
          aria-label="Chat"
        >
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">New conversation</h2>
          </div>
          <div className="flex-1">
            <ConversationEmptyState
              icon={<LogoMark className="size-12" />}
              title="Start a conversation"
              description="Ask a question, brainstorm an idea or work through a problem. Your conversations are saved to your account."
            />
          </div>
          <div className="border-t border-border p-3">
            <PromptInput onSubmit={({ text }) => start(text)}>
              <PromptInputBody>
                <PromptInputTextarea
                  autoFocus={!!user}
                  disabled={!user || starting}
                  placeholder={user ? "Message RCOVA AI…" : "Sign in to start chatting"}
                  maxLength={8000}
                  aria-label="Message"
                />
              </PromptInputBody>
              <PromptInputFooter>
                <p className="px-1 text-xs text-muted-foreground">
                  Enter to send · Shift + Enter for a new line
                </p>
                <PromptInputSubmit
                  status={starting ? "submitted" : "ready"}
                  disabled={!user || starting}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      </div>
    </ToolShell>
  );
}
