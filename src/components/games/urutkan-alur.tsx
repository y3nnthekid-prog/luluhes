"use client";

import * as React from "react";
import { Check, RotateCcw, Trophy } from "lucide-react";

import { StageIcon } from "@/components/stage-icon";
import { Button } from "@/components/ui/button";
import { urutanBenar } from "@/lib/games";
import { cn } from "@/lib/utils";

type Kartu = (typeof urutanBenar)[number];

function acak<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Menyusun sebelas tahap sesuai urutan sebenarnya.
 *
 * Berbasis ketuk, bukan seret. Menyeret di layar sentuh gampang bentrok dengan
 * gulir halaman, dan permainan ini justru paling sering dibuka dari ponsel.
 */
export function UrutkanAlur() {
  const [mulai, setMulai] = React.useState(false);
  const [sisa, setSisa] = React.useState<Kartu[]>([]);
  const [tersusun, setTersusun] = React.useState<Kartu[]>([]);
  const [salah, setSalah] = React.useState(0);
  const [goyang, setGoyang] = React.useState<string | null>(null);

  // Pengacakan baru dijalankan setelah pengguna menekan Mulai, jadi tidak ada
  // isi acak yang dirender di server dan tidak ada ketidakcocokan hidrasi.
  const mainkan = React.useCallback(() => {
    setSisa(acak(urutanBenar));
    setTersusun([]);
    setSalah(0);
    setGoyang(null);
    setMulai(true);
  }, []);

  function pilih(kartu: Kartu) {
    const berikutnya = urutanBenar[tersusun.length];
    if (kartu.slug === berikutnya.slug) {
      setTersusun((t) => [...t, kartu]);
      setSisa((s) => s.filter((k) => k.slug !== kartu.slug));
    } else {
      setSalah((n) => n + 1);
      setGoyang(kartu.slug);
      window.setTimeout(() => setGoyang(null), 420);
    }
  }

  const selesai = mulai && tersusun.length === urutanBenar.length;

  if (!mulai) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Ketuk tahapan sesuai urutan sebenarnya, dari persiapan proposal sampai
          ijazah. Salah ketuk tidak menggugurkan — hanya menambah hitungan.
        </p>
        <Button onClick={mainkan} size="lg" className="mt-4">
          Mulai menyusun
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Tersusun{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {tersusun.length}/{urutanBenar.length}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Salah{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {salah}
          </span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={mainkan}
          className="ml-auto"
        >
          <RotateCcw aria-hidden />
          Ulang
        </Button>
      </div>

      {selesai && (
        <div className="sheen mt-4 flex items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Trophy className="size-5" aria-hidden />
          </span>
          <p className="text-sm">
            <strong className="font-heading">Alurnya kamu hafal.</strong>{" "}
            {salah === 0
              ? "Tanpa satu pun salah ketuk — itu bukan kebetulan."
              : `Dengan ${salah} kali salah. Coba lagi untuk memperbaiki.`}
          </p>
        </div>
      )}

      {/* Yang sudah tersusun */}
      {tersusun.length > 0 && (
        <ol className="mt-4 space-y-1.5">
          {tersusun.map((k, i) => (
            <li
              key={k.slug}
              className="flex items-center gap-2.5 rounded-xl border border-brand/20 bg-brand-soft px-3 py-2"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand text-xs font-semibold text-brand-foreground tabular-nums">
                {i + 1}
              </span>
              <StageIcon name={k.icon} className="size-4 shrink-0 text-brand" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {k.title}
              </span>
              <Check className="size-4 shrink-0 text-brand" aria-hidden />
            </li>
          ))}
        </ol>
      )}

      {/* Yang belum tersusun */}
      {sisa.length > 0 && (
        <>
          <p className="mt-5 text-xs font-medium text-muted-foreground">
            Mana yang datang setelah nomor {tersusun.length}?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sisa.map((k) => (
              <button
                key={k.slug}
                type="button"
                onClick={() => pilih(k)}
                className={cn(
                  "card-lift flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:border-brand/40 hover:bg-brand-soft/60",
                  goyang === k.slug &&
                    "animate-[shake_420ms_ease-in-out] border-warn/60 bg-warn-muted",
                )}
              >
                <StageIcon name={k.icon} className="size-4 shrink-0 text-brand" />
                <span className="max-w-52 truncate">{k.shortTitle}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
