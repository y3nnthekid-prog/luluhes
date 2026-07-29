/**
 * Store kecil di atas Local Storage yang bisa dipakai `useSyncExternalStore`.
 *
 * Dipakai alih-alih membaca Local Storage di dalam `useEffect`: React perlu
 * snapshot terpisah untuk server dan klien agar hidrasi tidak memicu render
 * berantai. Nilai di memori jadi sumber kebenaran setelah pembacaan pertama,
 * sehingga website tetap berfungsi ketika Local Storage diblokir (mode privat) —
 * progres hanya tidak ikut tersimpan.
 */
export type LocalStore<T> = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
};

export function createLocalStore<T>(
  key: string,
  fallback: T,
  parse: (raw: string) => T,
): LocalStore<T> {
  let cached: T = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  function readFromStorage(): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : parse(raw);
    } catch {
      return fallback;
    }
  }

  function ensureLoaded() {
    if (loaded) return;
    loaded = true;
    cached = readFromStorage();
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      // Perubahan dari tab lain pada perangkat yang sama ikut tersinkron.
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key && event.key !== null) return;
        cached = readFromStorage();
        onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot() {
      ensureLoaded();
      return cached;
    },
    getServerSnapshot() {
      return fallback;
    },
    set(value) {
      loaded = true;
      cached = value;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage penuh atau diblokir — nilai tetap hidup di memori sesi ini.
      }
      emit();
    },
  };
}

/** Menandai apakah render sudah berjalan di klien, tanpa setState di effect. */
const noopSubscribe = () => () => {};
export const hydratedStore = {
  subscribe: noopSubscribe,
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};
