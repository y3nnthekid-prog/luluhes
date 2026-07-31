import { callerIp, checkRate } from "@/lib/ai/guard";
import { BATAS_PAPAN, rapikanNama } from "@/lib/papan-skor";
import {
  ambilSkor,
  diagnosaPenyimpanan,
  penyimpananSiap,
  simpanSkor,
  ujiKoneksi,
} from "@/lib/redis";

export const runtime = "nodejs";

/** Permainan yang punya papan skor, beserta kunci penyimpanannya. */
const PERMAINAN: Record<string, string> = {
  lari: "lulushes:skor:lari",
  blast: "lulushes:skor:blast",
};

/**
 * Batas atas skor yang masuk akal.
 *
 * Skor dikirim dari peramban, jadi tidak ada cara benar-benar membuktikannya.
 * Batas ini tidak menghentikan kecurangan yang niat — ia hanya menjaga papan
 * tetap terbaca kalau ada yang mengirim angka konyol.
 */
const SKOR_MAKS = 100_000;

type Balasan = {
  /** Benar bila papan ini benar-benar dibagi lintas perangkat. */
  global: boolean;
  daftar: { nama: string; skor: number }[];
};

function json(isi: Balasan | { error: string }, init?: ResponseInit) {
  return Response.json(isi, init);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Alat bantu pemasangan: menyebutkan variabel mana yang terpasang dan
  // apakah Redis benar-benar menjawab. Tidak pernah menyertakan nilainya.
  if (searchParams.get("diagnosa") === "1") {
    return Response.json({
      variabel: diagnosaPenyimpanan(),
      kredensialLengkap: penyimpananSiap(),
      redisMenjawab: penyimpananSiap() ? await ujiKoneksi() : false,
    });
  }

  const kunci = PERMAINAN[searchParams.get("game") ?? ""];
  if (!kunci) return json({ error: "Permainan tidak dikenal." }, { status: 400 });

  if (!penyimpananSiap()) return json({ global: false, daftar: [] });

  const daftar = await ambilSkor(kunci, BATAS_PAPAN);
  // Penyimpanan terpasang tapi tidak menjawab — jangan berpura-pura papan
  // globalnya kosong, katakan saja belum global supaya klien memakai lokal.
  if (daftar === null) return json({ global: false, daftar: [] });

  return json({ global: true, daftar });
}

export async function POST(request: Request) {
  const rate = checkRate(callerIp(request));
  if (!rate.allowed) {
    return json(
      { error: "Terlalu sering mengirim skor. Coba lagi sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  let game = "";
  let nama = "";
  let skor = 0;
  try {
    const isi = (await request.json()) as {
      game?: unknown;
      nama?: unknown;
      skor?: unknown;
    };
    game = typeof isi.game === "string" ? isi.game : "";
    nama = rapikanNama(typeof isi.nama === "string" ? isi.nama : "");
    skor = typeof isi.skor === "number" ? Math.floor(isi.skor) : -1;
  } catch {
    return json({ error: "Format permintaan tidak dikenali." }, { status: 400 });
  }

  const kunci = PERMAINAN[game];
  if (!kunci) return json({ error: "Permainan tidak dikenal." }, { status: 400 });
  if (!nama) return json({ error: "Nama tidak boleh kosong." }, { status: 400 });
  if (!Number.isFinite(skor) || skor < 0 || skor > SKOR_MAKS) {
    return json({ error: "Skor di luar rentang wajar." }, { status: 400 });
  }

  if (!penyimpananSiap()) return json({ global: false, daftar: [] });

  const tersimpan = await simpanSkor(kunci, nama, skor);
  if (!tersimpan) return json({ global: false, daftar: [] });

  const daftar = await ambilSkor(kunci, BATAS_PAPAN);
  return json({ global: daftar !== null, daftar: daftar ?? [] });
}
