/**
 * Mesin permainan "Lari Menuju Wisuda".
 *
 * Seluruh aturan mainnya murni perhitungan: tidak menyentuh DOM, canvas,
 * maupun waktu nyata. Itu disengaja supaya fisikanya bisa diuji tanpa layar —
 * langkah waktu disuntikkan dari luar, begitu juga sumber acaknya.
 */

/** Tinggi lompatan dan gravitasi dipilih supaya satu lompatan ± 0,62 detik. */
export const GRAVITASI = -2600;
export const KECEPATAN_LOMPAT = 810;

export const PEMAIN_X = 56;
export const PEMAIN_LEBAR = 32;
export const PEMAIN_TINGGI = 46;
/** Saat menunduk badannya memendek — itulah gunanya menunduk. */
export const PEMAIN_TINGGI_MENUNDUK = 26;

export const KECEPATAN_AWAL = 330;
export const KECEPATAN_MAKS = 760;
/** Pertambahan kecepatan per detik. */
export const PERCEPATAN = 7;

export type Aksi = "lompat" | "menunduk" | "diam";

export type Rintangan = {
  id: number;
  x: number;
  w: number;
  h: number;
  /** Rintangan terbang harus ditunduki, bukan dilompati. */
  terbang: boolean;
  /**
   * Nama ikon yang digambar di dalam kotak rintangan.
   *
   * Sengaja berupa teks, bukan komponen: berkas ini tidak boleh menyentuh
   * React sama sekali supaya fisikanya tetap bisa diuji tanpa layar.
   * Pemetaan nama ke ikon dilakukan di komponen permainannya.
   */
  ikon: string;
  /** Dipakai hanya di layar kalah, bukan di dalam arena. */
  label: string;
  fakta: string;
};

/** Ketinggian bagian bawah rintangan terbang, di atas tanah. */
export const TINGGI_TERBANG = 34;

type Contoh = Omit<Rintangan, "id" | "x">;

/**
 * Katalog rintangan.
 *
 * Setiap satu adalah alasan nyata mahasiswa mengulang, dan faktanya diambil
 * dari data yang sama dengan halaman tahapan. Menabrak sesuatu di sini berarti
 * membaca aturan yang sebenarnya — itu inti permainannya.
 */
export const KATALOG: Contoh[] = [
  {
    w: 36, h: 42, terbang: false, ikon: "persen",
    label: "Turnitin 41%",
    fakta: "Batas Turnitin skripsi 30%. Lebih dari itu, berkas munaqosyah tidak diterima.",
  },
  {
    w: 36, h: 54, terbang: false, ikon: "kalender",
    label: "Revisi lewat 3 bulan",
    fakta: "Masa revisi setelah munaqosyah maksimal 3 bulan. Lewat itu, skripsi diujikan kembali.",
  },
  {
    w: 38, h: 40, terbang: false, ikon: "jam-pasir",
    label: "Bimbingan lewat 6 bulan",
    fakta: "Lama bimbingan skripsi maksimal 6 bulan sejak pembimbing ditetapkan.",
  },
  {
    w: 36, h: 48, terbang: false, ikon: "tumpukan",
    label: "SKS belum cukup",
    fakta: "Seminar proposal butuh minimal 100 SKS. Munaqosyah butuh minimal 138 SKS.",
  },
  {
    w: 36, h: 44, terbang: false, ikon: "berkas",
    label: "Revisi sempro lewat 1 bulan",
    fakta: "Perbaikan setelah seminar proposal maksimal 1 bulan. Lewat itu, proposal diseminarkan ulang.",
  },
  {
    w: 44, h: 32, terbang: true, ikon: "weker",
    label: "Daftar lewat pukul 16.00",
    fakta: "Pendaftaran ujian ditutup pukul 16.00 WIB. Telat semenit berarti menunggu bulan berikutnya.",
  },
  {
    w: 44, h: 32, terbang: true, ikon: "papan",
    label: "Lupa isi SKPI",
    fakta: "SKPI wajib diisi di AIS sebelum mendaftar munaqosyah.",
  },
  {
    w: 44, h: 32, terbang: true, ikon: "stempel",
    label: "Stempel Turnitin kering",
    fakta: "Hasil Turnitin wajib berstempel basah dari Perpustakaan Fakultas, bukan tangkapan layar.",
  },
];

export type Keadaan = {
  waktu: number;
  jarak: number;
  kecepatan: number;
  /** Tinggi kaki pemain di atas tanah. */
  y: number;
  vy: number;
  menunduk: boolean;
  rintangan: Rintangan[];
  /** Jarak tempuh saat rintangan berikutnya dilepas. */
  spawnBerikut: number;
  selesai: boolean;
  penabrak: Rintangan | null;
  idBerikut: number;
};

export function mulai(): Keadaan {
  return {
    waktu: 0,
    jarak: 0,
    kecepatan: KECEPATAN_AWAL,
    y: 0,
    vy: 0,
    menunduk: false,
    rintangan: [],
    spawnBerikut: 420,
    selesai: false,
    penabrak: null,
    idBerikut: 1,
  };
}

export function tinggiPemain(k: Keadaan): number {
  // Menunduk hanya berlaku saat menapak tanah; di udara badannya tetap tegak.
  return k.menunduk && k.y <= 0.5 ? PEMAIN_TINGGI_MENUNDUK : PEMAIN_TINGGI;
}

/** Kotak pembatas pemain, dalam koordinat dunia. */
export function kotakPemain(k: Keadaan) {
  return {
    kiri: PEMAIN_X,
    kanan: PEMAIN_X + PEMAIN_LEBAR,
    bawah: k.y,
    atas: k.y + tinggiPemain(k),
  };
}

export function kotakRintangan(r: Rintangan) {
  const bawah = r.terbang ? TINGGI_TERBANG : 0;
  return { kiri: r.x, kanan: r.x + r.w, bawah, atas: bawah + r.h };
}

export function bertabrakan(k: Keadaan, r: Rintangan): boolean {
  const a = kotakPemain(k);
  const b = kotakRintangan(r);
  // Sedikit kelonggaran supaya tabrakan terasa adil, bukan menjebak.
  const m = 4;
  return (
    a.kanan - m > b.kiri &&
    a.kiri + m < b.kanan &&
    a.atas - m > b.bawah &&
    a.bawah + m < b.atas
  );
}

/**
 * Memajukan permainan satu langkah waktu.
 *
 * `dt` dalam detik dan `acak` disuntikkan dari luar supaya hasilnya bisa
 * diulang persis di pengujian.
 */
export function langkah(
  k: Keadaan,
  dt: number,
  aksi: Aksi,
  acak: () => number = Math.random,
  lebarLayar = 640,
): Keadaan {
  if (k.selesai) return k;

  // Langkah waktu dibatasi supaya tab yang sempat tidak aktif tidak membuat
  // pemain menembus rintangan dalam satu lompatan perhitungan.
  const d = Math.min(dt, 1 / 30);

  const diTanah = k.y <= 0;
  let vy = k.vy;
  let y = k.y;

  if (aksi === "lompat" && diTanah) vy = KECEPATAN_LOMPAT;
  // Menunduk saat melayang membuat jatuhnya lebih cepat — terasa lebih enak.
  const gravitasi = aksi === "menunduk" && !diTanah ? GRAVITASI * 1.9 : GRAVITASI;

  vy += gravitasi * d;
  y += vy * d;
  if (y <= 0) {
    y = 0;
    vy = 0;
  }

  const kecepatan = Math.min(KECEPATAN_MAKS, k.kecepatan + PERCEPATAN * d);
  const maju = kecepatan * d;
  const jarak = k.jarak + maju;

  let rintangan = k.rintangan
    .map((r) => ({ ...r, x: r.x - maju }))
    .filter((r) => r.x + r.w > -40);

  let spawnBerikut = k.spawnBerikut;
  let idBerikut = k.idBerikut;
  if (jarak >= spawnBerikut) {
    const contoh = KATALOG[Math.floor(acak() * KATALOG.length)];
    rintangan = [...rintangan, { ...contoh, id: idBerikut, x: lebarLayar + 30 }];
    idBerikut++;
    // Jarak antar rintangan mengikuti kecepatan, jadi selalu ada waktu bereaksi.
    const jeda = kecepatan * (0.95 + acak() * 0.75);
    spawnBerikut = jarak + jeda;
  }

  const lanjut: Keadaan = {
    waktu: k.waktu + d,
    jarak,
    kecepatan,
    y,
    vy,
    menunduk: aksi === "menunduk",
    rintangan,
    spawnBerikut,
    selesai: false,
    penabrak: null,
    idBerikut,
  };

  const kena = rintangan.find((r) => bertabrakan(lanjut, r));
  if (kena) return { ...lanjut, selesai: true, penabrak: kena };

  return lanjut;
}

/** Skor yang ditampilkan: satu angka per lima piksel jarak tempuh. */
export function skor(k: Keadaan): number {
  return Math.floor(k.jarak / 5);
}
