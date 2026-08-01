/**
 * Mesin permainan "Blast Berkas".
 *
 * Papan delapan kali delapan. Tiga potongan berkas ditawarkan sekaligus; taruh
 * salah satunya di papan, dan setiap baris atau kolom yang penuh akan lenyap.
 * Permainan berakhir ketika tak satu pun potongan yang tersisa masih muat.
 *
 * Seperti mesin permainan lari, berkas ini murni perhitungan: tanpa DOM, tanpa
 * React, tanpa waktu nyata. Sumber acaknya disuntikkan dari luar supaya seluruh
 * jalannya permainan bisa diulang persis di pengujian.
 */

export const UKURAN = 8;

/** Papan disimpan datar; nilai 0 berarti kosong, selain itu nomor warna. */
export type Papan = number[];

export type Bentuk = {
  id: string;
  nama: string;
  /** Koordinat sel relatif terhadap sudut kiri atas bentuk. */
  sel: [number, number][];
  warna: number;
};

/**
 * Katalog potongan.
 *
 * Namanya sengaja memakai berkas yang benar-benar dikumpulkan saat mengurus
 * kelulusan — jadi sambil bermain, istilahnya ikut lekat.
 */
export const BENTUK: Omit<Bentuk, "id">[] = [
  { nama: "Lembar tunggal", sel: [[0, 0]], warna: 1 },
  { nama: "Lembar ganda", sel: [[0, 0], [0, 1]], warna: 2 },
  { nama: "Berkas tegak", sel: [[0, 0], [1, 0]], warna: 2 },
  { nama: "Map tiga lembar", sel: [[0, 0], [0, 1], [0, 2]], warna: 3 },
  { nama: "Bundel tegak", sel: [[0, 0], [1, 0], [2, 0]], warna: 3 },
  { nama: "Skripsi jilid", sel: [[0, 0], [0, 1], [1, 0], [1, 1]], warna: 4 },
  { nama: "Stopmap sudut", sel: [[0, 0], [1, 0], [1, 1]], warna: 5 },
  { nama: "Sudut terbalik", sel: [[0, 0], [0, 1], [1, 1]], warna: 5 },
  { nama: "Tanda tangan L", sel: [[0, 0], [1, 0], [2, 0], [2, 1]], warna: 6 },
  { nama: "Berkas panjang", sel: [[0, 0], [0, 1], [0, 2], [0, 3]], warna: 7 },
  { nama: "Tumpukan tegak", sel: [[0, 0], [1, 0], [2, 0], [3, 0]], warna: 7 },
  { nama: "Setumpuk map", sel: [[0, 0], [0, 1], [1, 0]], warna: 5 },
];

export function papanKosong(): Papan {
  return new Array(UKURAN * UKURAN).fill(0);
}

export function indeks(baris: number, kolom: number): number {
  return baris * UKURAN + kolom;
}

/** Apakah bentuk ini muat bila sudut kiri atasnya ditaruh di (baris, kolom)? */
export function muat(
  papan: Papan,
  bentuk: Pick<Bentuk, "sel">,
  baris: number,
  kolom: number,
): boolean {
  for (const [db, dk] of bentuk.sel) {
    const b = baris + db;
    const k = kolom + dk;
    if (b < 0 || b >= UKURAN || k < 0 || k >= UKURAN) return false;
    if (papan[indeks(b, k)] !== 0) return false;
  }
  return true;
}

/** Adakah satu saja tempat di papan yang masih memuat bentuk ini? */
export function adaTempat(papan: Papan, bentuk: Pick<Bentuk, "sel">): boolean {
  for (let b = 0; b < UKURAN; b++) {
    for (let k = 0; k < UKURAN; k++) {
      if (muat(papan, bentuk, b, k)) return true;
    }
  }
  return false;
}

/** Menaruh bentuk; pemanggil wajib memastikan `muat` lebih dulu. */
export function taruh(
  papan: Papan,
  bentuk: Bentuk,
  baris: number,
  kolom: number,
): Papan {
  const baru = [...papan];
  for (const [db, dk] of bentuk.sel) {
    baru[indeks(baris + db, kolom + dk)] = bentuk.warna;
  }
  return baru;
}

export type HasilBersih = {
  papan: Papan;
  barisPenuh: number[];
  kolomPenuh: number[];
  /** Banyaknya sel yang lenyap. */
  selHilang: number;
};

/**
 * Menghapus seluruh baris dan kolom yang penuh.
 *
 * Keduanya ditentukan lebih dulu, baru dihapus bersamaan. Kalau dihapus satu
 * per satu, membersihkan sebuah baris akan membuat kolom yang tadinya penuh
 * jadi tidak penuh lagi — dan satu petak yang menyelesaikan baris sekaligus
 * kolom hanya akan dihitung separuh.
 */
export function bersihkan(papan: Papan): HasilBersih {
  const barisPenuh: number[] = [];
  const kolomPenuh: number[] = [];

  for (let b = 0; b < UKURAN; b++) {
    let penuh = true;
    for (let k = 0; k < UKURAN; k++) {
      if (papan[indeks(b, k)] === 0) {
        penuh = false;
        break;
      }
    }
    if (penuh) barisPenuh.push(b);
  }

  for (let k = 0; k < UKURAN; k++) {
    let penuh = true;
    for (let b = 0; b < UKURAN; b++) {
      if (papan[indeks(b, k)] === 0) {
        penuh = false;
        break;
      }
    }
    if (penuh) kolomPenuh.push(k);
  }

  if (barisPenuh.length === 0 && kolomPenuh.length === 0) {
    return { papan, barisPenuh, kolomPenuh, selHilang: 0 };
  }

  const baru = [...papan];
  const hilang = new Set<number>();
  for (const b of barisPenuh) {
    for (let k = 0; k < UKURAN; k++) hilang.add(indeks(b, k));
  }
  for (const k of kolomPenuh) {
    for (let b = 0; b < UKURAN; b++) hilang.add(indeks(b, k));
  }
  for (const i of hilang) baru[i] = 0;

  return { papan: baru, barisPenuh, kolomPenuh, selHilang: hilang.size };
}

/**
 * Nilai satu langkah.
 *
 * Sel yang ditaruh selalu dihitung. Membersihkan beberapa garis sekaligus
 * dihargai lebih tinggi secara berlipat — itu yang membuat menahan diri demi
 * satu ledakan besar lebih berharga daripada membersihkan satu-satu.
 */
export function nilaiLangkah(
  selDitaruh: number,
  garisBersih: number,
): number {
  if (garisBersih === 0) return selDitaruh;
  return selDitaruh + garisBersih * UKURAN * (garisBersih + 1) / 2;
}

export type Keadaan = {
  papan: Papan;
  /** Tiga tawaran; null berarti sudah terpakai. */
  tawaran: (Bentuk | null)[];
  skor: number;
  selesai: boolean;
  /** Garis yang baru saja lenyap, untuk animasi. */
  baruBersih: { baris: number[]; kolom: number[] };
  urut: number;
};

function ambilBentuk(acak: () => number, urut: number): Bentuk {
  const contoh = BENTUK[Math.floor(acak() * BENTUK.length)];
  return { ...contoh, id: `${urut}` };
}

export function tigaTawaran(
  acak: () => number,
  mulaiUrut: number,
): [Bentuk[], number] {
  const hasil: Bentuk[] = [];
  let urut = mulaiUrut;
  for (let i = 0; i < 3; i++) hasil.push(ambilBentuk(acak, urut++));
  return [hasil, urut];
}

export function mulai(acak: () => number = Math.random): Keadaan {
  const [tawaran, urut] = tigaTawaran(acak, 1);
  return {
    papan: papanKosong(),
    tawaran,
    skor: 0,
    selesai: false,
    baruBersih: { baris: [], kolom: [] },
    urut,
  };
}

/** Apakah masih ada satu pun tawaran yang muat di papan? */
export function masihBisa(papan: Papan, tawaran: (Bentuk | null)[]): boolean {
  return tawaran.some((t) => t !== null && adaTempat(papan, t));
}

/**
 * Menjalankan satu langkah: menaruh tawaran ke-`slot` di (baris, kolom).
 * Mengembalikan keadaan yang sama persis bila langkahnya tidak sah.
 */
export function langkah(
  k: Keadaan,
  slot: number,
  baris: number,
  kolom: number,
  acak: () => number = Math.random,
): Keadaan {
  if (k.selesai) return k;
  const bentuk = k.tawaran[slot];
  if (!bentuk || !muat(k.papan, bentuk, baris, kolom)) return k;

  const setelahTaruh = taruh(k.papan, bentuk, baris, kolom);
  const hasil = bersihkan(setelahTaruh);
  const garis = hasil.barisPenuh.length + hasil.kolomPenuh.length;

  let tawaran: (Bentuk | null)[] = k.tawaran.map((t, i) =>
    i === slot ? null : t,
  );
  let urut = k.urut;
  // Tawaran baru hanya keluar setelah ketiganya habis, bukan satu per satu.
  // Aturan itu yang membuat pemain harus merencanakan tiga langkah sekaligus.
  if (tawaran.every((t) => t === null)) {
    const [baru, urutBaru] = tigaTawaran(acak, urut);
    tawaran = baru;
    urut = urutBaru;
  }

  return {
    papan: hasil.papan,
    tawaran,
    skor: k.skor + nilaiLangkah(bentuk.sel.length, garis),
    selesai: !masihBisa(hasil.papan, tawaran),
    baruBersih: { baris: hasil.barisPenuh, kolom: hasil.kolomPenuh },
    urut,
  };
}

/* ---------------------------------------------------------------- */
/* Menerjemahkan posisi penunjuk menjadi petak papan                 */
/* ---------------------------------------------------------------- */

export type GeometriPapan = {
  /** Tepi kiri dan atas kisi papan, dalam koordinat layar. */
  kiri: number;
  atas: number;
  /** Lebar seluruh kisi. */
  lebar: number;
  /** Jarak antar sel. */
  gap: number;
};

export function ukuranSel(lebarKisi: number, gap: number): number {
  return (lebarKisi - gap * (UKURAN - 1)) / UKURAN;
}

/** Ukuran bentuk dalam satuan petak. */
export function petakBentuk(bentuk: Pick<Bentuk, "sel">) {
  return {
    baris: Math.max(...bentuk.sel.map(([b]) => b)) + 1,
    kolom: Math.max(...bentuk.sel.map(([, k]) => k)) + 1,
  };
}

/**
 * Petak mana yang dituju bila bentuk dijatuhkan di titik ini.
 *
 * Penunjuk diperlakukan sebagai TITIK TENGAH bentuk, bukan sudut kiri atasnya.
 * Menyeret sambil membayangkan sudut kiri atas terasa meleset terus — yang
 * dilihat orang saat menyeret adalah keseluruhan potongannya.
 *
 * `angkat` menaikkan titik acuan sekian piksel di atas penunjuk. Di layar
 * sentuh jari menutupi petak yang sedang dituju, jadi bentuknya digeser ke
 * atas supaya tetap terlihat.
 */
export function selDariTitik(
  x: number,
  y: number,
  geo: GeometriPapan,
  bentuk: Pick<Bentuk, "sel">,
  angkat = 0,
): { baris: number; kolom: number } {
  const sel = ukuranSel(geo.lebar, geo.gap);
  const langkahPx = sel + geo.gap;
  const petak = petakBentuk(bentuk);

  const lebarBentuk = petak.kolom * sel + (petak.kolom - 1) * geo.gap;
  const tinggiBentuk = petak.baris * sel + (petak.baris - 1) * geo.gap;

  const kiriAtasX = x - lebarBentuk / 2;
  const kiriAtasY = y - angkat - tinggiBentuk / 2;

  return {
    baris: Math.round((kiriAtasY - geo.atas) / langkahPx),
    kolom: Math.round((kiriAtasX - geo.kiri) / langkahPx),
  };
}
