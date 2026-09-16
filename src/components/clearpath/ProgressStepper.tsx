import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { n: "01", label: "Profile", to: "/profile" as const },
  { n: "02", label: "Evidence", to: "/evidence" as const },
  { n: "03", label: "Assessment", to: "/assessment" as const },
  { n: "04", label: "Decision", to: "/decisions" as const },
];

export function ProgressStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Application progress" className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const index = i + 1;
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.n} className="flex items-center gap-2 sm:gap-3">
              <Link
                to={step.to}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : done
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border bg-card/60 text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "num grid size-5 place-items-center rounded-full text-[10px]",
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3" aria-hidden /> : step.n}
                </span>
                <span className="text-xs font-medium tracking-wide">{step.label}</span>
              </Link>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-6 sm:w-10",
                    done ? "bg-success/40" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
