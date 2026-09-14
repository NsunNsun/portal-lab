import type { Portal } from '../domain/types'
import { computeRisk } from '../domain/risk'

/**
 * Seven summary tiles above the table. All counts derive from domain data; an
 * empty dataset yields all zeros. Unsurveyed portals count only as «Без данных»,
 * never as critical or needing attention. Observer and rescuer are people, not
 * creatures, so they are excluded from «Существ внутри».
 */
export function SummaryTiles({ portals }: { portals: Portal[] }) {
  const open = portals.filter((p) => p.status !== 'closed').length
  const closed = portals.filter((p) => p.status === 'closed').length
  const questioned = portals.filter((p) => p.status === 'questioned').length
  const noData = portals.filter((p) => !p.surveyed).length
  const critical = portals.filter((p) => computeRisk(p).level === 'critical').length
  const attention = portals.filter((p) => {
    const level = computeRisk(p).level
    return level === 'high' || level === 'critical'
  }).length
  const creatures = portals.reduce((sum, p) => sum + p.creaturesInside, 0)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <Tile value={open} label="Открыто" />
      <Tile value={critical} label="Критических" highlight={critical > 0} />
      <Tile value={attention} label="Требуют внимания" />
      <Tile value={noData} label="Без данных" />
      <Tile value={questioned} label="Под вопросом" />
      <Tile value={closed} label="Закрыто" />
      <Tile value={creatures} label="Существ внутри" />
    </div>
  )
}

function Tile({
  value,
  label,
  highlight,
}: {
  value: number
  label: string
  highlight?: boolean
}) {
  return (
    <div
      className="rounded-lg p-3"
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
