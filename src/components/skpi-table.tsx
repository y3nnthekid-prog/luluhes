import { TriangleAlert } from "lucide-react";

import { skpi } from "@/lib/data";

/**
 * Tabel nomenklatur SKPI. Penulisan yang salah memicu pembatalan validasi
 * dari akademik dan Prodi, jadi contohnya ditampilkan persis apa adanya.
 */
export function SkpiTable() {
  return (
    <section id="skpi" aria-labelledby="skpi-heading">
      <h2 id="skpi-heading" className="font-heading text-lg font-semibold">
        {skpi.heading}
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
        {skpi.intro}
      </p>

      <div className="scroll-x mt-4">
        <table className="w-full min-w-xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-brand-soft">
              <th className="rounded-l-lg px-3 py-2 font-heading text-xs font-semibold">
                Nama prestasi
              </th>
              <th className="px-3 py-2 font-heading text-xs font-semibold">
                Kategori
              </th>
              <th className="px-3 py-2 font-heading text-xs font-semibold">
                Jenis prestasi
              </th>
              <th className="rounded-r-lg px-3 py-2 font-heading text-xs font-semibold">
                Tingkat
              </th>
            </tr>
          </thead>
          <tbody>
            {skpi.entries.map((entry) => (
              <tr key={entry.nama} className="border-b last:border-0">
                <td className="border-b px-3 py-2 font-medium">{entry.nama}</td>
                <td className="border-b px-3 py-2 text-muted-foreground">
                  {entry.kategori}
                </td>
                <td className="border-b px-3 py-2 text-muted-foreground">
                  {entry.jenis}
                </td>
                <td className="border-b px-3 py-2 text-muted-foreground">
                  {entry.tingkat}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 space-y-2">
        {skpi.rules.map((rule) => (
          <li
            key={rule}
            className="flex gap-2.5 rounded-xl border border-warn/30 bg-warn-muted p-3 text-sm"
          >
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-warn"
              aria-hidden
            />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-muted-foreground">{skpi.note}</p>
    </section>
  );
}
