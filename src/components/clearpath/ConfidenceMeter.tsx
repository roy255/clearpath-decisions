import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  value,
  label = "Confidence",
  className,
  compact = false,
}: {
  value: number;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 85 ? "bg-success" : pct >= 60 ? "bg-warning" : pct > 0 ? "bg-destructive" : "bg-muted-foreground/40";

  return (
    <div className={cn("w-full", className)}>
      {!compact && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="eyebrow">{label}</span>
          <span className="num text-sm text-foreground">{pct}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${pct} percent`}
      >
        <motion.div
          className={cn("h-full rounded-full", tone)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {compact && <span className="num mt-1 block text-xs text-muted-foreground">{pct}%</span>}
    </div>
  );
}

export function ReadinessDial({ value }: { value: number }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  return (
    <div className="relative grid size-40 place-items-center">
      <svg viewBox="0 0 150 150" className="size-40 -rotate-90">
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="num text-4xl font-semibold text-foreground">{value}%</div>
        <div className="eyebrow mt-1">Readiness</div>
      </div>
    </div>
  );
}
