import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STEPS = [
  "Document detected",
  "Document classified",
  "Information extracted",
  "Requirement matched",
  "Confidence calculated",
  "Assessment generated",
  "Decision updated",
];

export function ProcessingDialog({
  open,
  documentLabel,
  onComplete,
}: {
  open: boolean;
  documentLabel: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setStep(current);
      if (current > STEPS.length) {
        clearInterval(timer);
        onComplete();
      }
    }, 320);
    return () => clearInterval(timer);
  }, [open, onComplete]);

  return (
    <Dialog open={open}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="panel max-w-md border-border bg-card"
        aria-live="polite"
      >
        <DialogHeader>
          <DialogTitle className="text-base">Processing {documentLabel}</DialogTitle>
          <DialogDescription className="text-xs">
            Simulated extraction pipeline — demo data only.
          </DialogDescription>
        </DialogHeader>
        <ol className="grid gap-2.5">
          {STEPS.map((label, i) => {
            const done = step > i;
            const active = step === i;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border text-[10px]",
                    done
                      ? "border-success/40 bg-success/15 text-success"
                      : active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="size-3" aria-hidden />
                  ) : active ? (
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                  ) : (
                    <span className="num">{i + 1}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    done || active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                {done && (
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="ml-auto h-px max-w-16 bg-success/40"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
