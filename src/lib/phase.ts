import type { StagePhase } from "@/lib/types";

/**
 * Setiap fase punya warna sendiri, dibaca sebagai satu gradasi pematangan:
 * kuning (mulai) → limau → hijau → hijau tua (lulus).
 *
 * Limau dan kuning sangat terang, jadi teks di atasnya selalu gelap.
 */
type PhaseStyle = {
  /** Blok penuh warna fase. */
  solid: string;
  /** Latar lembut untuk tile ikon dan chip. */
  soft: string;
  /** Garis atau titik penanda. */
  dot: string;
  /** Teks berwarna fase, aman di latar terang maupun gelap. */
  text: string;
};

const styles: Record<StagePhase, PhaseStyle> = {
  Proposal: {
    solid: "bg-phase-proposal text-blush-foreground",
    soft: "bg-phase-proposal/25 text-blush-foreground dark:text-blush",
    dot: "bg-phase-proposal",
    text: "text-blush-foreground dark:text-blush",
  },
  Skripsi: {
    solid: "bg-phase-skripsi text-pop-foreground",
    soft: "bg-phase-skripsi/25 text-pop-foreground dark:text-blush",
    dot: "bg-phase-skripsi",
    text: "text-pop-foreground dark:text-blush",
  },
  Ujian: {
    solid: "bg-phase-ujian text-phase-ujian-foreground",
    soft: "bg-phase-ujian/25 text-phase-ujian-foreground dark:text-blush",
    dot: "bg-phase-ujian",
    text: "text-phase-ujian",
  },
  Kelulusan: {
    solid: "bg-phase-kelulusan text-brand-foreground",
    soft: "bg-phase-kelulusan/15 text-phase-kelulusan",
    dot: "bg-phase-kelulusan",
    text: "text-phase-kelulusan",
  },
};

export function phaseStyle(phase: StagePhase): PhaseStyle {
  return styles[phase];
}

/** Urutan fase beserta ringkasan satu barisnya, untuk legenda roadmap. */
export const phaseSummary: Record<StagePhase, string> = {
  Proposal: "Mengunci judul sampai proposal disahkan",
  Skripsi: "Menulis dan meneliti bersama pembimbing",
  Ujian: "Komprehensif, sidang, dan revisinya",
  Kelulusan: "Administrasi sampai ijazah di tangan",
};
