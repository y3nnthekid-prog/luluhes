"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Memunculkan isinya saat tergulir ke layar.
 *
 * Keadaan tersembunyi diatur CSS di balik kelas `.js-reveal` pada <html>, yang
 * dipasang skrip kecil di layout. Jadi kalau JavaScript tidak jalan, komponen
 * ini merender isinya apa adanya dan tetap terbaca. Animasi tidak boleh sampai
 * menyembunyikan isi website.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Jeda dalam milidetik, untuk memunculkan sederet elemen bergiliran. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = React.useRef<HTMLElement | null>(null);

  // Ref berupa fungsi yang menerima HTMLElement, bukan ref bertipe satu elemen.
  // Tanpa itu tipe `as` yang bisa berganti-ganti tag membuat tipe ref-nya
  // saling beririsan dan tidak pernah cocok.
  const pasang = React.useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Peramban lama tanpa IntersectionObserver langsung ditampilkan saja.
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    observer.observe(el);

    /*
     * Jaring pengaman.
     *
     * Memeriksa keberadaan IntersectionObserver saja ternyata tidak cukup: ia
     * bisa ada tetapi tidak pernah menyala, misalnya di tab yang pembaruan
     * gambarnya dibekukan. Waktu pengujian seluruh isi halaman ini benar-benar
     * tidak pernah muncul karena itu. Jadi setelah dua detik, isinya
     * ditampilkan apa pun yang terjadi — halaman kosong jauh lebih buruk
     * daripada halaman tanpa animasi.
     */
    const pengaman = window.setTimeout(() => {
      el.dataset.shown = "true";
      observer.disconnect();
    }, 2000);

    return () => {
      window.clearTimeout(pengaman);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={pasang}
      data-reveal=""
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
