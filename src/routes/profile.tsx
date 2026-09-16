import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/clearpath/AppShell";
import { PageHeader } from "@/components/clearpath/PageHeader";
import { ProgressStepper } from "@/components/clearpath/ProgressStepper";
import { RequireApplication } from "@/components/clearpath/RequireApplication";
import { DemoSelector } from "@/components/clearpath/DemoSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { updateProfile } from "@/lib/clearpath/store";
import type { ApplicantProfile } from "@/lib/clearpath/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Applicant profile — ClearPath" },
      {
        name: "description",
        content:
          "The declared applicant information ClearPath assesses evidence against: personal, academic, financial and contact details.",
      },
      { property: "og:title", content: "Applicant profile — ClearPath" },
      {
        property: "og:description",
        content: "Declared applicant information used as the baseline for evidence assessment.",
      },
    ],
  }),
  component: ProfilePage,
});

type FieldKey = keyof ApplicantProfile;

const groups: { id: string; title: string; hint: string; fields: [FieldKey, string][] }[] = [
  {
    id: "personal",
    title: "Personal information",
    hint: "Identity details checked against submitted identity evidence.",
    fields: [
      ["fullName", "Full name"],
      ["applicantId", "Applicant ID"],
      ["dateOfBirth", "Date of birth"],
      ["gender", "Gender"],
      ["nationality", "Nationality"],
    ],
  },
  {
    id: "academic",
    title: "Academic / employment information",
    hint: "Used for enrollment, academic-score and employment conditions.",
    fields: [
      ["institution", "Institution"],
      ["programme", "Programme"],
      ["academicScore", "Academic score"],
      ["employmentStatus", "Employment status"],
    ],
  },
  {
    id: "financial",
    title: "Financial information",
    hint: "Declared figures. Conflicts with submitted evidence are flagged automatically.",
    fields: [
      ["annualIncome", "Annual income"],
      ["householdSize", "Household size"],
      ["bankName", "Bank"],
    ],
  },
  {
    id: "contact",
    title: "Contact information",
    hint: "Used for evidence requests and reviewer correspondence.",
    fields: [
      ["email", "Email"],
      ["phone", "Phone"],
      ["address", "Address"],
    ],
  },
];

function ProfilePage() {
  return (
    <AppShell toolbar={<><ProgressStepper current={1} /><DemoSelector /></>}>
      <RequireApplication>
        {({ application, scenario }) => <ProfileBody application={application} scenarioName={scenario.name} />}
      </RequireApplication>
    </AppShell>
  );
}

function ProfileBody({
  application,
  scenarioName,
}: {
  application: { id: string; profile: ApplicantProfile };
  scenarioName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ApplicantProfile>(application.profile);

  const save = () => {
    updateProfile(application.id, draft);
    setEditing(false);
    toast.success("Applicant information updated", {
      description: "The assessment has been recalculated.",
    });
  };

  const profile = editing ? draft : application.profile;

  return (
    <>
      <PageHeader
        eyebrow="Step 01 · Profile"
        title={application.profile.fullName}
        description={`${scenarioName} · Applicant ${application.profile.applicantId}. Declared information forms the baseline every piece of evidence is compared against.`}
        actions={
          editing ? (
            <Button size="sm" onClick={save}>
              <Save className="size-3.5" aria-hidden /> Save changes
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => { setDraft(application.profile); setEditing(true); }}>
                <Pencil className="size-3.5" aria-hidden /> Edit information
              </Button>
              <Button size="sm" asChild>
                <Link to="/evidence">
                  Continue to evidence <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Button>
            </>
          )
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Scenario", value: scenarioName },
          { label: "Programme", value: profile.programme },
          { label: "Annual income", value: profile.annualIncome },
          { label: "Academic score", value: profile.academicScore },
        ].map((stat) => (
          <div key={stat.label} className="panel p-4">
            <p className="eyebrow">{stat.label}</p>
            <p className="mt-2 text-base font-medium text-foreground">{stat.value}</p>
          </div>
        ))}
      </section>

      <Accordion type="multiple" defaultValue={["personal", "financial"]} className="grid gap-3">
        {groups.map((group) => (
          <AccordionItem key={group.id} value={group.id} className="panel border-none px-5">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-left">
                <span className="block text-sm font-semibold text-foreground">{group.title}</span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {group.hint}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                {group.fields.map(([key, label]) => (
                  <div key={key}>
                    {editing ? (
                      <>
                        <Label htmlFor={key} className="text-xs text-muted-foreground">
                          {label}
                        </Label>
                        <Input
                          id={key}
                          value={draft[key]}
                          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                          className="mt-1.5 bg-background/60"
                        />
                      </>
                    ) : (
                      <>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 text-sm text-foreground">{profile[key]}</dd>
                      </>
                    )}
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
