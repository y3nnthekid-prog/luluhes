import type { MetadataRoute } from "next";

import { site } from "@/lib/data";

/**
 * Aturan perayapan.
 *
 * Seluruh isi website memang dimaksudkan ditemukan lewat pencarian — itu
 * gunanya dibuat. Yang ditutup hanya route API: isinya bukan halaman, dan
 * merayapinya cuma menghabiskan jatah panggilan model tanpa manfaat apa pun.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
