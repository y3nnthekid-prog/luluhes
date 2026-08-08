"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Frasa yang berputar di judul hero.
 *
 * Sengaja bukan kata sifat ("hebat", "mudah", "modern") — kata begitu bisa
 * ditempel ke website mana pun dan justru membuatnya terasa dicetak dari
 * cetakan yang sama dengan ribuan website lain. Yang dipakai di sini adalah
 * kekhawatiran yang benar-benar dibawa mahasiswa HES, ditempelkan ke nama
 * tahap yang mereka pakai sehari-hari. Dalam tiga detik pertama pengunjung
 * sudah tahu website ini bicara soal apa, tanpa perlu membaca paragraf.
 *
 * `tahap` menunjuk slug di stages.json dan diuji di kata-berputar.test.ts,
 * supaya frasa promosi di sini tidak diam-diam menyimpang dari data yang
 * sebenarnya ada halamannya.
 */
export const FRASA_HERO = [
  { teks: "syarat sempro", tahap: "sempro" },
  { teks: "berkas komprehensif", tahap: "komprehensif" },
  { teks: "jadwal munaqosyah", tahap: "munaqosyah" },
  { teks: "alur yudisium", tahap: "yudisium" },
  { teks: "tanggal wisuda", tahap: "wisuda" },
] as const;

/** Berapa lama satu frasa bertahan sebelum berganti. */
const JEDA_MS = 2600;

export function KataBerputar() {
  const kurangiGerak = useReducedMotion();
  const [indeks, setIndeks] = React.useState(0);

  React.useEffect(() => {
    // Yang meminta gerakan dikurangi tidak mendapat putaran sama sekali:
    // teks berganti sendiri di tengah kalimat justru paling mengganggu bagi
    // mereka. Frasa pertama tetap tampil, jadi kalimatnya tidak pernah pincang.
    if (kurangiGerak) return;

    const jam = window.setInterval(
      () => setIndeks((n) => (n + 1) % FRASA_HERO.length),
      JEDA_MS,
    );
    return () => window.clearInterval(jam);
  }, [kurangiGerak]);

  // Frasa terpanjang dipakai sebagai penyangga lebar. Tanpa ini judulnya
  // melar-mengkerut tiap pergantian, dan di layar sempit seluruh baris ikut
  // melompat — persis jenis goyangan yang membuat halaman terasa murah.
  const terpanjang = FRASA_HERO.reduce((a, b) =>
    b.teks.length > a.teks.length ? b : a,
  ).teks;

  const sekarang = FRASA_HERO[indeks];

  return (
    <>
      {/*
       * Pembaca layar mendapat kalimat utuh sekali jalan. Yang berputar di
       * layar disembunyikan darinya: nama aksesibel yang berubah tiap 2,6
       * detik membuat judulnya terdengar berganti-ganti tanpa sebab.
       */}
      <span className="sr-only">
        {FRASA_HERO.map((f) => f.teks).join(", ")}.
      </span>

      <span
        aria-hidden
        className="relative inline-grid text-left align-bottom"
      >
        {/* Penyangga lebar; tidak pernah terlihat, tapi ikut menentukan ukuran. */}
        <span className="invisible col-start-1 row-start-1">{terpanjang}</span>

        <AnimatePresence mode="popLayout" initial={false}>
          {/*
           * Sengaja tanpa `.sorot-kata`. Stabilonya digambar dengan jeda 900ms
           * sekali jalan; ditempel ke elemen yang berganti tiap 2,6 detik, ia
           * menggambar ulang terus-menerus dan justru jadi berisik. Warna
           * aksen sudah cukup memisahkannya dari sisa kalimat.
           */}
          <motion.span
            key={sekarang.teks}
            className="col-start-1 row-start-1 text-surface-accent"
            initial={kurangiGerak ? false : { opacity: 0, y: "0.45em" }}
            animate={{ opacity: 1, y: 0 }}
            exit={kurangiGerak ? undefined : { opacity: 0, y: "-0.45em" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {sekarang.teks}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}
