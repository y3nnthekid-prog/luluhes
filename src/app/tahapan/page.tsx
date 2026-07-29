import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { StageStatusDot } from "@/components/stage-status-dot";
import { Badge } from "@/components/ui/badge";
import { getStagesByPhase, phases, totalStages } from "@/lib/data";
import { StageIcon } from "@/components/stage-icon";

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
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Semua tahapan
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {totalStages} tahap dikelompokkan ke dalam empat fase. Setiap halaman
          tahapan memuat persyaratan, dokumen, langkah, checklist, tenggat, tips
          alumni, dan template.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {phases.map((phase) => (
          <section key={phase}>
            <h2 className="flex items-center gap-2 font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {phase}
            </h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {getStagesByPhase(phase).map((stage) => {
                return (
                  <li key={stage.slug}>
                    <Link
                      href={`/tahapan/${stage.slug}`}
                      className="group flex h-full flex-col rounded-xl border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <StageIcon name={stage.icon} className="size-4" />
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          Tahap {stage.order}
                        </span>
                        <StageStatusDot slug={stage.slug} className="ml-auto" />
                      </div>

                      <h3 className="mt-3 flex items-center gap-1 font-heading font-medium">
                        {stage.title}
                        <ChevronRight
                          className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </h3>

                      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {stage.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Clock aria-hidden />
                          {stage.estimatedDuration}
                        </Badge>
                        <Badge variant="ghost" className="text-muted-foreground">
                          {stage.checklist.length} langkah
                        </Badge>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
