import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ProcessingDialog } from "./ProcessingDialog";
import { attachEvidence, requestReview } from "@/lib/clearpath/store";

/**
 * Shared applicant-side evidence actions with the simulated
 * document-processing pipeline attached.
 */
export function useEvidenceActions(appId: string) {
  const [pending, setPending] = useState<{ requirementId: string; label: string } | null>(null);

  const process = useCallback((requirementId: string, label: string) => {
    setPending({ requirementId, label });
  }, []);

  const complete = useCallback(() => {
    if (!pending) return;
    attachEvidence(appId, pending.requirementId, "verified");
    const label = pending.label;
    setPending(null);
    toast.success("Evidence processed", {
      description: `${label} extracted and matched to its requirement.`,
    });
  }, [appId, pending]);

  const review = useCallback(
    (requirementId: string) => {
      requestReview(appId, requirementId);
      toast.info("Human review requested", {
        description: "The application now appears in the reviewer queue.",
      });
    },
    [appId],
  );

  const dialog = (
    <ProcessingDialog
      open={pending !== null}
      documentLabel={pending?.label ?? ""}
      onComplete={complete}
    />
  );

  return { process, review, dialog };
}
