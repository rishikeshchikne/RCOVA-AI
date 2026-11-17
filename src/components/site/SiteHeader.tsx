import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Coins, LayoutDashboard, LogOut, Menu, Shield, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCredits } from "@/config/plans";
import { MAIN_NAV } from "@/config/site";
import { useAuth } from "@/lib/auth";
import { creditAccountQuery, isAdminQuery } from "@/lib/queries";
import { Logo } from "./Logo";

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";
const activeClass = "text-foreground bg-card";
const mobileLinkClass = "rounded-lg px-3 py-3 text-base hover:bg-card";

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const userId = user?.id ?? "";
  const { data: account } = useQuery({ ...creditAccountQuery(userId), enabled: !!user });
  const { data: isAdmin } = useQuery({ ...isAdminQuery(userId), enabled: !!user });

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navLinkClass}
              activeProps={{ className: activeClass }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-40 items-center justify-end gap-2 md:flex">
          {loading ? null : user ? (
            <>
              {account && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  aria-label={`${account.balance} credits available`}
                >
                  <Coins className="size-3.5 text-lavender" aria-hidden="true" />
                  <strong className="font-semibold text-foreground">
                    {formatCredits(account.balance)}
                  </strong>
                  credits
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="icon" aria-label="Account menu" className="rounded-full">
                    <User />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <User /> Account
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void handleSignOut()}>
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="glass" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm border-border bg-surface">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="mt-2 flex flex-col gap-1 px-4">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-card hover:text-foreground"
                  activeProps={{ className: activeClass }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-border" />
              {user ? (
                <>
                  {account && (
                    <p className="px-3 pb-2 text-sm text-muted-foreground">
                      <strong className="text-foreground">{formatCredits(account.balance)}</strong>{" "}
                      credits available
                    </p>
                  )}
                  <Link to="/dashboard" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    Dashboard
                  </Link>
                  <Link to="/account" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    Account
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className={mobileLinkClass}>
                      Admin
                    </Link>
                  )}
                  <Button variant="glass" className="mt-3" onClick={() => void handleSignOut()}>
                    Log out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="glass" size="lg">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="hero" size="lg">
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
