import { AlertTriangle, CircleDashed, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META, DECISION_META } from "@/lib/clearpath/engine";
import type { DecisionState, EvidenceStatus } from "@/lib/clearpath/types";

const toneClass: Record<string, string> = {
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/12 text-warning",
  danger: "border-destructive/35 bg-destructive/12 text-destructive",
  info: "border-info/35 bg-info/12 text-info",
  neutral: "border-border-strong bg-muted/60 text-muted-foreground",
};

const statusIcon: Record<EvidenceStatus, typeof ShieldCheck> = {
  VERIFIED: ShieldCheck,
  PARTIAL: Info,
  NEEDS_REVIEW: AlertTriangle,
  MISSING: CircleDashed,
  CONFLICT: TriangleAlert,
};

export function StatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: EvidenceStatus;
  className?: string;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  const Icon = statusIcon[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-[0.12em]",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        toneClass[meta.tone],
        className,
      )}
    >
      <Icon aria-hidden className={size === "sm" ? "size-3" : "size-3.5"} />
      {meta.label}
    </span>
  );
}

export function DecisionBadge({
  state,
  className,
}: {
  state: DecisionState;
  className?: string;
}) {
  const meta = DECISION_META[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
        toneClass[meta.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {state.replace(/_/g, " ")}
    </span>
  );
}

export function ImpactBadge({ impact }: { impact: "HIGH" | "MEDIUM" | "LOW" }) {
  const tone = impact === "HIGH" ? "danger" : impact === "MEDIUM" ? "warning" : "neutral";
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        toneClass[tone],
      )}
    >
      Impact {impact}
    </span>
  );
}
