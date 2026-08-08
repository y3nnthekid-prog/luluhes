import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/breadcrumb";
import { Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { generalFaq, getStage, stages } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang paling sering muncul seputar alur kelulusan HES UIN Jakarta — dari tenggat revisi sampai batas Turnitin.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const stagesWithFaq = stages.filter((stage) => stage.faq.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "FAQ" }]} />

      <Reveal as="section" className="mt-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Pertanyaan yang sering muncul
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pertanyaan umum lebih dulu, lalu pertanyaan yang khusus muncul di tiap
          tahapan.
        </p>
      </Reveal>

      <Reveal as="section" delay={80} className="mt-10">
        <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Umum
        </h2>
        <Accordion className="mt-2">
          {generalFaq.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="pr-6 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      <div className="mt-12 space-y-10">
        {stagesWithFaq.map((stage) => (
          <section key={stage.slug}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
                {stage.title}
              </h2>
              <Link
                href={`/tahapan/${stage.slug}`}
                className="text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center"
              >
                Buka tahap {stage.order}
              </Link>
            </div>
            <Accordion className="mt-2">
              {stage.faq.map((item) => (
                <AccordionItem
                  key={item.question}
                  value={`${stage.slug}-${item.question}`}
                >
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent className="pr-6 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
        Pertanyaanmu belum terjawab? Yang berwenang menjawab tetap Sekretaris
        Program Studi. Daftar kontak dan tautan resmi ada di{" "}
        <Link
          href="/tentang"
          className="underline underline-offset-3 hover:text-foreground"
        >
          halaman Tentang
        </Link>
        .{" "}
        {getStage("munaqosyah") && (
          <>
            Pertanyaan soal berkas sidang paling sering terjawab di{" "}
            <Link
              href="/tahapan/munaqosyah"
              className="underline underline-offset-3 hover:text-foreground"
            >
              halaman Munaqosyah
            </Link>
            .
          </>
        )}
      </div>
    </div>
  );
}
