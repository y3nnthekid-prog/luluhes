"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Check, ChevronRight, MapPin } from "lucide-react";

import { StageIcon } from "@/components/stage-icon";
import { stages } from "@/lib/data";
import { phaseStyle } from "@/lib/phase";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * Jaring pengaman untuk animasi yang bergantung pada IntersectionObserver.
 *
 * `whileInView` hanya menyala kalau IO benar-benar bekerja. Di lingkungan yang
 * IO-nya ada tapi tidak pernah memanggil balik, node roadmap tersangkut di
 * `opacity: 0` selamanya — peta kelulusannya hilang sama sekali, padahal
 * isinya sudah ada di DOM. Ini perlakuan yang sama dengan `Reveal`, yang lebih
 * dulu kena masalah persis begitu.
 *
 * Buktinya adalah panggilan balik pertama, bukan `isIntersecting`: observer
 * yang sehat selalu memanggil balik sekali segera sesudah `observe()`, entah
 * elemennya sedang terlihat atau tidak. Jadi animasi gulirnya tetap utuh saat
 * IO sehat, dan hanya dipaksa tampil kalau IO memang bisu.
 *
 * Mengembalikan `[paksaTampil, pasang]`.
 */
function usePengamanTampil(): [boolean, (node: HTMLOListElement | null) => void] {
  const [paksaTampil, setPaksaTampil] = React.useState(false);
  const ref = React.useRef<HTMLOListElement | null>(null);

  const pasang = React.useCallback((node: HTMLOListElement | null) => {
    ref.current = node;
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Peramban lama tanpa IntersectionObserver: tidak akan pernah ada yang
    // memicu whileInView, jadi langsung tampilkan saja. Lewat timer supaya
    // setState-nya tidak terjadi saat efek masih berjalan.
    if (typeof IntersectionObserver === "undefined") {
      const segera = window.setTimeout(() => setPaksaTampil(true), 0);
      return () => window.clearTimeout(segera);
    }

    let pengaman = 0;
    const pengintai = new IntersectionObserver(() => {
      window.clearTimeout(pengaman);
      pengintai.disconnect();
    });
    pengintai.observe(el);

    pengaman = window.setTimeout(() => setPaksaTampil(true), 2000);

    return () => {
      window.clearTimeout(pengaman);
      pengintai.disconnect();
    };
  }, []);

  return [paksaTampil, pasang];
}

/**
 * Peta perjalanan kelulusan. Setiap node bisa diklik, node aktif disorot,
 * dan node yang checklist-nya tuntas ditandai selesai. Warna node mengikuti
 * fase, sehingga perjalanan terbaca sebagai gradasi dari kuning ke hijau tua.
 */
export function Roadmap({ compact = false }: { compact?: boolean }) {
  const { hydrated, currentStage, stageProgress } = useProgress();
  const reduceMotion = useReducedMotion();
  const [paksaTampil, pasangDaftar] = usePengamanTampil();

  return (
    <ol ref={pasangDaftar} className="relative">
      {stages.map((stage, i) => {
        const progress = stageProgress(stage.slug);
        const isCurrent = hydrated && stage.slug === currentStage.slug;
        const isDone = hydrated && progress.status === "selesai";
        const isLast = i === stages.length - 1;
        const phase = phaseStyle(stage.phase);
        const showPhaseLabel = i === 0 || stages[i - 1].phase !== stage.phase;

        return (
          <motion.li
            /*
             * Kuncinya ikut berubah saat pengaman menyala supaya elemennya
             * dipasang ulang. `initial` hanya dibaca sekali waktu dipasang;
             * kalau elemen lama dipertahankan, motion akan mencoba
             * *menganimasikan* dari opacity 0 — dan animasi itu justru yang
             * tidak jalan di lingkungan bermasalah. Dengan dipasang ulang
             * memakai `initial={false}`, nilainya ditulis langsung tanpa
             * animasi sama sekali.
             */
            key={paksaTampil ? `${stage.slug}-pengaman` : stage.slug}
            initial={reduceMotion || paksaTampil ? false : { opacity: 0, y: 10 }}
            whileInView={paksaTampil ? undefined : { opacity: 1, y: 0 }}
            animate={paksaTampil ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.3) }}
            className="relative pl-13 sm:pl-16"
          >
            {/* Rel penghubung antar node */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-11 bottom-0 left-[19px] w-0.5 rounded-full sm:left-[23px]",
                  isDone ? phase.dot : "bg-border",
                )}
              />
            )}

            {/* Penanda pergantian fase */}
            {showPhaseLabel && (
              <p
                className={cn(
                  "mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                  phase.soft,
                )}
              >
                Fase {stage.phase}
              </p>
            )}

            <span
              aria-hidden
              className={cn(
                "absolute left-0 flex size-10 items-center justify-center rounded-2xl border-2 transition-all sm:size-12",
                showPhaseLabel ? "top-9" : "top-1",
                isDone && cn(phase.dot, "border-transparent text-white shadow-sm"),
                isCurrent &&
                  !isDone &&
                  cn(
                    "border-transparent shadow-md ring-4 ring-brand/20",
                    phase.solid,
                  ),
                !isDone &&
                  !isCurrent &&
                  "border-border bg-card text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="size-5" strokeWidth={3} />
              ) : (
                <StageIcon name={stage.icon} className="size-5" />
              )}
            </span>

            <Link
              href={`/tahapan/${stage.slug}`}
              className={cn(
                "group -mx-3 block rounded-2xl px-3 py-2.5 transition-colors hover:bg-muted/70",
                isLast ? "mb-0" : compact ? "mb-3" : "mb-5",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  Tahap {stage.order}
                </span>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
                    <MapPin className="size-3" aria-hidden />
                    Posisi kamu
                  </span>
                )}
                {isDone && !isCurrent && (
                  <span className={cn("text-xs font-semibold", phase.text)}>
                    Selesai
                  </span>
                )}
              </div>

              <h3 className="mt-0.5 flex items-center gap-1.5 font-heading text-base font-semibold">
                {stage.title}
                <ChevronRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </h3>

              {!compact && (
                <p className="mt-1 line-clamp-2 max-w-prose text-sm text-muted-foreground">
                  {stage.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
                  {stage.estimatedDuration}
                </span>
                {hydrated && progress.done > 0 && !isDone && (
                  <span className="text-muted-foreground tabular-nums">
                    {progress.done}/{progress.total} langkah
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
