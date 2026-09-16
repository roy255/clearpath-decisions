export type EvidenceStatus =
  | "VERIFIED"
  | "PARTIAL"
  | "NEEDS_REVIEW"
  | "MISSING"
  | "CONFLICT";

export type DecisionState =
  | "READY_TO_PROCEED"
  | "NOT_ELIGIBLE"
  | "NEEDS_INFORMATION"
  | "NEEDS_HUMAN_REVIEW"
  | "CONFLICT_DETECTED";

export type DetectedFact = { label: string; value: string };

export type EvidenceItem = {
  id: string;
  requirementId: string;
  documentName: string;
  documentType: string;
  status: Exclude<EvidenceStatus, "MISSING">;
  confidence: number;
  detected: DetectedFact[];
  issue?: string | undefined;
  conflict?: { field: string; profileValue: string; evidenceValue: string } | undefined;
  updatedAt: string;
  reviewerConfirmed?: boolean | undefined;
};

export type RequirementDef = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  evidenceType: string;
  evidenceLabel: string;
  expectedFacts: string[];
};

export type ApplicantProfile = {
  fullName: string;
  applicantId: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  institution: string;
  programme: string;
  academicScore: string;
  employmentStatus: string;
  annualIncome: string;
  householdSize: string;
  bankName: string;
  email: string;
  phone: string;
  address: string;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  icon: "graduation" | "home" | "heart" | "book" | "briefcase";
  requirements: RequirementDef[];
  eligibility: {
    label: string;
    check: (profile: ApplicantProfile) => { ok: boolean; reason: string };
  };
};

export type ReviewEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type Application = {
  id: string;
  scenarioId: string;
  profile: ApplicantProfile;
  evidence: EvidenceItem[];
  createdAt: string;
  reviewLog: ReviewEvent[];
  escalated?: boolean | undefined;
};

export type AssessedRequirement = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  evidence: EvidenceItem | null;
  evidenceLabel: string;
  status: EvidenceStatus;
  confidence: number;
  issue?: string | undefined;
  explanation: string;
  nextAction: string;
};

export type NextAction = {
  id: string;
  title: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  why: string;
  cta: "UPLOAD" | "REPLACE" | "REVIEW" | "NONE";
  requirementId?: string;
};

export type Assessment = {
  requirements: AssessedRequirement[];
  readiness: number;
  counts: {
    established: number;
    needsReview: number;
    missing: number;
    conflict: number;
    partial: number;
  };
  decision: {
    state: DecisionState;
    headline: string;
    summary: string;
    established: string[];
    notEstablished: string[];
    problems: string[];
    blockers: { title: string; detail: string }[];
  };
  actions: NextAction[];
  averageConfidence: number;
};
