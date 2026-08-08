"use client";

import * as React from "react";

/** Berapa lama menunggu bukti bahwa IntersectionObserver hidup. */
export const AMBANG_PENGAMAN_MS = 2000;

/**
 * Jaring pengaman untuk animasi yang bergantung pada IntersectionObserver.
 *
 * Animasi "muncul saat tergulir" hanya menyala kalau IO benar-benar bekerja.
 * Di lingkungan yang IO-nya ada tapi tidak pernah memanggil balik — tab
 * tersembunyi, misalnya, tempat peramban membekukan IO — elemennya tersangkut
 * di keadaan tersembunyi selamanya. Isinya sudah ada di DOM, tapi tidak
 * seorang pun bisa melihatnya. Halaman kosong jauh lebih buruk daripada
 * halaman tanpa animasi.
 *
 * Yang dijadikan bukti "IO menyala" adalah panggilan baliknya yang pertama,
 * bukan `isIntersecting`-nya: observer yang sehat selalu memanggil balik sekali
 * segera sesudah `observe()`, entah elemennya sedang terlihat atau tidak.
 * Membedakan keduanya penting — kalau pengaman menyala tanpa syarat setelah
 * sekian detik, di halaman panjang semua blok yang belum tergulir ikut muncul
 * serentak dan animasi gulirnya jadi sia-sia.
 *
 * Catatan bagi pemakainya: lingkungan yang membekukan IO umumnya membekukan
 * `requestAnimationFrame` juga. Jadi begitu pengaman ini menyala, jangan
 * memunculkan isinya lewat pustaka animasi — pustaka itu butuh rAF dan justru
 * sedang ikut beku. Tulis keadaan tampaknya langsung.
 *
 * Mengembalikan `[paksaTampil, pasang]`; `pasang` dipasang sebagai `ref` pada
 * elemen mana pun yang mewakili blok ini.
 */
export function usePengamanTampil<T extends Element>(): [
  boolean,
  (node: T | null) => void,
] {
  const [paksaTampil, setPaksaTampil] = React.useState(false);
  const ref = React.useRef<T | null>(null);

  const pasang = React.useCallback((node: T | null) => {
    ref.current = node;
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Peramban lama tanpa IntersectionObserver: tidak akan pernah ada yang
    // memicu animasinya, jadi langsung tampilkan saja. Lewat timer supaya
    // setState-nya tidak terjadi saat efek masih berjalan.
    if (typeof IntersectionObserver === "undefined") {
      const segera = window.setTimeout(() => setPaksaTampil(true), 0);
      return () => window.clearTimeout(segera);
    }

    let pengaman = 0;
    const pengintai = new IntersectionObserver(() => {
      window.clearTimeout(pengaman);
      pengintai.disconnect();
    });
    pengintai.observe(el);

    pengaman = window.setTimeout(
      () => setPaksaTampil(true),
      AMBANG_PENGAMAN_MS,
    );

    return () => {
      window.clearTimeout(pengaman);
      pengintai.disconnect();
    };
  }, []);

  return [paksaTampil, pasang];
}
