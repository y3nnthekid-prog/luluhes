import { describe, expect, it } from "vitest";

import { FRASA_HERO } from "./kata-berputar";
import stages from "@/data/stages.json";

/**
 * Judul hero menjanjikan sesuatu: "syarat sempro", "jadwal munaqosyah", dan
 * seterusnya. Janji itu cuma jujur kalau tahapnya benar-benar ada halamannya.
 *
 * Tanpa tes ini, menghapus atau mengganti nama satu tahap akan meninggalkan
 * judul yang memancing pengunjung mencari sesuatu yang sudah tidak ada — dan
 * tidak ada yang gagal, tidak ada yang memberi tahu.
 */
describe("frasa berputar di hero", () => {
  const slug = new Set(stages.map((s) => s.slug));

  it("setiap frasa menunjuk tahap yang benar-benar ada", () => {
    for (const f of FRASA_HERO) {
      expect(slug, `tahap "${f.tahap}" (frasa "${f.teks}")`).toContain(f.tahap);
    }
  });

  it("menyebut nama tahapnya di dalam teks yang dibaca pengunjung", () => {
    // Frasanya harus memuat kata yang sama dengan tahap yang dirujuk. Kalau
    // tidak, kaitan ke data cuma formalitas di kode dan tidak terasa di layar.
    for (const f of FRASA_HERO) {
      expect(f.teks.toLowerCase()).toContain(f.tahap.toLowerCase());
    }
  });

  it("tidak ada frasa kembar", () => {
    const teks = FRASA_HERO.map((f) => f.teks);
    expect(new Set(teks).size).toBe(teks.length);
  });

  it("cukup banyak untuk terasa berputar, cukup pendek untuk tidak melar", () => {
    expect(FRASA_HERO.length).toBeGreaterThanOrEqual(3);
    for (const f of FRASA_HERO) {
      // Judulnya sudah memakai clamp sampai 4,75rem; frasa yang terlalu
      // panjang membuat penyangga lebarnya mendominasi seluruh baris.
      expect(f.teks.length, f.teks).toBeLessThanOrEqual(24);
    }
  });
});
