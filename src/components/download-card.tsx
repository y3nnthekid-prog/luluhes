import Link from "next/link";
import {
  Clock,
  Download,
  ExternalLink,
  FileText,
  FileType2,
  Hourglass,
  SquareArrowOutUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getStage } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { DownloadItem } from "@/lib/types";

const statusLabel: Record<DownloadItem["status"], string> = {
  tersedia: "Siap unduh",
  "menunggu-unggah": "Belum diunggah",
  "perlu-verifikasi": "Cek ke Prodi",
};

const statusStyle: Record<DownloadItem["status"], string> = {
  tersedia: "bg-brand-soft text-brand",
  "menunggu-unggah": "bg-muted text-muted-foreground",
  "perlu-verifikasi": "bg-blush/25 text-blush-foreground dark:text-blush",
};

export function DownloadCard({
  item,
  showStage = true,
}: {
  item: DownloadItem;
  showStage?: boolean;
}) {
  const stage = getStage(item.stage);
  const isForm = item.format === "Google Form";
  // Berkas lokal disajikan langsung dari website; sisanya tautan keluar.
  const isLocalFile = item.url?.startsWith("/") ?? false;
  const available = item.url !== null;

  const Icon = isForm ? SquareArrowOutUpRight : available ? FileType2 : FileText;

  return (
    <div
      id={item.id}
      className={cn(
        "card-lift flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center",
        available && "border-brand/25",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          available
            ? "bg-brand-soft text-brand"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4.5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-sm font-semibold">{item.name}</h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              statusStyle[item.status],
            )}
          >
            {statusLabel[item.status]}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">
            {item.format}
          </span>
          {item.version !== "—" && <span>Versi {item.version}</span>}
          {item.size !== "—" && <span>{item.size}</span>}
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
        <a
          href={item.url!}
          // Berkas lokal langsung diunduh; form dibuka di tab baru.
          {...(isLocalFile
            ? { download: "" }
            : { target: "_blank", rel: "noopener noreferrer" })}
          className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/85 pointer-coarse:min-h-11"
        >
          {isForm ? (
            <>
              <ExternalLink className="size-4" aria-hidden />
              Buka form
            </>
          ) : (
            <>
              <Download className="size-4" aria-hidden />
              Unduh
            </>
          )}
        </a>
      ) : (
        <Button size="sm" variant="outline" className="shrink-0" disabled>
          <Hourglass aria-hidden />
          Belum ada
        </Button>
      )}
    </div>
  );
}
