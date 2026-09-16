# ClearPath — From Evidence to Decision

An evidence intelligence platform for public-service applications. ClearPath turns declared
applicant information plus supporting evidence into an **explainable decision**: what has been
established, what cannot yet be established, what is contradictory, why the application is in its
current state, and the single most useful next action.

> All applicants, documents and detected values in this prototype are fictional demonstration data.

## Problem

Government and public-service applications require citizens to prove they satisfy a set of
conditions using personal information and supporting documents. Applicants often do not know what
evidence is required, whether what they submitted is sufficient, or why their application cannot
proceed. Reviewers must manually inspect several pieces of information before deciding whether an
application can move forward.

## Problem analysis

- **Requirements are invisible.** Applicants see a form, not the conditions the form tests.
- **Outcomes are opaque.** "Rejected" or "pending" says nothing about which condition failed.
- **Evidence quality is treated as binary.** A document can be present yet unreadable, incomplete,
  or in direct contradiction with declared information.
- **Human review is unstructured.** Reviewers receive documents without the reasoning that made the
  case unresolvable.

## Solution

ClearPath makes the reasoning chain itself the product:

```
Applicant information → Evidence → Assessment → Explanation → Decision → Next action → Human review
```

Every requirement carries its evidence, detected facts, confidence, issue, explanation and next
action. The decision is derived from those requirement outcomes and always states its own basis.

## Key features

- Five real-world scenarios, each with its own requirement set and eligibility condition.
- Evidence Vault with per-document status, confidence, detected facts and issues.
- **Evidence Chain** — the interactive signature view linking applicant → requirement → evidence.
- Requirement matrix with a per-row reason.
- Readiness score kept explicitly separate from the eligibility decision.
- "Why this decision?" panel enumerating the blockers.
- Ranked Next Best Action with an explicit impact and rationale.
- Conflict detection between declared and detected values, auto-routed to human review.
- Reviewer queue and reviewer detail with confirm / request / reject / escalate / resolve actions and
  a live audit trail.
- Demo mode with four fully populated outcomes.
- Simulated seven-step document-processing pipeline.

## User journey

1. **Landing** — the promise and the chain in one screen.
2. **Scenario selection** (`/apply`) — pick what you are applying for.
3. **Profile** (`/profile`) — grouped declared information, editable.
4. **Evidence** (`/evidence`) — vault plus evidence chain; upload, replace, request review.
5. **Assessment** (`/assessment`) — readiness, requirement matrix, chain.
6. **Decision** (`/decisions`) — decision card, why-this-decision, next best action.
7. **Reviewer** (`/review`, `/review/$appId`) — inspect and resolve unresolved cases.

## Evidence Chain

The applicant node branches into each requirement, and each requirement resolves to a document node
carrying a status. Selecting a requirement opens a detail panel showing evidence, detected facts,
confidence, status, issue, explanation and next action — the visual bridge between evidence and
decision.

## Reasoning engine

`src/lib/clearpath/engine.ts` is deterministic and dependency-free. Per requirement:

```ts
{
  id: "income",
  name: "Income Verification",
  required: true,
  evidence: "income_certificate",
  status: "NEEDS_REVIEW",
  confidence: 0.43,
  issue: "Document text partially unreadable",
  explanation: "The income value could not be reliably established.",
  nextAction: "Upload a clearer certificate or request reviewer verification.",
}
```

Resolution order: reviewer-confirmed → conflict → confidence below 0.6 → incomplete fact set →
verified. Readiness is a weighted completeness measure (verified 1.0, partial 0.5, needs review 0.4,
conflict 0.3, missing 0), never the decision itself.

## Decision states

| State | Trigger |
| --- | --- |
| `CONFLICT_DETECTED` | A detected value contradicts declared information |
| `NOT_ELIGIBLE` | A scenario condition itself is unmet (income ceiling, score threshold) |
| `NEEDS_INFORMATION` | A required condition has no evidence |
| `NEEDS_HUMAN_REVIEW` | Evidence exists but cannot be resolved confidently |
| `READY_TO_PROCEED` | All required conditions established |

Each state reports what was established, what is not, what is problematic, why, and what happens next.

## Reviewer workflow

The queue lists every application whose state needs intervention with the blocking issue, average
confidence and age. In the detail view a reviewer applies an action per open requirement; the state
recomputes immediately and the transition (for example `NEEDS_HUMAN_REVIEW → READY_TO_PROCEED`) is
confirmed on screen and appended to the audit trail.

## Architecture

```
src/lib/clearpath/
  types.ts       data models
  scenarios.ts   scenario + requirement definitions, eligibility rules
  demo.ts        document catalogue, evidence factory, demo presets, seeded queue
  engine.ts      deterministic reasoning engine
  store.ts       tiny observable store (useSyncExternalStore) + mutations
src/components/clearpath/   AppShell, EvidenceCard, EvidenceChain, RequirementMatrix,
                            DecisionPanels, ConfidenceMeter, StatusBadge, DemoSelector, …
src/routes/                 landing, apply, profile, evidence, assessment, decisions,
                            overview, applications, review, review/$appId, settings
```

No backend is required: state lives in memory, which keeps the demo instant and offline-safe.

## Technology stack

React 19 · TypeScript · TanStack Start / Router · Tailwind CSS v4 · shadcn/ui · Lucide · Motion ·
Sonner.

## Demo scenarios

| Preset | Outcome |
| --- | --- |
| Complete application | `READY_TO_PROCEED`, all conditions established at 96% |
| Missing evidence | `NEEDS_INFORMATION`, bank proof absent + income unreadable |
| Conflict detected | `CONFLICT_DETECTED`, declared ₹1,20,000 vs detected ₹2,80,000 |
| Human review required | `NEEDS_HUMAN_REVIEW`, evidence present but low confidence |

## Installation

```bash
bun install
```

## Environment variables

None are required. Optional AI wording assistance is behind a toggle in Settings and the app runs
fully without any key.

## Local development

```bash
bun run dev      # http://localhost:8080
bun run build    # production build
bun run lint
```

## Deployment

Deployed via Lovable (Publish). The build output targets an edge runtime; no database or secret is
needed.

## AI usage

AI is optional and non-authoritative: it may only reword explanations, summaries and next-action
copy. All statuses, conflicts and decisions come from the deterministic engine, so a missing provider
can never break the demo.

## Future improvements

- Real OCR / document classification with confidence taken from the extractor.
- Persistence and authentication for multi-session applicant and reviewer accounts.
- Requirement definitions authored by programme owners rather than hard-coded.
- Notification and evidence-request loop back to the applicant.
- Reviewer analytics: time-to-resolution, conflict frequency per document type.
