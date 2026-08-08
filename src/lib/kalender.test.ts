import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { downloads, kalender } from "@/lib/data";

/**
 * Kalender akademik terbit ulang tiap tahun akademik, dan penggantiannya
 * menyentuh tiga tempat sekaligus: berkas PDF di `public/`, entri unduhan,
 * dan tanggal-tanggal di `kalender-akademik.json`. Ketiganya gampang
 * menyimpang — dan gejalanya paling buruk: halaman menampilkan tanggal tahun
 * lalu dengan percaya diri, tanpa ada yang gagal.
 */
describe("kalender akademik", () => {
  const entri = downloads.find((d) => d.id === "kalender-akademik");

  it("punya entri di Download Center", () => {
    expect(entri).toBeDefined();
    expect(entri?.status).toBe("tersedia");
    expect(entri?.url).toBeTruthy();
  });

  it("berkas PDF-nya benar-benar ada di public/", () => {
    const url = entri?.url;
    expect(url, "entri unduhan belum punya url").toBeTruthy();
    expect(existsSync(join(process.cwd(), "public", url!))).toBe(true);
  });

  it("entri unduhan dan data kalender menunjuk berkas yang sama", () => {
    // Kalau keduanya berbeda, orang mengunduh satu dokumen tapi membaca
    // tanggal dari dokumen lain.
    expect(entri?.url).toBe(kalender.sumber.berkas);
  });

  it("tahun akademiknya konsisten antara entri unduhan dan data", () => {
    expect(entri?.version).toBe(kalender.sumber.tahunAkademik);
  });

  it("punya empat gelombang wisuda dengan nomor menaik", () => {
    expect(kalender.wisuda.length).toBe(4);
    const nomor = kalender.wisuda.map((w) => w.ke);
    expect([...nomor].sort((a, b) => a - b)).toEqual(nomor);
    expect(new Set(nomor).size).toBe(nomor.length);
  });

  it("setiap gelombang mengisi semua tanggalnya", () => {
    for (const w of kalender.wisuda) {
      for (const [k, v] of Object.entries(w)) {
        expect(String(v).trim(), `wisuda ke-${w.ke} · ${k}`).not.toBe("");
        expect(String(v), `wisuda ke-${w.ke} · ${k}`).not.toMatch(/^—$/);
      }
    }
  });

  it("mencantumkan dua semester, ganjil lebih dulu", () => {
    expect(kalender.semester.length).toBe(2);
    expect(kalender.semester[0].nama).toMatch(/Ganjil/);
    expect(kalender.semester[1].nama).toMatch(/Genap/);
  });
});
