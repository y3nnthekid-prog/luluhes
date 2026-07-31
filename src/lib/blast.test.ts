import { describe, expect, test } from "vitest";

import {
  BENTUK,
  UKURAN,
  adaTempat,
  bersihkan,
  indeks,
  langkah,
  masihBisa,
  muat,
  mulai,
  nilaiLangkah,
  papanKosong,
  taruh,
  type Bentuk,
} from "@/lib/blast";

const acakTetap = (n = 0) => () => n;

function bentukDari(nama: string): Bentuk {
  const b = BENTUK.find((x) => x.nama === nama);
  if (!b) throw new Error(`bentuk "${nama}" tidak ada`);
  return { ...b, id: "uji" };
}

const satuSel = bentukDari("Lembar tunggal");
const duaMendatar = bentukDari("Lembar ganda");
const empatPersegi = bentukDari("Skripsi jilid");

describe("menaruh bentuk", () => {
  test("papan kosong berukuran delapan kali delapan", () => {
    const p = papanKosong();
    expect(p).toHaveLength(UKURAN * UKURAN);
    expect(p.every((s) => s === 0)).toBe(true);
  });

  test("bentuk muat di papan kosong", () => {
    expect(muat(papanKosong(), satuSel, 0, 0)).toBe(true);
    expect(muat(papanKosong(), empatPersegi, 3, 3)).toBe(true);
  });

  test("bentuk tidak boleh keluar dari papan", () => {
    expect(muat(papanKosong(), duaMendatar, 0, UKURAN - 1)).toBe(false);
    expect(muat(papanKosong(), satuSel, UKURAN, 0)).toBe(false);
    expect(muat(papanKosong(), satuSel, -1, 0)).toBe(false);
  });

  test("bentuk tidak boleh menimpa sel terisi", () => {
    const p = taruh(papanKosong(), satuSel, 2, 2);
    expect(muat(p, satuSel, 2, 2)).toBe(false);
    expect(muat(p, satuSel, 2, 3)).toBe(true);
  });

  test("menaruh tidak mengubah papan asalnya", () => {
    const asal = papanKosong();
    const baru = taruh(asal, satuSel, 0, 0);
    expect(asal[0]).toBe(0);
    expect(baru[0]).toBe(satuSel.warna);
  });
});

describe("membersihkan garis", () => {
  test("baris penuh lenyap", () => {
    const p = papanKosong();
    for (let k = 0; k < UKURAN; k++) p[indeks(3, k)] = 1;
    const h = bersihkan(p);
    expect(h.barisPenuh).toEqual([3]);
    expect(h.selHilang).toBe(UKURAN);
    expect(h.papan.every((s) => s === 0)).toBe(true);
  });

  test("kolom penuh lenyap", () => {
    const p = papanKosong();
    for (let b = 0; b < UKURAN; b++) p[indeks(b, 5)] = 1;
    const h = bersihkan(p);
    expect(h.kolomPenuh).toEqual([5]);
    expect(h.selHilang).toBe(UKURAN);
  });

  test("baris dan kolom yang bersilangan tidak dihitung ganda", () => {
    // Satu sel dipakai bersama baris 0 dan kolom 0, jadi yang lenyap
    // 8 + 8 - 1 = 15, bukan 16. Ini yang rusak kalau keduanya dihapus
    // berurutan alih-alih ditentukan lebih dulu lalu dihapus bersamaan.
    const p = papanKosong();
    for (let k = 0; k < UKURAN; k++) p[indeks(0, k)] = 1;
    for (let b = 0; b < UKURAN; b++) p[indeks(b, 0)] = 1;
    const h = bersihkan(p);
    expect(h.barisPenuh).toEqual([0]);
    expect(h.kolomPenuh).toEqual([0]);
    expect(h.selHilang).toBe(UKURAN * 2 - 1);
  });

  test("papan yang belum penuh tidak berubah", () => {
    const p = taruh(papanKosong(), satuSel, 0, 0);
    const h = bersihkan(p);
    expect(h.selHilang).toBe(0);
    expect(h.papan).toBe(p);
  });

  test("baris hampir penuh tetap utuh", () => {
    const p = papanKosong();
    for (let k = 0; k < UKURAN - 1; k++) p[indeks(2, k)] = 1;
    expect(bersihkan(p).barisPenuh).toEqual([]);
  });
});

describe("nilai langkah", () => {
  test("tanpa garis bersih, nilainya sebanyak sel yang ditaruh", () => {
    expect(nilaiLangkah(4, 0)).toBe(4);
  });

  test("membersihkan garis bernilai jauh lebih besar", () => {
    expect(nilaiLangkah(1, 1)).toBeGreaterThan(nilaiLangkah(4, 0));
  });

  test("beberapa garis sekaligus dihargai berlipat, bukan sekadar dijumlah", () => {
    const satu = nilaiLangkah(1, 1) - 1;
    const dua = nilaiLangkah(1, 2) - 1;
    expect(dua).toBeGreaterThan(satu * 2);
  });
});

describe("jalannya permainan", () => {
  test("dimulai dengan tiga tawaran dan papan kosong", () => {
    const k = mulai(acakTetap());
    expect(k.tawaran).toHaveLength(3);
    expect(k.tawaran.every((t) => t !== null)).toBe(true);
    expect(k.skor).toBe(0);
    expect(k.selesai).toBe(false);
  });

  test("langkah yang tidak sah tidak mengubah apa pun", () => {
    const k = mulai(acakTetap());
    // Slot kosong
    expect(langkah(k, 9, 0, 0, acakTetap())).toBe(k);
    // Di luar papan
    expect(langkah(k, 0, UKURAN + 2, 0, acakTetap())).toBe(k);
  });

  test("menaruh menambah skor dan mengosongkan slotnya", () => {
    const k = mulai(acakTetap());
    const sesudah = langkah(k, 0, 0, 0, acakTetap());
    expect(sesudah.skor).toBeGreaterThan(0);
    expect(sesudah.tawaran[0]).toBeNull();
  });

  test("tawaran baru hanya datang setelah ketiganya terpakai", () => {
    let k = mulai(acakTetap());
    k = langkah(k, 0, 0, 0, acakTetap());
    expect(k.tawaran.filter((t) => t === null)).toHaveLength(1);
    k = langkah(k, 1, 2, 0, acakTetap());
    expect(k.tawaran.filter((t) => t === null)).toHaveLength(2);
    k = langkah(k, 2, 4, 0, acakTetap());
    // Ketiganya habis, jadi disegarkan sekaligus.
    expect(k.tawaran.every((t) => t !== null)).toBe(true);
  });

  test("permainan berhenti ketika tidak ada tawaran yang muat lagi", () => {
    // Papan penuh kecuali satu sel di pojok, dan tawarannya bentuk 2x2.
    const papan = papanKosong().map(() => 1);
    papan[indeks(0, 0)] = 0;
    expect(masihBisa(papan, [empatPersegi])).toBe(false);
    expect(masihBisa(papan, [satuSel])).toBe(true);
  });

  test("adaTempat menemukan celah sempit", () => {
    const papan = papanKosong().map(() => 1);
    papan[indeks(4, 4)] = 0;
    expect(adaTempat(papan, satuSel)).toBe(true);
    expect(adaTempat(papan, duaMendatar)).toBe(false);
  });
});

describe("katalog bentuk", () => {
  test("semua bentuk muat di papan kosong", () => {
    for (const b of BENTUK) {
      expect(adaTempat(papanKosong(), b), b.nama).toBe(true);
    }
  });

  test("setiap bentuk punya nama dan minimal satu sel", () => {
    for (const b of BENTUK) {
      expect(b.nama.length, b.nama).toBeGreaterThan(3);
      expect(b.sel.length, b.nama).toBeGreaterThan(0);
    }
  });

  test("tidak ada bentuk yang selnya kembar", () => {
    for (const b of BENTUK) {
      const kunci = b.sel.map(([x, y]) => `${x},${y}`);
      expect(new Set(kunci).size, b.nama).toBe(kunci.length);
    }
  });
});
