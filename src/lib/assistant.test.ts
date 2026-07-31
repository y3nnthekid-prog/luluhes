import { describe, expect, test } from "vitest";

import { findAnswers, susunJawaban } from "@/lib/assistant";

/**
 * Kumpulan pertanyaan untuk menguji mesin jawab.
 *
 * Ditulis meniru cara mahasiswa benar-benar mengetik: disingkat, salah eja,
 * campur bahasa gaul, kadang cuma potongan kalimat. Pertanyaan yang rapi
 * secara tata bahasa justru jarang muncul.
 *
 * `terima` berisi pola id jawaban yang dianggap benar — sengaja beberapa,
 * karena sering ada lebih dari satu entri yang sama-sama menjawab.
 */
type Kasus = { q: string; terima?: RegExp; tolak?: true };

const KASUS: Record<string, Kasus[]> = {
  "Pertanyaan langsung": [
    { q: "berapa batas turnitin", terima: /^faq-8$/ },
    { q: "syarat daftar munaqosyah", terima: /munaqosyah/ },
    { q: "apa saja berkas pendaftaran munaqosyah", terima: /munaqosyah/ },
    { q: "ujian komprehensif terdiri dari apa saja", terima: /komprehensif|faq-29/ },
    { q: "apa bedanya yudisium dan wisuda", terima: /^faq-49$/ },
    { q: "berapa lama ijazah terbit setelah wisuda", terima: /^faq-55$/ },
    { q: "di mana lembar pernyataan keaslian diletakkan", terima: /^faq-44$/ },
    { q: "apa urutan tanda tangan yang benar", terima: /^faq-43$/ },
    { q: "berapa penguji sidang munaqosyah", terima: /^faq-39$/ },
    { q: "kalau tidak lulus komprehensif bisa mengulang", terima: /^faq-34$/ },
    { q: "hasil turnitin saya 40 persen gimana", terima: /^faq-3[67]$/ },
    { q: "kapan nilai sidang keluar", terima: /^faq-40$/ },
    { q: "bisakah ijazah diambil orang lain", terima: /^faq-56$/ },
    { q: "berapa halaman proposal yang ideal", terima: /^faq-16$/ },
    { q: "apakah wisuda wajib", terima: /^faq-52$/ },
    { q: "berapa lama dari sempro sampai wisuda", terima: /^faq-4$/ },
  ],

  "Salah ketik": [
    { q: "berapa batas turnitn", terima: /^faq-8$/ },
    { q: "syarat munaqosya apa aja", terima: /munaqosyah/ },
    { q: "kapan yudisum dilaksanakan", terima: /yudisium/ },
    { q: "ujian komprehensip itu apa", terima: /komprehensif|faq-29/ },
    { q: "bebas pustka gimana caranya", terima: /bebas-pustaka/ },
    { q: "seminar propsal syaratnya apa", terima: /sempro/ },
    { q: "munaqosah pendaftarannya kapan", terima: /munaqosyah|jadwal/ },
    { q: "wisudah kapan digelar", terima: /wisuda/ },
  ],

  "Singkatan dan bahasa gaul": [
    { q: "sempro butuh sks berapa", terima: /^faq-14$|sempro/ },
    { q: "kompre ujiannya apa aja", terima: /komprehensif|faq-29/ },
    { q: "ttd siapa aja di lembar pengesahan", terima: /^faq-(24|43)$/ },
    { q: "dosbing gimana milihnya", terima: /^faq-23$/ },
    { q: "brp lama revisi setelah sidang", terima: /^faq-42$|revisi-munaqosyah/ },
    { q: "kpn sempro dibuka", terima: /^faq-18$|sempro|jadwal/ },
    { q: "skpi itu apa", terima: /skpi|^faq-38$/ },
  ],

  "Maksud tersirat": [
    { q: "kapan sidang munaqosyah", terima: /jadwal|^faq-41$|munaqosyah/ },
    { q: "dokumen apa saja untuk yudisium", terima: /yudisium/ },
    { q: "cara daftar munaqosyah gimana", terima: /munaqosyah/ },
    { q: "tenggat yang bikin mengulang", terima: /^faq-5$|warn-/ },
    { q: "template proposal ada di mana", terima: /^dl-/ },
    { q: "download formulir bebas pustaka", terima: /^dl-|bebas-pustaka/ },
  ],

  "Langkah berikutnya": [
    { q: "habis sidang munaqosyah ngapain", terima: /revisi-munaqosyah/ },
    { q: "setelah yudisium apa", terima: /wisuda/ },
    { q: "sebelum sempro harus ngapain", terima: /pra-sempro/ },
    { q: "sesudah bebas pustaka lanjut ke mana", terima: /yudisium/ },
  ],

  "Di luar topik": [
    { q: "cuaca hari ini bagaimana", tolak: true },
    { q: "resep rendang enak", tolak: true },
    { q: "siapa presiden indonesia", tolak: true },
    { q: "harga bitcoin sekarang", tolak: true },
    { q: "rekomendasi film akhir pekan", tolak: true },
  ],

  // Kelompok penjebak: memakai kata pemicu yang sama dengan pertanyaan sah
  // ("syarat", "kapan", "download", "tips", "daftar") tetapi topiknya jauh di
  // luar kelulusan HES. Justru kelompok inilah yang paling mudah membuat
  // asisten mengarang.
  "Di luar topik tapi memakai kata pemicu": [
    { q: "syarat bikin sim c", tolak: true },
    { q: "cara daftar cpns 2026", tolak: true },
    { q: "kapan gaji karyawan cair", tolak: true },
    { q: "download film gratis", tolak: true },
    { q: "tips diet sehat", tolak: true },
    { q: "jadwal kereta jakarta bandung", tolak: true },
    { q: "dokumen buat bikin paspor", tolak: true },
    { q: "berapa harga emas hari ini", tolak: true },
    { q: "jadwal sholat hari ini", tolak: true },
    { q: "kapan gaji karyawan cair", tolak: true },
    { q: "cara bikin cv lamaran kerja", tolak: true },
    { q: "berapa gaji lulusan hukum", tolak: true },
    { q: "beasiswa s2 luar negeri", tolak: true },
    { q: "cara masak mie goreng", tolak: true },
    { q: "harga laptop murah", tolak: true },
  ],

  // Ronde kedua. Sembilan puluh pertanyaan baru dijalankan lalu jawabannya
  // dibaca satu per satu; yang di bawah ini adalah kasus yang semula salah
  // dan sudah diperbaiki. Dikunci di sini supaya tidak diam-diam rusak lagi.
  "Temuan audit": [
    { q: "kompre boleh diulang berapa kali", terima: /^faq-34$|komprehensif/ },
    { q: "turnitin dicek siapa", terima: /^faq-8$|turnitin/ },
    {
      q: "permisi mau nanya kalau misalnya hasil turnitin aku ternyata di atas batas gimana ya solusinya",
      terima: /^faq-3[67]$|turnitin/,
    },
    {
      q: "aku udah selesai sidang tapi bingung banget habis ini harus ngapain lagi ya kak",
      terima: /revisi-munaqosyah/,
    },
    {
      q: "halo kak aku mau tanya dong soal syarat pendaftaran sidang munaqosyah itu apa aja ya",
      terima: /munaqosyah/,
    },
    { q: "mulai skripsi dari mana", terima: /ringkasan-alur/ },
    { q: "total berapa tahap sampai lulus", terima: /ringkasan-alur/ },
    { q: "berapa lama proses munaqosyah", terima: /munaqosyah/ },
  ],

  // Satu kata saja berarti "ceritakan soal ini" — yang menjawab halaman
  // tahapannya, bukan satu FAQ sempit yang kebetulan menyebut kata itu.
  "Satu kata": [
    { q: "sempro", terima: /^stage-sempro$/ },
    { q: "munaqosyah", terima: /^stage-munaqosyah$/ },
    { q: "yudisium", terima: /^stage-yudisium$/ },
    { q: "wisuda", terima: /^stage-wisuda$/ },
    { q: "turnitin", terima: /^faq-8$|turnitin/ },
  ],

  // Ditulis setelah mesinnya selesai disetel, tanpa menyesuaikan mesin lagi —
  // gunanya memastikan perbaikannya benar-benar berlaku umum, bukan cuma
  // hafal pada pertanyaan yang dipakai menyetel.
  "Uji lepas": [
    { q: "ipk minimal buat yudisium berapa", terima: /yudisium/ },
    { q: "kartu bimbingan dapat dari siapa", terima: /bimbingan|revisi-sempro/ },
    { q: "lupa belum isi skpi gimana", terima: /skpi|^faq-(10|38)$/ },
    { q: "stempel basah itu maksudnya apa", terima: /^faq-37$|turnitin|munaqosyah/ },
    { q: "penguji sidang ada berapa orang", terima: /^faq-39$|munaqosyah/ },
    { q: "kalo proposal ditolak gimana", terima: /^faq-19$|sempro/ },
    { q: "berkas apa aja yang dibawa pas wisuda", terima: /wisuda/ },
    { q: "prosedur ambil ijazah gimana", terima: /ijazah/ },
    { q: "batas revisi skripsi berapa lama", terima: /revisi|^faq-42$/ },
    // Label semula hanya menerima halaman tahapan. Itu keliru: formulir
    // validasi Perpustakaan FSH justru benda yang dicari orang yang bertanya
    // begini, dan judulnya cocok persis. Jadi labelnya yang dibetulkan,
    // bukan mesinnya yang dipaksa mengalah.
    {
      q: "validasi perpustakaan fakultas caranya",
      terima: /bebas-pustaka|^faq-47$|^dl-form-validasi-perpus-fsh$/,
    },
  ],
};

function nilai(kasus: Kasus): boolean {
  const hasil = findAnswers(kasus.q, 3);
  if (kasus.tolak) return hasil.length === 0;
  if (hasil.length === 0) return false;
  return kasus.terima!.test(hasil[0].answer.id);
}

describe("mesin jawab", () => {
  const rapor: string[] = [];
  let lulus = 0;
  let total = 0;

  for (const [kelompok, kasusnya] of Object.entries(KASUS)) {
    describe(kelompok, () => {
      for (const kasus of kasusnya) {
        test(kasus.q, () => {
          const ok = nilai(kasus);
          total++;
          if (ok) lulus++;
          else {
            const hasil = findAnswers(kasus.q, 3);
            rapor.push(
              `${kelompok} · "${kasus.q}" → ${
                hasil.length === 0
                  ? "(tidak ada jawaban)"
                  : hasil.map((h) => `${h.answer.id}(${h.score.toFixed(1)})`).join(", ")
              }`,
            );
          }
          expect(ok, rapor.at(-1)).toBe(true);
        });
      }
    });
  }

  test("ringkasan", () => {
    const persen = total === 0 ? 0 : Math.round((lulus / total) * 100);
    console.log(`\nSkor: ${lulus}/${total} (${persen}%)`);
    if (rapor.length) console.log("Gagal:\n  " + rapor.join("\n  "));
  });
});

describe("penyusun jawaban", () => {
  test("menutup jawaban tahapan dengan langkah sesudahnya", () => {
    const jawaban = susunJawaban("syarat daftar munaqosyah");
    expect(jawaban.kosong).toBe(false);
    expect(jawaban.teks).toContain("Setelah ini: Tahap 7");
  });

  test("tidak menambah 'setelah ini' pada tahap terakhir", () => {
    const jawaban = susunJawaban("syarat pengambilan ijazah");
    expect(jawaban.teks).not.toContain("Setelah ini:");
  });

  test("tidak menambah 'setelah ini' pada jawaban yang memang soal urutan", () => {
    const jawaban = susunJawaban("setelah yudisium apa");
    expect(jawaban.teks).not.toContain("Setelah ini:");
  });

  test("menawarkan topik terdekat saat pertanyaannya meleset", () => {
    // "wisudanya" salah eja dan tidak terkoreksi, tapi topiknya masih terbaca.
    const jawaban = susunJawaban("qwerty asdfgh zxcvbn");
    expect(jawaban.kosong).toBe(true);
    expect(jawaban.saran?.length).toBeGreaterThan(0);
  });

  test("pertanyaan di luar topik tetap ditolak, bukan dikarang", () => {
    const jawaban = susunJawaban("resep rendang enak");
    expect(jawaban.kosong).toBe(true);
    expect(jawaban.utama).toBeUndefined();
    expect(jawaban.teks).toContain("belum punya jawabannya");
  });

  test("menyertakan tautan halaman sumber", () => {
    const jawaban = susunJawaban("berapa batas turnitin");
    expect(jawaban.utama?.href).toBeTruthy();
  });

  test("tidak menawarkan dua chip berjudul sama", () => {
    for (const q of ["berapa batas turnitin", "kompre ujiannya apa aja"]) {
      const { utama, terkait } = susunJawaban(q);
      const judul = terkait.map((t) => t.title);
      expect(new Set(judul).size, q).toBe(judul.length);
      expect(judul, q).not.toContain(utama!.title);
    }
  });
});
