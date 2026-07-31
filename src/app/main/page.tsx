import type { Metadata } from "next";
import { Blocks, Footprints, Gamepad2, ListOrdered, Puzzle } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { BlastPanel } from "@/components/games/blast-panel";
import { LariWisuda } from "@/components/games/lari-wisuda";
import { TebakTahap } from "@/components/games/tebak-tahap";
import { UrutkanAlur } from "@/components/games/urutkan-alur";
import { Reveal } from "@/components/reveal";
import { bankSoal } from "@/lib/games";
import { totalStages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ruang Main",
  description:
    "Empat mini game untuk menguji hafalan alur kelulusan HES: lari menghindari tenggat, menata berkas, menyusun urutan tahapan, dan menebak asal sebuah syarat.",
};

export default function MainPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "Ruang Main" }]} />

      <Reveal>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm shadow-brand/30">
            <Gamepad2 className="size-5.5" aria-hidden />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">
              Ruang Main
            </h1>
            <p className="text-sm text-muted-foreground">
              Cara paling cepat tahu bagian mana yang belum kamu hafal.
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Keempat permainan ini merakit isinya dari data yang sama dengan halaman
          tahapan — {totalStages} tahap dan {bankSoal.length} potongan syarat,
          dokumen, serta peringatan. Jadi kalau kamu menang di sini, kamu memang
          hafal alurnya, bukan hafal soalnya.
        </p>
      </Reveal>

      <Reveal delay={90} as="section" className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Footprints className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Lari Menuju Wisuda
            </h2>
            <p className="text-xs text-muted-foreground">
              Lompati tenggat, tunduki yang melayang
            </p>
          </div>
        </div>
        <div className="mt-4">
          <LariWisuda />
        </div>
      </Reveal>

      <Reveal delay={90} as="section" className="mt-12 border-t pt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Blocks className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">Blast Berkas</h2>
            <p className="text-xs text-muted-foreground">
              Tata potongan berkas, penuhi baris atau kolom
            </p>
          </div>
        </div>
        <div className="mt-4">
          <BlastPanel />
        </div>
      </Reveal>

      <Reveal delay={90} as="section" className="mt-12 border-t pt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blush text-blush-foreground">
            <ListOrdered className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">Susun Alur</h2>
            <p className="text-xs text-muted-foreground">
              Urutkan {totalStages} tahap dari awal sampai ijazah
            </p>
          </div>
        </div>
        <div className="mt-4">
          <UrutkanAlur />
        </div>
      </Reveal>

      <Reveal delay={90} as="section" className="mt-12 border-t pt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blush text-blush-foreground">
            <Puzzle className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">Tebak Tahap</h2>
            <p className="text-xs text-muted-foreground">
              Delapan potongan acak, tebak asalnya
            </p>
          </div>
        </div>
        <div className="mt-4">
          <TebakTahap />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-10 rounded-xl border bg-muted/50 p-3 text-xs text-muted-foreground">
          Papan skor Lari dan Blast dibagi ke semua pemain, jadi nama yang kamu
          ketik beserta skornya memang dikirim dan tersimpan di server — hanya
          itu, tidak ada data lain. Susun Alur dan Tebak Tahap sepenuhnya di
          perangkatmu dan tidak mengirim apa pun. Skornya untuk latihan, bukan
          penilaian.
        </p>
      </Reveal>
    </div>
  );
}
