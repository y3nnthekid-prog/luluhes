import {
  ArrowRight,
  FileText,
  FolderDown,
  ListChecks,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { PositionCard } from "@/components/position-card";
import { Roadmap } from "@/components/roadmap";
import { WizardDialog } from "@/components/wizard-dialog";
import { LinkButton } from "@/components/link-button";
import { downloads, site, stages, totalStages } from "@/lib/data";

const questions = [
  {
    icon: MapPin,
    question: "Saya sedang berada di mana?",
    answer:
      "Roadmap dan kartu posisi menunjukkan tahap kamu sekarang dari 12 tahap kelulusan.",
  },
  {
    icon: ListChecks,
    question: "Apa yang harus saya lakukan sekarang?",
    answer:
      "Setiap tahap punya langkah berurutan dan checklist yang tersimpan otomatis.",
  },
  {
    icon: FolderDown,
    question: "Dokumen apa yang saya butuhkan?",
    answer:
      "Daftar dokumen dan template dikelompokkan per tahap, bukan dicampur jadi satu.",
  },
  {
    icon: ArrowRight,
    question: "Apa langkah berikutnya?",
    answer:
      "Setiap halaman selalu menutup dengan tahap sesudahnya. Kamu tidak pernah buntu.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-14 sm:py-20">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-1.5 rounded-full bg-brand" aria-hidden />
          {site.program} · {site.faculty}
        </p>

        <h1 className="mt-4 font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          Berhenti menebak-nebak alur kelulusanmu.
        </h1>

        <p className="mt-4 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
          {site.name} menyusun seluruh proses dari persiapan proposal sampai
          pengambilan ijazah menjadi satu alur yang runtut — lengkap dengan
          tenggat resmi yang paling sering bikin mahasiswa mengulang.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <WizardDialog />
          <LinkButton href="/roadmap" variant="outline" size="lg">
            Lihat roadmap
            <ArrowRight aria-hidden data-icon="inline-end" />
          </LinkButton>
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-4 border-t pt-6 sm:max-w-md">
          <div>
            <dt className="text-xs text-muted-foreground">Tahapan</dt>
            <dd className="font-heading text-2xl font-medium tabular-nums">
              {totalStages}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Template</dt>
            <dd className="font-heading text-2xl font-medium tabular-nums">
              {downloads.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Butuh akun</dt>
            <dd className="font-heading text-2xl font-medium">Tidak</dd>
          </div>
        </dl>
      </section>

      {/* Posisi pengguna */}
      <section className="pb-14">
        <PositionCard />
      </section>

      {/* Empat pertanyaan inti */}
      <section className="border-t py-14">
        <h2 className="font-heading text-xl font-medium sm:text-2xl">
          Empat pertanyaan yang selalu dijawab
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Kalau setelah membaca sebuah halaman kamu masih harus bertanya ke
          senior, berarti halaman itu belum cukup baik.
        </p>

        <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {questions.map(({ icon: Icon, question, answer }) => (
            <div key={question} className="flex gap-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <h3 className="font-heading text-sm font-medium">{question}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap ringkas */}
      <section className="border-t py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-medium sm:text-2xl">
              Perjalananmu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalStages} tahap, dari {stages[0].shortTitle} sampai{" "}
              {stages[stages.length - 1].shortTitle}.
            </p>
          </div>
          <LinkButton href="/roadmap" variant="outline" size="sm">
            Roadmap lengkap
            <ArrowRight aria-hidden data-icon="inline-end" />
          </LinkButton>
        </div>

        <div className="mt-8">
          <Roadmap compact />
        </div>
      </section>

      {/* Dasar informasi */}
      <section className="border-t py-14">
        <div className="rounded-xl border bg-muted/40 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <ShieldCheck className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-base font-medium">
                Dasar informasi di website ini
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Persyaratan dan tenggat berlabel{" "}
                <strong className="font-medium text-foreground">Resmi</strong>{" "}
                mengacu pada Surat {site.officialSource.issuer} No.{" "}
                {site.officialSource.number} tanggal {site.officialSource.date}{" "}
                tentang {site.officialSource.title}. Selebihnya berlabel{" "}
                <strong className="font-medium text-foreground">Alumni</strong> —
                praktik umum yang tetap perlu kamu konfirmasi ke Prodi.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <LinkButton href="/tentang" variant="outline" size="sm">
                  <FileText aria-hidden />
                  Tentang website ini
                </LinkButton>
                <LinkButton href="/download" variant="ghost" size="sm">
                  <FolderDown aria-hidden />
                  Download Center
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
