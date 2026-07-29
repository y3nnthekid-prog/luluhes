"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

export function ResetProgressButton() {
  const { hydrated, overall, reset } = useProgress();
  const [confirming, setConfirming] = React.useState(false);

  if (!hydrated) return null;

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Hapus {overall.done} centang dan penanda posisimu?
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            reset();
            setConfirming(false);
          }}
        >
          Ya, hapus
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Batal
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setConfirming(true)}
      disabled={overall.done === 0}
    >
      <RotateCcw aria-hidden />
      Reset progres saya
    </Button>
  );
}
