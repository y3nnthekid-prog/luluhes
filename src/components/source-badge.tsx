import { CircleAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SourceLevel } from "@/lib/types";

/**
 * Menandai asal sebuah informasi supaya pengguna tahu mana yang punya dasar
 * tertulis dan mana yang masih perlu dikonfirmasi ke Prodi.
 */
export function SourceBadge({
  source,
  className,
}: {
  source: SourceLevel;
  className?: string;
}) {
  if (source === "resmi") {
    return (
      <Badge
        variant="outline"
        className={cn("border-brand/30 bg-brand/10 text-brand", className)}
        title="Tertulis dalam Surat Dekan FSH No. B-252/F4/PP.01.1/01/2024"
      >
        <ShieldCheck aria-hidden />
        Resmi
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-muted-foreground", className)}
      title="Praktik umum / pengalaman alumni — konfirmasikan ke Prodi"
    >
      <CircleAlert aria-hidden />
      Alumni
    </Badge>
  );
}
