import { createLocalStore } from "@/lib/local-store";

/**
 * Efek suara mini game.
 *
 * Nadanya dibangkitkan langsung lewat Web Audio, bukan diputar dari berkas.
 * Konsekuensinya: nol byte tambahan yang harus diunduh, dan tidak ada jeda
 * pemuatan sebelum bunyi pertama terdengar.
 *
 * Semuanya sengaja pelan dan pendek — di bawah 200 milidetik. Permainan ini
 * dibuka di ruang baca dan di kelas; suara yang menyentak justru membuat orang
 * mematikannya sekalian.
 */

export type Nada =
  | "lompat"
  | "kena"
  | "taruh"
  | "ledak"
  | "selesai"
  | "pilih";

/** Preferensi suara, tersimpan di peramban masing-masing. */
export const suaraStore = createLocalStore<boolean>(
  "lulus-hes:suara:v1",
  true,
  (raw) => {
    try {
      return JSON.parse(raw) === true;
    } catch {
      return true;
    }
  },
);

let konteks: AudioContext | null = null;

/**
 * Konteks audio dibuat malas, saat bunyi pertama diminta.
 *
 * Peramban menolak memulai audio sebelum ada interaksi pengguna. Karena setiap
 * bunyi di sini selalu menyusul sebuah ketukan atau tekanan tombol, membuatnya
 * saat itu juga sudah cukup — dan tidak ada AudioContext menganggur bagi orang
 * yang cuma membaca halamannya.
 */
function ambilKonteks(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (konteks) return konteks;
  const Kelas =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Kelas) return null;
  try {
    konteks = new Kelas();
    return konteks;
  } catch {
    return null;
  }
}

type Resep = {
  /** Frekuensi awal dan akhir, dalam hertz. */
  dari: number;
  ke: number;
  durasi: number;
  bentuk: OscillatorType;
  keras: number;
};

const RESEP: Record<Nada, Resep> = {
  // Naik cepat: terasa seperti terangkat.
  lompat: { dari: 420, ke: 720, durasi: 0.11, bentuk: "sine", keras: 0.07 },
  // Turun dan kasar: terasa seperti tersandung.
  kena: { dari: 260, ke: 90, durasi: 0.19, bentuk: "sawtooth", keras: 0.06 },
  // Ketukan tumpul saat potongan mendarat di papan.
  taruh: { dari: 300, ke: 240, durasi: 0.06, bentuk: "triangle", keras: 0.06 },
  // Cerah dan naik: hadiah untuk garis yang lenyap.
  ledak: { dari: 640, ke: 1180, durasi: 0.16, bentuk: "sine", keras: 0.08 },
  // Turun perlahan: menandai berakhir, bukan menghukum.
  selesai: { dari: 520, ke: 200, durasi: 0.28, bentuk: "sine", keras: 0.06 },
  // Sangat singkat, untuk memilih potongan.
  pilih: { dari: 520, ke: 560, durasi: 0.04, bentuk: "sine", keras: 0.04 },
};

/**
 * Membunyikan satu nada.
 *
 * Diam saja bila pengguna mematikan suara, bila peramban tidak mendukung Web
 * Audio, atau bila apa pun gagal. Bunyi adalah hiasan; kegagalannya tidak
 * boleh sampai mengganggu jalannya permainan.
 */
export function bunyikan(nada: Nada): void {
  if (!suaraStore.getSnapshot()) return;

  const ctx = ambilKonteks();
  if (!ctx) return;

  try {
    // Tab yang sempat tidak aktif membuat konteksnya tertidur.
    if (ctx.state === "suspended") void ctx.resume();

    const r = RESEP[nada];
    const kini = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = r.bentuk;
    osc.frequency.setValueAtTime(r.dari, kini);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, r.ke), kini + r.durasi);

    // Naik sangat cepat lalu meluruh: tanpa ini tiap nada berakhir dengan
    // letupan klik saat gelombangnya terpotong mendadak.
    gain.gain.setValueAtTime(0.0001, kini);
    gain.gain.exponentialRampToValueAtTime(r.keras, kini + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, kini + r.durasi);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(kini);
    osc.stop(kini + r.durasi + 0.02);
  } catch {
    // Diabaikan dengan sengaja.
  }
}
