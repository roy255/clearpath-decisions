import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileStack } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/clearpath/AppShell";
import { EmptyState, PageHeader } from "@/components/clearpath/PageHeader";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { DecisionBadge } from "@/components/clearpath/StatusBadge";
import { Button } from "@/components/ui/button";
import { setActive, useClearPath } from "@/lib/clearpath/store";
import { assess, needsReviewer } from "@/lib/clearpath/engine";
import { getScenario } from "@/lib/clearpath/scenarios";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Applications — ClearPath" },
      {
        name: "description",
        content:
          "All applications held in this workspace with their derived decision state, readiness and outstanding blockers.",
      },
      { property: "og:title", content: "Applications — ClearPath" },
      {
        property: "og:description",
        content: "Switch between applications and open any one at its decision.",
      },
    ],
  }),
  component: Applications,
});

function Applications() {
  const applications = useClearPath((s) => s.applications);
  const activeId = useClearPath((s) => s.activeId);
  const navigate = useNavigate();

  const open = (id: string, name: string) => {
    setActive(id);
    toast.success("Application opened", { description: name });
    navigate({ to: "/assessment" });
  };

  return (
    <AppShell toolbar={<DemoSelector />}>
      <PageHeader
        eyebrow="Workspace"
        title="Applications"
        description="Every application is assessed by the same deterministic engine. Open one to inspect its evidence, reasoning and decision."
        actions={
          <Button size="sm" asChild>
            <Link to="/apply">Start an application</Link>
          </Button>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileStack className="size-5" aria-hidden />}
          title="No applications yet"
          description="Start a new application or load a demo scenario to populate the workspace."
          action={<DemoSelector />}
        />
      ) : (
        <ul className="grid gap-3">
          {applications.map((app) => {
            const assessment = assess(app);
            const scenario = getScenario(app.scenarioId);
            return (
              <li
                key={app.id}
                className="panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">{app.profile.fullName}</h2>
                    <span className="num text-[10px] text-muted-foreground">{app.id}</span>
                    {app.id === activeId && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{scenario.name}</p>
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                    {assessment.decision.summary}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
                  <div className="w-32">
                    <p className="eyebrow">Readiness</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${assessment.readiness}%` }}
                      />
                    </div>
                    <p className="num mt-1 text-[11px] text-muted-foreground">
                      {assessment.readiness}%
                    </p>
                  </div>
                  <DecisionBadge state={assessment.decision.state} />
                  <Button size="sm" onClick={() => open(app.id, app.profile.fullName)}>
                    Open
                  </Button>
                  {needsReviewer(assessment.decision.state) && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/review/$appId" params={{ appId: app.id }}>
                        Inspect
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
