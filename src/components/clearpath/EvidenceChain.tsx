import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, FileWarning, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { Button } from "@/components/ui/button";
import type { AssessedRequirement } from "@/lib/clearpath/types";

const dotTone: Record<string, string> = {
  VERIFIED: "bg-success",
  PARTIAL: "bg-warning",
  NEEDS_REVIEW: "bg-info",
  MISSING: "bg-muted-foreground/50",
  CONFLICT: "bg-destructive",
};

/**
 * The signature interactive view: applicant -> requirement -> evidence,
 * with a live detail panel explaining what each link establishes.
 */
export function EvidenceChain({
  applicantName,
  requirements,
  onAction,
}: {
  applicantName: string;
  requirements: AssessedRequirement[];
  onAction?: ((requirementId: string, action: "UPLOAD" | "REPLACE" | "REVIEW") => void) | undefined;
}) {
  const [selectedId, setSelectedId] = useState(requirements[0]?.id ?? "");
  const selected = requirements.find((r) => r.id === selectedId) ?? requirements[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="panel p-5">
        <p className="eyebrow mb-4">Evidence chain</p>
        <div className="flex items-center gap-3 pb-2">
          <span className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <User className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{applicantName}</p>
            <p className="text-xs text-muted-foreground">Applicant node</p>
          </div>
        </div>

        <ul className="relative ml-4 border-l border-border pl-6">
          {requirements.map((req, i) => {
            const active = req.id === selected?.id;
            return (
              <li key={req.id} className="relative py-2.5">
                <span
                  aria-hidden
                  className="absolute -left-6 top-1/2 h-px w-6 bg-border"
                />
                <motion.span
                  aria-hidden
                  className={cn(
                    "absolute -left-[30px] top-1/2 size-2 -translate-y-1/2 rounded-full",
                    dotTone[req.status],
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                />
                <button
                  type="button"
                  onClick={() => setSelectedId(req.id)}
                  aria-pressed={active}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-primary/40 bg-primary/8"
                      : "border-border bg-card/40 hover:border-border-strong",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{req.name}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="size-3" aria-hidden />
                    {req.evidence && req.status !== "MISSING"
                      ? req.evidence.documentName
                      : "No evidence"}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.aside
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="panel flex flex-col p-5"
          >
            <p className="eyebrow mb-2">Requirement detail</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">{selected.name}</h3>
              <StatusBadge status={selected.status} size="md" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{selected.description}</p>

            <div className="mt-4">
              <ConfidenceMeter value={selected.confidence} />
            </div>

            <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
              <p className="eyebrow mb-2">Evidence</p>
              {selected.evidence && selected.status !== "MISSING" ? (
                <>
                  <p className="text-sm text-foreground">{selected.evidence.documentName}</p>
                  <ul className="mt-2 grid gap-1.5">
                    {selected.evidence.detected.map((fact) => (
                      <li key={fact.label} className="flex justify-between gap-3 text-xs">
                        <span className="text-muted-foreground">{fact.label}</span>
                        <span className="num text-foreground">{fact.value}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileWarning className="size-4" aria-hidden /> No evidence attached
                </p>
              )}
            </div>

            {selected.issue && (
              <p className="mt-3 rounded-lg border border-warning/25 bg-warning/8 p-3 text-xs text-warning">
                {selected.issue}
              </p>
            )}

            <div className="mt-4 grid gap-3 text-xs leading-relaxed">
              <div>
                <p className="eyebrow mb-1">Explanation</p>
                <p className="text-muted-foreground">{selected.explanation}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Next action</p>
                <p className="text-foreground">{selected.nextAction}</p>
              </div>
            </div>

            {onAction && selected.status !== "VERIFIED" && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {selected.status === "MISSING" ? (
                  <Button size="sm" onClick={() => onAction(selected.id, "UPLOAD")}>
                    Upload evidence
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => onAction(selected.id, "REPLACE")}>
                      Replace document
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onAction(selected.id, "REVIEW")}>
                      Request review
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
