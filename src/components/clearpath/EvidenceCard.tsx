import { motion } from "motion/react";
import { FileText, RefreshCcw, Upload, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import type { AssessedRequirement } from "@/lib/clearpath/types";

export function EvidenceCard({
  requirement,
  index,
  onUpload,
  onReplace,
  onRequestReview,
}: {
  requirement: AssessedRequirement;
  index: number;
  onUpload: (requirementId: string) => void;
  onReplace: (requirementId: string) => void;
  onRequestReview: (requirementId: string) => void;
}) {
  const { evidence, status } = requirement;
  const missing = status === "MISSING";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="panel flex flex-col p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
            <FileText className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              {missing ? requirement.evidenceLabel : evidence?.documentName}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {missing ? "No document submitted" : evidence?.documentType}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="mt-4 grid gap-3 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Supports</dt>
          <dd className="text-right font-medium text-foreground">{requirement.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Last updated</dt>
          <dd className="num text-right text-muted-foreground">
            {evidence ? new Date(evidence.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <ConfidenceMeter value={requirement.confidence} />
      </div>

      {evidence && evidence.detected.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
          <p className="eyebrow mb-2">Detected information</p>
          <ul className="grid gap-1.5">
            {evidence.detected.map((fact) => (
              <li key={fact.label} className="flex justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{fact.label}</span>
                <span className="num text-foreground">{fact.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(requirement.issue || missing) && (
        <p className="mt-4 rounded-lg border border-warning/25 bg-warning/8 p-3 text-xs leading-relaxed text-warning">
          {requirement.issue ?? "Required evidence has not been submitted."}
        </p>
      )}

      {evidence?.conflict && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive">
          <p className="font-semibold uppercase tracking-[0.12em]">Conflict detected</p>
          <p className="mt-1.5 leading-relaxed">
            Profile states {evidence.conflict.profileValue}; evidence states{" "}
            {evidence.conflict.evidenceValue}.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        {missing ? (
          <Button size="sm" onClick={() => onUpload(requirement.id)}>
            <Upload className="size-3.5" aria-hidden /> Upload evidence
          </Button>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => onReplace(requirement.id)}>
              <RefreshCcw className="size-3.5" aria-hidden /> Replace document
            </Button>
            {status !== "VERIFIED" && (
              <Button size="sm" variant="outline" onClick={() => onRequestReview(requirement.id)}>
                <UserSearch className="size-3.5" aria-hidden /> Request review
              </Button>
            )}
          </>
        )}
      </div>
    </motion.article>
  );
}
