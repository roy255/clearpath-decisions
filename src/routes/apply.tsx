import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Book, Briefcase, GraduationCap, Heart, Home, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/lib/clearpath/scenarios";
import { startApplication } from "@/lib/clearpath/store";
import { toast } from "sonner";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Choose a scenario — ClearPath" },
      {
        name: "description",
        content:
          "Select a public-service scenario — scholarship, housing, healthcare, education grant or employment benefit — and ClearPath loads its requirements.",
      },
      { property: "og:title", content: "Choose a scenario — ClearPath" },
      {
        property: "og:description",
        content: "Five real-world public-service scenarios, each with its own requirement set.",
      },
    ],
  }),
  component: ScenarioSelection,
});

const icons: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  home: Home,
  heart: Heart,
  book: Book,
  briefcase: Briefcase,
};

function ScenarioSelection() {
  const navigate = useNavigate();

  const start = (scenarioId: string, name: string) => {
    startApplication(scenarioId);
    toast.success("Application started", { description: name });
    navigate({ to: "/profile" });
  };

  return (
    <AppShell toolbar={<DemoSelector />}>
      <PageHeader
        eyebrow="Step 00 · Scenario"
        title="What are you applying for?"
        description="Each scenario carries its own conditions and evidence requirements. ClearPath assesses only what that scenario actually requires."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario, i) => {
          const Icon = icons[scenario.icon] ?? GraduationCap;
          return (
            <motion.article
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="panel flex flex-col p-5"
            >
              <span className="grid size-10 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">{scenario.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {scenario.description}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                <div>
                  <dt className="text-muted-foreground">Requirements</dt>
                  <dd className="num mt-0.5 text-foreground">{scenario.requirements.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Evidence items</dt>
                  <dd className="num mt-0.5 text-foreground">
                    {scenario.requirements.filter((r) => r.required).length}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Condition: {scenario.eligibility.label}
              </p>
              <Button
                className="mt-5 w-full"
                onClick={() => start(scenario.id, scenario.name)}
              >
                Start
              </Button>
            </motion.article>
          );
        })}
      </div>
    </AppShell>
  );
}
