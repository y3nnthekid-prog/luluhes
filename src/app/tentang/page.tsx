import type { Metadata } from "next";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { ResetProgressButton } from "@/components/reset-progress-button";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Lulus HES adalah inisiatif pribadi alumni untuk membantu mahasiswa HES UIN Jakarta menjalani proses kelulusan. Bukan website resmi kampus.",
};

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "Tentang" }]} />

      <header className="mt-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {site.about.heading}
        </h1>
      </header>

      <div className="mt-6 space-y-4">
        {site.about.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-muted-foreground text-pretty">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Disclaimer */}
      <section className="mt-12 rounded-xl border p-5">
        <h2 className="font-heading text-base font-medium">
          {site.disclaimer.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {site.disclaimer.intro}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {site.disclaimer.points.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50"
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Sumber resmi */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-medium">Sumber informasi</h2>
        <div className="mt-4 flex gap-3 rounded-xl border bg-muted/40 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <div className="text-sm">
            <p className="font-medium">{site.officialSource.title}</p>
            <p className="mt-1 text-muted-foreground">
              Surat {site.officialSource.issuer}
              <br />
              No. {site.officialSource.number} · {site.officialSource.date}
            </p>
            <p className="mt-3 text-muted-foreground">
              Informasi berlabel{" "}
              <strong className="font-medium text-foreground">Resmi</strong>{" "}
              berasal dari surat ini. Informasi berlabel{" "}
              <strong className="font-medium text-foreground">Alumni</strong>{" "}
              berasal dari praktik umum dan pengalaman — berguna sebagai
              gambaran, tetapi wajib kamu konfirmasi ke Prodi.
            </p>
          </div>
        </div>
      </section>

      {/* Kontak dan tautan resmi */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-medium">
          Kontak & tautan resmi
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Untuk kepastian, selalu rujuk ke sumber resmi berikut.
        </p>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {site.contacts.map((contact) => (
            <li key={contact.label + contact.url}>
              <a
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full items-start gap-2.5 rounded-xl border p-3.5 transition-colors hover:bg-muted/50"
              >
                <ExternalLink
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {contact.label}
                  </span>
                  {contact.note && (
                    <span className="block text-xs text-muted-foreground">
                      {contact.note}
                    </span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Data & privasi */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-medium">Data & privasi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Website ini tidak punya akun, tidak punya server penyimpan data, dan
          tidak mengirim apa pun ke mana pun. Seluruh checklist dan penanda
          posisimu disimpan di Local Storage browser yang kamu pakai sekarang.
          Kalau kamu berganti browser atau perangkat, progresmu tidak ikut
          berpindah.
        </p>
        <div className="mt-4">
          <ResetProgressButton />
        </div>
      </section>
    </div>
  );
}
