import { stages } from "@/lib/data";

/**
 * Bank soal untuk Ruang Main.
 *
 * Seluruhnya dibangun dari `stages.json`, bukan ditulis ulang di sini. Jadi
 * begitu datanya diperbarui, soalnya ikut terbarui — dan tidak akan pernah ada
 * pertanyaan yang jawabannya bertentangan dengan isi halaman tahapan.
 */

export type Soal = {
  id: string;
  /** Potongan teks yang harus ditebak asal tahapnya. */
  petunjuk: string;
  jenis: "Syarat" | "Dokumen" | "Peringatan" | "Langkah";
  /** Slug tahap yang benar. */
  jawaban: string;
  /** Empat slug tahap sebagai pilihan, termasuk jawabannya. */
  pilihan: string[];
};

/** Kata yang terlalu umum untuk dianggap membocorkan nama tahap. */
const umum = new Set([
  "tahap", "dan", "atau", "skripsi", "ujian", "proposal", "berkas", "penelitian",
  "pengesahan", "pendaftaran", "penunjukan", "validasi", "persiapan",
]);

function kataKhas(judul: string): string[] {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !umum.has(w));
}

/**
 * Menolak potongan yang menyebut nama tahapnya sendiri.
 *
 * Tanpa saringan ini sebagian besar soal jadi hadiah gratis: potongannya
 * berbunyi "…mendaftar munaqosyah…" dan pilihan jawabannya memuat kata yang
 * sama persis.
 */
function membocorkan(teks: string, khas: string[]): boolean {
  const rendah = teks.toLowerCase();
  return khas.some((k) => rendah.includes(k));
}

/**
 * Pengecoh diambil dari tahap yang berdekatan, bukan acak.
 *
 * Membedakan syarat munaqosyah dari syarat komprehensif itu justru pengetahuan
 * yang berguna; membedakannya dari wisuda tidak mengajarkan apa pun.
 */
function pengecoh(indeks: number): string[] {
  const hasil: string[] = [];
  for (const jarak of [1, -1, 2, -2, 3, -3, 4, -4]) {
    const lain = stages[indeks + jarak];
    if (lain && !hasil.includes(lain.slug)) hasil.push(lain.slug);
    if (hasil.length === 3) break;
  }
  return hasil;
}

/** Dibangun sekali, urutannya tetap — pengacakan dilakukan di sisi peramban. */
export const bankSoal: Soal[] = stages.flatMap((stage, indeks) => {
  const khas = kataKhas(stage.title);
  const lawan = pengecoh(indeks);
  if (lawan.length < 3) return [];

  const potongan: { teks: string; jenis: Soal["jenis"] }[] = [
    ...stage.requirements.map((r) => ({ teks: r.text, jenis: "Syarat" as const })),
    ...stage.documents.map((d) => ({ teks: d.name, jenis: "Dokumen" as const })),
    ...stage.warnings.map((w) => ({ teks: w.text, jenis: "Peringatan" as const })),
    ...stage.steps.map((s) => ({ teks: s.detail, jenis: "Langkah" as const })),
  ];

  return potongan
    .filter((p) => p.teks.length >= 40 && !membocorkan(p.teks, khas))
    .slice(0, 4)
    .map((p, i) => ({
      id: `${stage.slug}-${i}`,
      petunjuk: p.teks.length > 220 ? `${p.teks.slice(0, 217)}…` : p.teks,
      jenis: p.jenis,
      jawaban: stage.slug,
      pilihan: [stage.slug, ...lawan],
    }));
});

/** Urutan tahap yang benar, dipakai permainan menyusun alur. */
export const urutanBenar = stages.map((s) => ({
  slug: s.slug,
  order: s.order,
  shortTitle: s.shortTitle,
  title: s.title,
  icon: s.icon,
}));

export const judulTahap = new Map(stages.map((s) => [s.slug, s.title]));
