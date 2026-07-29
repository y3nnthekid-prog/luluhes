"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, HelpCircle, Lightbulb, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { allFaq, downloads, getStage, stages } from "@/lib/data";
import { cn } from "@/lib/utils";

type ResultKind = "Tahapan" | "Template" | "FAQ" | "Tips";

type SearchEntry = {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  href: string;
  /** Teks gabungan yang dicocokkan dengan kata kunci. */
  haystack: string;
};

/** Indeks dibangun sekali dari JSON — mencakup tahapan, template, FAQ, dan tips. */
const index: SearchEntry[] = [
  ...stages.map((stage) => ({
    id: `stage-${stage.slug}`,
    kind: "Tahapan" as const,
    title: stage.title,
    subtitle: `Tahap ${stage.order} · ${stage.estimatedDuration}`,
    href: `/tahapan/${stage.slug}`,
    haystack: [
      stage.title,
      stage.shortTitle,
      stage.description,
      stage.goal,
      ...stage.requirements.map((r) => r.text),
      ...stage.documents.map((d) => d.name),
      ...stage.steps.map((s) => `${s.title} ${s.detail}`),
      ...stage.checklist.map((c) => c.label),
    ].join(" "),
  })),
  ...downloads.map((item) => ({
    id: `download-${item.id}`,
    kind: "Template" as const,
    title: item.name,
    subtitle: `${item.format} · ${getStage(item.stage)?.title ?? item.stage}`,
    href: `/download#${item.id}`,
    haystack: `${item.name} ${item.description} ${item.format}`,
  })),
  ...allFaq.map((item, i) => ({
    id: `faq-${i}`,
    kind: "FAQ" as const,
    title: item.question,
    subtitle: item.stage
      ? (getStage(item.stage)?.title ?? "Umum")
      : "Pertanyaan umum",
    href: item.stage ? `/tahapan/${item.stage}#faq` : "/faq",
    haystack: `${item.question} ${item.answer}`,
  })),
  ...stages.flatMap((stage) =>
    stage.tips.map((tip, i) => ({
      id: `tip-${stage.slug}-${i}`,
      kind: "Tips" as const,
      title: tip,
      subtitle: `Tips alumni · ${stage.title}`,
      href: `/tahapan/${stage.slug}#tips`,
      haystack: tip,
    })),
  ),
];

const kindIcon: Record<ResultKind, React.ElementType> = {
  Tahapan: FileText,
  Template: FileText,
  FAQ: HelpCircle,
  Tips: Lightbulb,
};

function search(query: string): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return index
    .map((entry) => {
      const hay = entry.haystack.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return null;
      // Kecocokan pada judul diprioritaskan, dan tahapan naik ke atas.
      const title = entry.title.toLowerCase();
      const titleHits = terms.filter((t) => title.includes(t)).length;
      const score = titleHits * 10 + (entry.kind === "Tahapan" ? 5 : 0);
      return { entry, score };
    })
    .filter((r): r is { entry: SearchEntry; score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((r) => r.entry);
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const results = React.useMemo(() => search(query), [query]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  function go(href: string) {
    openChange(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground sm:min-w-52 sm:justify-start"
        aria-label="Cari tahapan, template, atau FAQ"
      >
        <Search aria-hidden />
        <span className="hidden sm:inline">Cari…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-sans text-[10px] sm:inline">
          Ctrl K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="top-24 max-w-lg translate-y-0 gap-0 p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">Pencarian</DialogTitle>
          <DialogDescription className="sr-only">
            Cari tahapan, template, FAQ, dan tips alumni.
          </DialogDescription>

          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari tahapan, template, FAQ, tips…"
              className="h-7 border-0 px-0 focus-visible:ring-0"
            />
          </div>

          <div className="max-h-[min(60vh,26rem)] overflow-y-auto p-1.5">
            {query.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Ketik untuk mencari. Coba{" "}
                <button
                  type="button"
                  className="underline underline-offset-3"
                  onClick={() => setQuery("turnitin")}
                >
                  turnitin
                </button>
                ,{" "}
                <button
                  type="button"
                  className="underline underline-offset-3"
                  onClick={() => setQuery("skpi")}
                >
                  skpi
                </button>
                , atau{" "}
                <button
                  type="button"
                  className="underline underline-offset-3"
                  onClick={() => setQuery("bimbingan")}
                >
                  bimbingan
                </button>
                .
              </p>
            )}

            {query.length > 0 && results.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;.
              </p>
            )}

            <ul>
              {results.map((entry) => {
                const Icon = kindIcon[entry.kind];
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => go(entry.href)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left",
                        "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                      )}
                    >
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {entry.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {entry.subtitle}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {entry.kind}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            Tidak menemukan yang kamu cari?{" "}
            <Link
              href="/faq"
              onClick={() => openChange(false)}
              className="underline underline-offset-3"
            >
              Buka FAQ
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
