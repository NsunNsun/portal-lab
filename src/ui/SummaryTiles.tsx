import type { Portal } from '../domain/types'
import { computeRisk } from '../domain/risk'

/**
 * Five summary tiles above the table. All counts derive from domain data;
 * an empty dataset yields all zeros without breaking anything.
 */
export function SummaryTiles({ portals }: { portals: Portal[] }) {
  const open = portals.filter((p) => p.status !== 'closed').length
  const closed = portals.filter((p) => p.status === 'closed').length
  const critical = portals.filter((p) => computeRisk(p).level === 'critical').length
  const attention = portals.filter((p) => {
    const level = computeRisk(p).level
    return level === 'high' || level === 'critical'
  }).length
  const creatures = portals.reduce((sum, p) => sum + p.creaturesInside, 0)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Tile value={open} label="Открыто" />
      <Tile value={critical} label="Критических" highlight={critical > 0} />
      <Tile value={attention} label="Требуют внимания" />
      <Tile value={closed} label="Закрыто" />
      {/* On the 2-column mobile grid the 5th tile fills the row instead of sitting alone. */}
      <Tile value={creatures} label="Существ внутри" className="col-span-2 sm:col-span-1" />
    </div>
  )
}

function Tile({
  value,
  label,
  highlight,
  className = '',
}: {
  value: number
  label: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-lg p-3 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      <div
        className="text-2xl font-semibold"
        style={{ color: highlight ? 'var(--risk-critical)' : 'var(--ink)' }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </div>
    </div>
  )
}
