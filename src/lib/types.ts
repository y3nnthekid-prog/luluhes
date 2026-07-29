/**
 * Tipe data untuk seluruh konten Lulus HES.
 *
 * Semua konten website berasal dari file JSON di `src/data`.
 * Tidak ada teks tahapan yang ditulis langsung di komponen.
 */

/** Sumber sebuah informasi. Dipakai untuk menandai mana yang resmi, mana yang perlu dikonfirmasi. */
export type SourceLevel =
  /** Tertulis pada Surat Dekan FSH No. B-252/F4/PP.01.1/01/2024. */
  | "resmi"
  /** Praktik umum / pengalaman alumni. Sebaiknya dikonfirmasi ke Prodi. */
  | "alumni";

export type Fact = {
  text: string;
  source: SourceLevel;
};

export type StageDocument = {
  name: string;
  note?: string;
  source: SourceLevel;
};

export type StageStep = {
  title: string;
  detail: string;
  /** Siapa yang mengerjakan / dituju pada langkah ini. */
  actor?: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  /** Slug tahapan terkait, untuk halaman FAQ global. */
  stage?: string;
};

export type ImportantLink = {
  label: string;
  url: string;
  note?: string;
};

export type StagePhase = "Proposal" | "Skripsi" | "Ujian" | "Kelulusan";

export type Stage = {
  /** Urutan tahap, dimulai dari 1. */
  order: number;
  slug: string;
  title: string;
  /** Judul pendek untuk node roadmap dan breadcrumb. */
  shortTitle: string;
  /** Nama ikon lucide-react (lihat `src/lib/icons.ts`). */
  icon: string;
  phase: StagePhase;
  description: string;
  /** Apa yang ingin dicapai di tahap ini. Satu kalimat. */
  goal: string;
  estimatedDuration: string;
  requirements: Fact[];
  documents: StageDocument[];
  steps: StageStep[];
  checklist: ChecklistItem[];
  /** Batas waktu / jebakan administratif yang bikin mahasiswa mengulang. */
  warnings: Fact[];
  tips: string[];
  faq: FaqItem[];
  /** Id template pada `downloads.json`. */
  downloads: string[];
  importantLinks: ImportantLink[];
  previousStage: string | null;
  nextStage: string | null;
};

export type DownloadStatus =
  /** File sudah diunggah dan tautannya aktif. */
  | "tersedia"
  /** Metadata sudah ada, file belum diunggah ke Google Drive. */
  | "menunggu-unggah"
  /** Ada, tetapi kemungkinan sudah berubah — konfirmasi ke Prodi dulu. */
  | "perlu-verifikasi";

export type DownloadItem = {
  id: string;
  name: string;
  description: string;
  /** Slug tahapan pemilik template. */
  stage: string;
  version: string;
  format: string;
  size: string;
  status: DownloadStatus;
  /** ISO date, kapan metadata / file terakhir diperbarui. */
  updatedAt: string;
  /** Tautan Google Drive. `null` berarti belum diunggah. */
  url: string | null;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  program: string;
  faculty: string;
  university: string;
  officialSource: {
    title: string;
    number: string;
    date: string;
    issuer: string;
  };
  /** Folder Google Drive berisi seluruh template. */
  driveFolderUrl: string | null;
  disclaimer: {
    title: string;
    intro: string;
    points: string[];
    consent: string;
  };
  contacts: ImportantLink[];
  about: {
    heading: string;
    paragraphs: string[];
  };
};
