"use client";

import * as React from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bunyikan } from "@/lib/suara";
import {
  UKURAN,
  indeks,
  langkah,
  muat,
  mulai,
  petakBentuk,
  selDariTitik,
  ukuranSel,
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

/** Celah antar sel papan, sama dengan `gap-1` di kelasnya. */
const GAP = 4;

/**
 * Seberapa jauh bentuk diangkat di atas jari saat menyeret dengan sentuhan.
 *
 * Tanpa ini jari menutupi persis petak yang sedang dituju, dan pemain menaruh
 * potongan secara buta. Angkanya sekitar dua baris petak.
 */
const ANGKAT_SENTUH = 88;

type Seret = {
  slot: number;
  bentuk: Bentuk;
  sentuh: boolean;
  baris: number;
  kolom: number;
  sah: boolean;
};

export function BlastBerkas({
  onSelesai,
}: {
  /** Dipanggil sekali saat permainan berakhir, membawa skor akhirnya. */
  onSelesai?: (skor: number) => void;
}) {
  const [main, setMain] = React.useState(false);
  const [k, setK] = React.useState<Keadaan | null>(null);
  const [pilih, setPilih] = React.useState<number | null>(null);
  const [goyang, setGoyang] = React.useState(false);

  /** Petak yang sedang disorot beserta keabsahannya. */
  const [sorot, setSorot] = React.useState<{ sel: number[]; sah: boolean }>({
    sel: [],
    sah: false,
  });
  /** Slot yang sedang diseret, hanya untuk menyamarkan kartunya. */
  const [slotDiseret, setSlotDiseret] = React.useState<number | null>(null);
  /** Lebar kisi papan, dipakai menggambar bentuk hantu seukuran petaknya. */
  const [lebarKisi, setLebarKisi] = React.useState(320);

  const kisiRef = React.useRef<HTMLDivElement>(null);
  const hantuRef = React.useRef<HTMLDivElement>(null);
  const seretRef = React.useRef<Seret | null>(null);
  /**
   * Menandai bahwa jari benar-benar bergerak, bukan sekadar menekan.
   *
   * Peristiwa `click` tetap menyusul setelah seretan selesai. Tanpa penanda
   * ini, ketukan bayangan itu ikut memilih slot yang potongannya baru saja
   * terpakai — dan membunyikan nada pilih untuk sesuatu yang tidak dipilih.
   */
  const seretBergerakRef = React.useRef(false);

  const mainkan = React.useCallback(() => {
    setK(mulai());
    setPilih(0);
    setSorot({ sel: [], sah: false });
    setSlotDiseret(null);
    seretRef.current = null;
    setMain(true);
  }, []);

  // Kisi ikut melebar dan menyempit bersama layar, jadi ukurannya diamati
  // alih-alih dibaca sekali. Bentuk hantu harus persis seukuran petak papan;
  // kalau meleset, apa yang terlihat saat menyeret bukan yang akan ditaruh.
  React.useEffect(() => {
    const el = kisiRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const pengamat = new ResizeObserver(([entri]) => {
      setLebarKisi(entri.contentRect.width);
    });
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, [main]);

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

  /** Geometri kisi papan saat ini, dalam koordinat layar. */
  function geometri() {
    const el = kisiRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { kiri: r.left, atas: r.top, lebar: r.width, gap: GAP };
  }

  /** Menempatkan bentuk hantu mengikuti penunjuk. */
  function gerakkanHantu(x: number, y: number, sentuh: boolean) {
    const el = hantuRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y - (sentuh ? ANGKAT_SENTUH : 0)}px, 0) translate(-50%, -50%)`;
  }

  /** Menghitung ulang sasaran dan sorotannya dari posisi penunjuk. */
  function perbaruiSasaran(x: number, y: number) {
    const seret = seretRef.current;
    const papan = k;
    const geo = geometri();
    if (!seret || !papan || !geo) return;

    const { baris, kolom } = selDariTitik(
      x,
      y,
      geo,
      seret.bentuk,
      seret.sentuh ? ANGKAT_SENTUH : 0,
    );
    if (baris === seret.baris && kolom === seret.kolom) return;

    const sah = muat(papan.papan, seret.bentuk, baris, kolom);
    seretRef.current = { ...seret, baris, kolom, sah };
    setSorot({
      sel: sah
        ? seret.bentuk.sel.map(([db, dk]) => indeks(baris + db, kolom + dk))
        : [],
      sah,
    });
  }

  function mulaiSeret(e: React.PointerEvent, slot: number) {
    const papan = k;
    if (!papan || papan.selesai) return;
    const bentuk = papan.tawaran[slot];
    if (!bentuk) return;

    // Menahan gulir halaman selama jari masih menyeret potongan.
    e.preventDefault();
    try {
      // Menangkap penunjuk supaya seretan tetap terlacak walau jari keluar
      // dari kartunya. Bisa melempar bila penunjuknya sudah tidak dikenal
      // peramban — dan kalau itu terjadi, seluruh seretan ikut mati. Lebih
      // baik menyeret tanpa penangkapan daripada tidak bisa menyeret.
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Diabaikan dengan sengaja.
    }

    const sentuh = e.pointerType !== "mouse";
    seretBergerakRef.current = false;
    seretRef.current = {
      slot,
      bentuk,
      sentuh,
      baris: Number.NaN,
      kolom: Number.NaN,
      sah: false,
    };
    setPilih(slot);
    setSlotDiseret(slot);
    bunyikan("pilih");
    gerakkanHantu(e.clientX, e.clientY, sentuh);
    perbaruiSasaran(e.clientX, e.clientY);
  }

  function seretBergerak(e: React.PointerEvent) {
    const seret = seretRef.current;
    if (!seret) return;
    e.preventDefault();
    seretBergerakRef.current = true;
    gerakkanHantu(e.clientX, e.clientY, seret.sentuh);
    perbaruiSasaran(e.clientX, e.clientY);
  }

  function lepasSeret(e: React.PointerEvent) {
    const seret = seretRef.current;
    seretRef.current = null;
    setSlotDiseret(null);
    setSorot({ sel: [], sah: false });
    if (!seret) return;
    e.preventDefault();
    // Di luar papan atau tidak muat: batal tanpa hukuman apa pun.
    if (!Number.isFinite(seret.baris) || !seret.sah) return;
    taruhDi(seret.baris, seret.kolom, seret.slot);
  }

  function taruhDi(baris: number, kolom: number, slot: number) {
    const papan = k;
    if (!papan) return;

    const sesudah = langkah(papan, slot, baris, kolom);
    if (sesudah === papan) {
      bunyikan("kena");
      setGoyang(true);
      window.setTimeout(() => setGoyang(false), 420);
      return;
    }

    const adaLedakan =
      sesudah.baruBersih.baris.length + sesudah.baruBersih.kolom.length > 0;
    bunyikan(adaLedakan ? "ledak" : "taruh");
    if (sesudah.selesai) window.setTimeout(() => bunyikan("selesai"), 260);

    setK(sesudah);
    const berikut = sesudah.tawaran.findIndex((t) => t !== null);
    setPilih(berikut === -1 ? null : berikut);
  }

  if (!main || !k) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Seret potongan berkas ke papan. Setiap baris atau kolom yang penuh
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

  const bentukDiseret =
    slotDiseret !== null ? k.tawaran[slotDiseret] : null;

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
          ref={kisiRef}
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${UKURAN}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: UKURAN * UKURAN }).map((_, i) => {
            const baris = Math.floor(i / UKURAN);
            const kolom = i % UKURAN;
            const isi = k.papan[i];
            const disorot = sorot.sel.includes(i);
            return (
              <button
                key={i}
                type="button"
                aria-label={`Baris ${baris + 1} kolom ${kolom + 1}`}
                // Tetap bisa diketuk: menyeret enak dengan jari, tetapi
                // pengguna papan ketik dan pembaca layar butuh jalur ini.
                onClick={() => pilih !== null && taruhDi(baris, kolom, pilih)}
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

      {/* Tiga tawaran. Diseret, bukan diketuk dua kali. */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {k.tawaran.map((bentuk, slot) => (
          <button
            key={slot}
            type="button"
            disabled={!bentuk || k.selesai}
            onPointerDown={(e) => mulaiSeret(e, slot)}
            onPointerMove={seretBergerak}
            onPointerUp={lepasSeret}
            onPointerCancel={lepasSeret}
            onClick={() => {
              // Ketukan bayangan sesudah seretan diabaikan.
              if (seretBergerakRef.current) {
                seretBergerakRef.current = false;
                return;
              }
              setPilih(slot);
              bunyikan("pilih");
            }}
            aria-pressed={pilih === slot}
            className={cn(
              // touch-none menahan gulir halaman selama potongan diseret.
              // Tanpa itu, menarik potongan ke bawah malah menggulirkan layar.
              "flex min-h-24 touch-none flex-col items-center justify-center gap-1.5 rounded-xl border p-2 transition-colors",
              !bentuk && "opacity-30",
              slotDiseret === slot && "opacity-40",
              pilih === slot && bentuk
                ? "border-brand bg-brand-soft"
                : "hover:bg-muted/60",
            )}
          >
            {bentuk ? (
              <>
                <PetakGambar bentuk={bentuk} />
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

      {/* Bentuk hantu yang mengikuti jari. Selalu ada di pohon DOM supaya
          posisinya bisa diperbarui langsung tanpa render ulang React. */}
      <div
        ref={hantuRef}
        aria-hidden
        // Tanpa transisi dengan sengaja. Transisi butuh frame untuk berjalan,
        // dan saat pengujian ada keadaan di mana frame tidak pernah tiba —
        // hantunya tersangkut pada opasitas nol dan pemain menyeret tanpa
        // melihat apa pun. Muncul seketika juga terasa lebih pas: potongan
        // harus sudah ada di bawah jari begitu ditekan.
        className={cn(
          "pointer-events-none fixed top-0 left-0 z-50",
          bentukDiseret ? "opacity-90" : "hidden",
        )}
      >
        {bentukDiseret && (
          <HantuBentuk
            bentuk={bentukDiseret}
            sah={sorot.sah}
            lebarKisi={lebarKisi}
          />
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Seret potongan ke papan. Petak yang dituju ikut tersorot, dan saat
        menyeret dengan jari potongannya diangkat sedikit supaya tidak
        tertutup. Mengetuk potongan lalu mengetuk papan juga tetap bisa.
      </p>
    </div>
  );
}

/** Bentuk berukuran petak papan yang mengikuti penunjuk saat diseret. */
function HantuBentuk({
  bentuk,
  sah,
  lebarKisi,
}: {
  bentuk: Bentuk;
  sah: boolean;
  lebarKisi: number;
}) {
  const sel = ukuranSel(lebarKisi, GAP);
  const petak = petakBentuk(bentuk);
  const terisi = new Set(bentuk.sel.map(([b, k]) => `${b},${k}`));

  return (
    <span
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${petak.kolom}, ${sel}px)`,
        gap: GAP,
      }}
    >
      {Array.from({ length: petak.baris * petak.kolom }).map((_, i) => {
        const b = Math.floor(i / petak.kolom);
        const k = i % petak.kolom;
        const ada = terisi.has(`${b},${k}`);
        return (
          <span
            key={i}
            className={cn(
              "rounded-[5px]",
              ada && (sah ? WARNA[bentuk.warna] : "bg-warn/60"),
            )}
            style={{ width: sel, height: sel }}
          />
        );
      })}
    </span>
  );
}

/** Gambar kecil sebuah bentuk, dipakai di kartu tawaran. */
function PetakGambar({ bentuk }: { bentuk: Bentuk }) {
  const petak = petakBentuk(bentuk);
  const terisi = new Set(bentuk.sel.map(([b, k]) => `${b},${k}`));

  return (
    <span
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${petak.kolom}, 12px)` }}
      aria-hidden
    >
      {Array.from({ length: petak.baris * petak.kolom }).map((_, i) => {
        const b = Math.floor(i / petak.kolom);
        const k = i % petak.kolom;
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
