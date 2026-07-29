import {
  allFaq,
  downloads,
  getStage,
  schedule,
  skpi,
  stages,
  totalStages,
} from "@/lib/data";
import type { SourceLevel } from "@/lib/types";

/**
 * Mesin jawab untuk asisten tanya jawab.
 *
 * Jawaban diambil dari data yang sudah ada di website, bukan dikarang. Kalau
 * tidak ada yang cocok, asisten mengaku tidak tahu dan mengarahkan ke Prodi —
 * jauh lebih aman daripada menebak untuk urusan administrasi kelulusan.
 */

export type AnswerKind =
  | "FAQ"
  | "Tahapan"
  | "Dokumen"
  | "Tenggat"
  | "Langkah"
  | "Template"
  | "Jadwal"
  | "Tips"
  | "SKPI";

export type Answer = {
  id: string;
  kind: AnswerKind;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
  source?: SourceLevel;
  /** Teks yang dicocokkan dengan pertanyaan. */
  haystack: string;
  /** Kata-kata judul dan isi, untuk pencocokan per kata. */
  titleWords: string[];
  bodyWords: string[];
};

/** Singkatan dan ejaan alternatif yang lazim dipakai mahasiswa. */
const aliases: Record<string, string> = {
  sempro: "seminar proposal",
  semprop: "seminar proposal",
  kompre: "komprehensif",
  munaqosah: "munaqosyah",
  munaqasyah: "munaqosyah",
  munaqosyah: "munaqosyah munaqasyah",
  sidang: "sidang munaqosyah",
  ttd: "tanda tangan",
  dosbing: "dosen pembimbing",
  pembimbing: "dosen pembimbing",
  pa: "pembimbing akademik",
  kaprodi: "ketua program studi prodi",
  sekprodi: "sekretaris program studi prodi",
  prodi: "program studi",
  perpus: "perpustakaan",
  pu: "perpustakaan utama universitas",
  pf: "perpustakaan fakultas",
  fsh: "fakultas syariah dan hukum",
  uin: "universitas islam negeri",
  skl: "surat keterangan lulus",
  skpi: "surat keterangan pendamping ijazah",
  krs: "kartu rencana studi krs",
  sks: "satuan kredit semester sks",
  ipk: "indeks prestasi kumulatif ipk",
  cd: "cakram softfile",
  gform: "google form formulir",
  form: "formulir google form",
  tu: "tata usaha",
  yudis: "yudisium",
  wisudaan: "wisuda",
  plagiasi: "plagiarisme turnitin similarity",
  turnitin: "turnitin plagiasi similarity",
  gmn: "bagaimana",
  gimana: "bagaimana",
  brp: "berapa",
  kpn: "kapan",
  syarat: "syarat persyaratan",
  berkas: "berkas dokumen",
  ngurus: "mengurus",
};

/** Kata yang terlalu umum untuk membedakan jawaban. */
const stopwords = new Set([
  "apa","apakah","yang","untuk","dari","dan","di","ke","itu","ini","saya","aku",
  "kamu","harus","bisa","boleh","gimana","bagaimana","kapan","berapa","kenapa",
  "mengapa","dengan","pada","dalam","atau","juga","sudah","belum","tidak","ada",
  "adalah","akan","kalau","jika","saja","nya","the","aja","dong","ya","sih","ku",
  "mau","ingin","perlu","butuh","cara","tolong","mohon","min","kak",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Memecah pertanyaan menjadi kelompok istilah. Satu kata beserta ekspansi
 * singkatannya dihitung sebagai SATU konsep, bukan beberapa kata — kalau tidak,
 * mengetik "sks" malah menurunkan skor karena menambah kata yang jarang muncul.
 */
function termGroups(text: string): string[][] {
  const groups: string[][] = [];
  for (const word of normalize(text).split(" ")) {
    if (word.length <= 2 || stopwords.has(word)) continue;
    const variants = new Set([word]);
    const alias = aliases[word];
    if (alias) {
      for (const part of alias.split(" ")) {
        if (part.length > 2) variants.add(part);
      }
    }
    groups.push([...variants]);
  }
  return groups;
}

function entry(
  a: Omit<Answer, "haystack" | "titleWords" | "bodyWords"> & { haystack?: string },
): Answer {
  const haystack = normalize(`${a.title} ${a.body} ${a.haystack ?? ""}`);
  return {
    ...a,
    haystack,
    titleWords: normalize(a.title).split(" ").filter(Boolean),
    bodyWords: haystack.split(" ").filter(Boolean),
  };
}

/**
 * Cocok bila ada kata yang sama persis, atau kata yang diawali istilah tersebut.
 * Sengaja tidak memakai pencocokan substring: "kopi" tidak boleh cocok dengan
 * "fotokopi", dan itu pernah membuat pertanyaan di luar topik terjawab.
 */
function matches(words: string[], variants: string[]): boolean {
  return words.some((word) =>
    variants.some(
      (v) => word === v || (v.length >= 4 && word.startsWith(v)),
    ),
  );
}

/** Basis pengetahuan dibangun sekali dari seluruh JSON website. */
export const knowledge: Answer[] = [
  ...allFaq.map((item, i) => {
    const stage = item.stage ? getStage(item.stage) : undefined;
    return entry({
      id: `faq-${i}`,
      kind: "FAQ",
      title: item.question,
      body: item.answer,
      href: stage ? `/tahapan/${stage.slug}#faq` : "/faq",
      hrefLabel: stage ? stage.title : "Halaman FAQ",
      haystack: stage?.title,
    });
  }),

  ...stages.map((stage) =>
    entry({
      id: `stage-${stage.slug}`,
      kind: "Tahapan",
      title: `Tahap ${stage.order}: ${stage.title}`,
      body: `${stage.description}\n\nTujuan: ${stage.goal}\nEstimasi: ${stage.estimatedDuration}`,
      href: `/tahapan/${stage.slug}`,
      hrefLabel: "Buka tahap ini",
      haystack: `${stage.shortTitle} ${stage.phase} tahap ${stage.order}`,
    }),
  ),

  ...stages.map((stage) =>
    entry({
      id: `syarat-${stage.slug}`,
      kind: "Dokumen",
      title: `Syarat ${stage.title}`,
      body: stage.requirements.map((r) => `• ${r.text}`).join("\n"),
      href: `/tahapan/${stage.slug}#syarat`,
      hrefLabel: "Lihat persyaratan",
      source: stage.requirements.some((r) => r.source === "resmi")
        ? "resmi"
        : "alumni",
      haystack: `syarat persyaratan ketentuan minimal boleh ikut daftar ${stage.shortTitle} ${stage.requirements.map((r) => r.text).join(" ")}`,
    }),
  ),

  ...stages.map((stage) =>
    entry({
      id: `dok-${stage.slug}`,
      kind: "Dokumen",
      title: `Dokumen untuk ${stage.title}`,
      body: stage.documents
        .map((d) => `• ${d.name}${d.note ? ` — ${d.note}` : ""}`)
        .join("\n"),
      href: `/tahapan/${stage.slug}#dokumen`,
      hrefLabel: "Lihat daftar dokumen",
      haystack: `dokumen berkas syarat ${stage.shortTitle} ${stage.documents.map((d) => d.name).join(" ")}`,
    }),
  ),

  ...stages.map((stage) =>
    entry({
      id: `langkah-${stage.slug}`,
      kind: "Langkah",
      title: `Langkah-langkah ${stage.title}`,
      body: stage.steps.map((s, i) => `${i + 1}. ${s.title} — ${s.detail}`).join("\n"),
      href: `/tahapan/${stage.slug}#langkah`,
      hrefLabel: "Lihat langkah lengkap",
      haystack: `langkah urutan alur prosedur ${stage.shortTitle} ${stage.steps.map((s) => s.title).join(" ")}`,
    }),
  ),

  ...stages.flatMap((stage) =>
    stage.warnings.map((w, i) =>
      entry({
        id: `warn-${stage.slug}-${i}`,
        kind: "Tenggat",
        title: `Perhatian di tahap ${stage.title}`,
        body: w.text,
        href: `/tahapan/${stage.slug}`,
        hrefLabel: stage.title,
        source: w.source,
        haystack: `tenggat batas waktu deadline mengulang ${stage.shortTitle}`,
      }),
    ),
  ),

  ...stages.flatMap((stage) =>
    stage.tips.map((tip, i) =>
      entry({
        id: `tip-${stage.slug}-${i}`,
        kind: "Tips",
        title: `Tips alumni · ${stage.title}`,
        body: tip,
        href: `/tahapan/${stage.slug}#tips`,
        hrefLabel: stage.title,
        haystack: `tips saran pengalaman ${stage.shortTitle}`,
      }),
    ),
  ),

  ...downloads.map((item) => {
    const stage = getStage(item.stage);
    const state =
      item.url === null
        ? "Berkasnya belum diunggah."
        : item.format === "Google Form"
          ? "Bisa langsung dibuka di Download Center."
          : "Bisa langsung diunduh di Download Center.";
    return entry({
      id: `dl-${item.id}`,
      kind: "Template",
      title: item.name,
      body: `${item.description}\n\n${state}`,
      href: `/download#${item.id}`,
      hrefLabel: "Buka di Download Center",
      haystack: `template formulir berkas unduh download ${item.format} ${stage?.title ?? ""}`,
    });
  }),

  ...schedule.exams.map((exam) =>
    entry({
      id: `jadwal-${exam.id}`,
      kind: "Jadwal",
      title: `Jadwal dan pendaftaran ${exam.name}`,
      body: `${exam.schedulePattern}\n\nTenggat pendaftaran: ${exam.deadlinePattern}\nSyarat: ${exam.requirement}\n\n${exam.example}`,
      href: `/tahapan/${exam.stage}`,
      hrefLabel: "Buka tahapnya",
      haystack: `jadwal pendaftaran daftar tenggat deadline periode bulan kapan dibuka mulai tanggal waktu ${exam.name}`,
    }),
  ),

  entry({
    id: "jadwal-umum",
    kind: "Jadwal",
    title: "Kapan ujian digelar dan bagaimana mendaftarnya?",
    body: `${schedule.intro}\n\n${schedule.reminders.map((r) => `• ${r}`).join("\n")}`,
    href: "/",
    hrefLabel: "Lihat siklus ujian",
    haystack: "jadwal ujian bulanan pendaftaran google form tenggat 16.00 wib drive terkunci",
  }),

  entry({
    id: "skpi-nomenklatur",
    kind: "SKPI",
    title: skpi.heading,
    body: `${skpi.intro}\n\n${skpi.entries
      .map(
        (e) =>
          `• ${e.nama} → Kategori: ${e.kategori} · Jenis: ${e.jenis} · Tingkat: ${e.tingkat}`,
      )
      .join("\n")}\n\n${skpi.rules.map((r) => `• ${r}`).join("\n")}`,
    href: "/tahapan/munaqosyah#skpi",
    hrefLabel: "Lihat tabel lengkap",
    haystack:
      "skpi nomenklatur toefl toafl kkn bimbingan teknis mediasi litigasi sertifikat input ais kategori jenis tingkat prestasi",
  }),

  entry({
    id: "ringkasan-alur",
    kind: "Tahapan",
    title: "Ringkasan seluruh alur kelulusan",
    body: `Ada ${totalStages} tahap:\n${stages
      .map((s) => `${s.order}. ${s.title} (${s.estimatedDuration})`)
      .join("\n")}`,
    href: "/roadmap",
    hrefLabel: "Buka roadmap",
    haystack: "alur ringkasan urutan tahap keseluruhan roadmap dari awal sampai lulus ijazah",
  }),
];

export type SearchResult = {
  answer: Answer;
  score: number;
};

/**
 * Skor kecocokan sederhana: seberapa banyak kata pertanyaan muncul,
 * dengan bobot lebih besar bila kata itu ada di judul jawaban.
 */
export function findAnswers(question: string, limit = 3): SearchResult[] {
  const groups = termGroups(question);
  if (groups.length === 0) return [];

  const results: SearchResult[] = [];
  for (const answer of knowledge) {
    let hits = 0;
    let score = 0;

    let titleHits = 0;
    for (const variants of groups) {
      const inTitle = matches(answer.titleWords, variants);
      const inBody = matches(answer.bodyWords, variants);
      if (!inTitle && !inBody) continue;
      hits++;
      if (inTitle) titleHits++;
      score += inTitle ? 3 : 1;
    }

    // Satu kecocokan lemah di badan teks tidak cukup. Tanpa aturan ini,
    // "cuaca hari ini" ikut terjawab hanya karena kata "hari" muncul di
    // keterangan tenggat.
    if (titleHits === 0 && hits < 2) continue;
    if (hits === 0) continue;

    // Cakupan menjaga agar pertanyaan panjang tidak cocok hanya karena satu kata.
    const coverage = hits / groups.length;
    if (coverage < 0.4) continue;

    // Jawaban resmi dan tenggat sedikit diprioritaskan.
    const bonus = answer.kind === "Tenggat" || answer.kind === "FAQ" ? 1.15 : 1;
    results.push({ answer, score: score * coverage * bonus });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Pertanyaan pembuka yang menunjukkan apa saja yang bisa dijawab. */
export const starterQuestions = [
  "Berapa batas Turnitin skripsi?",
  "Kapan pendaftaran sidang dibuka?",
  "Syarat daftar munaqosyah apa saja?",
  "Urutan tanda tangan setelah sidang?",
  "Cara isi SKPI di AIS",
  "Tenggat mana yang bikin mengulang?",
];
