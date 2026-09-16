import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { ProgressStepper } from "@/components/clearpath/ProgressStepper";
import { RequireApplication } from "@/components/clearpath/RequireApplication";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { DecisionCard, NextBestAction, ReasoningPanel } from "@/components/clearpath/DecisionPanels";
import { useEvidenceActions } from "@/components/clearpath/useEvidenceActions";
import { Button } from "@/components/ui/button";
import { needsReviewer } from "@/lib/clearpath/engine";
import type { Application, Assessment, NextAction } from "@/lib/clearpath/types";
import { toast } from "sonner";

export const Route = createFileRoute("/decisions")({
  head: () => ({
    meta: [
      { title: "Decision & next action — ClearPath" },
      {
        name: "description",
        content:
          "Why the application is in its current state, which blockers remain, and the highest-impact action to move it forward.",
      },
      { property: "og:title", content: "Decision & next action — ClearPath" },
      {
        property: "og:description",
        content: "Explainable decision states with a ranked next-best-action list.",
      },
    ],
  }),
  component: DecisionsPage,
});

function DecisionsPage() {
  return (
    <AppShell toolbar={<><ProgressStepper current={4} /><DemoSelector /></>}>
      <RequireApplication>
        {({ application, assessment }) => (
          <DecisionsBody application={application} assessment={assessment} />
        )}
      </RequireApplication>
    </AppShell>
  );
}

function DecisionsBody({
  application,
  assessment,
}: {
  application: Application;
  assessment: Assessment;
}) {
  const { process, review, dialog } = useEvidenceActions(application.id);

  const runAction = (action: NextAction) => {
    if (!action.requirementId) {
      toast.success(
        assessment.decision.state === "READY_TO_PROCEED"
          ? "Application submitted for processing"
          : "Reviewed scenario eligibility",
        {
          description:
            assessment.decision.state === "READY_TO_PROCEED"
              ? "All conditions established — nothing further is required from the applicant."
              : assessment.decision.summary,
        },
      );
      return;
    }
    if (action.cta === "REVIEW") review(action.requirementId);
    else {
      const req = assessment.requirements.find((r) => r.id === action.requirementId);
      process(action.requirementId, req?.evidenceLabel ?? "document");
    }
  };

  return (
    <>
      {dialog}
      <PageHeader
        eyebrow="Step 04 · Decision"
        title="Decision & next action"
        description="Every decision explains what was established, what is not, what is problematic and what should happen next."
        actions={
          needsReviewer(assessment.decision.state) ? (
            <Button size="sm" variant="outline" asChild>
              <Link to="/review/$appId" params={{ appId: application.id }}>
                <Inbox className="size-3.5" aria-hidden /> Open in reviewer mode
              </Link>
            </Button>
          ) : undefined
        }
      />

      <DecisionCard assessment={assessment} />
      <ReasoningPanel assessment={assessment} />
      <NextBestAction actions={assessment.actions} onAction={runAction} />
    </>
  );
}
