import { getScenario } from "./scenarios";
import type {
  Application,
  AssessedRequirement,
  Assessment,
  DecisionState,
  EvidenceStatus,
  NextAction,
} from "./types";

const WEIGHT: Record<EvidenceStatus, number> = {
  VERIFIED: 1,
  PARTIAL: 0.5,
  NEEDS_REVIEW: 0.4,
  CONFLICT: 0.3,
  MISSING: 0,
};

export const DECISION_META: Record<
  DecisionState,
  { label: string; tone: "success" | "warning" | "danger" | "info" }
> = {
  READY_TO_PROCEED: { label: "Ready to proceed", tone: "success" },
  NOT_ELIGIBLE: { label: "Not eligible", tone: "danger" },
  NEEDS_INFORMATION: { label: "Needs additional evidence", tone: "warning" },
  NEEDS_HUMAN_REVIEW: { label: "Human review required", tone: "info" },
  CONFLICT_DETECTED: { label: "Conflict detected", tone: "danger" },
};

export const STATUS_META: Record<
  EvidenceStatus,
  { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  VERIFIED: { label: "Verified", tone: "success" },
  PARTIAL: { label: "Partial", tone: "warning" },
  NEEDS_REVIEW: { label: "Needs review", tone: "info" },
  MISSING: { label: "Missing", tone: "neutral" },
  CONFLICT: { label: "Conflict", tone: "danger" },
};

/**
 * Deterministic reasoning engine. Every requirement is resolved from the
 * evidence attached to it — no AI call is required for any outcome below.
 */
export function assess(application: Application): Assessment {
  const scenario = getScenario(application.scenarioId);

  const requirements: AssessedRequirement[] = scenario.requirements.map((def) => {
    const evidence =
      application.evidence.find((item) => item.requirementId === def.id) ?? null;

    if (!evidence) {
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        required: def.required,
        evidence: null,
        evidenceLabel: def.evidenceLabel,
        status: "MISSING",
        confidence: 0,
        explanation: `No evidence has been submitted for ${def.name.toLowerCase()}, so the condition cannot be established.`,
        nextAction: `Upload a ${def.evidenceLabel.toLowerCase()} to establish ${def.name.toLowerCase()}.`,
      };
    }

    let status: EvidenceStatus = evidence.status;
    let confidence = evidence.confidence;

    if (evidence.reviewerConfirmed) {
      status = "VERIFIED";
      confidence = Math.max(confidence, 0.92);
    } else if (evidence.conflict) {
      status = "CONFLICT";
    } else if (confidence < 0.6) {
      status = "NEEDS_REVIEW";
    } else if (evidence.detected.length < def.expectedFacts.length) {
      status = status === "VERIFIED" ? "PARTIAL" : status;
    }

    const explanation = (() => {
      switch (status) {
        case "VERIFIED":
          return evidence.reviewerConfirmed
            ? `${def.name} was manually confirmed by a reviewer against the original document.`
            : `${def.name} is established from ${evidence.documentName} at ${Math.round(confidence * 100)}% extraction confidence.`;
        case "CONFLICT":
          return `${evidence.documentName} reports ${evidence.conflict?.field} as ${evidence.conflict?.evidenceValue}, while the applicant declared ${evidence.conflict?.profileValue}. The condition cannot be established while the two disagree.`;
        case "NEEDS_REVIEW":
          return `${evidence.documentName} was detected and classified, but the extracted values are only ${Math.round(confidence * 100)}% reliable, so ${def.name.toLowerCase()} cannot be established automatically.`;
        case "PARTIAL":
          return `${evidence.documentName} established some but not all required facts (${def.expectedFacts.join(", ")}).`;
        default:
          return `${def.name} cannot be established from the current evidence.`;
      }
    })();

    const nextAction = (() => {
      switch (status) {
        case "VERIFIED":
          return "No action required.";
        case "CONFLICT":
          return "Request reviewer verification, or replace the document with a corrected copy.";
        case "NEEDS_REVIEW":
          return "Upload a clearer document or request reviewer verification.";
        case "PARTIAL":
          return "Replace the document with a complete copy showing all required fields.";
        default:
          return `Upload a ${def.evidenceLabel.toLowerCase()}.`;
      }
    })();

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      required: def.required,
      evidence: { ...evidence, status: status === "MISSING" ? evidence.status : evidence.status },
      evidenceLabel: def.evidenceLabel,
      status,
      confidence,
      issue: evidence.issue,
      explanation,
      nextAction,
    };
  });

  const counts = {
    established: requirements.filter((r) => r.status === "VERIFIED").length,
    needsReview: requirements.filter((r) => r.status === "NEEDS_REVIEW").length,
    missing: requirements.filter((r) => r.status === "MISSING").length,
    conflict: requirements.filter((r) => r.status === "CONFLICT").length,
    partial: requirements.filter((r) => r.status === "PARTIAL").length,
  };

  const readiness = Math.round(
    (requirements.reduce((sum, r) => sum + WEIGHT[r.status], 0) / requirements.length) * 100,
  );

  const averageConfidence =
    requirements.reduce((sum, r) => sum + r.confidence, 0) / requirements.length;

  const eligibility = scenario.eligibility.check(application.profile);

  const state: DecisionState = counts.conflict
    ? "CONFLICT_DETECTED"
    : !eligibility.ok
      ? "NOT_ELIGIBLE"
      : counts.missing
        ? "NEEDS_INFORMATION"
        : counts.needsReview || counts.partial
          ? "NEEDS_HUMAN_REVIEW"
          : "READY_TO_PROCEED";

  const blockers = requirements
    .filter((r) => r.status !== "VERIFIED")
    .map((r) => ({ title: r.name, detail: r.explanation }));

  const summary = (() => {
    switch (state) {
      case "READY_TO_PROCEED":
        return `All ${requirements.length} required conditions are established from submitted evidence at an average confidence of ${Math.round(averageConfidence * 100)}%. The application can move to disbursement processing.`;
      case "CONFLICT_DETECTED":
        return "Submitted evidence contains information that differs from the applicant information. The application has been routed to human review because an automated decision would be unsafe.";
      case "NOT_ELIGIBLE":
        return `${eligibility.reason} This is a scenario condition, not an evidence problem, so additional documents will not change the outcome.`;
      case "NEEDS_INFORMATION":
        return `${blockers.length} condition${blockers.length === 1 ? "" : "s"} cannot be established yet. The application will proceed once the outstanding evidence is provided.`;
      default:
        return "Evidence exists for every condition, but at least one item cannot be resolved confidently by automated extraction. A reviewer must inspect the original document.";
    }
  })();

  const actions: NextAction[] = [];
  for (const r of requirements) {
    if (r.status === "MISSING") {
      actions.push({
        id: `upload-${r.id}`,
        title: `Upload ${r.evidenceLabel}`,
        impact: "HIGH",
        why: `This satisfies ${r.name}, a currently missing required condition.`,
        cta: "UPLOAD",
        requirementId: r.id,
      });
    } else if (r.status === "NEEDS_REVIEW" || r.status === "PARTIAL") {
      actions.push({
        id: `replace-${r.id}`,
        title: `Replace ${r.evidenceLabel}`,
        impact: "HIGH",
        why: `The current evidence cannot reliably establish ${r.name.toLowerCase()}.`,
        cta: "REPLACE",
        requirementId: r.id,
      });
      actions.push({
        id: `review-${r.id}`,
        title: "Request human verification",
        impact: "MEDIUM",
        why: "A reviewer can manually inspect the original evidence and confirm the value.",
        cta: "REVIEW",
        requirementId: r.id,
      });
    } else if (r.status === "CONFLICT") {
      actions.push({
        id: `review-${r.id}`,
        title: `Request review of ${r.evidenceLabel}`,
        impact: "HIGH",
        why: `Declared and detected values for ${r.name.toLowerCase()} disagree and only a reviewer can resolve which is correct.`,
        cta: "REVIEW",
        requirementId: r.id,
      });
      actions.push({
        id: `replace-${r.id}`,
        title: `Replace ${r.evidenceLabel}`,
        impact: "MEDIUM",
        why: "A corrected document that matches the declared information removes the conflict.",
        cta: "REPLACE",
        requirementId: r.id,
      });
    }
  }
  if (state === "READY_TO_PROCEED") {
    actions.push({
      id: "submit",
      title: "Submit application for processing",
      impact: "HIGH",
      why: "Every required condition is established, so nothing blocks submission.",
      cta: "NONE",
    });
  }
  if (state === "NOT_ELIGIBLE") {
    actions.length = 0;
    actions.push({
      id: "not-eligible",
      title: "Review scenario eligibility",
      impact: "HIGH",
      why: eligibility.reason,
      cta: "NONE",
    });
  }

  return {
    requirements,
    readiness,
    counts,
    averageConfidence,
    decision: {
      state,
      headline: DECISION_META[state].label,
      summary,
      established: requirements
        .filter((r) => r.status === "VERIFIED")
        .map((r) => `${r.name} established from ${r.evidence?.documentName ?? "evidence"}.`),
      notEstablished: requirements
        .filter((r) => r.status === "MISSING")
        .map((r) => `${r.name} — no evidence submitted.`),
      problems: requirements
        .filter((r) => r.status === "NEEDS_REVIEW" || r.status === "CONFLICT" || r.status === "PARTIAL")
        .map((r) => `${r.name} — ${r.issue ?? r.explanation}`),
      blockers,
    },
    actions: actions.slice(0, 4),
  };
}

export const needsReviewer = (state: DecisionState) =>
  state === "CONFLICT_DETECTED" || state === "NEEDS_HUMAN_REVIEW";
