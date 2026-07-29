import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  Lightbulb,
  Target,
  TriangleAlert,
} from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { DownloadCard } from "@/components/download-card";
import { PositionCard } from "@/components/position-card";
import { SourceBadge } from "@/components/source-badge";
import { StageChecklist } from "@/components/stage-checklist";
import { SkpiTable } from "@/components/skpi-table";
import { StageJumpLinks } from "@/components/stage-jump-links";
import { StagePinButton } from "@/components/stage-pin-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LinkButton } from "@/components/link-button";
import { ExamScheduleCard } from "@/components/exam-schedule-card";
import {
  getExamForStage,
  getStage,
  getStageDownloads,
  stages,
  totalStages,
} from "@/lib/data";
import { phaseStyle } from "@/lib/phase";
import { cn } from "@/lib/utils";
import { StageIcon } from "@/components/stage-icon";

export function generateStaticParams() {
  return stages.map((stage) => ({ slug: stage.slug }));
}

type StageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: StageParams): Promise<Metadata> {
  const { slug } = await params;
  const stage = getStage(slug);
  if (!stage) return {};
  return {
    title: stage.title,
    description: stage.description,
  };
}

export default async function StagePage({ params }: StageParams) {
  const { slug } = await params;
  const stage = getStage(slug);
  if (!stage) notFound();

  const previous = stage.previousStage ? getStage(stage.previousStage) : null;
  const next = stage.nextStage ? getStage(stage.nextStage) : null;
  const templates = getStageDownloads(stage);
  const exam = getExamForStage(stage.slug);
  const phase = phaseStyle(stage.phase);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Tahapan", href: "/tahapan" },
          { label: stage.shortTitle },
        ]}
      />

      <header className="relative mt-4 overflow-hidden rounded-3xl border bg-card p-5 sm:p-7">
        <span
          className={cn('absolute inset-x-0 top-0 h-1.5', phase.dot)}
          aria-hidden
        />

        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-2xl',
              phase.solid,
            )}
          >
            <StageIcon name={stage.icon} className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Tahap {stage.order} dari {totalStages} · Fase {stage.phase}
            </p>
            <h1 className="mt-1 font-heading text-2xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
              {stage.title}
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-muted-foreground text-pretty">
          {stage.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            <Clock className="size-3.5" aria-hidden />
            {stage.estimatedDuration}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {stage.checklist.length} langkah
          </span>
          <StagePinButton slug={stage.slug} />
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_19rem] lg:items-start">
        <div className="min-w-0 space-y-12">
          {exam && <ExamScheduleCard exam={exam} />}

          {/* Tujuan */}
          <section aria-labelledby="tujuan">
            <div className="flex gap-3 rounded-xl border bg-muted/40 p-4">
              <Target className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <div>
                <h2
                  id="tujuan"
                  className="font-heading text-sm font-medium"
                >
                  Tujuan tahap ini
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stage.goal}
                </p>
              </div>
            </div>
          </section>

          {/* Peringatan tenggat */}
          {stage.warnings.length > 0 && (
            <section aria-labelledby="peringatan" className="scroll-mt-20">
              <h2
                id="peringatan"
                className="flex items-center gap-2 font-heading text-lg font-medium"
              >
                <TriangleAlert className="size-4 text-warn" aria-hidden />
                Yang bikin mahasiswa mengulang
              </h2>
              <ul className="mt-4 space-y-2.5">
                {stage.warnings.map((warning) => (
                  <li
                    key={warning.text}
                    className="rounded-xl border border-warn/25 bg-warn/5 p-3.5"
                  >
                    <SourceBadge source={warning.source} className="mb-2" />
                    <p className="text-sm">{warning.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Persyaratan */}
          <section id="syarat" aria-labelledby="syarat-heading">
            <h2
              id="syarat-heading"
              className="font-heading text-lg font-medium"
            >
              Persyaratan
            </h2>
            <ul className="mt-4 space-y-3">
              {stage.requirements.map((req) => (
                <li key={req.text} className="flex flex-wrap items-start gap-2">
                  <SourceBadge source={req.source} className="mt-0.5" />
                  <span className="min-w-40 flex-1 text-sm">{req.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Langkah-langkah */}
          <section id="langkah" aria-labelledby="langkah-heading">
            <h2
              id="langkah-heading"
              className="font-heading text-lg font-medium"
            >
              Langkah-langkah
            </h2>
            <ol className="mt-4 space-y-0">
              {stage.steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < stage.steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-8 bottom-0 left-[13px] w-px bg-border"
                    />
                  )}
                  <span
                    aria-hidden
                    className="z-1 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium tabular-nums"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-sm font-medium">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.detail}
                    </p>
                    {step.actor && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {step.actor}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Dokumen */}
          <section id="dokumen" aria-labelledby="dokumen-heading">
            <h2
              id="dokumen-heading"
              className="font-heading text-lg font-medium"
            >
              Dokumen yang dibutuhkan
            </h2>
            <ul className="mt-4 divide-y rounded-xl border">
              {stage.documents.map((doc) => (
                <li key={doc.name} className="p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{doc.name}</span>
                    <SourceBadge source={doc.source} />
                  </div>
                  {doc.note && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {doc.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Checklist */}
          <section id="checklist" aria-labelledby="checklist-heading">
            <h2
              id="checklist-heading"
              className="font-heading text-lg font-medium"
            >
              Checklist
            </h2>
            <p className="mt-1.5 mb-4 text-sm text-muted-foreground">
              Tersimpan otomatis di browsermu. Tidak perlu akun, tidak perlu
              login.
            </p>
            <StageChecklist stage={stage} />
          </section>

          {/* Template */}
          {templates.length > 0 && (
            <section id="template" aria-labelledby="template-heading">
              <h2
                id="template-heading"
                className="font-heading text-lg font-medium"
              >
                Template & formulir
              </h2>
              <div className="mt-4 space-y-2.5">
                {templates.map((item) => (
                  <DownloadCard key={item.id} item={item} showStage={false} />
                ))}
              </div>
            </section>
          )}

          {stage.extras?.includes("skpi") && <SkpiTable />}

          {/* Tips alumni */}
          <section id="tips" aria-labelledby="tips-heading">
            <h2
              id="tips-heading"
              className="flex items-center gap-2 font-heading text-lg font-medium"
            >
              <Lightbulb className="size-4 text-muted-foreground" aria-hidden />
              Tips alumni
            </h2>
            <ul className="mt-4 space-y-2.5">
              {stage.tips.map((tip) => (
                <li
                  key={tip}
                  className="rounded-xl border-l-2 border-brand/40 bg-muted/40 py-2.5 pr-3.5 pl-3.5 text-sm"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ */}
          <section id="faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-heading text-lg font-medium">
              Pertanyaan yang sering muncul
            </h2>
            <Accordion className="mt-2">
              {stage.faq.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent className="pr-6 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Link penting */}
          <section id="link" aria-labelledby="link-heading">
            <h2 id="link-heading" className="font-heading text-lg font-medium">
              Link penting
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {stage.importantLinks.map((link) => (
                <li key={link.url + link.label}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full items-start gap-2.5 rounded-xl border p-3.5 transition-colors hover:bg-muted/50"
                  >
                    <ExternalLink
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {link.label}
                      </span>
                      {link.note && (
                        <span className="block text-xs text-muted-foreground">
                          {link.note}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Langkah berikutnya */}
          <section
            id="berikutnya"
            aria-labelledby="berikutnya-heading"
            className="border-t pt-8"
          >
            <h2
              id="berikutnya-heading"
              className="font-heading text-lg font-medium"
            >
              Setelah ini
            </h2>

            {next ? (
              <Link
                href={`/tahapan/${next.slug}`}
                className="mt-4 flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    Tahap {next.order} · {next.estimatedDuration}
                  </p>
                  <p className="mt-0.5 font-heading font-medium">{next.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {next.goal}
                  </p>
                </div>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            ) : (
              <p className="mt-4 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                Ini tahap terakhir. Setelah ijazah di tangan, perjalananmu di
                kampus selesai — selamat.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {previous && (
                <LinkButton
                  href={`/tahapan/${previous.slug}`}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft aria-hidden />
                  {previous.shortTitle}
                </LinkButton>
              )}
              <LinkButton href="/roadmap" variant="ghost" size="sm">
                Lihat roadmap
              </LinkButton>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <PositionCard />
          <StageJumpLinks
            hasTemplates={templates.length > 0}
            hasSkpi={stage.extras?.includes("skpi") ?? false}
          />
        </aside>
      </div>
    </div>
  );
}
