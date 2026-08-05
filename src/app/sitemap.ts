import type { MetadataRoute } from "next";

import { site, stages } from "@/lib/data";
import { halaman } from "@/lib/navigasi";

/**
 * Peta situs, dibangun dari data yang sama dengan halamannya.
 *
 * Menambah tahapan di `stages.json` otomatis menambahkannya di sini — tidak
 * ada daftar kedua yang harus diingat untuk diperbarui.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alamat = (jalur: string) => new URL(jalur, site.url).toString();

  return [
    ...halaman.map((h) => ({
      url: alamat(h.href),
      changeFrequency: "monthly" as const,
      priority: h.prioritas,
    })),
    ...stages.map((s) => ({
      url: alamat(`/tahapan/${s.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
