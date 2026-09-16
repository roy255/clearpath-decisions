import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { resetDemoData } from "@/lib/clearpath/store";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ClearPath" },
      {
        name: "description",
        content:
          "Workspace settings for the ClearPath prototype: reasoning mode, optional AI assistance and demo data controls.",
      },
      { property: "og:title", content: "Settings — ClearPath" },
      {
        property: "og:description",
        content: "Reasoning mode, AI assistance and demo data controls.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [aiAssist, setAiAssist] = useState(false);

  return (
    <AppShell toolbar={<DemoSelector />}>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="ClearPath assesses evidence with a deterministic rules engine. Optional AI assistance only rewords explanations — it never decides an outcome."
      />

      <section className="panel grid gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-md">
            <Label htmlFor="ai-assist" className="text-sm font-medium text-foreground">
              AI-assisted wording
            </Label>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              When a provider is connected, explanations and next-action wording can be summarised by
              a language model. Decisions stay with the rules engine, so the prototype works fully
              without any API key.
            </p>
          </div>
          <Switch
            id="ai-assist"
            checked={aiAssist}
            onCheckedChange={(checked) => {
              setAiAssist(checked);
              toast.info(
                checked
                  ? "No AI provider is connected — deterministic wording remains in use."
                  : "Deterministic wording in use.",
              );
            }}
          />
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">Demo data</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            All applicants, documents and detected values in this prototype are fictional
            demonstration data. Resetting restores the original review queue.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => {
              resetDemoData();
              toast.success("Workspace reset", { description: "Original demo queue restored." });
            }}
          >
            <RotateCcw className="size-3.5" aria-hidden /> Reset workspace
          </Button>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
          How decisions are derived
        </h2>
        <ol className="mt-4 grid gap-2 text-xs leading-relaxed text-muted-foreground">
          {[
            "Missing evidence for a required condition → NEEDS INFORMATION.",
            "Detected value contradicts declared information → CONFLICT DETECTED, routed to human review.",
            "Evidence present but extraction confidence below 60% → NEEDS HUMAN REVIEW.",
            "Scenario condition itself unmet (income ceiling, score threshold) → NOT ELIGIBLE.",
            "All required conditions established → READY TO PROCEED.",
          ].map((rule, i) => (
            <li key={rule} className="flex gap-3">
              <span className="num text-primary">{String(i + 1).padStart(2, "0")}</span>
              {rule}
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
