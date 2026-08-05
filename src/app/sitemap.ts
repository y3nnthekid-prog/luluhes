import type { MetadataRoute } from "next";

import { site, stages } from "@/lib/data";

/**
 * Peta situs, dibangun dari data yang sama dengan halamannya.
 *
 * Menambah tahapan di `stages.json` otomatis menambahkannya di sini — tidak
 * ada daftar kedua yang harus diingat untuk diperbarui.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alamat = (jalur: string) => new URL(jalur, site.url).toString();

  const halamanTetap = [
    { jalur: "/", prioritas: 1 },
    { jalur: "/roadmap", prioritas: 0.9 },
    { jalur: "/tahapan", prioritas: 0.9 },
    { jalur: "/download", prioritas: 0.8 },
    { jalur: "/faq", prioritas: 0.7 },
    { jalur: "/main", prioritas: 0.5 },
    { jalur: "/tentang", prioritas: 0.5 },
  ];

  return [
    ...halamanTetap.map((h) => ({
      url: alamat(h.jalur),
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
