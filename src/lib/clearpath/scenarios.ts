import type { ApplicantProfile, Scenario } from "./types";

export const parseAmount = (value: string): number =>
  Number(String(value).replace(/[^0-9.]/g, "")) || 0;

export const parsePercent = (value: string): number =>
  Number(String(value).replace(/[^0-9.]/g, "")) || 0;

const incomeCap =
  (cap: number, label: string) =>
  (profile: ApplicantProfile) => {
    const income = parseAmount(profile.annualIncome);
    return income <= cap
      ? { ok: true, reason: `Declared annual income is within the ${label} threshold.` }
      : {
          ok: false,
          reason: `Declared annual income exceeds the ${label} threshold of ₹${cap.toLocaleString("en-IN")}.`,
        };
  };

export const scenarios: Scenario[] = [
  {
    id: "student-scholarship",
    name: "Student Scholarship",
    description:
      "Merit-cum-means support for enrolled undergraduate and postgraduate students.",
    icon: "graduation",
    eligibility: {
      label: "Income under ₹2,50,000 and academic score of at least 60%",
      check: (profile) => {
        const income = incomeCap(250000, "scholarship")(profile);
        if (!income.ok) return income;
        const score = parsePercent(profile.academicScore);
        return score >= 60
          ? { ok: true, reason: "Income and academic thresholds are both satisfied." }
          : {
              ok: false,
              reason: `Academic score of ${score}% is below the required minimum of 60%.`,
            };
      },
    },
    requirements: [
      {
        id: "identity",
        name: "Identity Verification",
        description: "A government identity document matching the applicant name.",
        required: true,
        evidenceType: "identity_document",
        evidenceLabel: "Aadhaar / National ID",
        expectedFacts: ["Full name", "ID number", "Date of birth"],
      },
      {
        id: "enrollment",
        name: "Student Enrollment",
        description: "Proof of current enrollment at a recognised institution.",
        required: true,
        evidenceType: "college_id",
        evidenceLabel: "College ID",
        expectedFacts: ["Institution", "Student ID", "Course", "Enrollment year"],
      },
      {
        id: "academic",
        name: "Academic Score",
        description: "Most recent academic result meeting the merit threshold.",
        required: true,
        evidenceType: "marksheet",
        evidenceLabel: "Marksheet",
        expectedFacts: ["Board / University", "Aggregate score", "Year"],
      },
      {
        id: "income",
        name: "Income Verification",
        description: "Household income certificate for means assessment.",
        required: true,
        evidenceType: "income_certificate",
        evidenceLabel: "Income Certificate",
        expectedFacts: ["Annual income", "Issuing authority", "Issue date"],
      },
      {
        id: "bank",
        name: "Bank Account Evidence",
        description: "Bank account proof for disbursement of funds.",
        required: true,
        evidenceType: "bank_proof",
        evidenceLabel: "Bank Passbook / Statement",
        expectedFacts: ["Account holder", "Account number", "Bank name"],
      },
    ],
  },
  {
    id: "housing-assistance",
    name: "Housing Assistance",
    description: "Rental support for low-income households in urban districts.",
    icon: "home",
    eligibility: {
      label: "Household income under ₹3,00,000",
      check: incomeCap(300000, "housing assistance"),
    },
    requirements: [
      {
        id: "identity",
        name: "Identity Verification",
        description: "A government identity document matching the applicant name.",
        required: true,
        evidenceType: "identity_document",
        evidenceLabel: "Aadhaar / National ID",
        expectedFacts: ["Full name", "ID number", "Date of birth"],
      },
      {
        id: "residence",
        name: "Residence Proof",
        description: "Current address proof within the eligible district.",
        required: true,
        evidenceType: "residence_proof",
        evidenceLabel: "Utility Bill",
        expectedFacts: ["Address", "Billing period", "Consumer name"],
      },
      {
        id: "tenancy",
        name: "Tenancy Agreement",
        description: "Registered rental agreement with monthly rent stated.",
        required: true,
        evidenceType: "tenancy_agreement",
        evidenceLabel: "Rental Agreement",
        expectedFacts: ["Landlord", "Monthly rent", "Agreement period"],
      },
      {
        id: "income",
        name: "Income Verification",
        description: "Household income certificate for means assessment.",
        required: true,
        evidenceType: "income_certificate",
        evidenceLabel: "Income Certificate",
        expectedFacts: ["Annual income", "Issuing authority", "Issue date"],
      },
      {
        id: "bank",
        name: "Bank Account Evidence",
        description: "Bank account proof for disbursement of funds.",
        required: true,
        evidenceType: "bank_proof",
        evidenceLabel: "Bank Passbook / Statement",
        expectedFacts: ["Account holder", "Account number", "Bank name"],
      },
    ],
  },
  {
    id: "healthcare-support",
    name: "Healthcare Support",
    description: "Treatment cost assistance for households below the income ceiling.",
    icon: "heart",
    eligibility: {
      label: "Household income under ₹4,00,000",
      check: incomeCap(400000, "healthcare support"),
    },
    requirements: [
      {
        id: "identity",
        name: "Identity Verification",
        description: "A government identity document matching the applicant name.",
        required: true,
        evidenceType: "identity_document",
        evidenceLabel: "Aadhaar / National ID",
        expectedFacts: ["Full name", "ID number", "Date of birth"],
      },
      {
        id: "medical",
        name: "Medical Necessity",
        description: "Hospital treatment estimate or diagnosis summary.",
        required: true,
        evidenceType: "medical_report",
        evidenceLabel: "Hospital Estimate",
        expectedFacts: ["Hospital", "Diagnosis", "Estimated cost"],
      },
      {
        id: "income",
        name: "Income Verification",
        description: "Household income certificate for means assessment.",
        required: true,
        evidenceType: "income_certificate",
        evidenceLabel: "Income Certificate",
        expectedFacts: ["Annual income", "Issuing authority", "Issue date"],
      },
      {
        id: "bank",
        name: "Bank Account Evidence",
        description: "Bank account proof for disbursement of funds.",
        required: true,
        evidenceType: "bank_proof",
        evidenceLabel: "Bank Passbook / Statement",
        expectedFacts: ["Account holder", "Account number", "Bank name"],
      },
    ],
  },
  {
    id: "education-grant",
    name: "Education Grant",
    description: "One-time grant covering tuition and study materials.",
    icon: "book",
    eligibility: {
      label: "Income under ₹2,00,000 and active enrollment",
      check: incomeCap(200000, "education grant"),
    },
    requirements: [
      {
        id: "identity",
        name: "Identity Verification",
        description: "A government identity document matching the applicant name.",
        required: true,
        evidenceType: "identity_document",
        evidenceLabel: "Aadhaar / National ID",
        expectedFacts: ["Full name", "ID number", "Date of birth"],
      },
      {
        id: "enrollment",
        name: "Student Enrollment",
        description: "Proof of current enrollment at a recognised institution.",
        required: true,
        evidenceType: "college_id",
        evidenceLabel: "College ID",
        expectedFacts: ["Institution", "Student ID", "Course", "Enrollment year"],
      },
      {
        id: "fees",
        name: "Fee Structure",
        description: "Institution fee receipt or demand letter for the current term.",
        required: true,
        evidenceType: "fee_receipt",
        evidenceLabel: "Fee Receipt",
        expectedFacts: ["Institution", "Term", "Payable amount"],
      },
      {
        id: "income",
        name: "Income Verification",
        description: "Household income certificate for means assessment.",
        required: true,
        evidenceType: "income_certificate",
        evidenceLabel: "Income Certificate",
        expectedFacts: ["Annual income", "Issuing authority", "Issue date"],
      },
    ],
  },
  {
    id: "employment-benefit",
    name: "Employment Benefit",
    description: "Transitional income support for recently unemployed applicants.",
    icon: "briefcase",
    eligibility: {
      label: "Applicant is not currently in full-time employment",
      check: (profile) =>
        /employ/i.test(profile.employmentStatus) &&
        !/unemploy|seeking|student/i.test(profile.employmentStatus)
          ? {
              ok: false,
              reason:
                "Applicant is recorded as currently employed, which does not satisfy the benefit condition.",
            }
          : {
              ok: true,
              reason: "Applicant is not in full-time employment.",
            },
    },
    requirements: [
      {
        id: "identity",
        name: "Identity Verification",
        description: "A government identity document matching the applicant name.",
        required: true,
        evidenceType: "identity_document",
        evidenceLabel: "Aadhaar / National ID",
        expectedFacts: ["Full name", "ID number", "Date of birth"],
      },
      {
        id: "separation",
        name: "Employment Separation",
        description: "Relieving letter or termination notice from the last employer.",
        required: true,
        evidenceType: "relieving_letter",
        evidenceLabel: "Relieving Letter",
        expectedFacts: ["Employer", "Last working day", "Designation"],
      },
      {
        id: "income",
        name: "Income Verification",
        description: "Latest income statement for benefit calculation.",
        required: true,
        evidenceType: "income_certificate",
        evidenceLabel: "Income Certificate",
        expectedFacts: ["Annual income", "Issuing authority", "Issue date"],
      },
      {
        id: "bank",
        name: "Bank Account Evidence",
        description: "Bank account proof for disbursement of funds.",
        required: true,
        evidenceType: "bank_proof",
        evidenceLabel: "Bank Passbook / Statement",
        expectedFacts: ["Account holder", "Account number", "Bank name"],
      },
    ],
  },
];

export const getScenario = (id: string): Scenario =>
  scenarios.find((s) => s.id === id) ?? scenarios[0]!;
