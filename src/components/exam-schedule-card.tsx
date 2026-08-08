import { CalendarClock, ExternalLink, TriangleAlert } from "lucide-react";

import { schedule } from "@/lib/data";
import type { ExamCycle } from "@/lib/types";

/**
 * Kartu jadwal dan pendaftaran untuk tahapan yang punya ujian bulanan.
 * Ditaruh di atas halaman karena tenggat pendaftaran adalah hal paling
 * mendesak bagi pengguna yang sedang berada di tahap ini.
 */
export function ExamScheduleCard({ exam }: { exam: ExamCycle }) {
  return (
    <section
      aria-labelledby="jadwal-heading"
      className="overflow-hidden rounded-2xl border border-brand/25 bg-card"
    >
      <div className="flex items-center gap-2.5 border-b bg-brand-soft px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <CalendarClock className="size-4" aria-hidden />
        </span>
        <h2 id="jadwal-heading" className="font-heading text-sm font-semibold">
          Jadwal &amp; pendaftaran
        </h2>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Pelaksanaan
            </p>
            <p className="mt-1 text-sm">{exam.schedulePattern}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Tenggat pendaftaran
            </p>
            <p className="mt-1 text-sm font-medium">{exam.deadlinePattern}</p>
          </div>
        </div>

        <p className="rounded-xl bg-muted/70 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Contoh periode:</span>{" "}
          {exam.example}
        </p>

        <a
          href={exam.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/85 pointer-coarse:min-h-11 sm:w-auto"
        >
          Buka form pendaftaran
          <ExternalLink className="size-4" aria-hidden />
        </a>

        <div className="flex gap-2.5 rounded-xl border border-warn/30 bg-warn-muted p-3">
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-warn"
            aria-hidden
          />
          <p className="text-xs text-foreground/80">{schedule.warning}</p>
        </div>
      </div>
    </section>
  );
}
