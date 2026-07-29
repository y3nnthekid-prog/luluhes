"use client";

import { MapPin, MapPinOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

/**
 * Menjadikan tahap ini sebagai "posisi saya", atau melepasnya kembali
 * ke deteksi otomatis dari checklist.
 */
export function StagePinButton({ slug }: { slug: string }) {
  const { hydrated, state, currentStage, pinStage } = useProgress();
  if (!hydrated) return null;

  const isPinned = state.pinnedStage === slug;
  const isCurrent = currentStage.slug === slug;

  if (isPinned) {
    return (
      <Button variant="ghost" size="xs" onClick={() => pinStage(null)}>
        <MapPinOff aria-hidden />
        Lepas penanda posisi
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="xs" onClick={() => pinStage(slug)}>
      <MapPin aria-hidden />
      {isCurrent ? "Kunci sebagai posisi saya" : "Saya di tahap ini"}
    </Button>
  );
}
