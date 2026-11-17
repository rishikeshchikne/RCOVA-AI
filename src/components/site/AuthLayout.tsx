import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { LogoMark } from "./Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
        <LogoMark className="mx-auto size-11" />
        <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-center text-muted-foreground">{subtitle}</p>
        <div className="surface-card mt-8 p-6 sm:p-8">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}

const GOOGLE_G = (
  <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

/** Google sign-in button following Google's dark-theme branding guidelines. */
export function GoogleButton({
  label = "Continue with Google",
  onSignedIn,
  onError,
}: {
  label?: string;
  onSignedIn: () => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      onError("Google sign-in didn't complete. Please try again.");
      return;
    }
    if (result.redirected) return;
    setBusy(false);
    onSignedIn();
  };
  return (
    <Button
      type="button"
      onClick={signIn}
      disabled={busy}
      className="h-11 w-full gap-2.5 rounded-lg border border-[#8E918F] bg-[#131314] px-3 text-sm font-medium text-[#E3E3E3] hover:bg-[#1f1f21]"
    >
      {GOOGLE_G}
      {label}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function FormError({ message }: { message?: string | null | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
