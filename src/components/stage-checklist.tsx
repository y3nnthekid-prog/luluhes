"use client";

import { Check, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/types";

/**
 * Checklist tahapan. Tersimpan otomatis di Local Storage — tanpa akun, tanpa login.
 */
export function StageChecklist({ stage }: { stage: Stage }) {
  const { hydrated, isChecked, toggleItem, setStageChecked, stageProgress } =
    useProgress();
  const progress = stageProgress(stage.slug);
  const allDone = progress.done === progress.total && progress.total > 0;

  return (
    <div className="rounded-xl border">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-medium">Checklist tahap ini</p>
          <p className="text-xs text-muted-foreground">
            {hydrated
              ? `${progress.done} dari ${progress.total} selesai · tersimpan otomatis`
              : "Memuat progres…"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setStageChecked(stage.slug, !allDone)}
          disabled={!hydrated}
        >
          {allDone ? (
            <>
              <RotateCcw aria-hidden />
              Kosongkan
            </>
          ) : (
            <>
              <Check aria-hidden />
              Centang semua
            </>
          )}
        </Button>
      </div>

      <div
        className="h-1 w-full bg-muted"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progres ${stage.title}`}
      >
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${hydrated ? progress.percent : 0}%` }}
        />
      </div>

      <ul className="divide-y">
        {stage.checklist.map((item) => {
          const checked = hydrated && isChecked(stage.slug, item.id);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleItem(stage.slug, item.id)}
                  disabled={!hydrated}
                  className="mt-0.5"
                />
                <span
                  className={cn(
                    "text-sm transition-colors",
                    checked && "text-muted-foreground line-through",
                  )}
                >
                  {item.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
