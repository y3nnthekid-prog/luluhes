import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkButtonProps = {
  href: string;
  /** Buka di tab baru dengan rel yang aman. Pakai untuk tautan keluar. */
  external?: boolean;
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof buttonVariants>;

/**
 * Tautan yang tampil seperti tombol.
 *
 * Sengaja tidak memakai `<Button render={<Link/>}>`: komponen Button dari Base UI
 * mengharapkan elemen <button> asli, sehingga merender <a> di dalamnya menghapus
 * semantik dan menambahkan type="button" pada tautan.
 */
export function LinkButton({
  href,
  external = false,
  variant,
  size,
  className,
  children,
}: LinkButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
