import Link from "next/link";

import { site } from "@/lib/data";
import { halamanSelainBeranda } from "@/lib/navigasi";

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

          {/* Urutannya dulu ditulis tangan di sini dan sudah menyimpang dari
              header. Sekarang keduanya membaca daftar yang sama. */}
          <nav className="flex flex-col gap-2 text-sm sm:text-right">
            {halamanSelainBeranda.map((h) => (
              <Link
                key={h.href}
                href={h.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {h.label}
              </Link>
            ))}
            <Link
              href="/tentang#dukungan"
              className="font-medium text-brand hover:underline"
            >
              Dukung &amp; beri masukan
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
