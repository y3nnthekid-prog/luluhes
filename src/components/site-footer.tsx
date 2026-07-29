import Link from "next/link";

import { site } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <p className="font-heading font-medium">{site.name}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {site.description}
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm sm:text-right">
            <Link
              href="/roadmap"
              className="text-muted-foreground hover:text-foreground"
            >
              Roadmap
            </Link>
            <Link
              href="/tahapan"
              className="text-muted-foreground hover:text-foreground"
            >
              Tahapan
            </Link>
            <Link
              href="/download"
              className="text-muted-foreground hover:text-foreground"
            >
              Download Center
            </Link>
            <Link
              href="/faq"
              className="text-muted-foreground hover:text-foreground"
            >
              FAQ
            </Link>
            <Link
              href="/tentang"
              className="text-muted-foreground hover:text-foreground"
            >
              Tentang
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          Website ini <strong className="font-medium">bukan website resmi</strong>{" "}
          dan tidak berada di bawah pengelolaan Program Studi, Fakultas, maupun
          Universitas. Kebijakan administrasi dapat berubah sewaktu-waktu —
          selalu konfirmasikan ke Sekretaris Program Studi atau unit terkait.
          Sebagian besar tenggat mengacu pada Surat {site.officialSource.issuer}{" "}
          No. {site.officialSource.number} tanggal {site.officialSource.date}.
        </p>
      </div>
    </footer>
  );
}
