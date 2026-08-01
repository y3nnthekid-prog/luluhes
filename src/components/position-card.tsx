"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { LinkButton } from "@/components/link-button";
import { ProgressRing } from "@/components/progress-ring";
import { StageIcon } from "@/components/stage-icon";
import { WizardDialog } from "@/components/wizard-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getStage, totalStages } from "@/lib/data";
import { phaseStyle } from "@/lib/phase";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * Kartu "Posisi Anda". Menjawab empat pertanyaan inti sekaligus:
 * saya di mana, sejauh apa progresnya, apa yang harus dikerjakan sekarang,
 * dan apa langkah berikutnya.
 */
export function PositionCard({ className }: { className?: string }) {
  const { hydrated, currentStage, stageProgress, overall, nextAction } =
    useProgress();

  if (!hydrated) {
    // Placeholder setinggi kartu asli supaya layout tidak melompat saat hidrasi.
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="h-52" />
      </Card>
    );
  }

  const progress = stageProgress(currentStage.slug);
  const phase = phaseStyle(currentStage.phase);
  const next = currentStage.nextStage ? getStage(currentStage.nextStage) : null;
  const remaining = totalStages - currentStage.order;

  return (
    <Card className={cn("relative overflow-hidden pt-0", className)}>
      {/* Pita fase di tepi atas kartu */}
      <div className={cn("h-1.5 w-full", phase.dot)} aria-hidden />

      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              Posisi kamu
            </p>

            <h2 className="mt-1.5 font-heading text-lg leading-tight font-semibold text-balance">
              <Link
                href={`/tahapan/${currentStage.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {currentStage.title}
              </Link>
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  phase.soft,
                )}
              >
                <StageIcon name={currentStage.icon} className="size-3" />
                {currentStage.phase}
              </span>
              <span className="text-xs text-muted-foreground">
                Tahap {currentStage.order}/{totalStages}
              </span>
            </div>
          </div>

          <ProgressRing
            percent={overall.percent}
            label={`${progress.done}/${progress.total}`}
          />
        </div>

        <div className="rounded-xl bg-brand-soft p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Yang harus kamu lakukan sekarang
          </p>
          <p className="mt-1 text-sm font-medium text-balance">
            {nextAction
              ? nextAction.label
              : `Semua langkah tahap ini selesai. Lanjut ke ${
                  next ? next.title : "pengambilan ijazah"
                }.`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkButton
            href={`/tahapan/${currentStage.slug}`}
            className="flex-1"
          >
            Buka tahap ini
            <ArrowRight aria-hidden data-icon="inline-end" />
          </LinkButton>
          <WizardDialog
            label="Bukan di sini?"
            variant="outline"
            size="default"
            className="flex-1"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {remaining === 0 || !next ? (
            "Ini tahap terakhir."
          ) : (
            <>
              {remaining} tahap lagi. Setelah ini:{" "}
              <Link
                href={`/tahapan/${next.slug}`}
                className="font-medium underline underline-offset-3 hover:text-foreground"
              >
                {next.title}
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
