import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { ProgressStepper } from "@/components/clearpath/ProgressStepper";
import { RequireApplication } from "@/components/clearpath/RequireApplication";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { EvidenceCard } from "@/components/clearpath/EvidenceCard";
import { EvidenceChain } from "@/components/clearpath/EvidenceChain";
import { useEvidenceActions } from "@/components/clearpath/useEvidenceActions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Application, Assessment } from "@/lib/clearpath/types";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence vault — ClearPath" },
      {
        name: "description",
        content:
          "Every requirement needs evidence and every evidence item needs a reason. Inspect detected facts, confidence and issues per document.",
      },
      { property: "og:title", content: "Evidence vault — ClearPath" },
      {
        property: "og:description",
        content: "Documents, detected facts, confidence and issues in one workspace.",
      },
    ],
  }),
  component: EvidencePage,
});

function EvidencePage() {
  return (
    <AppShell toolbar={<><ProgressStepper current={2} /><DemoSelector /></>}>
      <RequireApplication>
        {({ application, assessment }) => (
          <EvidenceBody application={application} assessment={assessment} />
        )}
      </RequireApplication>
    </AppShell>
  );
}

function EvidenceBody({
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
        eyebrow="Step 02 · Evidence"
        title="Evidence vault"
        description="Every requirement needs evidence. Every evidence item needs a reason. Confidence below 60% cannot establish a condition automatically."
        actions={
          <Button size="sm" asChild>
            <Link to="/assessment">
              Run assessment <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Verified", value: assessment.counts.established, tone: "text-success" },
          { label: "Needs review", value: assessment.counts.needsReview + assessment.counts.partial, tone: "text-info" },
          { label: "Conflicts", value: assessment.counts.conflict, tone: "text-destructive" },
          { label: "Missing", value: assessment.counts.missing, tone: "text-muted-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="panel p-4">
            <p className="eyebrow">{stat.label}</p>
            <p className={`num mt-2 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="vault">
        <TabsList>
          <TabsTrigger value="vault">Vault</TabsTrigger>
          <TabsTrigger value="chain">Evidence chain</TabsTrigger>
        </TabsList>
        <TabsContent value="vault" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assessment.requirements.map((req, i) => (
              <EvidenceCard
                key={req.id}
                requirement={req}
                index={i}
                onUpload={(id) => handle(id, "UPLOAD")}
                onReplace={(id) => handle(id, "REPLACE")}
                onRequestReview={(id) => handle(id, "REVIEW")}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="chain" className="mt-4">
          <EvidenceChain
            applicantName={application.profile.fullName}
            requirements={assessment.requirements}
            onAction={handle}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
