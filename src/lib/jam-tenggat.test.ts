import { describe, expect, it } from "vitest";

import { JAM_TENGGAT, schedule } from "@/lib/data";

/**
 * Beranda mencetak satu angka besar-besar: jam tenggat pendaftaran ujian.
 *
 * Angka itu ditulis terpisah dari prosa yang menjelaskannya, jadi keduanya
 * bisa menyimpang tanpa ada yang menyadari. Gejalanya adalah dua jam berbeda
 * tampil di satu layar — lebih buruk daripada tidak mencantumkannya sama
 * sekali, karena pembaca jadi tidak tahu mana yang benar.
 */
describe("jam tenggat yang dicetak besar di beranda", () => {
  it("benar-benar disebut di teks penjelasnya", () => {
    expect(schedule.intro).toContain(JAM_TENGGAT);
  });

  it("dipakai konsisten oleh setiap ujian yang tenggatnya berjam", () => {
    const berjam = schedule.exams.filter((e) =>
      /pukul\s*\d/i.test(e.deadlinePattern),
    );

    // Angka tunggal di beranda hanya jujur selama semua ujian memakai jam yang
    // sama. Begitu ada yang berbeda, seksinya perlu dirancang ulang — dan tes
    // ini yang memberi tahu, bukan mahasiswa yang telat mendaftar.
    expect(berjam.length).toBeGreaterThan(0);
    for (const e of berjam) {
      expect(e.deadlinePattern, e.name).toContain(JAM_TENGGAT);
    }
  });
});
