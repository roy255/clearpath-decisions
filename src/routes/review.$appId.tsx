import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileWarning, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/clearpath/AppShell";
import { EmptyState, PageHeader } from "@/components/clearpath/PageHeader";
import { DecisionBadge, StatusBadge } from "@/components/clearpath/StatusBadge";
import { ConfidenceMeter } from "@/components/clearpath/ConfidenceMeter";
import { RequirementMatrix } from "@/components/clearpath/RequirementMatrix";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assess, DECISION_META } from "@/lib/clearpath/engine";
import { getScenario } from "@/lib/clearpath/scenarios";
import { reviewerAction, useClearPath, type ReviewerAction } from "@/lib/clearpath/store";
import type { DecisionState } from "@/lib/clearpath/types";

export const Route = createFileRoute("/review/$appId")({
  head: () => ({
    meta: [
      { title: "Reviewer detail — ClearPath" },
      {
        name: "description",
        content:
          "Reviewer workspace: applicant information, evidence, detected facts, conflicts and reasoning with confirm, reject, escalate and resolve actions.",
      },
      { property: "og:title", content: "Reviewer detail — ClearPath" },
      {
        property: "og:description",
        content: "Inspect unresolved applications and resolve them with a full audit trail.",
      },
    ],
  }),
  component: ReviewDetail,
});

const actions: { value: ReviewerAction; label: string }[] = [
  { value: "CONFIRM_EVIDENCE", label: "Confirm evidence" },
  { value: "REQUEST_NEW_EVIDENCE", label: "Request new evidence" },
  { value: "REJECT_EVIDENCE", label: "Reject evidence" },
  { value: "ESCALATE", label: "Escalate" },
  { value: "RESOLVE_REVIEW", label: "Resolve review" },
];

function ReviewDetail() {
  const { appId } = useParams({ from: "/review/$appId" });
  const application = useClearPath((s) => s.applications.find((a) => a.id === appId) ?? null);
  const [transition, setTransition] = useState<{ from: DecisionState; to: DecisionState } | null>(
    null,
  );

  if (!application) {
    return (
      <AppShell>
        <EmptyState
          icon={<FileWarning className="size-5" aria-hidden />}
          title="Application not found"
          description="This application is no longer in the workspace. Return to the review queue to pick another case."
          action={
            <Button size="sm" asChild>
              <Link to="/review">Back to review queue</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const assessment = assess(application);
  const scenario = getScenario(application.scenarioId);
  const openItems = assessment.requirements.filter((r) => r.status !== "VERIFIED");

  const run = (action: ReviewerAction, requirementId?: string) => {
    const before = assessment.decision.state;
    const detail = reviewerAction(application.id, action, requirementId);
    const after = assess({ ...(useStoreApp(application.id) ?? application) }).decision.state;
    setTransition({ from: before, to: after });
    toast.success("Reviewer action recorded", { description: detail });
  };

  return (
    <AppShell
      toolbar={
        <Button size="sm" variant="outline" asChild>
          <Link to="/review">
            <ArrowLeft className="size-3.5" aria-hidden /> Review queue
          </Link>
        </Button>
      }
    >
      <PageHeader
        eyebrow={`Reviewer detail · ${application.id}`}
        title={application.profile.fullName}
        description={`${scenario.name} · ${scenario.eligibility.label}`}
        actions={<DecisionBadge state={assessment.decision.state} />}
      />

      {transition && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel flex flex-wrap items-center gap-3 border-success/30 p-4"
          role="status"
        >
          <CheckCircle2 className="size-4 text-success" aria-hidden />
          <span className="text-sm text-foreground">Action applied.</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="num">{transition.from.replace(/_/g, " ")}</span>
            <ArrowRight className="size-3" aria-hidden />
            <span className="num text-foreground">{transition.to.replace(/_/g, " ")}</span>
            <span>({DECISION_META[transition.to].label})</span>
          </span>
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-4">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              Reasoning
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {assessment.decision.summary}
            </p>
            <ol className="mt-4 grid gap-3">
              {assessment.decision.blockers.map((b, i) => (
                <li key={b.title} className="rounded-lg border border-border bg-background/40 p-4">
                  <p className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <span className="num text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                    {b.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{b.detail}</p>
                </li>
              ))}
              {!assessment.decision.blockers.length && (
                <li className="rounded-lg border border-success/25 bg-success/8 p-4 text-xs text-success">
                  No open items remain on this application.
                </li>
              )}
            </ol>
          </div>

          <RequirementMatrix requirements={assessment.requirements} />

          <div className="panel p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              Open items & reviewer actions
            </h2>
            {openItems.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Every requirement is established. Nothing requires a reviewer decision.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {openItems.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.evidence && item.status !== "MISSING"
                        ? item.evidence.documentName
                        : "No evidence attached"}
                    </p>
                    <div className="mt-3"><ConfidenceMeter value={item.confidence} /></div>

                    {item.evidence?.conflict && (
                      <div className="mt-3 grid gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive">
                        <p className="flex items-center gap-2 font-semibold uppercase tracking-[0.12em]">
                          <ShieldAlert className="size-3.5" aria-hidden /> Conflict
                        </p>
                        <p>
                          Declared {item.evidence.conflict.field}:{" "}
                          <span className="num">{item.evidence.conflict.profileValue}</span> · detected:{" "}
                          <span className="num">{item.evidence.conflict.evidenceValue}</span>
                        </p>
                      </div>
                    )}

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {item.explanation}
                    </p>

                    <ReviewerActionRow onRun={(action) => run(action, item.id)} />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" onClick={() => run("RESOLVE_REVIEW")}>
                Resolve review
              </Button>
              <Button size="sm" variant="outline" onClick={() => run("ESCALATE")}>
                Escalate application
              </Button>
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              Applicant information
            </h2>
            <dl className="mt-4 grid gap-3 text-xs">
              {[
                ["Applicant ID", application.profile.applicantId],
                ["Date of birth", application.profile.dateOfBirth],
                ["Institution", application.profile.institution],
                ["Programme", application.profile.programme],
                ["Academic score", application.profile.academicScore],
                ["Employment", application.profile.employmentStatus],
                ["Declared income", application.profile.annualIncome],
                ["Household size", application.profile.householdSize],
                ["Email", application.profile.email],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              Audit trail
            </h2>
            <ol className="mt-4 grid gap-3">
              {application.reviewLog.slice(0, 8).map((event) => (
                <li key={event.id} className="border-l border-border pl-3">
                  <p className="text-xs font-medium text-foreground">{event.action}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {event.detail}
                  </p>
                  <p className="num mt-1 text-[10px] text-muted-foreground">
                    {event.actor} · {new Date(event.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
              {!application.reviewLog.length && (
                <li className="text-xs text-muted-foreground">No activity recorded yet.</li>
              )}
            </ol>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function ReviewerActionRow({ onRun }: { onRun: (action: ReviewerAction) => void }) {
  const [choice, setChoice] = useState<ReviewerAction>("CONFIRM_EVIDENCE");
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <Select value={choice} onValueChange={(v) => setChoice(v as ReviewerAction)}>
        <SelectTrigger className="w-56 bg-background/60" aria-label="Reviewer action">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {actions.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={() => onRun(choice)}>
        Apply action
      </Button>
    </div>
  );
}

/** Reads the freshest application snapshot after a mutation. */
function useStoreApp(id: string) {
  return useClearPath((s) => s.applications.find((a) => a.id === id) ?? null);
}
