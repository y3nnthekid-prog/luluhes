import { ArrowRight } from "lucide-react";

import { CountUp } from "@/components/count-up";
import { LinkButton } from "@/components/link-button";
import { StageIcon } from "@/components/stage-icon";
import { WizardDialog } from "@/components/wizard-dialog";
import { downloads, site, stages, totalStages } from "@/lib/data";
import { cn } from "@/lib/utils";

const JUDUL = "Berhenti menebak-nebak alur kelulusanmu.";

/**
 * Ikon tahap yang mengambang di sisi kanan hero.
 *
 * Tiga yang pertama tampil di layar kecil sekalipun; sisanya menyusul begitu
 * ada ruang. Versi sebelumnya menyembunyikan semuanya di bawah layar lebar,
 * jadi sebagian besar pengunjung tidak pernah melihat gerakan apa pun.
 */
const ikonMengambang = [
  { i: 0, top: "10%", right: "5%", dur: "5.4s", delay: "0s", kecil: true },
  { i: 4, top: "56%", right: "8%", dur: "4.6s", delay: "0.8s", kecil: true },
  { i: 10, top: "31%", right: "20%", dur: "6.2s", delay: "0.4s", kecil: true },
  { i: 2, top: "76%", right: "24%", dur: "5.8s", delay: "1.2s", kecil: false },
  { i: 5, top: "14%", right: "35%", dur: "6.6s", delay: "0.2s", kecil: false },
  { i: 8, top: "48%", right: "43%", dur: "5.2s", delay: "1.6s", kecil: false },
];

export function Hero() {
  const siapUnduh = downloads.filter((d) => d.url !== null).length;
  const kata = JUDUL.split(" ");

  return (
    <section className="px-4 pt-4">
      <div className="aurora grain surface-brand relative mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] px-6 py-12 sm:px-10 sm:py-16">
        {/* Gumpalan aurora ketiga; dua lainnya digambar sebagai pseudo-element. */}
        <span className="aurora-3" aria-hidden />

        {/* Ikon tahap yang mengambang. Murni hiasan, jadi disembunyikan dari
            pembaca layar. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {ikonMengambang.map((f) => {
            const stage = stages[f.i];
            if (!stage) return null;
            return (
              <span
                key={stage.slug}
                className={cn(
                  "float-soft absolute flex items-center justify-center rounded-2xl bg-white/50 text-surface-accent shadow-sm ring-1 ring-white/60 backdrop-blur-sm",
                  "size-9 sm:size-11",
                  !f.kecil && "hidden md:flex",
                )}
                style={
                  {
                    top: f.top,
                    right: f.right,
                    "--dur": f.dur,
                    "--delay": f.delay,
                  } as React.CSSProperties
                }
              >
                <StageIcon name={stage.icon} className="size-4 sm:size-5" />
              </span>
            );
          })}
        </div>

        <p className="relative z-1 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium ring-1 ring-black/5">
          <span
            className="pulse-ring relative size-1.5 rounded-full bg-surface-accent"
            aria-hidden
          />
          {site.program} · {site.faculty}
        </p>

        {/* Judul muncul kata demi kata. Teks utuhnya tetap satu <h1>, jadi
            pembaca layar dan mesin pencari membacanya sebagai satu kalimat. */}
        <h1 className="relative z-1 mt-5 font-heading text-[clamp(2.1rem,6.4vw,4.75rem)] leading-[1.02] font-bold tracking-tight text-pretty">
          {kata.map((k, i) => {
            const terakhir = i === kata.length - 1;
            return (
              <span
                key={`${k}-${i}`}
                className="word-rise"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {/* Kata terakhir disorot setelah seluruh kalimat naik. */}
                {terakhir ? <span className="sorot-kata">{k}</span> : `${k} `}
              </span>
            );
          })}
        </h1>

        {/* Garis perjalanan yang menggambar dirinya sendiri: satu tarikan dari
            proposal sampai ijazah. */}
        <svg
          viewBox="0 0 640 40"
          className="relative z-1 mt-6 h-8 w-full max-w-lg"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 30 C 120 30, 130 8, 240 8 S 400 32, 512 20 S 610 8, 636 10"
            stroke="var(--surface-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="draw-line"
            style={{ "--len": 760 } as React.CSSProperties}
            opacity="0.55"
          />
          <circle cx="636" cy="10" r="5" fill="var(--surface-accent)" />
        </svg>

        <p className="relative z-1 mt-4 max-w-2xl text-base text-pop-foreground/80 text-pretty sm:text-lg">
          Dari persiapan proposal sampai ijazah di tangan — satu alur runtut,
          lengkap dengan tenggat resmi yang paling sering bikin mahasiswa
          mengulang.
        </p>

        <div className="relative z-1 mt-7 flex flex-col gap-2.5 sm:flex-row">
          <WizardDialog className="bg-surface-accent text-white shadow-lg shadow-brand/25 transition-transform hover:scale-[1.02] hover:bg-surface-accent/85" />
          <LinkButton
            href="/roadmap"
            size="lg"
            className="border-black/10 bg-white/65 text-pop-foreground transition-transform hover:scale-[1.02] hover:bg-white/90"
            variant="outline"
          >
            Lihat roadmap
            <ArrowRight aria-hidden data-icon="inline-end" />
          </LinkButton>
        </div>

        <dl className="relative z-1 mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {[
            { label: "Tahapan", value: totalStages },
            { label: "Template", value: downloads.length },
            { label: "Siap unduh", value: siapUnduh },
          ].map((stat) => (
            <div key={stat.label}>
              <dd className="font-heading text-3xl leading-none font-bold">
                <CountUp value={stat.value} />
              </dd>
              <dt className="mt-1 text-xs text-pop-foreground/85">
                {stat.label}
              </dt>
            </div>
          ))}
          <div>
            <dd className="font-heading text-3xl leading-none font-bold">
              Gratis
            </dd>
            <dt className="mt-1 text-xs text-pop-foreground/85">Tanpa akun</dt>
          </div>
        </dl>
      </div>
    </section>
  );
}
