import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MessageSquarePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createThread, deleteThread, threadsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Saved conversations for the signed-in user. Each thread has its own page URL. */
export function ChatSidebar({ userId, activeId }: { userId: string; activeId?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: threads, isLoading } = useQuery(threadsQuery(userId));
  const [creating, setCreating] = useState(false);

  const startNew = async () => {
    setCreating(true);
    try {
      const id = await createThread(userId);
      await queryClient.invalidateQueries({ queryKey: ["chat-threads", userId] });
      navigate({ to: "/chat/$threadId", params: { threadId: id } });
    } catch {
      toast.error("Couldn't start a new conversation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteThread(id);
      queryClient.removeQueries({ queryKey: ["chat-messages", id] });
      await queryClient.invalidateQueries({ queryKey: ["chat-threads", userId] });
      if (id === activeId) navigate({ to: "/tools/chat", replace: true });
    } catch {
      toast.error("Couldn't delete that conversation.");
    }
  };

  return (
    <aside className="surface-card flex flex-col p-3 lg:max-h-[72vh]" aria-label="Conversations">
      <Button variant="hero" onClick={startNew} disabled={creating} className="w-full">
        {creating ? <Loader2 className="animate-spin" /> : <MessageSquarePlus />} New conversation
      </Button>
      <p className="mt-4 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Your conversations
      </p>
      {isLoading && <p className="px-2 py-3 text-sm text-muted-foreground">Loading…</p>}
      {threads && threads.length === 0 && (
        <p className="px-2 py-3 text-sm text-muted-foreground">No saved conversations yet.</p>
      )}
      <ul className="mt-2 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
        {threads?.map((t) => (
          <li
            key={t.id}
            className={cn(
              "group flex shrink-0 items-center gap-1 rounded-lg pr-1 transition-colors",
              t.id === activeId ? "bg-accent" : "hover:bg-card",
            )}
          >
            <Link
              to="/chat/$threadId"
              params={{ threadId: t.id }}
              aria-current={t.id === activeId ? "page" : undefined}
              className={cn(
                "min-w-0 max-w-52 flex-1 truncate px-3 py-2 text-left text-sm lg:max-w-none",
                t.id === activeId ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.title}
            </Link>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label={`Delete conversation: ${t.title}`}
              className="rounded-md p-1.5 text-muted-foreground opacity-70 hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-auto hidden px-2 pt-4 text-xs text-muted-foreground lg:block">
        Conversations are saved to your account.
      </p>
    </aside>
  );
}
