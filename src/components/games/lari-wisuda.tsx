"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, GraduationCap, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

/** Tinggi arena bermain, dalam piksel. */
const ARENA = 210;
/** Banyaknya kotak rintangan yang disiapkan; tidak pernah lebih dari ini di layar. */
const KOLAM = 5;

type Status = "siap" | "main" | "selesai";

export function LariWisuda() {
  const [status, setStatus] = React.useState<Status>("siap");
  const [angka, setAngka] = React.useState(0);
  const [rekor, setRekor] = React.useState(0);
  const [penabrak, setPenabrak] = React.useState<Keadaan["penabrak"]>(null);

  const arenaRef = React.useRef<HTMLDivElement>(null);
  const pemainRef = React.useRef<HTMLDivElement>(null);
  const kotakRef = React.useRef<(HTMLDivElement | null)[]>([]);

  const keadaanRef = React.useRef<Keadaan>(mulai());
  const aksiRef = React.useRef<Aksi>("diam");
  const statusRef = React.useRef<Status>("siap");

  const mainkan = React.useCallback(() => {
    keadaanRef.current = mulai();
    aksiRef.current = "diam";
    setPenabrak(null);
    setAngka(0);
    statusRef.current = "main";
    setStatus("main");
  }, []);

  // Satu gelung animasi untuk seluruh permainan. Posisi diperbarui langsung ke
  // gaya elemen, bukan lewat state React — kalau tiap frame memicu render
  // ulang, permainannya tersendat justru saat paling ramai.
  React.useEffect(() => {
    if (status !== "main") return;

    let raf = 0;
    let terakhir = performance.now();
    let hitungSkor = 0;

    const gambar = (kini: number) => {
      const dt = (kini - terakhir) / 1000;
      terakhir = kini;

      const lebar = arenaRef.current?.clientWidth ?? 640;
      const k = langkah(keadaanRef.current, dt, aksiRef.current, Math.random, lebar);
      keadaanRef.current = k;

      // Pemain
      const p = pemainRef.current;
      if (p) {
        const menunduk = k.menunduk && k.y <= 0.5;
        const tinggi = menunduk ? PEMAIN_TINGGI_MENUNDUK : PEMAIN_TINGGI;
        p.style.height = `${tinggi}px`;
        p.style.transform = `translate3d(${PEMAIN_X}px, ${-k.y}px, 0)`;
      }

      // Rintangan
      for (let i = 0; i < KOLAM; i++) {
        const el = kotakRef.current[i];
        if (!el) continue;
        const r = k.rintangan[i];
        if (!r) {
          el.style.opacity = "0";
          el.style.transform = "translate3d(-999px, 0, 0)";
          continue;
        }
        const bawah = r.terbang ? TINGGI_TERBANG : 0;
        el.style.opacity = "1";
        el.style.width = `${r.w}px`;
        el.style.height = `${r.h}px`;
        el.style.transform = `translate3d(${r.x}px, ${-bawah}px, 0)`;
        const label = el.firstElementChild as HTMLElement | null;
        if (label && label.textContent !== r.label) label.textContent = r.label;
        if (label) {
          label.style.bottom = r.terbang ? "auto" : `${r.h + 6}px`;
          label.style.top = r.terbang ? `${r.h + 6}px` : "auto";
        }
      }

      // Skor diperbarui lima kali per detik saja, bukan tiap frame.
      hitungSkor += dt;
      if (hitungSkor > 0.2) {
        hitungSkor = 0;
        setAngka(skor(k));
      }

      if (k.selesai) {
        const nilai = skor(k);
        setAngka(nilai);
        setRekor((r) => Math.max(r, nilai));
        setPenabrak(k.penabrak);
        statusRef.current = "selesai";
        setStatus("selesai");
        return;
      }

      raf = requestAnimationFrame(gambar);
    };

    raf = requestAnimationFrame(gambar);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  // Papan ketik: spasi dan panah atas melompat, panah bawah menunduk.
  React.useEffect(() => {
    const turun = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        // Spasi menggulirkan halaman kalau tidak ditahan, dan itu membuat
        // arena melompat keluar layar tepat saat pemain butuh melihatnya.
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
        {rekor > 0 && (
          <p className="text-sm text-muted-foreground">
            Terbaik{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {rekor}
            </span>
          </p>
        )}
        {status !== "siap" && (
          <Button variant="outline" size="sm" onClick={mainkan} className="ml-auto">
            <RotateCcw aria-hidden />
            Ulang
          </Button>
        )}
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        className="relative mt-3 overflow-hidden rounded-2xl border bg-gradient-to-b from-blush/35 to-card"
        style={{ height: ARENA }}
      >
        {/* Garis tanah */}
        <div className="absolute inset-x-0 bottom-8 h-px bg-brand/30" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-8 bg-brand-soft/60"
          aria-hidden
        />

        {/* Pemain */}
        <div
          ref={pemainRef}
          className="absolute bottom-8 left-0 flex items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-md shadow-brand/30"
          style={{
            width: PEMAIN_LEBAR,
            height: PEMAIN_TINGGI,
            transform: `translate3d(${PEMAIN_X}px, 0, 0)`,
          }}
          aria-hidden
        >
          <GraduationCap className="size-4" />
        </div>

        {/* Kolam rintangan; jumlahnya tetap supaya tidak ada elemen yang
            dibuat dan dibuang setiap frame. */}
        {Array.from({ length: KOLAM }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              kotakRef.current[i] = el;
            }}
            className="absolute bottom-8 left-0 rounded-md border border-warn/40 bg-warn-muted opacity-0"
            aria-hidden
          >
            <span className="absolute left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap text-warn" />
          </div>
        ))}

        {/* Lapisan pesan */}
        {status !== "main" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/80 p-5 text-center backdrop-blur-sm">
            {status === "siap" ? (
              <>
                <p className="font-heading text-base font-semibold">
                  Lari menuju wisuda
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Lompati tenggat yang menghadang, tunduki yang melayang. Setiap
                  rintangan adalah alasan nyata mahasiswa mengulang.
                </p>
                <Button onClick={mainkan}>Mulai lari</Button>
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
                </p>
                <Button onClick={mainkan}>Coba lagi</Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Kendali sentuh. Di layar sentuh tidak ada papan ketik, jadi tombolnya
          harus ada — dan dibuat besar supaya bisa ditekan sambil berlari. */}
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

      <p className={cn("mt-3 text-xs text-muted-foreground", "hidden sm:block")}>
        Spasi atau panah atas untuk melompat, panah bawah untuk menunduk.
      </p>
    </div>
  );
}
