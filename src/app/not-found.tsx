import { Compass } from "lucide-react";

import { LinkButton } from "@/components/link-button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Compass className="size-5" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
        Halaman ini tidak ada
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tautannya mungkin salah atau sudah berubah. Kembali ke roadmap untuk
        melihat posisimu.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <LinkButton href="/roadmap">Buka roadmap</LinkButton>
        <LinkButton href="/" variant="outline">
          Ke beranda
        </LinkButton>
      </div>
    </div>
  );
}
