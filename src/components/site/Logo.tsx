import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <defs>
        <linearGradient id="rcova-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--electric)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#rcova-g)" />
      <path
        d="M11 22V10h5.2a3.8 3.8 0 0 1 0 7.6H11m5.2 0L21 22"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="9.5" r="1.8" fill="var(--lavender)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}
      aria-label="RCOVA AI home"
    >
      <LogoMark />
      <span className="text-lg">
        RCOVA <span className="text-lavender">AI</span>
      </span>
    </Link>
  );
}
