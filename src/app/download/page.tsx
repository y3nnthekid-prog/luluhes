import type { Metadata } from "next";
import Link from "next/link";
import { FolderDown, Info } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { Reveal } from "@/components/reveal";
import { DownloadCard } from "@/components/download-card";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { downloads, getDownloadsForStage, site, stages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Download Center",
  description:
    "Semua template, formulir, dan panduan kelulusan HES dikelompokkan berdasarkan tahapan.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  const available = downloads.filter(
    (d) => d.status === "tersedia" && d.url !== null,
  );
  const stagesWithFiles = stages.filter(
    (stage) => getDownloadsForStage(stage.slug).length > 0,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={[{ label: "Download Center" }]} />

      <Reveal as="section" className="mt-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Download Center
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {downloads.length} template dan formulir, dikelompokkan per tahapan
          supaya kamu tidak perlu menebak mana yang dipakai kapan.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {site.driveFolderUrl ? (
            <LinkButton href={site.driveFolderUrl} external size="default">
              <FolderDown aria-hidden />
              Download semua template
            </LinkButton>
          ) : (
            <Button size="default" disabled>
              <FolderDown aria-hidden />
              Download semua template
            </Button>
          )}
          <LinkButton href="/roadmap" variant="outline" size="default">
            Lihat roadmap
          </LinkButton>
        </div>
      </Reveal>

      {/* Status file */}
      <div className="mt-8 flex gap-3 rounded-2xl border border-brand/25 bg-brand-soft p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <div className="text-sm text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground">
              {available.length} dari {downloads.length} berkas
            </strong>{" "}
            sudah bisa dibuka sekarang — sebagian dokumen resmi dari Prodi,
            sebagian tautan Google Form pendaftaran. Sisanya sudah terdaftar di
            sini tetapi filenya belum diunggah.
          </p>
          <p className="mt-1.5">
            Untuk mengaktifkan sisanya, unggah file ke Google Drive lalu isi{" "}
            <code>url</code> pada <code>src/data/downloads.json</code> dan{" "}
            <code>driveFolderUrl</code> pada <code>src/data/site.json</code>.
          </p>
        </div>
      </div>

      {/* Per tahapan */}
      <div className="mt-10 space-y-10">
        {stagesWithFiles.map((stage) => {
          const items = getDownloadsForStage(stage.slug);
          return (
            <section key={stage.slug} id={`tahap-${stage.slug}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-base font-medium">
                  <Link
                    href={`/tahapan/${stage.slug}`}
                    className="hover:underline underline-offset-4"
                  >
                    {stage.title}
                  </Link>
                </h2>
                <span className="text-xs text-muted-foreground">
                  Tahap {stage.order} · {items.length} file
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {items.map((item) => (
                  <DownloadCard key={item.id} item={item} showStage={false} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
