import { useSyncExternalStore } from "react";
import type { Application, EvidenceItem, ReviewEvent } from "./types";
import { getScenario } from "./scenarios";
import {
  buildDemoApplication,
  makeEvidence,
  priyaProfile,
  seedQueue,
  type DemoKey,
} from "./demo";

export type ClearPathState = {
  applications: Application[];
  activeId: string | null;
  demoMode: boolean;
};

const initial = (): ClearPathState => {
  const queue = seedQueue();
  return { applications: queue, activeId: null, demoMode: false };
};

let state: ClearPathState = initial();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const set = (next: Partial<ClearPathState>) => {
  state = { ...state, ...next };
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useClearPath<T>(selector: (s: ClearPathState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export const getState = () => state;

export const getApplication = (id: string | null) =>
  state.applications.find((a) => a.id === id) ?? null;

export function useActiveApplication() {
  return useClearPath((s) => s.applications.find((a) => a.id === s.activeId) ?? null);
}

const logEvent = (actor: string, action: string, detail: string): ReviewEvent => ({
  id: Math.random().toString(36).slice(2, 9),
  at: new Date().toISOString(),
  actor,
  action,
  detail,
});

const updateApp = (id: string, updater: (app: Application) => Application) =>
  set({
    applications: state.applications.map((a) => (a.id === id ? updater(a) : a)),
  });

export function startApplication(scenarioId: string): string {
  const id = `APP-${Math.floor(4500 + Math.random() * 400)}`;
  const app: Application = {
    id,
    scenarioId,
    profile: priyaProfile,
    evidence: [],
    createdAt: new Date().toISOString(),
    reviewLog: [logEvent("System", "Application created", `Scenario: ${getScenario(scenarioId).name}`)],
  };
  set({ applications: [app, ...state.applications], activeId: id, demoMode: false });
  return id;
}

export function loadDemo(key: DemoKey, scenarioId = "student-scholarship"): string {
  const app = buildDemoApplication(key, scenarioId);
  app.reviewLog = [logEvent("System", "Demo scenario loaded", `Preset: ${key}`)];
  set({ applications: [app, ...state.applications], activeId: app.id, demoMode: true });
  return app.id;
}

export function setActive(id: string | null) {
  set({ activeId: id });
}

export function attachEvidence(
  appId: string,
  requirementId: string,
  variant: "verified" | "low" | "partial" | "conflict" = "verified",
) {
  const app = getApplication(appId);
  if (!app) return;
  const def = getScenario(app.scenarioId).requirements.find((r) => r.id === requirementId);
  if (!def) return;
  const item = makeEvidence(requirementId, def.evidenceType, variant);
  updateApp(appId, (a) => ({
    ...a,
    evidence: [...a.evidence.filter((e) => e.requirementId !== requirementId), item],
    reviewLog: [
      logEvent("Applicant", "Evidence submitted", `${item.documentName} attached to ${def.name}`),
      ...a.reviewLog,
    ],
  }));
}

export function requestReview(appId: string, requirementId: string) {
  const app = getApplication(appId);
  if (!app) return;
  const def = getScenario(app.scenarioId).requirements.find((r) => r.id === requirementId);
  updateApp(appId, (a) => ({
    ...a,
    reviewLog: [
      logEvent(
        "Applicant",
        "Human review requested",
        `Manual verification requested for ${def?.name ?? requirementId}`,
      ),
      ...a.reviewLog,
    ],
  }));
}

export type ReviewerAction =
  | "CONFIRM_EVIDENCE"
  | "REQUEST_NEW_EVIDENCE"
  | "REJECT_EVIDENCE"
  | "ESCALATE"
  | "RESOLVE_REVIEW";

export function reviewerAction(
  appId: string,
  action: ReviewerAction,
  requirementId?: string,
): string {
  const app = getApplication(appId);
  if (!app) return "";
  const def = requirementId
    ? getScenario(app.scenarioId).requirements.find((r) => r.id === requirementId)
    : undefined;
  const label = def?.name ?? "application";

  const mapEvidence = (fn: (e: EvidenceItem) => EvidenceItem) =>
    app.evidence.map((e) => (!requirementId || e.requirementId === requirementId ? fn(e) : e));

  let detail = "";
  let evidence = app.evidence;

  switch (action) {
    case "CONFIRM_EVIDENCE":
      evidence = mapEvidence((e) => ({
        ...e,
        reviewerConfirmed: true,
        conflict: undefined,
        issue: undefined,
        status: "VERIFIED",
        confidence: Math.max(e.confidence, 0.92),
        updatedAt: new Date().toISOString(),
      }));
      detail = `Reviewer confirmed the original document for ${label}.`;
      break;
    case "REJECT_EVIDENCE":
      evidence = app.evidence.filter((e) => requirementId && e.requirementId !== requirementId);
      detail = `Reviewer rejected the evidence for ${label}; the requirement is now unsupported.`;
      break;
    case "REQUEST_NEW_EVIDENCE":
      evidence = mapEvidence((e) => ({
        ...e,
        status: "NEEDS_REVIEW",
        confidence: Math.min(e.confidence, 0.45),
        issue: "Reviewer requested a replacement document from the applicant.",
        updatedAt: new Date().toISOString(),
      }));
      detail = `Reviewer requested new evidence for ${label}.`;
      break;
    case "ESCALATE":
      detail = "Application escalated to a senior assessment officer.";
      break;
    case "RESOLVE_REVIEW":
      evidence = app.evidence.map((e) => ({
        ...e,
        reviewerConfirmed: true,
        conflict: undefined,
        issue: undefined,
        status: "VERIFIED",
        confidence: Math.max(e.confidence, 0.92),
      }));
      detail = "Reviewer resolved all open review items on this application.";
      break;
  }

  updateApp(appId, (a) => ({
    ...a,
    evidence,
    escalated: action === "ESCALATE" ? true : a.escalated,
    reviewLog: [logEvent("Reviewer · A. Nair", action.replace(/_/g, " ").toLowerCase(), detail), ...a.reviewLog],
  }));

  return detail;
}

export function resetDemoData() {
  state = initial();
  emit();
}
