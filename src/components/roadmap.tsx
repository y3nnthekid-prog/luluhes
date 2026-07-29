"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { stages } from "@/lib/data";
import { StageIcon } from "@/components/stage-icon";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * Peta perjalanan kelulusan. Setiap node bisa diklik, node aktif disorot,
 * dan node yang checklist-nya tuntas ditandai selesai.
 */
export function Roadmap({ compact = false }: { compact?: boolean }) {
  const { hydrated, currentStage, stageProgress } = useProgress();
  const reduceMotion = useReducedMotion();

  return (
    <ol className="relative">
      {stages.map((stage, i) => {
        const progress = stageProgress(stage.slug);
        const isCurrent = hydrated && stage.slug === currentStage.slug;
        const isDone = hydrated && progress.status === "selesai";
        const isLast = i === stages.length - 1;

        return (
          <motion.li
            key={stage.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
            className="relative pl-11 sm:pl-14"
          >
            {/* Rel penghubung antar node */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-9 bottom-0 left-[15px] w-px sm:left-[19px]",
                  isDone ? "bg-brand/40" : "bg-border",
                )}
              />
            )}

            <span
              aria-hidden
              className={cn(
                "absolute top-2 left-0 flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-colors sm:size-10",
                isDone && "border-brand bg-brand text-brand-foreground",
                isCurrent &&
                  !isDone &&
                  "border-brand bg-brand/10 text-brand ring-4 ring-brand/15",
                !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="size-4" />
              ) : (
                <StageIcon name={stage.icon} className="size-4" />
              )}
            </span>

            <Link
              href={`/tahapan/${stage.slug}`}
              className={cn(
                "group -mx-2 mb-1 block rounded-xl px-2 py-2 transition-colors hover:bg-muted/60",
                isLast ? "pb-2" : compact ? "pb-4" : "pb-6",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  Tahap {stage.order}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {stage.phase}
                </span>
                {isCurrent && (
                  <Badge className="ml-1 gap-1 bg-brand text-brand-foreground">
                    <MapPin aria-hidden />
                    Posisi kamu
                  </Badge>
                )}
              </div>

              <h3 className="mt-0.5 flex items-center gap-1.5 font-heading font-medium">
                {stage.title}
                <ChevronRight
                  className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </h3>

              {!compact && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {stage.description}
                </p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{stage.estimatedDuration}</span>
                {hydrated && progress.done > 0 && (
                  <span
                    className={cn(
                      "tabular-nums",
                      isDone && "font-medium text-brand",
                    )}
                  >
                    {isDone
                      ? "Selesai"
                      : `${progress.done}/${progress.total} langkah`}
                  </span>
                )}
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ol>
  );
}
