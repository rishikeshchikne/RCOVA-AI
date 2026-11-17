import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Clearly labeled banner for anything not yet connected to a real backend. */
export function DemoNotice({
  title = "Demo mode",
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <div>
        <p className="font-medium text-warning">{title}</p>
        <div className="mt-0.5 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-warning",
        className,
      )}
    >
      Sample data
    </span>
  );
}
