import { StatusBadge } from "./StatusBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import type { AssessedRequirement } from "@/lib/clearpath/types";

export function RequirementMatrix({ requirements }: { requirements: AssessedRequirement[] }) {
  return (
    <section className="panel overflow-hidden" aria-label="Requirement matrix">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
          Requirement matrix
        </h2>
        <span className="num text-xs text-muted-foreground">
          {requirements.filter((r) => r.status === "VERIFIED").length}/{requirements.length} established
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-medium">Requirement</th>
              <th scope="col" className="px-5 py-3 font-medium">Evidence</th>
              <th scope="col" className="w-32 px-5 py-3 font-medium">Confidence</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((r) => (
              <tr key={r.id} className="border-b border-border/70 last:border-0 align-top">
                <th scope="row" className="px-5 py-4 font-medium text-foreground">{r.name}</th>
                <td className="px-5 py-4 text-muted-foreground">
                  {r.status === "MISSING" ? "—" : r.evidence?.documentName}
                </td>
                <td className="px-5 py-4">
                  <ConfidenceMeter value={r.confidence} compact />
                </td>
                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                <td className="max-w-sm px-5 py-4 text-xs leading-relaxed text-muted-foreground">
                  {r.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {requirements.map((r) => (
          <li key={r.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{r.name}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.status === "MISSING" ? "No evidence" : r.evidence?.documentName}
            </p>
            <div className="mt-3"><ConfidenceMeter value={r.confidence} /></div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{r.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
