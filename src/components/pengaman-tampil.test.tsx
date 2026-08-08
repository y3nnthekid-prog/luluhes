// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { AMBANG_PENGAMAN_MS, usePengamanTampil } from "./pengaman-tampil";
import { Reveal } from "./reveal";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

/**
 * IntersectionObserver tiruan yang bisa diatur "sehat" atau "bisu".
 *
 * Yang sehat memanggil balik segera sesudah observe() dengan
 * `isIntersecting: false` — meniru elemen yang ada di bawah layar. Itu memang
 * yang dilakukan observer sungguhan, dan justru kasus itulah yang membedakan
 * aturan lama dari yang sekarang.
 */
function pasangIO(mode: "sehat" | "bisu" | "tidak-ada") {
  if (mode === "tidak-ada") {
    // @ts-expect-error sengaja dihapus untuk meniru peramban lama
    delete window.IntersectionObserver;
    return { jumlahObserve: () => 0 };
  }

  let jumlah = 0;
  class Tiruan {
    callback: IntersectionObserverCallback;
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb;
    }
    observe(el: Element) {
      jumlah++;
      if (mode === "bisu") return;
      setTimeout(() => {
        this.callback(
          [{ target: el, isIntersecting: false } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }, 0);
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver = Tiruan as unknown as typeof IntersectionObserver;
  return { jumlahObserve: () => jumlah };
}

let wadah: HTMLDivElement;
let root: Root;
const ioAsli = window.IntersectionObserver;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  wadah = document.createElement("div");
  document.body.appendChild(wadah);
  root = createRoot(wadah);
});

afterEach(() => {
  act(() => root.unmount());
  wadah.remove();
  vi.useRealTimers();
  window.IntersectionObserver = ioAsli;
});

function Percobaan() {
  const [paksaTampil, pasang] = usePengamanTampil<HTMLDivElement>();
  return <div ref={pasang} data-testid="blok" data-paksa={String(paksaTampil)} />;
}

const paksaSekarang = () =>
  wadah.querySelector("[data-testid=blok]")?.getAttribute("data-paksa");

describe("usePengamanTampil", () => {
  it("memaksa tampil kalau observer tidak pernah memanggil balik", () => {
    pasangIO("bisu");
    act(() => root.render(<Percobaan />));

    expect(paksaSekarang()).toBe("false");

    act(() => void vi.advanceTimersByTime(AMBANG_PENGAMAN_MS + 1));
    expect(paksaSekarang()).toBe("true");
  });

  it("tidak memaksa tampil kalau observer memanggil balik, walau elemennya belum terlihat", () => {
    pasangIO("sehat");
    act(() => root.render(<Percobaan />));

    // panggilan balik pertama datang di sini, dengan isIntersecting: false
    act(() => void vi.advanceTimersByTime(1));
    expect(paksaSekarang()).toBe("false");

    // dan pengaman tetap diam meski ambangnya jauh terlampaui
    act(() => void vi.advanceTimersByTime(AMBANG_PENGAMAN_MS * 5));
    expect(paksaSekarang()).toBe("false");
  });

  it("langsung memaksa tampil di peramban tanpa IntersectionObserver", () => {
    pasangIO("tidak-ada");
    act(() => root.render(<Percobaan />));

    act(() => void vi.advanceTimersByTime(1));
    expect(paksaSekarang()).toBe("true");
  });

  it("membatalkan pengaman saat dilepas, supaya tidak ada setState setelah unmount", () => {
    pasangIO("bisu");
    act(() => root.render(<Percobaan />));
    act(() => root.render(<></>));

    const kesalahan = vi.spyOn(console, "error").mockImplementation(() => {});
    act(() => void vi.advanceTimersByTime(AMBANG_PENGAMAN_MS * 2));
    expect(kesalahan).not.toHaveBeenCalled();
    kesalahan.mockRestore();
  });
});

describe("Reveal", () => {
  const ditampilkan = () =>
    wadah.querySelector("[data-reveal]")?.getAttribute("data-shown");

  it("menampilkan isinya kalau observer tidak pernah memanggil balik", () => {
    pasangIO("bisu");
    act(() => root.render(<Reveal>halo</Reveal>));

    expect(ditampilkan()).toBe(null);

    act(() => void vi.advanceTimersByTime(AMBANG_PENGAMAN_MS + 1));
    expect(ditampilkan()).toBe("true");
  });

  it("tidak menampilkan apa pun selama observer hidup dan elemennya belum terlihat", () => {
    pasangIO("sehat");
    act(() => root.render(<Reveal>halo</Reveal>));

    act(() => void vi.advanceTimersByTime(AMBANG_PENGAMAN_MS * 5));
    // ini yang dulu keliru: pengamannya menyala tanpa syarat, sehingga blok
    // yang belum tergulir ikut muncul dan animasinya jadi sia-sia
    expect(ditampilkan()).toBe(null);
  });
});
