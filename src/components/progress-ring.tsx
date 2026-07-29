/**
 * Cincin progres. Dipakai menggantikan bar datar supaya angka progres
 * langsung terbaca sebagai satu objek, bukan sebagai garis tipis.
 */
export function ProgressRing({
  percent,
  size = 76,
  stroke = 7,
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  /** Teks kecil di bawah angka, misal "3/12". */
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Progres ${safe} persen${label ? `, ${label}` : ""}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-brand transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-base leading-none font-semibold tabular-nums">
          {safe}
          <span className="text-[0.6em] font-medium">%</span>
        </span>
        {label && (
          <span className="mt-0.5 text-[10px] leading-none text-muted-foreground tabular-nums">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
