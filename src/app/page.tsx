import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  FileText,
  FolderDown,
  ListChecks,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { LinkButton } from "@/components/link-button";
import { PositionCard } from "@/components/position-card";
import { Roadmap } from "@/components/roadmap";
import { StageIcon } from "@/components/stage-icon";
import { WizardDialog } from "@/components/wizard-dialog";
import {
  downloads,
  getStagesByPhase,
  phases,
  schedule,
  site,
  totalStages,
} from "@/lib/data";
import { phaseStyle, phaseSummary } from "@/lib/phase";
import { cn } from "@/lib/utils";

const questions = [
  {
    icon: MapPin,
    question: "Saya di mana?",
    answer:
      "Roadmap dan kartu posisi menunjukkan tahap kamu sekarang dari 12 tahap.",
  },
  {
    icon: ListChecks,
    question: "Sekarang ngapain?",
    answer: "Tiap tahap punya langkah berurutan dan checklist yang auto-tersimpan.",
  },
  {
    icon: FolderDown,
    question: "Butuh dokumen apa?",
    answer: "Template dikelompokkan per tahap, bukan dicampur jadi satu tumpukan.",
  },
  {
    icon: ArrowRight,
    question: "Habis ini apa?",
    answer: "Tiap halaman selalu menutup dengan tahap sesudahnya. Tidak pernah buntu.",
  },
];

export default function HomePage() {
  const readyTemplates = downloads.filter((d) => d.url !== null).length;

  return (
    <div>
      {/* Hero */}
      <section className="px-4 pt-4">
        <div className="grain relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-11 surface-brand sm:px-10 sm:py-20">
          <p className="relative z-1 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
            <span className="size-1.5 rounded-full bg-lime" aria-hidden />
            {site.program} · {site.faculty}
          </p>

          <h1 className="relative z-1 mt-5 max-w-2xl font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
            Berhenti menebak-nebak alur kelulusanmu.
          </h1>

          <p className="relative z-1 mt-5 max-w-lg text-base text-white/80 text-pretty sm:text-lg">
            Dari persiapan proposal sampai ijazah di tangan — satu alur runtut,
            lengkap dengan tenggat resmi yang paling sering bikin mahasiswa
            mengulang.
          </p>

          <div className="relative z-1 mt-8 flex flex-col gap-2.5 sm:flex-row">
            <WizardDialog className="bg-lime text-lime-foreground hover:bg-lime/85" />
            <LinkButton
              href="/roadmap"
              size="lg"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
              variant="outline"
            >
              Lihat roadmap
              <ArrowRight aria-hidden data-icon="inline-end" />
            </LinkButton>
          </div>

          {/* Angka ringkas */}
          <dl className="relative z-1 mt-8 flex flex-wrap gap-x-7 gap-y-4">
            {[
              { label: "Tahapan", value: totalStages },
              { label: "Template", value: downloads.length },
              { label: "Siap unduh", value: readyTemplates },
              { label: "Perlu akun", value: "Tidak" },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="font-heading text-3xl leading-none font-bold tabular-nums">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-white/70">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Posisi pengguna + empat pertanyaan */}
        <section className="grid gap-6 py-14 lg:grid-cols-[22rem_1fr] lg:items-start">
          <PositionCard />

          <div className="lg:pt-2">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">
              Empat pertanyaan yang selalu dijawab
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Kalau setelah membaca satu halaman kamu masih harus bertanya ke
              senior, berarti halaman itu belum cukup baik.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {questions.map(({ icon: Icon, question, answer }) => (
                <div
                  key={question}
                  className="card-lift rounded-2xl border bg-card p-4"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-heading text-sm font-semibold">
                    {question}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Siklus ujian bulanan */}
        <section className="border-t py-14">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sun text-sun-foreground">
              <CalendarClock className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                {schedule.heading}
              </h2>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {schedule.intro}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {schedule.exams.map((exam) => (
              <div
                key={exam.id}
                className="card-lift flex flex-col rounded-2xl border bg-card p-4"
              >
                <h3 className="font-heading text-sm font-semibold">
                  {exam.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {exam.schedulePattern}
                </p>
                <p className="mt-3 rounded-lg bg-sun/20 px-2.5 py-1.5 text-xs font-medium text-sun-foreground dark:text-sun">
                  Tenggat: {exam.deadlinePattern}
                </p>
                <a
                  href={exam.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline"
                >
                  Buka form pendaftaran
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-xl border border-warn/30 bg-warn-muted p-3 text-xs text-foreground/80">
            {schedule.warning}
          </p>
        </section>

        {/* Fase perjalanan */}
        <section className="border-t py-14">
          <h2 className="font-heading text-xl font-semibold sm:text-2xl">
            Empat fase perjalanan
          </h2>
          <div className="journey-bar mt-4 h-2 w-full rounded-full" aria-hidden />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((phase) => {
              const style = phaseStyle(phase);
              const inPhase = getStagesByPhase(phase);
              return (
                <div
                  key={phase}
                  className="card-lift relative overflow-hidden rounded-2xl border bg-card p-4"
                >
                  <span
                    className={cn("absolute inset-x-0 top-0 h-1", style.dot)}
                    aria-hidden
                  />
                  <div className="flex -space-x-1.5">
                    {inPhase.map((stage) => (
                      <span
                        key={stage.slug}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg ring-2 ring-card",
                          style.soft,
                        )}
                      >
                        <StageIcon name={stage.icon} className="size-3.5" />
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-3 font-heading text-sm font-semibold">
                    {phase}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {phaseSummary[phase]}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                    Tahap {inPhase[0].order}–{inPhase[inPhase.length - 1].order}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roadmap ringkas */}
        <section className="border-t py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">
              Perjalananmu
            </h2>
            <LinkButton href="/roadmap" variant="outline" size="sm">
              Roadmap lengkap
              <ArrowRight aria-hidden data-icon="inline-end" />
            </LinkButton>
          </div>

          <div className="mt-8">
            <Roadmap compact />
          </div>
        </section>

        {/* Dasar informasi */}
        <section className="border-t py-14">
          <div className="grain relative overflow-hidden rounded-3xl p-6 surface-brand sm:p-8">
            <span className="relative z-1 flex size-10 items-center justify-center rounded-xl bg-white/15 text-lime">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <h2 className="relative z-1 mt-4 font-heading text-lg font-semibold">
              Dasar informasi di website ini
            </h2>
            <p className="relative z-1 mt-2 max-w-2xl text-sm text-white/80">
              Persyaratan berlabel <strong className="text-lime">Resmi</strong>{" "}
              mengacu pada Surat {site.officialSource.issuer} No.{" "}
              {site.officialSource.number} tanggal {site.officialSource.date}.
              Selebihnya berlabel <strong className="text-lime">Alumni</strong> —
              praktik umum yang tetap perlu kamu konfirmasi ke Prodi.
            </p>
            <div className="relative z-1 mt-5 flex flex-wrap gap-2">
              <LinkButton
                href="/tentang"
                size="sm"
                className="bg-lime text-lime-foreground hover:bg-lime/85"
              >
                <FileText aria-hidden />
                Tentang website ini
              </LinkButton>
              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/85 hover:text-white"
              >
                <FolderDown className="size-4" aria-hidden />
                Download Center
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
