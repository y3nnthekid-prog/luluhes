import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // Tes komponen ditulis sebagai .tsx dan menyatakan lingkungannya sendiri
    // lewat docblock `@vitest-environment jsdom`. Sisanya logika murni dan
    // tetap jalan di node, yang jauh lebih cepat daripada memasang DOM palsu
    // untuk berkas yang tidak membutuhkannya.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
