import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, CircleSlash, HelpCircle, RefreshCcw, Upload, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionBadge, ImpactBadge } from "./StatusBadge";
import type { Assessment, NextAction } from "@/lib/clearpath/types";

export function DecisionCard({ assessment }: { assessment: Assessment }) {
  const { decision } = assessment;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel hero-glow p-6"
      aria-label="Decision"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Current decision state</p>
        <DecisionBadge state={decision.state} />
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
        {decision.headline}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {decision.summary}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Column
          tone="success"
          icon={<CheckCircle2 className="size-4" aria-hidden />}
          title="What was established"
          items={decision.established}
          empty="Nothing has been established yet."
        />
        <Column
          tone="muted"
          icon={<CircleSlash className="size-4" aria-hidden />}
          title="What is not established"
          items={decision.notEstablished}
          empty="No outstanding conditions."
        />
        <Column
          tone="warning"
          icon={<HelpCircle className="size-4" aria-hidden />}
          title="What is problematic"
          items={decision.problems}
          empty="No problems detected."
        />
      </div>
    </motion.section>
  );
}

function Column({
  tone,
  icon,
  title,
  items,
  empty,
}: {
  tone: "success" | "warning" | "muted";
  icon: ReactNode;
  title: string;
  items: string[];
  empty: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${toneClass}`}>
        {icon}
        {title}
      </p>
      {items.length ? (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item} className="text-xs leading-relaxed text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground/70">{empty}</p>
      )}
    </div>
  );
}

export function ReasoningPanel({ assessment }: { assessment: Assessment }) {
  const { blockers, state } = assessment.decision;
  return (
    <section className="panel p-6" aria-label="Why this decision">
      <h2 className="text-lg font-semibold text-foreground">Why this decision?</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {blockers.length
          ? `${blockers.length} ${blockers.length === 1 ? "blocker currently prevents" : "blockers currently prevent"} this application from proceeding.`
          : "No blockers remain — every condition traces back to verified evidence."}
      </p>

      <ol className="mt-5 grid gap-3">
        {blockers.map((blocker, i) => (
          <motion.li
            key={blocker.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-4 rounded-lg border border-border bg-background/40 p-4"
          >
            <span className="num text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{blocker.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{blocker.detail}</p>
            </div>
          </motion.li>
        ))}
        {!blockers.length && (
          <li className="rounded-lg border border-success/25 bg-success/8 p-4 text-xs text-success">
            All required conditions are established from submitted evidence.
          </li>
        )}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="eyebrow">Current state</span>
        <DecisionBadge state={state} />
      </div>
    </section>
  );
}

const ctaIcon = {
  UPLOAD: Upload,
  REPLACE: RefreshCcw,
  REVIEW: UserSearch,
  NONE: CheckCircle2,
};

const ctaLabel = {
  UPLOAD: "Upload evidence",
  REPLACE: "Replace document",
  REVIEW: "Request review",
  NONE: "Continue",
};

export function NextBestAction({
  actions,
  onAction,
}: {
  actions: NextAction[];
  onAction: (action: NextAction) => void;
}) {
  return (
    <section className="panel p-6" aria-label="Next best action">
      <h2 className="text-lg font-semibold text-foreground">Next best action</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Ranked by how much each action moves the application forward.
      </p>
      <ol className="mt-5 grid gap-3">
        {actions.map((action, i) => {
          const Icon = ctaIcon[action.cta];
          return (
            <motion.li
              key={action.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col gap-3 rounded-lg border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-4">
                <span className="num text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{action.title}</p>
                    <ImpactBadge impact={action.impact} />
                  </div>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                    {action.why}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={action.cta === "NONE" ? "secondary" : "default"}
                onClick={() => onAction(action)}
                className="sm:shrink-0"
              >
                <Icon className="size-3.5" aria-hidden />
                {ctaLabel[action.cta]}
              </Button>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
