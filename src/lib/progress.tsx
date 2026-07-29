"use client";

import * as React from "react";

import { stages, totalChecklistItems, getStage } from "@/lib/data";
import { createLocalStore, hydratedStore } from "@/lib/local-store";
import type { Stage } from "@/lib/types";

const STORAGE_KEY = "lulus-hes:progress:v1";
const DISCLAIMER_KEY = "lulus-hes:disclaimer:v1";

type ProgressState = {
  /** slug tahapan -> daftar id item checklist yang sudah dicentang */
  checked: Record<string, string[]>;
  /** Tahap yang dipilih pengguna lewat wizard. Null = ditebak dari checklist. */
  pinnedStage: string | null;
};

const emptyState: ProgressState = { checked: {}, pinnedStage: null };

function parseProgress(raw: string): ProgressState {
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      checked:
        parsed.checked && typeof parsed.checked === "object"
          ? parsed.checked
          : {},
      pinnedStage:
        typeof parsed.pinnedStage === "string" ? parsed.pinnedStage : null,
    };
  } catch {
    return emptyState;
  }
}

const progressStore = createLocalStore(STORAGE_KEY, emptyState, parseProgress);
const disclaimerStore = createLocalStore(
  DISCLAIMER_KEY,
  false,
  (raw) => raw === "true",
);

export type StageProgress = {
  done: number;
  total: number;
  percent: number;
  status: "belum" | "berjalan" | "selesai";
};

type ProgressContextValue = {
  /** False saat render di server dan pada render hidrasi pertama. */
  hydrated: boolean;
  state: ProgressState;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => void;
  toggleItem: (stageSlug: string, itemId: string) => void;
  isChecked: (stageSlug: string, itemId: string) => boolean;
  setStageChecked: (stageSlug: string, checked: boolean) => void;
  pinStage: (slug: string | null) => void;
  reset: () => void;
  stageProgress: (slug: string) => StageProgress;
  /** Tahap yang sedang berjalan: pilihan pengguna, atau tahap pertama yang belum selesai. */
  currentStage: Stage;
  overall: { done: number; total: number; percent: number };
  /** Item checklist pertama yang belum dicentang pada tahap sekarang. */
  nextAction: { stage: Stage; label: string } | null;
};

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const hydrated = React.useSyncExternalStore(
    hydratedStore.subscribe,
    hydratedStore.getSnapshot,
    hydratedStore.getServerSnapshot,
  );

  const state = React.useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot,
  );

  const disclaimerAccepted = React.useSyncExternalStore(
    disclaimerStore.subscribe,
    disclaimerStore.getSnapshot,
    disclaimerStore.getServerSnapshot,
  );

  const value = React.useMemo<ProgressContextValue>(() => {
    const stageProgress = (slug: string): StageProgress => {
      const stage = getStage(slug);
      const total = stage?.checklist.length ?? 0;
      const validIds = new Set(stage?.checklist.map((i) => i.id) ?? []);
      const done = (state.checked[slug] ?? []).filter((id) =>
        validIds.has(id),
      ).length;
      const percent = total === 0 ? 0 : Math.round((done / total) * 100);
      return {
        done,
        total,
        percent,
        status: done === 0 ? "belum" : done >= total ? "selesai" : "berjalan",
      };
    };

    const isChecked = (stageSlug: string, itemId: string) =>
      (state.checked[stageSlug] ?? []).includes(itemId);

    const toggleItem = (stageSlug: string, itemId: string) => {
      const current = state.checked[stageSlug] ?? [];
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      progressStore.set({
        ...state,
        checked: { ...state.checked, [stageSlug]: next },
      });
    };

    const setStageChecked = (stageSlug: string, checked: boolean) => {
      const stage = getStage(stageSlug);
      if (!stage) return;
      progressStore.set({
        ...state,
        checked: {
          ...state.checked,
          [stageSlug]: checked ? stage.checklist.map((i) => i.id) : [],
        },
      });
    };

    const pinStage = (slug: string | null) => {
      progressStore.set({ ...state, pinnedStage: slug });
    };

    const pinned = state.pinnedStage ? getStage(state.pinnedStage) : undefined;
    // Tanpa pilihan eksplisit, tahap sekarang = tahap pertama yang belum tuntas.
    const inferred =
      stages.find((s) => stageProgress(s.slug).status !== "selesai") ??
      stages[stages.length - 1];
    const currentStage = pinned ?? inferred;

    const done = stages.reduce((sum, s) => sum + stageProgress(s.slug).done, 0);
    const overall = {
      done,
      total: totalChecklistItems,
      percent:
        totalChecklistItems === 0
          ? 0
          : Math.round((done / totalChecklistItems) * 100),
    };

    const pendingItem = currentStage.checklist.find(
      (item) => !isChecked(currentStage.slug, item.id),
    );

    return {
      hydrated,
      state,
      disclaimerAccepted,
      acceptDisclaimer: () => disclaimerStore.set(true),
      toggleItem,
      isChecked,
      setStageChecked,
      pinStage,
      reset: () => progressStore.set(emptyState),
      stageProgress,
      currentStage,
      overall,
      nextAction: pendingItem
        ? { stage: currentStage, label: pendingItem.label }
        : null,
    };
  }, [hydrated, state, disclaimerAccepted]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = React.useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress harus dipakai di dalam <ProgressProvider>");
  }
  return ctx;
}
