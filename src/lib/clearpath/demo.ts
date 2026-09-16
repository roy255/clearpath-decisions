import type { Application, ApplicantProfile, EvidenceItem } from "./types";
import { getScenario } from "./scenarios";

type Catalog = Record<
  string,
  { documentName: string; documentType: string; facts: { label: string; value: string }[] }
>;

const catalog: Catalog = {
  identity_document: {
    documentName: "Aadhaar Card",
    documentType: "Government identity document (PDF)",
    facts: [
      { label: "Full name", value: "Priya Sharma" },
      { label: "ID number", value: "XXXX XXXX 4821" },
      { label: "Date of birth", value: "14 Mar 2004" },
    ],
  },
  college_id: {
    documentName: "College ID",
    documentType: "Institution-issued card (image)",
    facts: [
      { label: "Institution", value: "Pune Institute of Technology" },
      { label: "Student ID", value: "PIT21CS0142" },
      { label: "Course", value: "B.Tech Computer Science" },
      { label: "Enrollment year", value: "2022" },
    ],
  },
  marksheet: {
    documentName: "Semester Marksheet",
    documentType: "Academic result (PDF)",
    facts: [
      { label: "Board / University", value: "Savitribai Phule Pune University" },
      { label: "Aggregate score", value: "82%" },
      { label: "Year", value: "2025" },
    ],
  },
  income_certificate: {
    documentName: "Income Certificate",
    documentType: "Revenue department certificate (scan)",
    facts: [
      { label: "Annual income", value: "₹1,20,000" },
      { label: "Issuing authority", value: "Tehsildar, Pune District" },
      { label: "Issue date", value: "08 Feb 2026" },
    ],
  },
  bank_proof: {
    documentName: "Bank Passbook",
    documentType: "Bank account proof (image)",
    facts: [
      { label: "Account holder", value: "Priya Sharma" },
      { label: "Account number", value: "XXXXXX8830" },
      { label: "Bank name", value: "State Bank of India" },
    ],
  },
  residence_proof: {
    documentName: "Electricity Bill",
    documentType: "Utility statement (PDF)",
    facts: [
      { label: "Address", value: "12 Shanti Nagar, Pune 411014" },
      { label: "Billing period", value: "Jan 2026" },
      { label: "Consumer name", value: "Rahul Verma" },
    ],
  },
  tenancy_agreement: {
    documentName: "Rental Agreement",
    documentType: "Registered agreement (PDF)",
    facts: [
      { label: "Landlord", value: "S. Kulkarni" },
      { label: "Monthly rent", value: "₹9,500" },
      { label: "Agreement period", value: "Jun 2025 – May 2026" },
    ],
  },
  medical_report: {
    documentName: "Hospital Estimate",
    documentType: "Treatment estimate (PDF)",
    facts: [
      { label: "Hospital", value: "Sahyadri Multispecialty Hospital" },
      { label: "Diagnosis", value: "Cardiac valve repair" },
      { label: "Estimated cost", value: "₹2,15,000" },
    ],
  },
  fee_receipt: {
    documentName: "Fee Demand Letter",
    documentType: "Institution receipt (PDF)",
    facts: [
      { label: "Institution", value: "Pune Institute of Technology" },
      { label: "Term", value: "Semester 7, 2026" },
      { label: "Payable amount", value: "₹64,000" },
    ],
  },
  relieving_letter: {
    documentName: "Relieving Letter",
    documentType: "Employer letter (PDF)",
    facts: [
      { label: "Employer", value: "Nextwave Systems Pvt Ltd" },
      { label: "Last working day", value: "31 Jan 2026" },
      { label: "Designation", value: "Associate Engineer" },
    ],
  },
};

const now = () => new Date().toISOString();

export function makeEvidence(
  requirementId: string,
  evidenceType: string,
  variant: "verified" | "low" | "partial" | "conflict" = "verified",
  overrides: Partial<EvidenceItem> = {},
): EvidenceItem {
  const entry = catalog[evidenceType] ?? {
    documentName: "Supporting Document",
    documentType: "Document (PDF)",
    facts: [{ label: "Detected", value: "Document content" }],
  };
  const base: EvidenceItem = {
    id: `${requirementId}-${Math.random().toString(36).slice(2, 8)}`,
    requirementId,
    documentName: entry.documentName,
    documentType: entry.documentType,
    status: "VERIFIED",
    confidence: 0.94,
    detected: entry.facts,
    updatedAt: now(),
  };

  if (variant === "low") {
    return {
      ...base,
      status: "NEEDS_REVIEW",
      confidence: 0.43,
      detected: entry.facts.slice(1),
      issue: "Document text quality is insufficient; the primary value could not be read reliably.",
      ...overrides,
    };
  }
  if (variant === "partial") {
    return {
      ...base,
      status: "PARTIAL",
      confidence: 0.71,
      detected: entry.facts.slice(0, Math.max(1, entry.facts.length - 2)),
      issue: "Some expected fields were not present in the submitted copy.",
      ...overrides,
    };
  }
  if (variant === "conflict") {
    return {
      ...base,
      status: "CONFLICT",
      confidence: 0.88,
      detected: [{ label: "Annual income", value: "₹2,80,000" }, ...entry.facts.slice(1)],
      issue: "Detected income differs from the income declared in the applicant profile.",
      conflict: {
        field: "annual income",
        profileValue: "₹1,20,000",
        evidenceValue: "₹2,80,000",
      },
      ...overrides,
    };
  }
  return { ...base, ...overrides };
}

export const priyaProfile: ApplicantProfile = {
  fullName: "Priya Sharma",
  applicantId: "CG-2026-0142",
  dateOfBirth: "14 Mar 2004",
  gender: "Female",
  nationality: "Indian",
  institution: "Pune Institute of Technology",
  programme: "B.Tech Computer Science",
  academicScore: "82%",
  employmentStatus: "Full-time student",
  annualIncome: "₹1,20,000",
  householdSize: "4",
  bankName: "State Bank of India",
  email: "priya.sharma@example.in",
  phone: "+91 98XXX 41207",
  address: "12 Shanti Nagar, Pune, Maharashtra 411014",
};

const profileFor = (
  name: string,
  id: string,
  overrides: Partial<ApplicantProfile>,
): ApplicantProfile => ({ ...priyaProfile, fullName: name, applicantId: id, ...overrides });

const appId = () => `APP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export type DemoKey = "complete" | "missing" | "conflict" | "review";

export const demoPresets: {
  key: DemoKey;
  title: string;
  outcome: string;
  description: string;
}[] = [
  {
    key: "complete",
    title: "Complete application",
    outcome: "READY TO PROCEED",
    description: "Every required condition is established from high-confidence evidence.",
  },
  {
    key: "missing",
    title: "Missing evidence",
    outcome: "NEEDS INFORMATION",
    description: "Bank proof absent and the income certificate is unreadable.",
  },
  {
    key: "conflict",
    title: "Conflict detected",
    outcome: "HUMAN REVIEW REQUIRED",
    description: "Declared income ₹1,20,000 versus detected income ₹2,80,000.",
  },
  {
    key: "review",
    title: "Human review required",
    outcome: "NEEDS HUMAN REVIEW",
    description: "Evidence exists for every condition but confidence is too low to resolve.",
  },
];

export function buildDemoApplication(key: DemoKey, scenarioId = "student-scholarship"): Application {
  const scenario = getScenario(scenarioId);
  const evidence: EvidenceItem[] = [];

  for (const req of scenario.requirements) {
    if (key === "complete") {
      evidence.push(makeEvidence(req.id, req.evidenceType, "verified", { confidence: 0.96 }));
      continue;
    }
    if (key === "missing") {
      if (req.id === "bank") continue;
      if (req.id === "income") {
        evidence.push(makeEvidence(req.id, req.evidenceType, "low"));
        continue;
      }
      evidence.push(makeEvidence(req.id, req.evidenceType, "verified"));
      continue;
    }
    if (key === "conflict") {
      if (req.id === "income") {
        evidence.push(makeEvidence(req.id, req.evidenceType, "conflict"));
        continue;
      }
      evidence.push(makeEvidence(req.id, req.evidenceType, "verified"));
      continue;
    }
    if (req.id === "income") {
      evidence.push(makeEvidence(req.id, req.evidenceType, "low"));
      continue;
    }
    if (req.id === "academic" || req.id === "residence" || req.id === "medical") {
      evidence.push(makeEvidence(req.id, req.evidenceType, "partial"));
      continue;
    }
    evidence.push(makeEvidence(req.id, req.evidenceType, "verified"));
  }

  return {
    id: appId(),
    scenarioId,
    profile: priyaProfile,
    evidence,
    createdAt: now(),
    reviewLog: [],
  };
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export function seedQueue(): Application[] {
  const conflict = buildDemoApplication("conflict");
  conflict.id = "APP-4471";
  conflict.createdAt = daysAgo(2);

  const review = buildDemoApplication("review");
  review.id = "APP-4468";
  review.createdAt = daysAgo(4);
  review.profile = profileFor("Rahul Verma", "CG-2026-0117", {
    programme: "M.Sc Statistics",
    academicScore: "76%",
    annualIncome: "₹1,80,000",
  });

  const housing = buildDemoApplication("review", "housing-assistance");
  housing.id = "APP-4460";
  housing.createdAt = daysAgo(6);
  housing.profile = profileFor("Anita Desai", "CG-2026-0093", {
    employmentStatus: "Part-time employed",
    annualIncome: "₹2,40,000",
    institution: "—",
    programme: "—",
    academicScore: "—",
  });

  const health = buildDemoApplication("conflict", "healthcare-support");
  health.id = "APP-4455";
  health.createdAt = daysAgo(9);
  health.profile = profileFor("Imran Qureshi", "CG-2026-0071", {
    employmentStatus: "Self-employed",
    annualIncome: "₹1,20,000",
    institution: "—",
    programme: "—",
    academicScore: "—",
  });

  return [conflict, review, housing, health];
}
