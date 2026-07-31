"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bankSoal, judulTahap, type Soal } from "@/lib/games";
import { cn } from "@/lib/utils";

const JUMLAH_SOAL = 8;

function acak<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Menebak dari tahap mana sebuah syarat, dokumen, atau peringatan berasal.
 *
 * Soalnya dirakit dari `stages.json`, dan pengecohnya sengaja diambil dari
 * tahap yang bersebelahan — membedakan syarat munaqosyah dari syarat
 * komprehensif itu justru yang berguna diingat.
 */
export function TebakTahap() {
  const [soal, setSoal] = React.useState<Soal[] | null>(null);
  const [ke, setKe] = React.useState(0);
  const [dipilih, setDipilih] = React.useState<string | null>(null);
  const [benar, setBenar] = React.useState(0);

  // Sama seperti permainan menyusun: pengacakan baru terjadi setelah ditekan,
  // jadi tidak ada isi acak yang dirender di server.
  const mainkan = React.useCallback(() => {
    setSoal(
      acak(bankSoal)
        .slice(0, JUMLAH_SOAL)
        .map((s) => ({ ...s, pilihan: acak(s.pilihan) })),
    );
    setKe(0);
    setDipilih(null);
    setBenar(0);
  }, []);

  if (!soal) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Delapan potongan syarat, dokumen, dan peringatan diambil acak dari
          seluruh tahapan. Tebak masing-masing berasal dari tahap yang mana.
        </p>
        <Button onClick={mainkan} size="lg" className="mt-4">
          Mulai menebak
        </Button>
      </div>
    );
  }

  const kini = soal[ke];
  const selesai = ke >= soal.length;

  if (selesai) {
    const persen = Math.round((benar / soal.length) * 100);
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="font-heading text-4xl font-bold text-brand tabular-nums">
          {benar}/{soal.length}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {persen === 100
            ? "Sempurna. Kamu tahu persis apa milik tahap yang mana."
            : persen >= 60
              ? "Sudah bagus. Yang meleset biasanya syarat antar tahap yang bersebelahan."
              : "Masih banyak yang tertukar — itu wajar, tahapnya memang mirip-mirip."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={mainkan}>
            <RotateCcw aria-hidden />
            Main lagi
          </Button>
          <Button variant="outline" render={<Link href="/tahapan" />}>
            Baca tahapannya
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Button>
        </div>
      </div>
    );
  }

  const sudahJawab = dipilih !== null;

  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Soal{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {ke + 1}/{soal.length}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Benar{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {benar}
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={mainkan} className="ml-auto">
          <RotateCcw aria-hidden />
          Ulang
        </Button>
      </div>

      {/* Bilah kemajuan */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${(ke / soal.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 rounded-2xl border bg-card p-4">
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
          {kini.jenis}
        </span>
        <p className="mt-3 text-sm leading-relaxed">{kini.petunjuk}</p>
      </div>

      <p className="mt-4 text-xs font-medium text-muted-foreground">
        Ini bagian dari tahap yang mana?
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {kini.pilihan.map((slug) => {
          const iniJawaban = slug === kini.jawaban;
          const iniDipilih = slug === dipilih;
          return (
            <button
              key={slug}
              type="button"
              disabled={sudahJawab}
              onClick={() => {
                setDipilih(slug);
                if (iniJawaban) setBenar((n) => n + 1);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-card px-3 py-3 text-left text-sm transition-colors",
                !sudahJawab && "card-lift hover:border-brand/40 hover:bg-brand-soft/60",
                sudahJawab && iniJawaban && "border-brand/50 bg-brand-soft",
                sudahJawab &&
                  iniDipilih &&
                  !iniJawaban &&
                  "border-warn/50 bg-warn-muted",
                sudahJawab && !iniJawaban && !iniDipilih && "opacity-55",
              )}
            >
              <span className="min-w-0 flex-1">{judulTahap.get(slug)}</span>
              {sudahJawab && iniJawaban && (
                <Check className="size-4 shrink-0 text-brand" aria-hidden />
              )}
              {sudahJawab && iniDipilih && !iniJawaban && (
                <X className="size-4 shrink-0 text-warn" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      {sudahJawab && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm">
            {dipilih === kini.jawaban ? (
              <span className="font-medium text-brand">Tepat.</span>
            ) : (
              <>
                <span className="font-medium text-warn">Bukan.</span>{" "}
                <span className="text-muted-foreground">
                  Jawabannya {judulTahap.get(kini.jawaban)}.
                </span>
              </>
            )}
          </p>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => {
              setKe((n) => n + 1);
              setDipilih(null);
            }}
          >
            {ke + 1 === soal.length ? "Lihat hasil" : "Lanjut"}
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Button>
        </div>
      )}
    </div>
  );
}
