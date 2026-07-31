"use client";

import * as React from "react";

/**
 * Jejak lembut yang mengikuti tetikus.
 *
 * Elemennya selalu dirender, dan CSS yang memutuskan kapan ia tampil —
 * hanya pada perangkat bertetikus, dan hanya bila pengguna tidak meminta
 * gerak dikurangi. Menyimpannya di state React akan berarti memanggil
 * setState di dalam effect, yang dilarang aturan lint proyek ini dan memang
 * tidak perlu: keputusannya murni soal kemampuan perangkat, bukan data.
 */
export function CursorLucu() {
  const jejakRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const bisa =
      window.matchMedia?.("(pointer: fine)").matches &&
      !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!bisa) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let jx = x;
    let jy = y;
    let besar = 1;
    let raf = 0;

    const gerak = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      // Membesar di atas apa pun yang bisa diklik, jadi jejaknya sekalian
      // menegaskan mana yang bisa disentuh.
      const t = e.target as HTMLElement | null;
      besar = t?.closest("a, button, [role='button'], summary, label") ? 2 : 1;
    };

    const gelung = () => {
      // Mengejar dengan peredaman, jadi jejaknya menyusul sedikit terlambat.
      jx += (x - jx) * 0.18;
      jy += (y - jy) * 0.18;
      const el = jejakRef.current;
      if (el) {
        el.style.transform = `translate3d(${jx}px, ${jy}px, 0) translate(-50%, -50%) scale(${besar})`;
      }
      raf = requestAnimationFrame(gelung);
    };

    window.addEventListener("pointermove", gerak, { passive: true });
    raf = requestAnimationFrame(gelung);

    return () => {
      window.removeEventListener("pointermove", gerak);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={jejakRef}
      aria-hidden
      className="jejak-kursor pointer-events-none fixed top-0 left-0 z-[100] size-5 rounded-full opacity-70 mix-blend-multiply dark:mix-blend-screen"
      style={{
        background:
          "radial-gradient(circle, var(--pop) 0%, color-mix(in srgb, var(--pop) 35%, transparent) 55%, transparent 72%)",
        transition: "transform 60ms linear",
      }}
    />
  );
}
