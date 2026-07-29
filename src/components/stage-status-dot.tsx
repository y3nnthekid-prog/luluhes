"use client";

import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

/** Penanda ringkas status sebuah tahap: posisi sekarang, berjalan, atau selesai. */
export function StageStatusDot({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { hydrated, currentStage, stageProgress } = useProgress();
  if (!hydrated) return null;

  const progress = stageProgress(slug);
  const isCurrent = currentStage.slug === slug;

  if (isCurrent) {
    return (
      <Badge className={cn("bg-brand text-brand-foreground", className)}>
        Posisi kamu
      </Badge>
    );
  }

  if (progress.status === "selesai") {
    return (
      <Badge
        variant="outline"
        className={cn("border-brand/30 bg-brand/10 text-brand", className)}
      >
        Selesai
      </Badge>
    );
  }

  if (progress.status === "berjalan") {
    return (
      <Badge
        variant="outline"
        className={cn("text-muted-foreground tabular-nums", className)}
      >
        {progress.done}/{progress.total}
      </Badge>
    );
  }

  return null;
}
