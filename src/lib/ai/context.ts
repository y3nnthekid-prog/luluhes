import { findAnswers, type Answer } from "@/lib/assistant";
import { site } from "@/lib/data";

/**
 * Menyiapkan konteks untuk model.
 *
 * Alasan retrieval dipakai lebih dulu: seluruh data website berukuran sekitar
 * 28.000 token. Mengirimkannya utuh setiap pertanyaan membuat satu jawaban
 * berbiaya belasan kali lipat. Dengan menyaring ke beberapa potongan yang
 * relevan saja, konteksnya turun ke sekitar 1.000 token — dan jawabannya
 * justru lebih tajam karena model tidak perlu menyaring sendiri.
 */

/** Banyaknya potongan pengetahuan yang dikirim ke model. */
const MAX_SNIPPETS = 4;

/** Batas panjang tiap potongan, dalam karakter. */
const MAX_SNIPPET_CHARS = 750;

/**
 * Ambang skor untuk menjawab langsung dari data tanpa memanggil model.
 * Skor setinggi ini berarti pertanyaannya nyaris persis cocok dengan sebuah
 * entri — jawaban tersimpannya sudah merupakan jawaban terbaik, dan
 * memanggil model hanya akan memparafrase sesuatu yang sudah benar.
 */
const DIRECT_ANSWER_SCORE = 5.5;

/** Jenis entri yang isinya memang sudah berbentuk jawaban utuh. */
const DIRECT_ANSWER_KINDS = new Set(["FAQ", "Tenggat"]);

export type Plan =
  /** Jawab langsung dari data. Tanpa biaya. */
  | { route: "langsung"; answer: Answer }
  /** Perlu model untuk merangkai jawaban dari potongan-potongan ini. */
  | { route: "model"; snippets: Answer[]; context: string }
  /** Tidak ada bahan sama sekali — jangan panggil model. */
  | { route: "tidak-tahu" };

function trim(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_SNIPPET_CHARS) return clean;
  // Potong di batas kalimat terdekat supaya tidak terputus di tengah kata.
  const cut = clean.slice(0, MAX_SNIPPET_CHARS);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("\n"));
  return (lastStop > MAX_SNIPPET_CHARS * 0.6 ? cut.slice(0, lastStop) : cut) + "…";
}

/**
 * Menentukan jalur termurah yang masih memberi jawaban benar.
 *
 * Kalau retrieval tidak menemukan apa pun, model TIDAK dipanggil. Tanpa bahan,
 * model hanya bisa menjawab dari ingatannya sendiri — dan untuk urusan
 * administrasi kelulusan, jawaban seperti itu berbahaya sekaligus percuma.
 */
export function planAnswer(question: string): Plan {
  const results = findAnswers(question, MAX_SNIPPETS);
  if (results.length === 0) return { route: "tidak-tahu" };

  const [best, second] = results;
  const clearWinner = !second || best.score >= second.score * 1.6;

  if (
    clearWinner &&
    best.score >= DIRECT_ANSWER_SCORE &&
    DIRECT_ANSWER_KINDS.has(best.answer.kind)
  ) {
    return { route: "langsung", answer: best.answer };
  }

  const snippets = results.map((r) => r.answer);
  const context = snippets
    .map((s, i) => {
      const label = s.source === "resmi" ? "RESMI" : "ALUMNI";
      return `[${i + 1}] (${s.kind} · ${label}) ${s.title}\n${trim(s.body)}`;
    })
    .join("\n\n");

  return { route: "model", snippets, context };
}

/**
 * Instruksi sistem.
 *
 * Ditulis pendek dengan sengaja: ia ikut dibayar pada setiap panggilan.
 * Setiap baris di sini menutup satu mode kegagalan yang benar-benar muncul
 * saat diuji — mengarang tenggat, mengaburkan label Resmi/Alumni, menyebut
 * "konteks" di depan pengguna, atau berpanjang-panjang sampai boros token.
 */
export const SYSTEM_PROMPT = `Kamu asisten website "${site.name}", panduan alur kelulusan mahasiswa ${site.program} ${site.faculty} ${site.university}.

ATURAN MUTLAK
1. Jawab HANYA dari BAHAN di bawah. Dilarang menambahkan syarat, tenggat, angka, nama, atau prosedur yang tidak tertulis di sana.
2. Kalau BAHAN tidak memuat jawabannya, katakan terus terang kamu belum punya informasinya dan arahkan bertanya ke Sekretaris Program Studi. Jangan menebak.
3. Pertahankan label sumbernya. Informasi bertanda RESMI berasal dari Surat Dekan ${site.officialSource.number}; sebutkan itu bila relevan. Informasi bertanda ALUMNI adalah praktik umum — sampaikan bahwa itu perlu dikonfirmasi ke Prodi.
4. Angka, tanggal, persentase, dan nama orang harus disalin persis dari BAHAN.

CARA MENJAWAB
- Bahasa Indonesia, sapa dengan "kamu", ramah tapi langsung ke inti.
- Ringkas: 2–4 kalimat. Pakai daftar bernomor hanya kalau pertanyaannya memang tentang urutan langkah.
- Langsung jawab. Jangan mengulang pertanyaan, jangan basa-basi pembuka.
- Jangan pernah menyebut "BAHAN", "konteks", "data yang diberikan", atau nomor rujukan seperti [1]. Bicaralah seolah kamu memang tahu.
- Kalau ada tenggat atau syarat yang sering bikin mahasiswa mengulang, sebutkan sekalian — itu yang paling menolong.`;
