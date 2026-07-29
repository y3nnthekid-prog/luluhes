const links = [
  { href: "#syarat", label: "Persyaratan" },
  { href: "#langkah", label: "Langkah-langkah" },
  { href: "#dokumen", label: "Dokumen" },
  { href: "#checklist", label: "Checklist" },
  { href: "#template", label: "Template", needsTemplates: true },
  { href: "#skpi", label: "Nomenklatur SKPI", needsSkpi: true },
  { href: "#tips", label: "Tips alumni" },
  { href: "#faq", label: "FAQ" },
  { href: "#link", label: "Link penting" },
  { href: "#berikutnya", label: "Setelah ini" },
];

/** Daftar isi halaman tahapan. Disembunyikan di layar kecil agar tidak menambah keramaian. */
export function StageJumpLinks({
  hasTemplates,
  hasSkpi,
}: {
  hasTemplates: boolean;
  hasSkpi: boolean;
}) {
  return (
    <nav
      aria-label="Daftar isi halaman"
      className="hidden rounded-xl border p-4 lg:block"
    >
      <p className="font-heading text-sm font-medium">Di halaman ini</p>
      <ul className="mt-3 space-y-1.5">
        {links
          .filter(
            (link) =>
              (!link.needsTemplates || hasTemplates) &&
              (!link.needsSkpi || hasSkpi),
          )
          .map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
      </ul>
    </nav>
  );
}
