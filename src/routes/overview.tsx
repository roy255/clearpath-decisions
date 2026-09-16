import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Inbox, Layers, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { DecisionBadge, StatusBadge } from "@/components/clearpath/StatusBadge";
import { ReadinessDial } from "@/components/clearpath/ConfidenceMeter";
import { Button } from "@/components/ui/button";
import { useClearPath, useActiveApplication } from "@/lib/clearpath/store";
import { assess, needsReviewer } from "@/lib/clearpath/engine";
import { getScenario } from "@/lib/clearpath/scenarios";
import type { EvidenceStatus } from "@/lib/clearpath/types";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Overview — ClearPath" },
      {
        name: "description",
        content:
          "Portfolio view of applications: evidence status distribution, readiness, confidence spread and the reviewer queue.",
      },
      { property: "og:title", content: "Overview — ClearPath" },
      {
        property: "og:description",
        content: "Evidence status distribution, readiness and review load at a glance.",
      },
    ],
  }),
  component: Overview,
});

const statusOrder: EvidenceStatus[] = ["VERIFIED", "PARTIAL", "NEEDS_REVIEW", "CONFLICT", "MISSING"];

const barTone: Record<EvidenceStatus, string> = {
  VERIFIED: "bg-success",
  PARTIAL: "bg-warning",
  NEEDS_REVIEW: "bg-info",
  CONFLICT: "bg-destructive",
  MISSING: "bg-muted-foreground/50",
};

function Overview() {
  const applications = useClearPath((s) => s.applications);
  const active = useActiveApplication();
  const assessments = applications.map((a) => ({ app: a, assessment: assess(a) }));

  const distribution = statusOrder.map((status) => ({
    status,
    count: assessments.reduce(
      (n, { assessment }) => n + assessment.requirements.filter((r) => r.status === status).length,
      0,
    ),
  }));
  const totalRequirements = distribution.reduce((n, d) => n + d.count, 0) || 1;
  const queue = assessments.filter(({ assessment }) => needsReviewer(assessment.decision.state));
  const avgReadiness = Math.round(
    assessments.reduce((n, { assessment }) => n + assessment.readiness, 0) / (assessments.length || 1),
  );

  return (
    <AppShell toolbar={<DemoSelector />}>
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="Everything ClearPath currently holds: evidence outcomes across applications, average readiness and open review load."
        actions={
          <>
            <Button size="sm" asChild>
              <Link to="/apply">Start an application</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/review">
                <Inbox className="size-3.5" aria-hidden /> Review queue
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Applications", value: applications.length, icon: Layers },
          { label: "Awaiting review", value: queue.length, icon: Inbox },
          { label: "Average readiness", value: `${avgReadiness}%`, icon: ShieldCheck },
        ].map((stat) => (
          <div key={stat.label} className="panel flex items-center gap-4 p-5">
            <span className="grid size-10 place-items-center rounded-lg border border-border bg-muted/40 text-primary">
              <stat.icon className="size-4" aria-hidden />
            </span>
            <div>
              <p className="eyebrow">{stat.label}</p>
              <p className="num mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="panel p-6" aria-label="Evidence status distribution">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
            Evidence status distribution
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {applications.length} application{applications.length === 1 ? "" : "s"} and{" "}
            {totalRequirements} requirements.
          </p>
          <ul className="mt-5 grid gap-4">
            {distribution.map((d) => (
              <li key={d.status}>
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge status={d.status} />
                  <span className="num text-xs text-muted-foreground">
                    {d.count} · {Math.round((d.count / totalRequirements) * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${barTone[d.status]}`}
                    style={{ width: `${(d.count / totalRequirements) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel flex flex-col items-center justify-center gap-4 p-6" aria-label="Active application">
          {active ? (
            <>
              <ReadinessDial value={assess(active).readiness} />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{active.profile.fullName}</p>
                <p className="text-xs text-muted-foreground">{getScenario(active.scenarioId).name}</p>
              </div>
              <DecisionBadge state={assess(active).decision.state} />
              <Button size="sm" variant="secondary" asChild>
                <Link to="/decisions">
                  Open decision <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No active application</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Start an application or load a demo scenario to see the full reasoning chain.
              </p>
              <div className="mt-4 flex justify-center">
                <DemoSelector />
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="panel overflow-hidden" aria-label="Confidence by application">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
            Confidence distribution
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {assessments.map(({ app, assessment }) => (
            <li key={app.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-40 flex-1">
                <p className="text-sm font-medium text-foreground">{app.profile.fullName}</p>
                <p className="text-xs text-muted-foreground">{getScenario(app.scenarioId).name}</p>
              </div>
              <div className="min-w-40 flex-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round(assessment.averageConfidence * 100)}%` }}
                  />
                </div>
                <p className="num mt-1 text-[11px] text-muted-foreground">
                  {Math.round(assessment.averageConfidence * 100)}% average extraction confidence
                </p>
              </div>
              <DecisionBadge state={assessment.decision.state} />
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
