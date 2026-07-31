"use client";

import * as React from "react";

/**
 * Angka yang menghitung naik saat pertama terlihat.
 *
 * Nilai akhirnya dirender lebih dulu di server, lalu animasi hanya menurunkan
 * angkanya sebentar sebelum naik kembali. Urutan itu disengaja: kalau
 * JavaScript tidak jalan, yang tampil sudah angka yang benar, bukan nol.
 */
export function CountUp({
  value,
  duration = 1100,
}: {
  value: number;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [tampil, setTampil] = React.useState(value);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const kurangiGerak = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (kurangiGerak || typeof IntersectionObserver === "undefined") return;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();

        const mulai = performance.now();
        const langkah = (kini: number) => {
          const t = Math.min(1, (kini - mulai) / duration);
          // Melambat di ujung, supaya berhentinya terasa mendarat.
          const eased = 1 - Math.pow(1 - t, 3);
          setTampil(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(langkah);
        };
        setTampil(0);
        raf = requestAnimationFrame(langkah);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {tampil}
    </span>
  );
}
