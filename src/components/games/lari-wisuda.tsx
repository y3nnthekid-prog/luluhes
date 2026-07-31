"use client";

import * as React from "react";
import {
  AlarmClock,
  ArrowDown,
  ArrowUp,
  CalendarX2,
  ClipboardList,
  FileWarning,
  GraduationCap,
  Hourglass,
  Layers,
  Percent,
  RotateCcw,
  Stamp,
  type LucideIcon,
} from "lucide-react";

import {
  PapanSkorPanel,
  kirimSkor,
} from "@/components/games/papan-skor-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAKS_HURUF_NAMA,
  namaPemainStore,
  papanSkorStore,
  peringkatUntuk,
  rapikanNama,
} from "@/lib/papan-skor";
import { bunyikan } from "@/lib/suara";
import {
  PEMAIN_LEBAR,
  PEMAIN_TINGGI,
  PEMAIN_TINGGI_MENUNDUK,
  PEMAIN_X,
  TINGGI_TERBANG,
  langkah,
  mulai,
  skor,
  type Aksi,
  type Keadaan,
} from "@/lib/runner";

const ARENA = 210;
const KOLAM = 5;

/** Pemetaan nama ikon dari katalog rintangan ke komponennya. */
const IKON: Record<string, LucideIcon> = {
  persen: Percent,
  kalender: CalendarX2,
  "jam-pasir": Hourglass,
  tumpukan: Layers,
  berkas: FileWarning,
  weker: AlarmClock,
  papan: ClipboardList,
  stempel: Stamp,
};

type Status = "siap" | "main" | "selesai";

export function LariWisuda() {
  const [status, setStatus] = React.useState<Status>("siap");
  const [angka, setAngka] = React.useState(0);
  const [penabrak, setPenabrak] = React.useState<Keadaan["penabrak"]>(null);
  const [posisiBaru, setPosisiBaru] = React.useState<number | null>(null);
  // Ikon tiap slot rintangan. Diperbarui hanya saat isinya benar-benar
  // berganti — beberapa kali per detik, bukan tiap frame.
  const [slotIkon, setSlotIkon] = React.useState<string[]>([]);
  // Dinaikkan setiap skor terkirim, supaya papan mengambil data terbaru.
  const [penyegar, setPenyegar] = React.useState(0);

  // Papan skor dan nama dibaca lewat store yang sama dengan progres checklist,
  // supaya render di server dan klien tetap sepakat tanpa setState di effect.
  const papan = React.useSyncExternalStore(
    papanSkorStore.subscribe,
    papanSkorStore.getSnapshot,
    papanSkorStore.getServerSnapshot,
  );
  const namaTersimpan = React.useSyncExternalStore(
    namaPemainStore.subscribe,
    namaPemainStore.getSnapshot,
    namaPemainStore.getServerSnapshot,
  );

  const [nama, setNama] = React.useState("");
  const namaDipakai = rapikanNama(nama) || namaTersimpan;

  const arenaRef = React.useRef<HTMLDivElement>(null);
  const pemainRef = React.useRef<HTMLDivElement>(null);
  const kotakRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const ikonSekarangRef = React.useRef<string[]>([]);

  const keadaanRef = React.useRef<Keadaan>(mulai());
  const aksiRef = React.useRef<Aksi>("diam");
  const statusRef = React.useRef<Status>("siap");
  // Nama dikunci saat permainan dimulai, bukan dibaca ulang tiap frame.
  // Menulis ref saat render dilarang, dan gelung animasinya tidak boleh
  // ikut dimulai ulang hanya karena huruf di kolom nama bertambah.
  const namaMainRef = React.useRef("");

  const mainkan = React.useCallback(() => {
    const bersih = rapikanNama(namaDipakai);
    namaMainRef.current = bersih || "Tanpa nama";
    if (bersih) namaPemainStore.set(bersih);
    keadaanRef.current = mulai();
    aksiRef.current = "diam";
    setPenabrak(null);
    setPosisiBaru(null);
    setSlotIkon([]);
    ikonSekarangRef.current = [];
    setAngka(0);
    statusRef.current = "main";
    setStatus("main");
  }, [namaDipakai]);

  React.useEffect(() => {
    const p = pemainRef.current;
    if (!p) return;
    p.style.width = `${PEMAIN_LEBAR}px`;
    p.style.height = `${PEMAIN_TINGGI}px`;
    p.style.transform = `translate3d(${PEMAIN_X}px, 0, 0)`;
  }, []);

  React.useEffect(() => {
    if (status !== "main") return;

    let raf = 0;
    let terakhir = performance.now();
    let hitungSkor = 0;

    const gambar = (kini: number) => {
      const dt = (kini - terakhir) / 1000;
      terakhir = kini;

      const lebar = arenaRef.current?.clientWidth ?? 640;
      const keadaanSebelum = keadaanRef.current;
      const k = langkah(keadaanSebelum, dt, aksiRef.current, Math.random, lebar);
      keadaanRef.current = k;

      // Berangkat melompat: kemarin masih menapak, sekarang sudah naik.
      if (keadaanSebelum.y <= 0 && k.y > 0) bunyikan("lompat");

      const p = pemainRef.current;
      if (p) {
        const menunduk = k.menunduk && k.y <= 0.5;
        p.style.height = `${menunduk ? PEMAIN_TINGGI_MENUNDUK : PEMAIN_TINGGI}px`;
        p.style.transform = `translate3d(${PEMAIN_X}px, ${-k.y}px, 0)`;
      }

      const ikonKini: string[] = [];
      for (let i = 0; i < KOLAM; i++) {
        const el = kotakRef.current[i];
        if (!el) continue;
        const r = k.rintangan[i];
        if (!r) {
          ikonKini.push("");
          el.style.opacity = "0";
          el.style.transform = "translate3d(-999px, 0, 0)";
          continue;
        }
        ikonKini.push(r.ikon);
        const bawah = r.terbang ? TINGGI_TERBANG : 0;
        el.style.opacity = "1";
        el.style.width = `${r.w}px`;
        el.style.height = `${r.h}px`;
        el.style.transform = `translate3d(${r.x}px, ${-bawah}px, 0)`;
      }

      if (ikonKini.join("|") !== ikonSekarangRef.current.join("|")) {
        ikonSekarangRef.current = ikonKini;
        setSlotIkon(ikonKini);
      }

      hitungSkor += dt;
      if (hitungSkor > 0.2) {
        hitungSkor = 0;
        setAngka(skor(k));
      }

      if (k.selesai) {
        bunyikan("kena");
        const nilai = skor(k);
        setAngka(nilai);
        setPenabrak(k.penabrak);
        const pemain = namaMainRef.current || "Tanpa nama";
        setPosisiBaru(peringkatUntuk(papanSkorStore.getSnapshot(), nilai));
        void kirimSkor("lari", {
          nama: pemain,
          skor: nilai,
          pada: new Date().toISOString(),
        }).then(() => setPenyegar((n) => n + 1));
        statusRef.current = "selesai";
        setStatus("selesai");
        return;
      }

      raf = requestAnimationFrame(gambar);
    };

    raf = requestAnimationFrame(gambar);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  React.useEffect(() => {
    const turun = (e: KeyboardEvent) => {
      // Jangan rebut papan ketik saat pengguna sedang mengetik namanya.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (statusRef.current !== "main") mainkan();
        else aksiRef.current = "lompat";
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        aksiRef.current = "menunduk";
      }
    };
    const naik = (e: KeyboardEvent) => {
      if (["Space", "ArrowUp", "KeyW", "ArrowDown", "KeyS"].includes(e.code)) {
        aksiRef.current = "diam";
      }
    };
    window.addEventListener("keydown", turun);
    window.addEventListener("keyup", naik);
    return () => {
      window.removeEventListener("keydown", turun);
      window.removeEventListener("keyup", naik);
    };
  }, [mainkan]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Skor{" "}
          <span className="font-heading text-base font-bold text-brand tabular-nums">
            {angka}
          </span>
        </p>
        {papan[0] && (
          <p className="text-sm text-muted-foreground">
            Rekor{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {papan[0].skor}
            </span>{" "}
            oleh {papan[0].nama}
          </p>
        )}
        {status !== "siap" && (
          <Button variant="outline" size="sm" onClick={mainkan} className="ml-auto">
            <RotateCcw aria-hidden />
            Ulang
          </Button>
        )}
      </div>

      <div
        ref={arenaRef}
        className="relative mt-3 overflow-hidden rounded-2xl border bg-gradient-to-b from-blush/35 to-card"
        style={{ height: ARENA }}
      >
        <div className="absolute inset-x-0 bottom-8 h-px bg-brand/30" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-brand-soft/60" aria-hidden />

        <div
          ref={pemainRef}
          className="absolute bottom-8 left-0 flex items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-md shadow-brand/30"
          aria-hidden
        >
          <GraduationCap className="size-4" />
        </div>

        {/* Rintangan kini bergambar ikon, bukan bertulisan. Teks sekecil itu
            mustahil dibaca begitu larinya cepat — dan membacanya justru
            memaksa pemain berhenti memperhatikan lompatannya. */}
        {Array.from({ length: KOLAM }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              kotakRef.current[i] = el;
            }}
            className="absolute bottom-8 left-0 flex items-center justify-center rounded-lg border-2 border-warn/50 bg-warn-muted text-warn opacity-0"
            aria-hidden
          >
            {slotIkon[i] &&
              React.createElement(IKON[slotIkon[i]] ?? FileWarning, {
                className: "size-5",
                "aria-hidden": true,
              })}
          </div>
        ))}

        {status !== "main" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/85 p-5 text-center backdrop-blur-sm">
            {status === "siap" ? (
              <>
                <p className="font-heading text-base font-semibold">
                  Lari menuju wisuda
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Lompati tenggat yang menghadang, tunduki yang melayang. Setiap
                  rintangan adalah alasan nyata mahasiswa mengulang.
                </p>
                <div className="flex w-full max-w-xs flex-col gap-2">
                  <label htmlFor="nama-pemain" className="sr-only">
                    Nama kamu
                  </label>
                  <Input
                    id="nama-pemain"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder={namaTersimpan || "Nama kamu"}
                    maxLength={MAKS_HURUF_NAMA}
                    autoComplete="off"
                    className="text-center"
                  />
                  <Button onClick={mainkan} disabled={!namaDipakai}>
                    {namaDipakai ? `Mulai, ${namaDipakai}` : "Isi nama dulu"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="font-heading text-base font-semibold text-warn">
                  Kena {penabrak?.label}
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  {penabrak?.fakta}
                </p>
                <p className="text-sm">
                  Skor{" "}
                  <span className="font-heading font-bold text-brand tabular-nums">
                    {angka}
                  </span>
                  {posisiBaru && (
                    <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                      Peringkat {posisiBaru}
                    </span>
                  )}
                </p>
                <Button onClick={mainkan}>Coba lagi</Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
        <Button
          size="lg"
          variant="outline"
          className="h-14"
          onPointerDown={() => {
            if (statusRef.current !== "main") mainkan();
            else aksiRef.current = "lompat";
          }}
          onPointerUp={() => (aksiRef.current = "diam")}
          onPointerLeave={() => (aksiRef.current = "diam")}
        >
          <ArrowUp aria-hidden />
          Lompat
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14"
          onPointerDown={() => (aksiRef.current = "menunduk")}
          onPointerUp={() => (aksiRef.current = "diam")}
          onPointerLeave={() => (aksiRef.current = "diam")}
        >
          <ArrowDown aria-hidden />
          Menunduk
        </Button>
      </div>

      <p className="mt-3 hidden text-xs text-muted-foreground sm:block">
        Spasi atau panah atas untuk melompat, panah bawah untuk menunduk.
      </p>

      <PapanSkorPanel permainan="lari" penyegar={penyegar} />
    </div>
  );
}
