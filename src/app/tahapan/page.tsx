import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { StageIcon } from "@/components/stage-icon";
import { StageStatusDot } from "@/components/stage-status-dot";
import { getStagesByPhase, phases, totalStages } from "@/lib/data";
import { phaseStyle, phaseSummary } from "@/lib/phase";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tahapan",
  description:
    "Seluruh tahapan kelulusan HES UIN Jakarta dikelompokkan per fase: proposal, skripsi, ujian, dan kelulusan.",
};

export default function TahapanPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={[{ label: "Tahapan" }]} />

      <header className="mt-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Semua tahapan
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {totalStages} tahap dalam empat fase. Setiap halaman memuat
          persyaratan, dokumen, langkah, checklist, tenggat, tips alumni, dan
          template.
        </p>
        <div className="journey-bar mt-6 h-2 w-full rounded-full" aria-hidden />
      </header>

      <div className="mt-10 space-y-12">
        {phases.map((phase) => {
          const style = phaseStyle(phase);
          const inPhase = getStagesByPhase(phase);

          return (
            <section key={phase}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-heading text-xs font-bold tracking-wide uppercase",
                    style.solid,
                  )}
                >
                  {phase}
                </span>
                <p className="text-sm text-muted-foreground">
                  {phaseSummary[phase]}
                </p>
              </div>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {inPhase.map((stage) => (
                  <li key={stage.slug}>
                    <Link
                      href={`/tahapan/${stage.slug}`}
                      className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4"
                    >
                      <span
                        className={cn("absolute inset-x-0 top-0 h-1", style.dot)}
                        aria-hidden
                      />

                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl",
                            style.soft,
                          )}
                        >
                          <StageIcon name={stage.icon} className="size-4.5" />
                        </span>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          Tahap {stage.order}
                        </span>
                        <StageStatusDot slug={stage.slug} className="ml-auto" />
                      </div>

                      <h2 className="mt-3 flex items-center gap-1 font-heading text-base font-semibold">
                        {stage.title}
                        <ChevronRight
                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </h2>

                      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {stage.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
                          <Clock className="size-3" aria-hidden />
                          {stage.estimatedDuration}
                        </span>
                        <span>{stage.checklist.length} langkah</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
