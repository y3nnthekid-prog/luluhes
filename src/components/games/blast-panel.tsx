"use client";

import * as React from "react";

import { BlastBerkas } from "@/components/games/blast-berkas";
import {
  PapanSkorPanel,
  kirimSkor,
} from "@/components/games/papan-skor-panel";
import { Input } from "@/components/ui/input";
import {
  MAKS_HURUF_NAMA,
  namaPemainStore,
  rapikanNama,
} from "@/lib/papan-skor";

/**
 * Blast Berkas beserta kolom nama dan papan skornya.
 *
 * Namanya memakai simpanan yang sama dengan permainan lari, jadi cukup diketik
 * sekali untuk kedua permainan.
 */
export function BlastPanel() {
  const namaTersimpan = React.useSyncExternalStore(
    namaPemainStore.subscribe,
    namaPemainStore.getSnapshot,
    namaPemainStore.getServerSnapshot,
  );

  const [nama, setNama] = React.useState("");
  const [penyegar, setPenyegar] = React.useState(0);
  const namaDipakai = rapikanNama(nama) || namaTersimpan;

  const selesai = React.useCallback(
    (skor: number) => {
      const pemain = rapikanNama(namaDipakai) || "Tanpa nama";
      if (pemain !== "Tanpa nama") namaPemainStore.set(pemain);
      void kirimSkor("blast", {
        nama: pemain,
        skor,
        pada: new Date().toISOString(),
      }).then(() => setPenyegar((n) => n + 1));
    },
    [namaDipakai],
  );

  return (
    <div>
      <div className="mb-3">
        <label htmlFor="nama-blast" className="text-sm font-medium">
          Nama kamu <span className="text-muted-foreground">(untuk papan skor)</span>
        </label>
        <Input
          id="nama-blast"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder={namaTersimpan || "Nama kamu"}
          maxLength={MAKS_HURUF_NAMA}
          autoComplete="off"
          className="mt-1.5 max-w-xs"
        />
      </div>

      <BlastBerkas onSelesai={selesai} />
      <PapanSkorPanel permainan="blast" penyegar={penyegar} />
    </div>
  );
}
