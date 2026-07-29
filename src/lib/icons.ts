import {
  Award,
  BookOpen,
  FileCheck2,
  Gavel,
  GraduationCap,
  Library,
  Lightbulb,
  Milestone,
  PartyPopper,
  PenLine,
  Presentation,
  ScrollText,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

/**
 * Ikon tahapan dipilih lewat nama pada `stages.json`, bukan di komponen.
 * Menambah tahapan baru cukup menambah entri di sini.
 */
const stageIcons: Record<string, LucideIcon> = {
  Lightbulb,
  Presentation,
  PenLine,
  BookOpen,
  GraduationCap,
  Gavel,
  FileCheck2,
  UploadCloud,
  Library,
  ScrollText,
  PartyPopper,
  Award,
};

export function stageIcon(name: string): LucideIcon {
  return stageIcons[name] ?? Milestone;
}
