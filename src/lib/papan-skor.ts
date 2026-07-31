import { createLocalStore } from "@/lib/local-store";

/**
 * Papan skor "Lari Menuju Wisuda".
 *
 * Tersimpan di Local Storage peramban masing-masing, sama seperti progres
 * checklist: tidak ada akun, tidak ada server, dan skor siapa pun tidak pernah
 * meninggalkan perangkatnya sendiri.
 */

export type SkorEntri = {
  nama: string;
  skor: number;
  /** Tanggal ISO, dipakai memutus seri: yang lebih dulu mencapai tetap di atas. */
  pada: string;
};

export const BATAS_PAPAN = 7;
export const MAKS_HURUF_NAMA = 16;

/**
 * Merapikan nama yang diketik.
 *
 * Nama ini ditampilkan kembali di halaman, jadi karakter kendali dan spasi
 * berlebih dibuang lebih dulu. Panjangnya dipangkas supaya satu orang tidak
 * bisa merusak tata letak papan dengan nama sepanjang paragraf.
 */
export function rapikanNama(mentah: string): string {
  const bersih = mentah
    // Karakter kendali dibuang: nama ini dirender kembali ke halaman.
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return bersih.slice(0, MAKS_HURUF_NAMA);
}

/** Menyisipkan satu skor lalu mengembalikan tujuh besar yang sudah urut. */
export function tambahSkor(
  daftar: SkorEntri[],
  baru: SkorEntri,
): SkorEntri[] {
  return [...daftar, baru]
    .sort((a, b) => b.skor - a.skor || a.pada.localeCompare(b.pada))
    .slice(0, BATAS_PAPAN);
}

/**
 * Peringkat sebuah skor bila dimasukkan sekarang, mulai dari 1.
 * Mengembalikan null kalau skornya tidak masuk tujuh besar.
 */
export function peringkatUntuk(daftar: SkorEntri[], skor: number): number | null {
  const lebihTinggi = daftar.filter((e) => e.skor >= skor).length;
  const posisi = lebihTinggi + 1;
  return posisi <= BATAS_PAPAN ? posisi : null;
}

function bacaDaftar(raw: string): SkorEntri[] {
  try {
    const isi: unknown = JSON.parse(raw);
    if (!Array.isArray(isi)) return [];
    return isi
      .filter(
        (e): e is SkorEntri =>
          !!e &&
          typeof e === "object" &&
          typeof (e as SkorEntri).nama === "string" &&
          typeof (e as SkorEntri).skor === "number" &&
          Number.isFinite((e as SkorEntri).skor),
      )
      .map((e) => ({
        nama: rapikanNama(e.nama) || "Tanpa nama",
        skor: Math.max(0, Math.floor(e.skor)),
        pada: typeof e.pada === "string" ? e.pada : "",
      }))
      .sort((a, b) => b.skor - a.skor || a.pada.localeCompare(b.pada))
      .slice(0, BATAS_PAPAN);
  } catch {
    return [];
  }
}

export const papanSkorStore = createLocalStore<SkorEntri[]>(
  "lulus-hes:papan-skor:v1",
  [],
  bacaDaftar,
);

export const namaPemainStore = createLocalStore<string>(
  "lulus-hes:nama-pemain:v1",
  "",
  (raw) => {
    try {
      const isi: unknown = JSON.parse(raw);
      return typeof isi === "string" ? rapikanNama(isi) : "";
    } catch {
      return "";
    }
  },
);
