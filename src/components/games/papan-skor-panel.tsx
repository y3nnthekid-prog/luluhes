"use client";

import * as React from "react";
import { Globe, Smartphone, Trophy } from "lucide-react";

import {
  BATAS_PAPAN,
  papanSkorStore,
  tambahSkor,
  type SkorEntri,
} from "@/lib/papan-skor";
import { cn } from "@/lib/utils";

export type Permainan = "lari" | "blast";

type Isi = { global: boolean; daftar: { nama: string; skor: number }[] };

/**
 * Papan tujuh besar, global bila server menyediakannya.
 *
 * Kalau penyimpanan bersama belum dipasang — atau sedang tidak bisa dihubungi —
 * panel ini diam-diam beralih ke papan lokal di peramban masing-masing, dan
 * mengatakannya terus terang lewat label di sudut. Menampilkan papan lokal
 * seolah-olah itu peringkat sedunia jauh lebih buruk daripada mengaku.
 */
export function PapanSkorPanel({
  permainan,
  /** Dinaikkan setiap kali skor baru dikirim, untuk memicu pengambilan ulang. */
  penyegar = 0,
}: {
  permainan: Permainan;
  penyegar?: number;
}) {
  const lokal = React.useSyncExternalStore(
    papanSkorStore.subscribe,
    papanSkorStore.getSnapshot,
    papanSkorStore.getServerSnapshot,
  );

  const [server, setServer] = React.useState<Isi | null>(null);

  React.useEffect(() => {
    let batal = false;
    fetch(`/api/skor?game=${permainan}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((isi: Isi | null) => {
        if (!batal && isi && typeof isi.global === "boolean") setServer(isi);
      })
      .catch(() => {
        // Diabaikan: papan lokal yang dipakai.
      });
    return () => {
      batal = true;
    };
  }, [permainan, penyegar]);

  const global = server?.global === true;
  const daftar: { nama: string; skor: number }[] = global
    ? server!.daftar
    : lokal.map((e) => ({ nama: e.nama, skor: e.skor }));

  return (
    <div className="mt-6 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Trophy className="size-4 text-brand" aria-hidden />
        <h3 className="font-heading text-sm font-semibold">
          Tujuh skor tertinggi
        </h3>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            global
              ? "bg-brand-soft text-brand"
              : "bg-muted text-muted-foreground",
          )}
        >
          {global ? (
            <>
              <Globe className="size-3" aria-hidden />
              Semua pemain
            </>
          ) : (
            <>
              <Smartphone className="size-3" aria-hidden />
              Perangkat ini saja
            </>
          )}
        </span>
      </div>

      {daftar.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Belum ada yang tercatat. Skor pertama jadi milik kamu.
        </p>
      ) : (
        <ol className="mt-3 space-y-1">
          {daftar.slice(0, BATAS_PAPAN).map((e, i) => (
            <li
              key={`${e.nama}-${i}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm",
                i === 0 ? "bg-brand-soft font-medium" : "odd:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
                  i === 0
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{e.nama}</span>
              <span className="font-heading font-semibold tabular-nums">
                {e.skor}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {global
          ? "Papan ini dibagi ke semua pemain. Yang tersimpan hanya nama yang kamu ketik dan skornya — tidak ada data lain."
          : "Papan bersama belum aktif, jadi yang tampil baru skor di peramban ini."}
      </p>
    </div>
  );
}

/**
 * Mengirim skor ke server dan menyimpannya juga secara lokal.
 *
 * Lokal tetap ditulis apa pun hasilnya: kalau papan bersama sedang mati,
 * pemain tidak kehilangan catatannya sendiri.
 */
export async function kirimSkor(
  permainan: Permainan,
  entri: SkorEntri,
): Promise<void> {
  papanSkorStore.set(tambahSkor(papanSkorStore.getSnapshot(), entri));
  try {
    await fetch("/api/skor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: permainan,
        nama: entri.nama,
        skor: entri.skor,
      }),
    });
  } catch {
    // Papan lokal sudah tersimpan; kegagalan jaringan tidak perlu diteruskan.
  }
}
