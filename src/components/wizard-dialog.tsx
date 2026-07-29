"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, RotateCcw } from "lucide-react";

import wizardJson from "@/data/wizard.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStage, stages } from "@/lib/data";
import { StageIcon } from "@/components/stage-icon";
import { useProgress } from "@/lib/progress";

type WizardQuestion = {
  question: string;
  hint: string;
  /** Slug tahapan jika jawabannya "belum". */
  ifNo: string;
};

const questions = wizardJson as WizardQuestion[];

/** Semua pertanyaan dijawab "sudah" berarti tinggal mengambil ijazah. */
const finalStage = stages[stages.length - 1].slug;

export function WizardDialog({
  label = "Saya sedang di tahap mana?",
  variant = "default",
  size = "lg",
  className,
}: {
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [result, setResult] = React.useState<string | null>(null);
  const { pinStage } = useProgress();
  const router = useRouter();

  function restart() {
    setStep(0);
    setResult(null);
  }

  function answer(yes: boolean) {
    if (!yes) {
      setResult(questions[step].ifNo);
      return;
    }
    if (step + 1 >= questions.length) {
      setResult(finalStage);
      return;
    }
    setStep(step + 1);
  }

  function openChange(next: boolean) {
    setOpen(next);
    if (!next) restart();
  }

  function goToStage(slug: string) {
    pinStage(slug);
    setOpen(false);
    restart();
    router.push(`/tahapan/${slug}`);
  }

  const stage = result ? getStage(result) : undefined;
  const current = questions[step];

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Compass aria-hidden />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="sm:max-w-md">
          {stage ? (
            <>
              <DialogHeader>
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <StageIcon name={stage.icon} className="size-5" />
                </div>
                <DialogTitle className="text-lg">
                  Kamu ada di tahap {stage.order}
                </DialogTitle>
                <DialogDescription>{stage.title}</DialogDescription>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">{stage.goal}</p>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  Yang harus kamu lakukan sekarang
                </p>
                <p className="mt-1 font-medium">{stage.steps[0].title}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => goToStage(stage.slug)}
                >
                  Buka tahap ini
                  <ArrowRight aria-hidden data-icon="inline-end" />
                </Button>
                <Button variant="outline" size="lg" onClick={restart}>
                  <RotateCcw aria-hidden />
                  Ulangi
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">
                  Saya sedang di tahap mana?
                </DialogTitle>
                <DialogDescription>
                  Jawab beberapa pertanyaan singkat. Pertanyaan{" "}
                  {step + 1} dari maksimal {questions.length}.
                </DialogDescription>
              </DialogHeader>

              {/* Indikator langkah */}
              <div className="flex gap-1" aria-hidden>
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-1 flex-1 rounded-full " +
                      (i <= step ? "bg-brand" : "bg-muted")
                    }
                  />
                ))}
              </div>

              <div>
                <p className="font-heading text-base font-medium">
                  {current.question}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {current.hint}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => answer(true)}
                >
                  Sudah
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => answer(false)}
                >
                  Belum
                </Button>
              </div>

              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground"
                >
                  Kembali ke pertanyaan sebelumnya
                </button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
