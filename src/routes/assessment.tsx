import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { ProgressStepper } from "@/components/clearpath/ProgressStepper";
import { RequireApplication } from "@/components/clearpath/RequireApplication";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { ReadinessDial } from "@/components/clearpath/ConfidenceMeter";
import { RequirementMatrix } from "@/components/clearpath/RequirementMatrix";
import { EvidenceChain } from "@/components/clearpath/EvidenceChain";
import { DecisionBadge } from "@/components/clearpath/StatusBadge";
import { useEvidenceActions } from "@/components/clearpath/useEvidenceActions";
import { Button } from "@/components/ui/button";
import type { Application, Assessment } from "@/lib/clearpath/types";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Decision intelligence — ClearPath" },
      {
        name: "description",
        content:
          "Application readiness, the requirement matrix and per-requirement reasoning: what is established, what is not, and why.",
      },
      { property: "og:title", content: "Decision intelligence — ClearPath" },
      {
        property: "og:description",
        content: "Readiness score, requirement matrix and the interactive evidence chain.",
      },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  return (
    <AppShell toolbar={<><ProgressStepper current={3} /><DemoSelector /></>}>
      <RequireApplication>
        {({ application, assessment }) => (
          <AssessmentBody application={application} assessment={assessment} />
        )}
      </RequireApplication>
    </AppShell>
  );
}

function AssessmentBody({
  application,
  assessment,
}: {
  application: Application;
  assessment: Assessment;
}) {
  const { process, review, dialog } = useEvidenceActions(application.id);

  const handle = (requirementId: string, action: "UPLOAD" | "REPLACE" | "REVIEW") => {
    const req = assessment.requirements.find((r) => r.id === requirementId);
    if (!req) return;
    if (action === "REVIEW") review(requirementId);
    else process(requirementId, req.evidenceLabel);
  };

  return (
    <>
      {dialog}
      <PageHeader
        eyebrow="Step 03 · Assessment"
        title="Decision intelligence"
        description="Readiness measures how much of the evidence set is established. It is not the eligibility decision — that is derived separately from the requirement outcomes."
        actions={
          <Button size="sm" asChild>
            <Link to="/decisions">
              See the decision <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        }
      />

      <section className="panel flex flex-col items-center gap-8 p-6 sm:flex-row sm:items-center">
        <ReadinessDial value={assessment.readiness} />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Established", value: assessment.counts.established, tone: "text-success" },
            { label: "Needs review", value: assessment.counts.needsReview, tone: "text-info" },
            { label: "Conflicts", value: assessment.counts.conflict, tone: "text-destructive" },
            { label: "Missing", value: assessment.counts.missing, tone: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background/40 p-4">
              <p className="eyebrow">{s.label}</p>
              <p className={`num mt-1.5 text-2xl font-semibold ${s.tone}`}>{s.value}</p>
            </div>
          ))}
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-4">
            <span className="eyebrow">Derived decision state</span>
            <DecisionBadge state={assessment.decision.state} />
          </div>
        </div>
      </section>

      <RequirementMatrix requirements={assessment.requirements} />

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
          Evidence chain
        </h2>
        <EvidenceChain
          applicantName={application.profile.fullName}
          requirements={assessment.requirements}
          onAction={handle}
        />
      </section>
    </>
  );
}
