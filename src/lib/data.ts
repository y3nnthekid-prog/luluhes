import stagesJson from "@/data/stages.json";
import downloadsJson from "@/data/downloads.json";
import faqJson from "@/data/faq.json";
import siteJson from "@/data/site.json";
import scheduleJson from "@/data/schedule.json";
import skpiJson from "@/data/skpi.json";

import type {
  DownloadItem,
  ExamCycle,
  FaqItem,
  ScheduleConfig,
  SiteConfig,
  SkpiConfig,
  Stage,
  StagePhase,
} from "@/lib/types";

export const site = siteJson as SiteConfig;

export const schedule = scheduleJson as ScheduleConfig;

export const skpi = skpiJson as SkpiConfig;

/** Ujian bulanan yang mengurus sebuah tahapan, bila ada. */
export function getExamForStage(slug: string): ExamCycle | undefined {
  return schedule.exams.find((exam) => exam.stage === slug);
}

export const stages = (stagesJson as Stage[])
  .slice()
  .sort((a, b) => a.order - b.order);

export const downloads = downloadsJson as DownloadItem[];

/** FAQ global (halaman /faq) — belum termasuk FAQ per tahapan. */
export const generalFaq = faqJson as FaqItem[];

export const stageSlugs = stages.map((s) => s.slug);

export const totalStages = stages.length;

const stageBySlug = new Map(stages.map((s) => [s.slug, s]));

export function getStage(slug: string): Stage | undefined {
  return stageBySlug.get(slug);
}

export function getDownload(id: string): DownloadItem | undefined {
  return downloads.find((d) => d.id === id);
}

export function getDownloadsForStage(slug: string): DownloadItem[] {
  return downloads.filter((d) => d.stage === slug);
}

/** Template yang direferensikan sebuah tahapan, dalam urutan yang ditulis di data. */
export function getStageDownloads(stage: Stage): DownloadItem[] {
  return stage.downloads
    .map((id) => getDownload(id))
    .filter((d): d is DownloadItem => Boolean(d));
}

export const phases: StagePhase[] = ["Proposal", "Skripsi", "Ujian", "Kelulusan"];

export function getStagesByPhase(phase: StagePhase): Stage[] {
  return stages.filter((s) => s.phase === phase);
}

/** Seluruh FAQ (global + per tahapan) untuk halaman FAQ dan pencarian. */
export const allFaq: FaqItem[] = [
  ...generalFaq,
  ...stages.flatMap((stage) =>
    stage.faq.map((item) => ({ ...item, stage: stage.slug })),
  ),
];

/** Jumlah seluruh item checklist di semua tahapan — penyebut progres global. */
export const totalChecklistItems = stages.reduce(
  (total, stage) => total + stage.checklist.length,
  0,
);

/** Sisa estimasi waktu dari sebuah tahapan sampai selesai, sebagai teks. */
export function stagesRemaining(slug: string): number {
  const stage = getStage(slug);
  if (!stage) return totalStages;
  return totalStages - stage.order;
}
