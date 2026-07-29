import Link from "next/link";
import { Clock, Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { getStage } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { DownloadItem } from "@/lib/types";

const statusLabel: Record<DownloadItem["status"], string> = {
  tersedia: "Tersedia",
  "menunggu-unggah": "Belum diunggah",
  "perlu-verifikasi": "Perlu verifikasi",
};

export function DownloadCard({
  item,
  showStage = true,
}: {
  item: DownloadItem;
  showStage?: boolean;
}) {
  const stage = getStage(item.stage);
  const available = item.status === "tersedia" && item.url !== null;

  return (
    <div
      id={item.id}
      className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FileText className="size-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-sm font-medium">{item.name}</h3>
          <Badge
            variant="outline"
            className={cn(
              available
                ? "border-brand/30 bg-brand/10 text-brand"
                : "text-muted-foreground",
            )}
          >
            {statusLabel[item.status]}
          </Badge>
        </div>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{item.format}</span>
          <span>Versi {item.version}</span>
          <span>{item.size}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" aria-hidden />
            {item.updatedAt}
          </span>
          {showStage && stage && (
            <Link
              href={`/tahapan/${stage.slug}`}
              className="underline underline-offset-3 hover:text-foreground"
            >
              {stage.title}
            </Link>
          )}
        </div>
      </div>

      {available ? (
        <LinkButton
          href={item.url!}
          external
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          <Download aria-hidden />
          Unduh
        </LinkButton>
      ) : (
        <Button size="sm" variant="outline" className="shrink-0" disabled>
          <Download aria-hidden />
          Belum tersedia
        </Button>
      )}
    </div>
  );
}
