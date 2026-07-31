"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bunyikan, suaraStore } from "@/lib/suara";

/**
 * Menyalakan atau mematikan efek suara permainan.
 *
 * Pilihannya tersimpan di peramban, jadi tidak perlu diatur ulang tiap
 * berkunjung. Saat dinyalakan, satu nada singkat langsung dibunyikan sebagai
 * bukti bahwa suaranya memang hidup — tanpa itu pengguna tidak punya cara tahu
 * selain menunggu kejadian berikutnya di dalam permainan.
 */
export function TombolSuara() {
  const nyala = React.useSyncExternalStore(
    suaraStore.subscribe,
    suaraStore.getSnapshot,
    suaraStore.getServerSnapshot,
  );

  return (
    <Button
      variant="outline"
      size="sm"
      aria-pressed={nyala}
      onClick={() => {
        const baru = !nyala;
        suaraStore.set(baru);
        if (baru) bunyikan("pilih");
      }}
      title={nyala ? "Matikan efek suara" : "Nyalakan efek suara"}
    >
      {nyala ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
      {nyala ? "Suara aktif" : "Suara mati"}
    </Button>
  );
}
