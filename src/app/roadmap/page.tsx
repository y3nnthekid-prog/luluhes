import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { Reveal } from "@/components/reveal";
import { PositionCard } from "@/components/position-card";
import { Roadmap } from "@/components/roadmap";
import { WizardDialog } from "@/components/wizard-dialog";
import { phases, getStagesByPhase, totalStages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Peta lengkap tahapan kelulusan mahasiswa Hukum Ekonomi Syariah UIN Jakarta, dari persiapan proposal sampai pengambilan ijazah.",
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={[{ label: "Roadmap" }]} />

      <Reveal as="section" className="mt-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Roadmap kelulusan
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {totalStages} tahap yang harus kamu lewati. Klik tahap mana pun untuk
          melihat persyaratan, dokumen, langkah, dan tenggatnya.
        </p>
        <div className="mt-5">
          <WizardDialog size="default" />
        </div>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Reveal delay={120} className="order-2 lg:order-1">
          <Roadmap />
        </Reveal>

        <aside className="order-1 space-y-4 lg:sticky lg:top-20 lg:order-2">
          <PositionCard />

          <div className="rounded-xl border p-4">
            <h2 className="font-heading text-sm font-medium">Fase perjalanan</h2>
            <ul className="mt-3 space-y-2.5">
              {phases.map((phase) => {
                const inPhase = getStagesByPhase(phase);
                return (
                  <li key={phase} className="flex justify-between text-sm">
                    <span>{phase}</span>
                    <span className="text-muted-foreground tabular-nums">
                      Tahap {inPhase[0].order}–{inPhase[inPhase.length - 1].order}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
