/**
 * Thin horizontal gauge (6px, rounded) plus the numeric value beside it.
 * Fill uses the neutral accent; the track uses --line.
 *
 * `layout` picks how bar and number sit together:
 * - `'fill'` (default): the bar grows to fill the row, number pinned right —
 *   used where the meter owns its own line (detail card, mobile accordion).
 * - `'inline'`: a fixed-width bar tucked right next to the number with a small
 *   gap, forming one compact unit — used in the wide table so the number reads
 *   as part of its own column instead of drifting toward the next one.
 */
export function Meter({
  value,
  label,
  layout = 'fill',
}: {
  value: number
  label?: string
  layout?: 'fill' | 'inline'
}) {
  const pct = Math.max(0, Math.min(100, value))
  const inline = layout === 'inline'
  return (
    <div className={inline ? 'inline-flex items-center gap-1.5' : 'flex items-center gap-2'}>
      <div
        className={`h-1.5 overflow-hidden rounded-full ${inline ? 'w-10' : 'flex-1'}`}
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
      <span
        className={`nums text-sm ${inline ? '' : 'w-8 text-right'}`}
        style={{ color: 'var(--ink-2)' }}
      >
        {value}
      </span>
    </div>
  )
}
