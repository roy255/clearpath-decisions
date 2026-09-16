import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck2, GitBranch, ScanEye, ShieldCheck, UserRound } from "lucide-react";
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

const chain = [
  { label: "Applicant", icon: UserRound, detail: "Declared information" },
  { label: "Evidence", icon: FileCheck2, detail: "Documents & detected facts" },
  { label: "Assessment", icon: ScanEye, detail: "Requirement-by-requirement" },
  { label: "Decision", icon: ShieldCheck, detail: "Explained, not just pass/fail" },
  { label: "Next Action", icon: ArrowRight, detail: "The most useful step" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/12 text-primary">
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

      <main>
        <section className="hero-glow relative overflow-hidden border-y border-border">
          <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="eyebrow animate-in fade-in duration-500">
              Evidence intelligence for public services
            </p>
            <h1
              className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] text-foreground sm:text-6xl"
            >
              From evidence to{" "}
              <span className="text-gradient">decision</span>.
            </h1>
            <p
              className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
            >
              Know what is proven. Understand what is missing. Move your application forward — with the
              reasoning between evidence and outcome made visible.
            </p>

            <div
              className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-8 flex flex-wrap items-center gap-3"
            >
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

            <div className="mt-16">
              <p className="eyebrow mb-4 flex items-center gap-2">
                <GitBranch className="size-3.5" aria-hidden /> The evidence chain
              </p>
              <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {chain.map((node, i) => (
                  <li
                    key={node.label}
                    className="panel animate-in fade-in slide-in-from-bottom-2 relative p-4 duration-700"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <span className="num text-[10px] text-primary">0{i + 1}</span>
                    <node.icon className="mt-3 size-4 text-primary" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-foreground">{node.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{node.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Nothing is a black box",
                body: "Every requirement carries its evidence, detected facts, confidence, issue and explanation — the decision is traceable end to end.",
              },
              {
                title: "Contradictions surface early",
                body: "When declared information disagrees with a submitted document, ClearPath flags the conflict and routes the case to human review.",
              },
              {
                title: "Reviewers get context, not inboxes",
                body: "Unresolved applications arrive with the full reasoning attached, so a reviewer confirms, rejects or escalates in one screen.",
              },
            ].map((item) => (
              <article key={item.title} className="panel p-5">
                <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span>ClearPath — demonstration prototype. Demo data only.</span>
          <Link to="/review" className="hover:text-foreground">
            Reviewer mode
          </Link>
        </div>
      </footer>
    </div>
  );
}
