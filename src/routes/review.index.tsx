import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { EmptyState, PageHeader } from "@/components/clearpath/PageHeader";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { DecisionBadge } from "@/components/clearpath/StatusBadge";
import { Button } from "@/components/ui/button";
import { useClearPath } from "@/lib/clearpath/store";
import { assess, needsReviewer } from "@/lib/clearpath/engine";
import { getScenario } from "@/lib/clearpath/scenarios";

export const Route = createFileRoute("/review/")({
  head: () => ({
    meta: [
      { title: "Review queue — ClearPath" },
      {
        name: "description",
        content:
          "Applications that cannot be resolved automatically, with the blocking issue, confidence and age attached for the reviewer.",
      },
      { property: "og:title", content: "Review queue — ClearPath" },
      {
        property: "og:description",
        content: "Reviewer workspace for conflicted and low-confidence applications.",
      },
    ],
  }),
  component: ReviewQueue,
});

const ageInDays = (iso: string) =>
  Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));

function ReviewQueue() {
  const applications = useClearPath((s) => s.applications);
  const queue = applications
    .map((app) => ({ app, assessment: assess(app) }))
    .filter(({ assessment }) => needsReviewer(assessment.decision.state));

  return (
    <AppShell toolbar={<DemoSelector />}>
      <PageHeader
        eyebrow="Reviewer mode"
        title="Review queue"
        description="Applications routed here cannot be resolved by automated extraction alone: values conflict with declared information, or confidence is too low to establish a condition."
      />

      {queue.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" aria-hidden />}
          title="Queue is clear"
          description="No application currently requires human intervention. Load a demo scenario with a conflict to see the reviewer workflow."
          action={<DemoSelector />}
        />
      ) : (
        <ul className="grid gap-3">
          {queue.map(({ app, assessment }) => {
            const blocker = assessment.decision.blockers[0];
            return (
              <li
                key={app.id}
                className="panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">{app.profile.fullName}</h2>
                    <span className="num text-[10px] text-muted-foreground">{app.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getScenario(app.scenarioId).name}
                  </p>
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                    {blocker?.detail}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 lg:shrink-0">
                  <div>
                    <p className="eyebrow">Confidence</p>
                    <p className="num mt-1 text-sm text-foreground">
                      {Math.round(assessment.averageConfidence * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Age</p>
                    <p className="num mt-1 text-sm text-foreground">
                      {ageInDays(app.createdAt)}d
                    </p>
                  </div>
                  <DecisionBadge state={assessment.decision.state} />
                  <Button size="sm" asChild>
                    <Link to="/review/$appId" params={{ appId: app.id }}>
                      Inspect
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
