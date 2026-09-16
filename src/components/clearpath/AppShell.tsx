import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Boxes,
  FileStack,
  GaugeCircle,
  Inbox,
  Menu,
  ScanEye,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DemoSelector } from "./DemoSelector";
import { useActiveApplication, useClearPath } from "@/lib/clearpath/store";
import { getScenario } from "@/lib/clearpath/scenarios";
import { assess, needsReviewer } from "@/lib/clearpath/engine";

const nav = [
  { to: "/overview" as const, label: "Overview", icon: GaugeCircle },
  { to: "/applications" as const, label: "Applications", icon: FileStack },
  { to: "/evidence" as const, label: "Evidence", icon: Boxes },
  { to: "/decisions" as const, label: "Decisions", icon: ScanEye },
  { to: "/review" as const, label: "Review Queue", icon: Inbox },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const queueCount = useClearPath(
    (s) => s.applications.filter((a) => needsReviewer(assess(a).decision.state)).length,
  );

  return (
    <nav aria-label="Main" className="grid gap-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeProps={{
            className:
              "border-primary/35 bg-primary/10 text-foreground",
          }}
          inactiveProps={{
            className: "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          }}
          className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors"
        >
          <Icon className="size-4" aria-hidden />
          <span>{label}</span>
          {to === "/review" && queueCount > 0 && (
            <span className="num ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">
              {queueCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const active = useActiveApplication();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-1">
        <span className="grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/12 text-primary">
          <ShieldCheck className="size-4" aria-hidden />
        </span>
        <span>
          <span className="block font-display text-sm font-semibold tracking-[0.12em] text-foreground">
            CLEARPATH
          </span>
          <span className="block text-[10px] tracking-[0.12em] text-muted-foreground">
            EVIDENCE INTELLIGENCE
          </span>
        </span>
      </Link>

      <NavList onNavigate={onNavigate} />

      {active && (
        <div className="rounded-lg border border-border bg-background/40 p-3">
          <p className="eyebrow mb-1.5">Active application</p>
          <p className="text-sm font-medium text-foreground">{active.profile.fullName}</p>
          <p className="text-xs text-muted-foreground">{getScenario(active.scenarioId).name}</p>
          <p className="num mt-1 text-[10px] text-muted-foreground">{active.id}</p>
        </div>
      )}

      <div className="mt-auto grid gap-2 border-t border-border pt-4">
        <Link
          to="/settings"
          onClick={onNavigate}
          activeProps={{ className: "text-foreground" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="size-4" aria-hidden /> Settings
        </Link>
        <DemoSelector
          trigger={
            <Button variant="secondary" size="sm" className="justify-start">
              <ShieldCheck className="size-3.5" aria-hidden /> Demo mode
            </Button>
          }
        />
        <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
          Demo data only. No real applicant records are stored.
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  toolbar,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card/60 backdrop-blur lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="size-4" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-card p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-display text-sm font-semibold tracking-[0.14em] text-foreground lg:hidden">
              CLEARPATH
            </span>
            <span className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] tracking-[0.14em] text-muted-foreground lg:inline-flex">
              <span className="size-1.5 rounded-full bg-success" aria-hidden /> DEMO DATA ONLY
            </span>
          </div>
          {toolbar && <div className="flex flex-wrap items-center gap-3">{toolbar}</div>}
        </header>

        <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
