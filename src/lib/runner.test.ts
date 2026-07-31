import { describe, expect, test } from "vitest";

import {
  KATALOG,
  KECEPATAN_AWAL,
  KECEPATAN_MAKS,
  PEMAIN_TINGGI,
  PEMAIN_TINGGI_MENUNDUK,
  TINGGI_TERBANG,
  bertabrakan,
  kotakRintangan,
  langkah,
  mulai,
  skor,
  tinggiPemain,
  type Keadaan,
} from "@/lib/runner";

/** Sumber acak yang selalu sama, supaya hasil ujinya bisa diulang persis. */
function acakTetap(nilai = 0.5) {
  return () => nilai;
}

/** Menjalankan permainan beberapa detik tanpa rintangan mengganggu. */
function jalan(k: Keadaan, detik: number, aksi: Parameters<typeof langkah>[2] = "diam") {
  const dt = 1 / 60;
  let s = k;
  for (let t = 0; t < detik; t += dt) s = langkah(s, dt, aksi, acakTetap());
  return s;
}

describe("fisika lompatan", () => {
  test("pemain mulai menapak tanah", () => {
    const k = mulai();
    expect(k.y).toBe(0);
    expect(k.vy).toBe(0);
  });

  test("lompat mengangkat pemain lalu menurunkannya kembali", () => {
    let k = mulai();
    k = langkah(k, 1 / 60, "lompat", acakTetap());
    expect(k.y).toBeGreaterThan(0);

    const puncak = jalan(k, 0.3);
    expect(puncak.y).toBeGreaterThan(80);

    const mendarat = jalan(k, 1.2);
    expect(mendarat.y).toBe(0);
  });

  test("lompat kedua diabaikan selama masih di udara", () => {
    let k = langkah(mulai(), 1 / 60, "lompat", acakTetap());
    const sebelum = k.vy;
    k = langkah(k, 1 / 60, "lompat", acakTetap());
    // Kecepatan naik hanya berkurang oleh gravitasi, tidak disetel ulang.
    expect(k.vy).toBeLessThan(sebelum);
  });

  test("satu lompatan selesai dalam waktu yang masuk akal", () => {
    let k = langkah(mulai(), 1 / 60, "lompat", acakTetap());
    let durasi = 1 / 60;
    const dt = 1 / 60;
    while (k.y > 0 && durasi < 3) {
      k = langkah(k, dt, "diam", acakTetap());
      durasi += dt;
    }
    expect(durasi).toBeGreaterThan(0.4);
    expect(durasi).toBeLessThan(0.9);
  });
});

describe("menunduk", () => {
  test("memendekkan badan hanya saat menapak tanah", () => {
    const berdiri = mulai();
    expect(tinggiPemain(berdiri)).toBe(PEMAIN_TINGGI);
    expect(tinggiPemain({ ...berdiri, menunduk: true })).toBe(
      PEMAIN_TINGGI_MENUNDUK,
    );
    // Di udara badannya tetap tegak, jadi menunduk tidak bisa dipakai curang.
    expect(tinggiPemain({ ...berdiri, menunduk: true, y: 60 })).toBe(
      PEMAIN_TINGGI,
    );
  });

  test("mempercepat jatuh saat melayang", () => {
    const k = langkah(mulai(), 1 / 60, "lompat", acakTetap());
    const biasa = jalan(k, 0.25, "diam");
    const dipercepat = jalan(k, 0.25, "menunduk");
    expect(dipercepat.y).toBeLessThan(biasa.y);
  });
});

describe("tabrakan", () => {
  const rintanganTanah = { ...KATALOG.find((r) => !r.terbang)!, id: 1, x: 56 };
  const rintanganTerbang = { ...KATALOG.find((r) => r.terbang)!, id: 2, x: 56 };

  test("berdiri di depan rintangan tanah berarti tertabrak", () => {
    expect(bertabrakan(mulai(), rintanganTanah)).toBe(true);
  });

  test("melompat cukup tinggi melewatinya", () => {
    const melayang = { ...mulai(), y: rintanganTanah.h + 10 };
    expect(bertabrakan(melayang, rintanganTanah)).toBe(false);
  });

  test("rintangan terbang mengambang di atas tanah", () => {
    expect(kotakRintangan(rintanganTerbang).bawah).toBe(TINGGI_TERBANG);
    expect(kotakRintangan(rintanganTanah).bawah).toBe(0);
  });

  test("menunduk meloloskan pemain dari rintangan terbang", () => {
    const berdiri = mulai();
    expect(bertabrakan(berdiri, rintanganTerbang)).toBe(true);
    expect(bertabrakan({ ...berdiri, menunduk: true }, rintanganTerbang)).toBe(
      false,
    );
  });

  test("rintangan yang masih jauh belum menabrak", () => {
    expect(bertabrakan(mulai(), { ...rintanganTanah, x: 400 })).toBe(false);
  });

  test("permainan berhenti dan mencatat penabraknya", () => {
    let k: Keadaan = { ...mulai(), rintangan: [{ ...rintanganTanah, x: 60 }] };
    k = langkah(k, 1 / 60, "diam", acakTetap());
    expect(k.selesai).toBe(true);
    expect(k.penabrak?.label).toBe(rintanganTanah.label);
    // Setelah selesai, keadaannya tidak berubah lagi.
    expect(langkah(k, 1 / 60, "lompat", acakTetap())).toBe(k);
  });
});

describe("laju dan rintangan", () => {
  test("kecepatan naik tapi ada batas atasnya", () => {
    const awal = mulai();
    expect(awal.kecepatan).toBe(KECEPATAN_AWAL);
    const sebentar = jalan(awal, 5);
    expect(sebentar.kecepatan).toBeGreaterThan(KECEPATAN_AWAL);
    const lama = jalan(awal, 200);
    expect(lama.kecepatan).toBeLessThanOrEqual(KECEPATAN_MAKS);
  });

  test("rintangan muncul dari kanan layar", () => {
    let k = mulai();
    const dt = 1 / 60;
    for (let i = 0; i < 200 && k.rintangan.length === 0; i++) {
      k = langkah({ ...k, selesai: false, penabrak: null }, dt, "lompat", acakTetap(), 640);
    }
    expect(k.rintangan.length).toBeGreaterThan(0);
    expect(k.rintangan[0].x).toBeGreaterThan(600);
  });

  test("langkah waktu yang melonjak tidak membuat pemain menembus rintangan", () => {
    // Tab yang sempat tidak aktif bisa mengirim dt raksasa. Tanpa pembatas,
    // pemain akan melewati rintangan tanpa pernah dianggap menabrak.
    const k: Keadaan = { ...mulai(), rintangan: [{ ...rintanganTanahJauh() }] };
    const sesudah = langkah(k, 5, "diam", acakTetap());
    expect(sesudah.jarak).toBeLessThan(100);
  });

  function rintanganTanahJauh() {
    return { ...KATALOG.find((r) => !r.terbang)!, id: 9, x: 300 };
  }
});

describe("katalog rintangan", () => {
  test("memuat rintangan tanah maupun terbang", () => {
    expect(KATALOG.some((r) => !r.terbang)).toBe(true);
    expect(KATALOG.some((r) => r.terbang)).toBe(true);
  });

  test("setiap rintangan menjelaskan aturan sebenarnya", () => {
    for (const r of KATALOG) {
      expect(r.label.length, r.label).toBeGreaterThan(3);
      expect(r.fakta.length, r.label).toBeGreaterThan(40);
    }
  });

  test("setiap rintangan punya ikon, karena di arena tidak ada teks", () => {
    // Label sempat digambar di dalam arena dan tidak terbaca begitu larinya
    // cepat. Sekarang yang tampil ikon; teksnya hanya muncul di layar kalah.
    for (const r of KATALOG) {
      expect(r.ikon, r.label).toBeTruthy();
    }
    expect(new Set(KATALOG.map((r) => r.ikon)).size).toBe(KATALOG.length);
  });

  test("rintangan tanah bisa dilompati, yang terbang bisa ditunduki", () => {
    // Tinggi puncak lompatan ± 126 px; rintangan tanah harus di bawah itu.
    for (const r of KATALOG.filter((x) => !x.terbang)) {
      expect(r.h, r.label).toBeLessThan(110);
    }
    // Rintangan terbang harus menyisakan celah di atas kepala yang menunduk.
    for (const r of KATALOG.filter((x) => x.terbang)) {
      expect(TINGGI_TERBANG, r.label).toBeGreaterThan(PEMAIN_TINGGI_MENUNDUK);
    }
  });
});

describe("skor", () => {
  test("bertambah seiring jarak", () => {
    expect(skor(mulai())).toBe(0);
    expect(skor(jalan(mulai(), 3))).toBeGreaterThan(0);
  });
});
