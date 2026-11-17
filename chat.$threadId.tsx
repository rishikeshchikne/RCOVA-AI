import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ToolShell } from "@/components/site/ToolShell";
import { TOOL_CREDIT_COST } from "@/config/plans";
import { TOOLS } from "@/config/site";
import { threadMessagesQuery, threadQuery } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: seo("AI Chat conversation", "Your RCOVA AI Chat conversation.", { noindex: true }),
  }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(threadQuery(params.threadId)),
      context.queryClient.ensureQueryData(threadMessagesQuery(params.threadId)),
    ]);
  },
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const tool = TOOLS.find((t) => t.id === "chat")!;
  const { data: thread } = useQuery(threadQuery(threadId));
  const { data: messages } = useSuspenseQuery(threadMessagesQuery(threadId));

  return (
    <ToolShell tool={tool} cost={TOOL_CREDIT_COST.chat} costUnit="message">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <ChatSidebar userId={user.id} activeId={threadId} />
        {thread === null ? (
          <section className="surface-card flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <h2 className="text-lg font-semibold">Conversation not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              It may have been deleted. Start a new one from the list.
            </p>
            <Button asChild variant="glass" className="mt-4">
              <Link to="/tools/chat">Back to AI Chat</Link>
            </Button>
          </section>
        ) : (
          <ChatWindow
            key={threadId}
            threadId={threadId}
            title={thread?.title ?? "Conversation"}
            initialMessages={messages}
          />
        )}
      </div>
    </ToolShell>
  );
}
