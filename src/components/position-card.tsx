"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { WizardDialog } from "@/components/wizard-dialog";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { Card, CardContent } from "@/components/ui/card";
import { getStage, totalStages } from "@/lib/data";
import { StageIcon } from "@/components/stage-icon";
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
        <CardContent className="h-40" />
      </Card>
    );
  }

  const progress = stageProgress(currentStage.slug);
  const next = currentStage.nextStage ? getStage(currentStage.nextStage) : null;
  const remaining = totalStages - currentStage.order;

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <StageIcon name={currentStage.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              Posisi kamu
            </p>
            <h2 className="mt-0.5 font-heading text-base font-medium">
              <Link
                href={`/tahapan/${currentStage.slug}`}
                className="hover:underline underline-offset-4"
              >
                {currentStage.title}
              </Link>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tahap {currentStage.order} dari {totalStages} ·{" "}
              {currentStage.estimatedDuration}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {overall.percent}%
          </Badge>
        </div>

        <div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={overall.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progres keseluruhan"
          >
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${overall.percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {progress.done}/{progress.total} langkah di tahap ini
            </span>
            <span>
              {remaining === 0
                ? "Tahap terakhir"
                : `${remaining} tahap lagi menuju selesai`}
            </span>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">
            Yang harus kamu lakukan sekarang
          </p>
          <p className="mt-1 text-sm font-medium">
            {nextAction
              ? nextAction.label
              : `Semua langkah di tahap ini sudah selesai. Lanjut ke ${
                  next ? next.title : "pengambilan ijazah"
                }.`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkButton
            href={`/tahapan/${currentStage.slug}`}
            size="sm"
            className="flex-1"
          >
            Buka tahap ini
            <ArrowRight aria-hidden data-icon="inline-end" />
          </LinkButton>
          <WizardDialog
            label="Bukan di sini?"
            variant="outline"
            size="sm"
            className="flex-1"
          />
        </div>

        {next && (
          <p className="text-xs text-muted-foreground">
            Setelah ini:{" "}
            <Link
              href={`/tahapan/${next.slug}`}
              className="underline underline-offset-3 hover:text-foreground"
            >
              {next.title}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
