"use client";

import * as React from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  UKURAN,
  indeks,
  langkah,
  muat,
  mulai,
  type Bentuk,
  type Keadaan,
} from "@/lib/blast";
import { cn } from "@/lib/utils";

/** Warna tiap jenis potongan; indeksnya mengikuti `warna` pada katalog. */
const WARNA = [
  "",
  "bg-phase-proposal",
  "bg-phase-skripsi",
  "bg-phase-ujian",
  "bg-phase-kelulusan",
  "bg-pop",
  "bg-brand",
  "bg-blush",
];

export function BlastBerkas({
  onSelesai,
}: {
  /** Dipanggil sekali saat permainan berakhir, membawa skor akhirnya. */
  onSelesai?: (skor: number) => void;
}) {
  const [main, setMain] = React.useState(false);
  const [k, setK] = React.useState<Keadaan | null>(null);
  const [pilih, setPilih] = React.useState<number | null>(null);
  const [sorot, setSorot] = React.useState<number[]>([]);
  const [goyang, setGoyang] = React.useState(false);

  // Pengacakan baru dijalankan setelah ditekan, jadi tidak ada isi acak yang
  // dirender di server dan tidak ada ketidakcocokan hidrasi.
  const mainkan = React.useCallback(() => {
    setK(mulai());
    setPilih(0);
    setSorot([]);
    setMain(true);
  }, []);

  const selesaiRef = React.useRef(false);
  React.useEffect(() => {
    if (!k?.selesai || selesaiRef.current) return;
    selesaiRef.current = true;
    onSelesai?.(k.skor);
  }, [k?.selesai, k?.skor, onSelesai]);

  function mulaiUlang() {
    selesaiRef.current = false;
    mainkan();
  }

  function pratinjau(baris: number, kolom: number) {
    if (!k || pilih === null) return;
    const bentuk = k.tawaran[pilih];
    if (!bentuk || !muat(k.papan, bentuk, baris, kolom)) {
      setSorot([]);
      return;
    }
    setSorot(bentuk.sel.map(([db, dk]) => indeks(baris + db, kolom + dk)));
  }

  function taruhDi(baris: number, kolom: number) {
    if (!k || pilih === null) return;
    const bentuk = k.tawaran[pilih];
    if (!bentuk) return;

    const sesudah = langkah(k, pilih, baris, kolom);
    if (sesudah === k) {
      // Langkah tidak sah — beri isyarat, jangan diam saja.
      setGoyang(true);
      window.setTimeout(() => setGoyang(false), 420);
      return;
    }

    setK(sesudah);
    setSorot([]);
    // Pindah otomatis ke tawaran berikutnya yang masih ada.
    const berikut = sesudah.tawaran.findIndex((t) => t !== null);
    setPilih(berikut === -1 ? null : berikut);
  }

  if (!main || !k) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Taruh potongan berkas ke papan. Setiap baris atau kolom yang penuh
          akan lenyap. Tawaran baru datang setelah ketiganya terpakai — jadi
          pikirkan tiga langkah sekaligus.
        </p>
        <Button onClick={mainkan} size="lg" className="mt-4">
          <Sparkles aria-hidden />
          Mulai menata
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Skor{" "}
          <span className="font-heading text-base font-bold text-brand tabular-nums">
            {k.skor}
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={mulaiUlang} className="ml-auto">
          <RotateCcw aria-hidden />
          Ulang
        </Button>
      </div>

      {/* Papan */}
      <div
        className={cn(
          "relative mt-3 rounded-2xl border bg-card p-2",
          goyang && "animate-[shake_420ms_ease-in-out]",
        )}
      >
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${UKURAN}, minmax(0, 1fr))` }}
          onMouseLeave={() => setSorot([])}
        >
          {Array.from({ length: UKURAN * UKURAN }).map((_, i) => {
            const baris = Math.floor(i / UKURAN);
            const kolom = i % UKURAN;
            const isi = k.papan[i];
            const disorot = sorot.includes(i);
            return (
              <button
                key={i}
                type="button"
                aria-label={`Baris ${baris + 1} kolom ${kolom + 1}`}
                onMouseEnter={() => pratinjau(baris, kolom)}
                onFocus={() => pratinjau(baris, kolom)}
                onClick={() => taruhDi(baris, kolom)}
                className={cn(
                  "aspect-square rounded-[5px] transition-colors",
                  isi ? WARNA[isi] : "bg-muted",
                  disorot && "ring-2 ring-brand ring-offset-1 ring-offset-card",
                )}
              />
            );
          })}
        </div>

        {k.selesai && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card/90 p-5 text-center backdrop-blur-sm">
            <p className="font-heading text-base font-semibold">
              Papan buntu — tidak ada lagi yang muat.
            </p>
            <p className="text-sm">
              Skor akhir{" "}
              <span className="font-heading text-lg font-bold text-brand tabular-nums">
                {k.skor}
              </span>
            </p>
            <Button onClick={mulaiUlang}>Main lagi</Button>
          </div>
        )}
      </div>

      {/* Tiga tawaran */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {k.tawaran.map((bentuk, slot) => (
          <button
            key={slot}
            type="button"
            disabled={!bentuk || k.selesai}
            onClick={() => setPilih(slot)}
            aria-pressed={pilih === slot}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border p-2 transition-colors",
              !bentuk && "opacity-30",
              pilih === slot && bentuk
                ? "border-brand bg-brand-soft"
                : "hover:bg-muted/60",
            )}
          >
            {bentuk ? (
              <>
                <PetakBentuk bentuk={bentuk} />
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {bentuk.nama}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Terpakai</span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Ketuk potongan untuk memilih, lalu ketuk papan. Sel yang kamu ketuk jadi
        sudut kiri atas potongannya.
      </p>
    </div>
  );
}

/** Gambar kecil sebuah bentuk, dipakai di kartu tawaran. */
function PetakBentuk({ bentuk }: { bentuk: Bentuk }) {
  const maksBaris = Math.max(...bentuk.sel.map(([b]) => b)) + 1;
  const maksKolom = Math.max(...bentuk.sel.map(([, k]) => k)) + 1;
  const terisi = new Set(bentuk.sel.map(([b, k]) => `${b},${k}`));

  return (
    <span
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${maksKolom}, 12px)` }}
      aria-hidden
    >
      {Array.from({ length: maksBaris * maksKolom }).map((_, i) => {
        const b = Math.floor(i / maksKolom);
        const k = i % maksKolom;
        return (
          <span
            key={i}
            className={cn(
              "size-3 rounded-[3px]",
              terisi.has(`${b},${k}`) ? WARNA[bentuk.warna] : "bg-transparent",
            )}
          />
        );
      })}
    </span>
  );
}
