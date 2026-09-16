import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  FileCheck2,
  GitBranch,
  History,
  ScanEye,
  ShieldCheck,
  UserRound,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoSelector } from "@/components/clearpath/DemoSelector";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClearPath — From Evidence to Decision" },
      {
        name: "description",
        content:
          "ClearPath turns applicant information and supporting evidence into an explainable decision: what is proven, what is missing, and the next best action.",
      },
      { property: "og:title", content: "ClearPath — From Evidence to Decision" },
      {
        property: "og:description",
        content:
          "Evidence intelligence for public-service applications: transparent assessment, explainable decisions, reviewer workflow.",
      },
    ],
  }),
  component: Landing,
});

const rise = "animate-in fade-in slide-in-from-bottom-2 duration-700";

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl border border-primary/30 bg-primary/12 text-primary">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold tracking-[0.16em] text-foreground">
            CLEARPATH
          </span>
        </span>
        <nav className="flex items-center gap-2" aria-label="Primary">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/overview">Open workspace</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/apply">Start an application</Link>
          </Button>
        </nav>
      </header>

      <main className="hero-glow relative overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-8 sm:py-16">
          {/* Hero */}
          <div className="max-w-3xl">
            <p className={`eyebrow ${rise} flex items-center gap-2`}>
              <GitBranch className="size-3.5 text-primary" aria-hidden />
              Evidence intelligence for public services
            </p>
            <h1
              className={`${rise} mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-7xl`}
            >
              From <span className="text-gradient">evidence</span> to{" "}
              <span className="italic">decision.</span>
            </h1>
            <p
              className={`${rise} mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground`}
            >
              Know what is proven. Understand what is missing. Move your application forward —
              ClearPath structures every application into a verifiable evidence chain, with the
              reasoning between evidence and outcome made visible.
            </p>
            <div className={`${rise} mt-8 flex flex-wrap items-center gap-3`}>
              <Button asChild size="lg">
                <Link to="/apply">
                  Start an application <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <DemoSelector
                trigger={
                  <Button variant="outline" size="lg">
                    Explore demo
                  </Button>
                }
              />
            </div>
          </div>

          {/* Bento grid — the evidence chain */}
          <div className="grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-4 md:grid-cols-12">
            {/* Node 01 — Applicant */}
            <section
              className={`${rise} panel group relative overflow-hidden p-6 md:col-span-4`}
              aria-labelledby="chain-01"
            >
              <span className="num absolute right-4 top-4 text-[10px] uppercase tracking-widest text-primary/50">
                Input_Node_01
              </span>
              <span className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/40">
                <UserRound className="size-5" aria-hidden />
              </span>
              <h2 id="chain-01" className="text-xl font-semibold text-foreground">
                Applicant profile
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Declared information — identity, academics, finances — captured once, checked
                everywhere.
              </p>
            </section>

            {/* Core pipeline — nodes 02 + 03 */}
            <section
              className={`${rise} panel relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 md:col-span-8`}
              style={{ animationDelay: "80ms" }}
              aria-labelledby="chain-0203"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/8 to-transparent"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-6">
                <div className="max-w-sm space-y-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-accent">
                    Core pipeline
                  </span>
                  <h2 id="chain-0203" className="text-2xl font-bold text-foreground sm:text-3xl">
                    Evidence, made intelligible
                  </h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Documents are classified, facts extracted, and every requirement assessed
                    against the evidence that supports it.
                  </p>
                </div>
                <div className="hidden items-center gap-1 lg:flex" aria-hidden>
                  <span className="h-8 w-1 animate-pulse rounded-full bg-primary/20" />
                  <span className="h-12 w-1 rounded-full bg-primary/40" />
                  <span className="h-16 w-1 rounded-full bg-primary" />
                  <span className="h-10 w-1 rounded-full bg-primary/60" />
                </div>
              </div>
              <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background p-4">
                  <p className="num mb-1 flex items-center gap-2 text-[10px] text-primary">
                    <FileCheck2 className="size-3.5" aria-hidden /> [02] EVIDENCE
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Documents & detected facts, each with a confidence score
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background p-4">
                  <p className="num mb-1 flex items-center gap-2 text-[10px] text-accent">
                    <ScanEye className="size-3.5" aria-hidden /> [03] ASSESSMENT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requirement-by-requirement: established, missing, or in conflict
                  </p>
                </div>
              </div>
            </section>

            {/* Reasoning */}
            <section
              className={`${rise} panel flex flex-col justify-end p-6 md:col-span-3`}
              style={{ animationDelay: "160ms" }}
              aria-labelledby="feat-reasoning"
            >
              <span className="mb-auto grid size-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30">
                <Waypoints className="size-4" aria-hidden />
              </span>
              <h3 id="feat-reasoning" className="mt-4 text-lg font-semibold text-foreground">
                Nothing is a black box
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Every decision carries its reasoning, end to end.
              </p>
            </section>

            {/* Synthesis */}
            <section
              className={`${rise} tile-violet group relative cursor-default overflow-hidden rounded-2xl border border-border p-6 shadow-panel md:col-span-5`}
              style={{ animationDelay: "200ms" }}
              aria-labelledby="feat-synthesis"
            >
              <div
                className="absolute right-0 top-0 size-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/10 blur-3xl transition-all duration-700 group-hover:bg-accent/20"
                aria-hidden
              />
              <p className="num mb-4 text-[10px] uppercase tracking-widest text-primary">
                L4_Reasoning_Engine
              </p>
              <h3 id="feat-synthesis" className="text-2xl font-bold text-foreground">
                Contradictions surface early
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                When declared information disagrees with a submitted document, ClearPath flags the
                conflict and routes the case to human review — automatically.
              </p>
              <div className="mt-6 flex gap-2" aria-hidden>
                <span className="h-1 w-full overflow-hidden rounded-full bg-border">
                  <span className="block h-full w-[85%] bg-gradient-to-r from-primary to-accent" />
                </span>
              </div>
            </section>

            {/* Decision output */}
            <section
              className={`${rise} flex flex-col justify-between rounded-2xl border border-primary/60 bg-primary p-6 shadow-panel md:col-span-4`}
              style={{ animationDelay: "240ms" }}
              aria-labelledby="feat-decision"
            >
              <div className="flex items-start justify-between">
                <span className="num text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Final_Output
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-primary-foreground/15">
                  <Check className="size-4 text-primary-foreground" aria-hidden />
                </span>
              </div>
              <div>
                <h3
                  id="feat-decision"
                  className="text-2xl font-bold leading-tight text-primary-foreground"
                >
                  Decision-ready intelligence
                </h3>
                <p className="mt-2 text-sm text-primary-foreground/75">
                  Explained — never just pass or fail.
                </p>
                <Button
                  asChild
                  className="mt-4 w-full bg-background font-bold text-foreground hover:bg-background/85"
                >
                  <Link to="/apply">
                    Try the decision flow <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Audit trail */}
            <section
              className={`${rise} panel flex items-center gap-6 p-6 sm:p-8 md:col-span-6`}
              style={{ animationDelay: "280ms" }}
              aria-labelledby="feat-audit"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-border bg-background">
                <span className="grid grid-cols-2 gap-1" aria-hidden>
                  <span className="size-2 rounded-[2px] bg-accent" />
                  <span className="size-2 rounded-[2px] bg-border" />
                  <span className="size-2 rounded-[2px] bg-border" />
                  <span className="size-2 rounded-[2px] bg-primary" />
                </span>
              </span>
              <div>
                <h3 id="feat-audit" className="text-lg font-semibold text-foreground">
                  A complete audit trail
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every requirement is tracked from evidence to final decision — nothing changes
                  without a recorded reason.
                </p>
              </div>
            </section>

            {/* Reviewer */}
            <section
              className={`${rise} panel group relative flex items-center justify-between gap-6 overflow-hidden p-6 sm:p-8 md:col-span-6`}
              style={{ animationDelay: "320ms" }}
              aria-labelledby="feat-review"
            >
              <div className="relative z-10">
                <h3 id="feat-review" className="text-lg font-semibold italic text-foreground">
                  Reviewers get context, not inboxes
                </h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Unresolved applications arrive with the full reasoning attached — confirm, reject
                  or escalate in one screen.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/review">
                    Open the review queue <History className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
              <div
                className="pointer-events-none absolute right-0 top-0 flex h-full w-1/3 items-center justify-center opacity-15 transition-opacity group-hover:opacity-30"
                aria-hidden
              >
                <ShieldCheck className="size-28 text-accent" />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-8">
          <span>ClearPath — demonstration prototype. Demo data only.</span>
          <Link to="/review" className="hover:text-foreground">
            Reviewer mode
          </Link>
        </div>
      </footer>
    </div>
  );
}
