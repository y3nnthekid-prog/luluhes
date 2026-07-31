import { describe, expect, test } from "vitest";

import { stages } from "@/lib/data";
import { bankSoal, judulTahap, urutanBenar } from "@/lib/games";

describe("bank soal Tebak Tahap", () => {
  test("terisi cukup banyak untuk delapan soal per permainan", () => {
    expect(bankSoal.length).toBeGreaterThanOrEqual(20);
  });

  test("tiap soal punya empat pilihan yang berbeda", () => {
    for (const soal of bankSoal) {
      expect(soal.pilihan, soal.id).toHaveLength(4);
      expect(new Set(soal.pilihan).size, soal.id).toBe(4);
    }
  });

  test("jawabannya selalu ada di antara pilihan", () => {
    for (const soal of bankSoal) {
      expect(soal.pilihan, soal.id).toContain(soal.jawaban);
    }
  });

  test("setiap pilihan menunjuk tahap yang benar-benar ada", () => {
    const sah = new Set(stages.map((s) => s.slug));
    for (const soal of bankSoal) {
      for (const p of soal.pilihan) expect(sah, `${soal.id} → ${p}`).toContain(p);
    }
  });

  test("petunjuknya tidak membocorkan nama tahapnya sendiri", () => {
    // Kalau potongan soal menyebut kata khas dari judul tahapnya, jawabannya
    // tinggal dicocokkan — soalnya jadi hadiah gratis, bukan latihan.
    const umum = new Set([
      "tahap", "dan", "atau", "skripsi", "ujian", "proposal", "berkas",
      "penelitian", "pengesahan", "pendaftaran", "penunjukan", "validasi",
      "persiapan",
    ]);
    for (const soal of bankSoal) {
      const judul = judulTahap.get(soal.jawaban)!;
      const khas = judul
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !umum.has(w));
      for (const k of khas) {
        expect(soal.petunjuk.toLowerCase(), `${soal.id} membocorkan "${k}"`)
          .not.toContain(k);
      }
    }
  });

  test("petunjuknya cukup panjang untuk bisa ditebak, tapi tidak kepanjangan", () => {
    for (const soal of bankSoal) {
      expect(soal.petunjuk.length, soal.id).toBeGreaterThanOrEqual(40);
      expect(soal.petunjuk.length, soal.id).toBeLessThanOrEqual(220);
    }
  });

  test("pengecohnya diambil dari tahap yang berdekatan", () => {
    // Membedakan syarat munaqosyah dari syarat komprehensif itu berguna;
    // membedakannya dari wisuda tidak mengajarkan apa pun.
    const urutan = new Map(stages.map((s, i) => [s.slug, i]));
    for (const soal of bankSoal) {
      const asal = urutan.get(soal.jawaban)!;
      for (const p of soal.pilihan) {
        if (p === soal.jawaban) continue;
        expect(Math.abs(urutan.get(p)! - asal), `${soal.id} → ${p}`)
          .toBeLessThanOrEqual(4);
      }
    }
  });
});

describe("urutan Susun Alur", () => {
  test("memuat seluruh tahap, sesuai urutan resminya", () => {
    expect(urutanBenar.map((u) => u.slug)).toEqual(stages.map((s) => s.slug));
  });

  test("nomor urutnya menaik tanpa lompatan", () => {
    urutanBenar.forEach((u, i) => expect(u.order).toBe(i + 1));
  });

  test("setiap kartu punya nama pendek untuk dipakai di tombol", () => {
    for (const u of urutanBenar) {
      expect(u.shortTitle.length, u.slug).toBeGreaterThan(0);
    }
  });
});
