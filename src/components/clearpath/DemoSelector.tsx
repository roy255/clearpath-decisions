import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PlayCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { demoPresets, type DemoKey } from "@/lib/clearpath/demo";
import { loadDemo } from "@/lib/clearpath/store";

export function DemoSelector({
  trigger,
}: {
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<DemoKey | null>(null);
  const navigate = useNavigate();

  const run = (key: DemoKey) => {
    setLoading(key);
    setTimeout(() => {
      loadDemo(key);
      setLoading(null);
      setOpen(false);
      toast.success("Demo scenario loaded", {
        description: demoPresets.find((p) => p.key === key)?.title,
      });
      navigate({ to: "/assessment" });
    }, 420);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Sparkles className="size-3.5" aria-hidden /> Demo mode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="panel max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle>Demo mode</DialogTitle>
          <DialogDescription>
            Load a fully populated application to see the reasoning chain end to end. Demo data only.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2.5">
          {demoPresets.map((preset, i) => (
            <li key={preset.key}>
              <button
                type="button"
                onClick={() => run(preset.key)}
                disabled={loading !== null}
                className="w-full rounded-lg border border-border bg-background/40 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="num text-xs text-primary">0{i + 1}</span>
                    <span className="text-sm font-medium text-foreground">{preset.title}</span>
                  </span>
                  <span className="num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {loading === preset.key ? "Loading…" : preset.outcome}
                  </span>
                </div>
                <p className="mt-1.5 pl-8 text-xs text-muted-foreground">{preset.description}</p>
              </button>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <PlayCircle className="size-3.5" aria-hidden />
          Each preset recomputes decisions through the same deterministic engine.
        </p>
      </DialogContent>
    </Dialog>
  );
}
