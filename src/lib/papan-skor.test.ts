import { describe, expect, test } from "vitest";

import {
  BATAS_PAPAN,
  MAKS_HURUF_NAMA,
  peringkatUntuk,
  rapikanNama,
  tambahSkor,
  type SkorEntri,
} from "@/lib/papan-skor";

const e = (nama: string, skor: number, pada = "2026-08-01T00:00:00.000Z"): SkorEntri => ({
  nama,
  skor,
  pada,
});

describe("merapikan nama", () => {
  test("membuang spasi berlebih di ujung dan tengah", () => {
    expect(rapikanNama("  Fadayen   Fauzan  ")).toBe("Fadayen Fauzan");
  });

  test("membuang karakter kendali", () => {
    // Nama ini dirender kembali ke halaman, jadi tidak boleh menyelipkan
    // karakter yang bisa mengacaukan tampilan.
    expect(rapikanNama("Fa\u0000da\u001byen")).toBe("Fa da yen");
  });

  test("memangkas nama yang kepanjangan", () => {
    const panjang = "A".repeat(80);
    expect(rapikanNama(panjang)).toHaveLength(MAKS_HURUF_NAMA);
  });

  test("nama kosong tetap kosong", () => {
    expect(rapikanNama("   ")).toBe("");
  });
});

describe("papan tujuh besar", () => {
  test("hanya menyimpan tujuh teratas", () => {
    let daftar: SkorEntri[] = [];
    for (let i = 1; i <= 12; i++) daftar = tambahSkor(daftar, e(`P${i}`, i * 10));
    expect(daftar).toHaveLength(BATAS_PAPAN);
    expect(daftar[0].skor).toBe(120);
    expect(daftar[6].skor).toBe(60);
  });

  test("terurut dari skor tertinggi", () => {
    let daftar: SkorEntri[] = [];
    for (const n of [30, 90, 10, 70]) daftar = tambahSkor(daftar, e(`P${n}`, n));
    expect(daftar.map((x) => x.skor)).toEqual([90, 70, 30, 10]);
  });

  test("skor seri dimenangkan yang lebih dulu mencapainya", () => {
    let daftar: SkorEntri[] = [];
    daftar = tambahSkor(daftar, e("Duluan", 50, "2026-08-01T10:00:00.000Z"));
    daftar = tambahSkor(daftar, e("Belakangan", 50, "2026-08-01T12:00:00.000Z"));
    expect(daftar.map((x) => x.nama)).toEqual(["Duluan", "Belakangan"]);
  });

  test("skor kecil tidak menggeser papan yang sudah penuh", () => {
    let daftar: SkorEntri[] = [];
    for (let i = 0; i < BATAS_PAPAN; i++) daftar = tambahSkor(daftar, e(`P${i}`, 100 + i));
    const sebelum = daftar.map((x) => x.nama);
    daftar = tambahSkor(daftar, e("Kecil", 5));
    expect(daftar.map((x) => x.nama)).toEqual(sebelum);
  });
});

describe("peringkat", () => {
  const papan = [90, 70, 50].map((s, i) => e(`P${i}`, s));

  test("menghitung posisi dengan benar", () => {
    expect(peringkatUntuk(papan, 100)).toBe(1);
    expect(peringkatUntuk(papan, 80)).toBe(2);
    expect(peringkatUntuk(papan, 10)).toBe(4);
  });

  test("skor seri masuk di bawah yang sudah ada", () => {
    expect(peringkatUntuk(papan, 70)).toBe(3);
  });

  test("null bila tidak masuk tujuh besar", () => {
    const penuh = Array.from({ length: BATAS_PAPAN }, (_, i) => e(`P${i}`, 500 - i));
    expect(peringkatUntuk(penuh, 1)).toBeNull();
    expect(peringkatUntuk(penuh, 999)).toBe(1);
  });
});
