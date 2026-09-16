import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./PageHeader";
import { DemoSelector } from "./DemoSelector";
import { useActiveApplication } from "@/lib/clearpath/store";
import { assess } from "@/lib/clearpath/engine";
import { getScenario } from "@/lib/clearpath/scenarios";
import type { Application, Assessment, Scenario } from "@/lib/clearpath/types";

export function RequireApplication({
  children,
}: {
  children: (ctx: {
    application: Application;
    assessment: Assessment;
    scenario: Scenario;
  }) => ReactNode;
}) {
  const application = useActiveApplication();

  if (!application) {
    return (
      <EmptyState
        icon={<FolderSearch className="size-5" aria-hidden />}
        title="No active application"
        description="Choose a public-service scenario to begin, or load a demo application to explore the full evidence-to-decision chain."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <Link to="/apply">Start an application</Link>
            </Button>
            <DemoSelector />
          </div>
        }
      />
    );
  }

  return (
    <>
      {children({
        application,
        assessment: assess(application),
        scenario: getScenario(application.scenarioId),
      })}
    </>
  );
}
