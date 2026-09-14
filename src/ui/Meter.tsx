/**
 * Thin horizontal gauge (6px, rounded) plus the numeric value beside it.
 * Fill uses the neutral accent; the track uses --line.
 */
export function Meter({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ background: 'var(--line)' }}
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: 'var(--accent)' }}
        />
      </div>
      <span className="nums w-8 text-right text-sm" style={{ color: 'var(--ink-2)' }}>
        {value}
      </span>
    </div>
  )
}
