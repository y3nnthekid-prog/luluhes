import { createElement } from "react";

import { stageIcon } from "@/lib/icons";

/**
 * Merender ikon tahapan dari nama pada `stages.json`.
 *
 * Memakai `createElement` alih-alih `const Icon = stageIcon(name)` di dalam
 * render: menugaskan komponen ke variabel saat render membuat React memperlakukan
 * hasilnya sebagai komponen baru setiap render.
 */
export function StageIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return createElement(stageIcon(name), { className, "aria-hidden": true });
}
